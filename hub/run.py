"""Replay one use case against a model: python -m hub.run <slug>

Sends each turn of cases/<slug>/case.json in one conversation, saves every
<file name="..."> block the model returns into cases/<slug>/output/, converts
files per the case's "convert" rules, and writes output/transcript.json.
Input files listed in "inputs" (from cases/<slug>/input/) are attached to the
first turn. Each run starts from an empty output/ so reruns converge.
"""

import csv
import json
import re
import shutil
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

from hub import llm

ROOT = Path(__file__).resolve().parent.parent
FILE_BLOCK = re.compile(r'<file name="([^"/\\]+)">\n?(.*?)\n?</file>', re.S)
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

FILE_PROTOCOL = """
Deliver every file inside its own block, exactly like this:
<file name="example.svg">
...complete file contents...
</file>
Only files wrapped this way are saved for the user. Always send complete files, never fragments or diffs.
Outside the blocks, write your normal reply to the user."""

INPUT_NOTE = "\n\nThe files I am sharing with you are below, each inside an <input> block."


def to_png(src: Path, target: Path, rule: dict) -> None:
    subprocess.run(["rsvg-convert", "-w", str(rule["width"]), "-h", str(rule["height"]),
                    "-b", "white", "-o", str(target), str(src)], check=True)


def to_pandoc(src: Path, target: Path, rule: dict) -> None:
    # Slides need pandoc's own markdown: gfm prints `::: notes` as slide text and splits slides at tables.
    flavor = "markdown" if target.suffix == ".pptx" else "gfm"
    subprocess.run(["pandoc", "-f", flavor, str(src), "-o", str(target)], check=True)


def to_xlsx(src: Path, target: Path, rule: dict) -> None:
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = src.stem[:31]
    with src.open(newline="", encoding="utf-8") as f:
        for row in csv.reader(f):
            ws.append([_cell(v) for v in row])
    wb.save(target)


def _cell(v: str):
    try:
        return int(v) if re.fullmatch(r"-?\d{1,15}", v) else float(v) if re.fullmatch(r"-?\d+\.\d+", v) else v
    except ValueError:
        return v


def html_screenshot(src: Path, target: Path, rule: dict) -> None:
    w, h = rule.get("width", 1440), rule.get("height", 900)
    for attempt in range(3):  # headless Chrome occasionally exits non-zero during teardown
        with tempfile.TemporaryDirectory() as profile:
            r = subprocess.run([CHROME, "--headless=new", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
                                "--hide-scrollbars", f"--user-data-dir={profile}", f"--window-size={w},{h}",
                                "--virtual-time-budget=5000", f"--screenshot={target}", src.resolve().as_uri()],
                               capture_output=True, timeout=120)
        if target.exists() and target.stat().st_size > 0:
            return
    raise RuntimeError(f"Chrome could not screenshot {src.name}: {r.stderr.decode()[-300:]}")


CONVERTERS = {"png": to_png, "docx": to_pandoc, "pptx": to_pandoc, "xlsx": to_xlsx, "shot.png": html_screenshot}


def rule_for(path: Path, rules: dict) -> tuple[Path, dict] | None:
    """Rules are keyed by file-name ending; the longest matching key wins (".slides.md" beats ".md").
    Returns the converted file's path and the rule, or None when no rule matches."""
    key = max((k for k in rules if path.name.endswith(k)), key=len, default=None)
    if key is None:
        return None
    return path.with_name(path.name[: -len(key)] + "." + rules[key]["to"]), rules[key]


def convert(path: Path, rules: dict) -> list[Path]:
    match = rule_for(path, rules)
    if match is None:
        return []
    target, rule = match
    CONVERTERS[rule["to"]](path, target, rule)
    return [target]


def preview_of(png: Path) -> Path:
    return png.with_name(png.name.removesuffix(".png") + ".preview.jpg")


def jpeg_preview(png: Path, width: int = 1600) -> Path:
    """Downscaled JPEG beside the PNG: what the model reviews and what the gallery shows."""
    target = preview_of(png)
    subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "82", "-Z", str(width),
                    str(png), "--out", str(target)], check=True, capture_output=True)
    return target


def save_files(reply: str, out: Path, rules: dict) -> tuple[list[str], list[Path]]:
    names, rendered = [], []
    for name, body in FILE_BLOCK.findall(reply):
        path = out / name
        path.write_text(body.rstrip() + "\n", encoding="utf-8")
        names.append(name)
        for target in convert(path, rules):
            names.append(target.name)
            if target.suffix == ".png":
                jpeg_preview(target)
                rendered.append(target)
    return names, rendered


def display_text(reply: str) -> str:
    return FILE_BLOCK.sub(lambda m: f"[[file:{m.group(1)}]]", reply).strip()


def attach_inputs(case_dir: Path, names: list[str]) -> str:
    blocks = [f'<input name="{n}">\n{(case_dir / "input" / n).read_text(encoding="utf-8").rstrip()}\n</input>'
              for n in names]
    return INPUT_NOTE + "\n\n" + "\n\n".join(blocks) if blocks else ""


def run(slug: str) -> None:
    case_dir = ROOT / "cases" / slug
    case = json.loads((case_dir / "case.json").read_text())
    out = case_dir / "output"
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir()

    system = case["system"] + "\n" + FILE_PROTOCOL
    rules = case.get("convert", {})
    inputs = case.get("inputs", [])
    messages, log = [], []
    started = datetime.now(timezone.utc).isoformat(timespec="seconds")

    def write_transcript():
        (out / "transcript.json").write_text(json.dumps({
            "provider": llm.PROVIDER,
            "model": llm.MODEL,
            "started": started,
            "finished": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "inputs": inputs,
            "turns": log,
        }, indent=2, ensure_ascii=False) + "\n")

    def exchange(label, prompt, images=(), attachment=""):
        messages.append({"role": "user", "text": prompt + attachment, "images": list(images)})
        t0 = time.time()
        reply = llm.chat(system, messages)
        messages.append({"role": "assistant", "text": reply.text})
        files, rendered = save_files(reply.text, out, rules)
        log.append({
            "label": label,
            "prompt": prompt,
            "attached_inputs": inputs if attachment else [],
            "attached_images": len(images),
            "reply": display_text(reply.text),
            "files": files,
            "usage": reply.usage,
            "seconds": round(time.time() - t0, 1),
        })
        write_transcript()
        print(f"  {label}: {len(files)} files, {reply.usage['output']} output tokens, {log[-1]['seconds']}s",
              flush=True)
        return rendered

    print(f"{slug} on {llm.PROVIDER}:{llm.MODEL}", flush=True)
    for i, turn in enumerate(case["turns"]):
        rendered = exchange(turn["label"], turn["prompt"], attachment=attach_inputs(case_dir, inputs) if i == 0 else "")
        if turn.get("review") and rendered:
            exchange("Self-check", case["review_prompt"], [jpeg_preview(p).read_bytes() for p in rendered])


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: python -m hub.run <slug>")
    run(sys.argv[1])
