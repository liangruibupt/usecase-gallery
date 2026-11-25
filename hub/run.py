"""Replay one use case against a model: python -m hub.run <slug>

Sends each turn of cases/<slug>/case.json in one conversation, saves every
<file name="..."> block the model returns into cases/<slug>/output/, converts
files per the case's "convert" rules, and writes output/transcript.json.
Each run starts from an empty output/ so reruns converge to the same layout.
"""

import json
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from hub import llm

ROOT = Path(__file__).resolve().parent.parent
FILE_BLOCK = re.compile(r'<file name="([^"/\\]+)">\n?(.*?)\n?</file>', re.S)

FILE_PROTOCOL = """
Deliver every file inside its own block, exactly like this:
<file name="example.svg">
...complete file contents...
</file>
Only files wrapped this way are saved for the user. Always send complete files, never fragments or diffs.
Outside the blocks, write your normal reply to the user."""


def convert(path: Path, rules: dict) -> list[Path]:
    rule = rules.get(path.suffix)
    if not rule:
        return []
    target = path.with_suffix("." + rule["to"])
    if rule["to"] == "png":
        cmd = ["rsvg-convert", "-w", str(rule["width"]), "-h", str(rule["height"]),
               "-b", "white", "-o", str(target), str(path)]
    elif rule["to"] == "docx":
        cmd = ["pandoc", str(path), "-o", str(target)]
    else:
        raise SystemExit(f"No converter for {path.suffix} -> {rule['to']}")
    subprocess.run(cmd, check=True)
    return [target]


def jpeg_preview(png: Path, width: int = 1600) -> Path:
    """Downscaled JPEG beside the PNG: what the model reviews and what the gallery shows."""
    target = png.with_suffix(".preview.jpg")
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


def run(slug: str) -> None:
    case_dir = ROOT / "cases" / slug
    case = json.loads((case_dir / "case.json").read_text())
    out = case_dir / "output"
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir()

    system = case["system"] + "\n" + FILE_PROTOCOL
    rules = case.get("convert", {})
    messages, log = [], []
    started = datetime.now(timezone.utc).isoformat(timespec="seconds")

    def write_transcript():
        (out / "transcript.json").write_text(json.dumps({
            "provider": llm.PROVIDER,
            "model": llm.MODEL,
            "started": started,
            "finished": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "turns": log,
        }, indent=2, ensure_ascii=False) + "\n")

    def exchange(label, prompt, images=()):
        messages.append({"role": "user", "text": prompt, "images": list(images)})
        t0 = time.time()
        reply = llm.chat(system, messages)
        messages.append({"role": "assistant", "text": reply.text})
        files, rendered = save_files(reply.text, out, rules)
        log.append({
            "label": label,
            "prompt": prompt,
            "attached_images": len(images),
            "reply": display_text(reply.text),
            "files": files,
            "usage": reply.usage,
            "seconds": round(time.time() - t0, 1),
        })
        write_transcript()
        print(f"  {label}: {len(files)} files, {reply.usage['output']} output tokens, {log[-1]['seconds']}s")
        return rendered

    print(f"{slug} on {llm.PROVIDER}:{llm.MODEL}")
    for turn in case["turns"]:
        rendered = exchange(turn["label"], turn["prompt"])
        if turn.get("review") and rendered:
            exchange("Self-check", case["review_prompt"], [jpeg_preview(p).read_bytes() for p in rendered])



if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: python -m hub.run <slug>")
    run(sys.argv[1])
