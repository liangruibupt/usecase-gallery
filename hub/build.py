"""Build the static site's data: python -m hub.build

Writes gallery.json (one card per case, for the index) and
cases/<slug>/view.json (everything the case page shows). Cases that have not
been generated yet are skipped with a warning.
"""

import csv
import html
import json
import re
import subprocess
from pathlib import Path

from hub.run import preview_of, rule_for

ROOT = Path(__file__).resolve().parent.parent
CHIP = re.compile(r"\[\[file:([^\]]+)\]\]")
DERIVED = (".png", ".jpg", ".docx", ".pptx", ".xlsx")
MAX_TABLE_ROWS = 300


def md_to_html(text: str) -> str:
    # Swap file markers for an inert token so pandoc leaves them alone.
    names = CHIP.findall(text)
    text = CHIP.sub(lambda m: f"FILECHIP{names.index(m.group(1))}X", text)
    out = subprocess.run(["pandoc", "-f", "gfm-raw_html", "-t", "html"], input=text,
                         capture_output=True, text=True, check=True).stdout
    for i, name in enumerate(names):
        out = out.replace(f"FILECHIP{i}X", f'<span class="chip-file">{html.escape(name)}</span>')
    return out


def csv_to_html(path: Path) -> str:
    with path.open(newline="", encoding="utf-8") as f:
        rows = list(csv.reader(f))
    head, body = (rows[0], rows[1:]) if rows else ([], [])
    cells = lambda tag, row: "".join(f"<{tag}>{html.escape(c)}</{tag}>" for c in row)
    more = f"<p><em>{len(body) - MAX_TABLE_ROWS} more rows in the file.</em></p>" if len(body) > MAX_TABLE_ROWS else ""
    return (f"<table><thead><tr>{cells('th', head)}</tr></thead><tbody>"
            + "".join(f"<tr>{cells('td', r)}</tr>" for r in body[:MAX_TABLE_ROWS]) + "</tbody></table>" + more)


def md_title(text: str, fallback: str) -> str:
    return next((l.lstrip("# ").strip() for l in text.splitlines() if l.startswith("#")), fallback)


def describe(path: Path, href, rules: dict) -> dict:
    """One gallery item for a delivered (or input) file, keyed on its kind.
    Converted files are named by the same rule the runner used, so lookups never guess."""
    name, text = path.name, lambda: path.read_text(encoding="utf-8")
    match = rule_for(path, rules)
    derived = match[0] if match and match[0].exists() else None
    if path.suffix == ".svg":
        return {"kind": "image", "name": derived.name if derived else name, "href": href(derived or path),
                "source": href(path), "preview": href(preview_of(derived)) if derived else href(path)}
    if path.suffix in (".html", ".htm"):
        return {"kind": "page", "name": name, "href": href(path),
                "preview": href(preview_of(derived)) if derived else None}
    if name.endswith(".slides.md"):
        kind = "deck"
    elif path.suffix == ".md":
        kind = "document"
    elif path.suffix == ".csv":
        return {"kind": "sheet", "name": derived.name if derived else name, "title": path.stem,
                "href": href(derived or path), "source": href(path), "preview": csv_to_html(path)}
    else:
        return {"kind": "file", "name": name, "title": name, "href": href(path), "source": href(path),
                "preview": f"<pre>{html.escape(text())}</pre>"}
    return {"kind": kind, "name": derived.name if derived else name, "title": md_title(text(), path.stem),
            "href": href(derived or path), "source": href(path), "preview": md_to_html(text())}


def outputs(case_dir: Path, run: dict, rules: dict) -> list[dict]:
    """Final files on disk, in delivery order, labelled with the turn that wrote the final version."""
    out = case_dir / "output"
    href = lambda p: f"cases/{case_dir.name}/output/{p.name}"
    sources = [p for p in sorted(out.iterdir())
               if p.name != "transcript.json" and not p.name.endswith(DERIVED)]
    order = list(dict.fromkeys(f for turn in run["turns"] for f in turn["files"]))
    last_turn = {f: f"{i + 1:02d} · {turn['label']}" for i, turn in enumerate(run["turns"]) for f in turn["files"]}
    items = []
    for p in sources:
        item = describe(p, href, rules)
        item["turn"] = last_turn.get(p.name, "")
        item["rank"] = order.index(p.name) if p.name in order else len(order)
        items.append(item)
    return sorted(items, key=lambda item: item.pop("rank"))


def inputs(case_dir: Path, names: list[str]) -> list[dict]:
    href = lambda p: f"cases/{case_dir.name}/input/{p.name}"
    return [describe(case_dir / "input" / n, href, {}) for n in names]


def build() -> None:
    cards = []
    for case_file in sorted((ROOT / "cases").glob("*/case.json")):
        case_dir = case_file.parent
        case = json.loads(case_file.read_text())
        transcript = case_dir / "output" / "transcript.json"
        if not transcript.exists():
            print(f"skip {case['slug']}: run `python -m hub.run {case['slug']}` first")
            continue
        run = json.loads(transcript.read_text())
        for turn in run["turns"]:
            turn["reply_html"] = md_to_html(turn.pop("reply"))
        files = outputs(case_dir, run, case.get("convert", {}))
        usage = {k: sum(t["usage"][k] for t in run["turns"]) for k in ("input", "output")}
        card = {
            "slug": case["slug"],
            "title": case["title"],
            "summary": case["summary"],
            "tags": case["tags"],
            "lang": case.get("lang", "en"),
            "source": case["source"],
            "model": run["model"],
            "provider": run["provider"],
            "finished": run["finished"],
            "turns": len(run["turns"]),
            "outputs": len(files),
            "usage": usage,
            "seconds": round(sum(t["seconds"] for t in run["turns"])),
            "cover": next((f["preview"] for f in reversed(files) if f["kind"] in ("image", "page") and f["preview"]), None),
            "doc_titles": [f["title"] for f in files if f["kind"] in ("document", "deck", "sheet")][:3],
        }
        view = {**card, "inputs": inputs(case_dir, case.get("inputs", [])), "run": run, "outputs": files}
        (case_dir / "view.json").write_text(json.dumps(view, ensure_ascii=False) + "\n")
        cards.append(card)
    cards.sort(key=lambda c: (c["source"]["published"], c["slug"]), reverse=True)
    (ROOT / "gallery.json").write_text(json.dumps({"cases": cards}, indent=1, ensure_ascii=False) + "\n")
    print(f"gallery.json: {len(cards)} cases")


if __name__ == "__main__":
    build()
