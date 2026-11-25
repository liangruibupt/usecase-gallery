"""Build gallery.json for the static site: python -m hub.build

Reads every cases/<slug>/case.json and its output/transcript.json. Cases that
have not been generated yet are skipped with a warning.
"""

import html
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHIP = re.compile(r"\[\[file:([^\]]+)\]\]")


def md_to_html(text: str) -> str:
    # Swap file markers for an inert token so pandoc leaves them alone.
    names = CHIP.findall(text)
    text = CHIP.sub(lambda m: f"FILECHIP{names.index(m.group(1))}X", text)
    out = subprocess.run(["pandoc", "-f", "gfm-raw_html", "-t", "html"], input=text,
                         capture_output=True, text=True, check=True).stdout
    for i, name in enumerate(names):
        out = out.replace(f"FILECHIP{i}X", f'<span class="chip-file">{html.escape(name)}</span>')
    return out


def outputs(case_dir: Path, run: dict) -> list[dict]:
    """Final files on disk, in delivery order, labelled with the turn that wrote the final version."""
    out = case_dir / "output"
    href = lambda p: f"cases/{case_dir.name}/output/{p.name}"
    items = []
    for svg in sorted(out.glob("*.svg")):
        png = svg.with_suffix(".png")
        items.append({"kind": "image", "name": png.name, "href": href(png), "source": href(svg),
                      "preview": href(png.with_suffix(".preview.jpg"))})
    for md in sorted(out.glob("*.md")):
        docx = md.with_suffix(".docx")
        items.append({
            "kind": "document",
            "name": docx.name,
            "title": next((l.lstrip("# ").strip() for l in md.read_text().splitlines() if l.startswith("#")), md.stem),
            "href": href(docx),
            "source": href(md),
            "preview": md_to_html(md.read_text()),
        })
    order = list(dict.fromkeys(f for turn in run["turns"] for f in turn["files"]))
    last_turn = {f: f"{i + 1:02d} · {turn['label']}" for i, turn in enumerate(run["turns"]) for f in turn["files"]}
    for item in items:
        item["rank"] = order.index(item["name"]) if item["name"] in order else len(order)
        item["turn"] = last_turn.get(item["name"], "")
    return sorted(items, key=lambda item: item.pop("rank"))


def build() -> None:
    cases = []
    for case_file in sorted((ROOT / "cases").glob("*/case.json")):
        case = json.loads(case_file.read_text())
        transcript = case_file.parent / "output" / "transcript.json"
        if not transcript.exists():
            print(f"skip {case['slug']}: run `python -m hub.run {case['slug']}` first")
            continue
        run = json.loads(transcript.read_text())
        for turn in run["turns"]:
            turn["reply_html"] = md_to_html(turn.pop("reply"))
        files = outputs(case_file.parent, run)
        case.update(run=run, outputs=files,
                    cover=next((f["preview"] for f in reversed(files) if f["kind"] == "image"), None))
        cases.append(case)
    cases.sort(key=lambda c: c["source"]["published"], reverse=True)
    (ROOT / "gallery.json").write_text(json.dumps({"cases": cases}, indent=1, ensure_ascii=False) + "\n")
    print(f"gallery.json: {len(cases)} cases")


if __name__ == "__main__":
    build()
