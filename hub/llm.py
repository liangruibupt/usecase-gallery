"""One chat() call over Bedrock Claude (default) or OpenAI GPT.

Messages use a provider-neutral shape:
    {"role": "user" | "assistant", "text": str, "images": [jpeg_bytes, ...]}
"""

import base64
import os
from dataclasses import dataclass

PROVIDER = os.environ.get("HUB_PROVIDER", "bedrock")
MODEL = os.environ.get(
    "HUB_MODEL",
    "us.anthropic.claude-opus-5-5" if PROVIDER == "bedrock" else "gpt-5",
)
MAX_TOKENS = int(os.environ.get("HUB_MAX_TOKENS", "64000"))


@dataclass
class Reply:
    text: str
    usage: dict


def chat(system: str, messages: list[dict]) -> Reply:
    if PROVIDER not in ("bedrock", "openai"):
        raise SystemExit(f"Unknown HUB_PROVIDER={PROVIDER!r}; use 'bedrock' or 'openai'")
    reply = _bedrock(system, messages) if PROVIDER == "bedrock" else _openai(system, messages)
    if not reply.text.strip():
        raise RuntimeError(f"Model returned an empty reply ({reply.usage['output']} output tokens); split the turn")
    return reply


def _bedrock(system, messages):
    import boto3
    from botocore.config import Config

    client = boto3.client(
        "bedrock-runtime",
        region_name=os.environ.get("AWS_REGION", "us-east-1"),
        config=Config(read_timeout=1200, retries={"max_attempts": 3}),
    )
    payload = [
        {
            "role": m["role"],
            "content": [{"image": {"format": "jpeg", "source": {"bytes": img}}} for img in m.get("images", [])]
            + [{"text": m["text"]}],
        }
        for m in messages
    ]
    r = client.converse(
        modelId=MODEL,
        system=[{"text": system}],
        messages=payload,
        inferenceConfig={"maxTokens": MAX_TOKENS},
    )
    text = "".join(c.get("text", "") for c in r["output"]["message"]["content"])
    if r.get("stopReason") == "max_tokens":
        raise RuntimeError("Reply hit HUB_MAX_TOKENS; raise it or split the turn")
    return Reply(text, {"input": r["usage"]["inputTokens"], "output": r["usage"]["outputTokens"]})


def _openai(system, messages):
    from openai import OpenAI

    payload = [{"role": "system", "content": system}]
    for m in messages:
        parts = [
            {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + base64.b64encode(img).decode()}}
            for img in m.get("images", [])
        ]
        payload.append({"role": m["role"], "content": parts + [{"type": "text", "text": m["text"]}]})
    r = OpenAI().chat.completions.create(model=MODEL, messages=payload, max_completion_tokens=MAX_TOKENS)
    if r.choices[0].finish_reason == "length":
        raise RuntimeError("Reply hit HUB_MAX_TOKENS; raise it or split the turn")
    return Reply(
        r.choices[0].message.content,
        {"input": r.usage.prompt_tokens, "output": r.usage.completion_tokens},
    )
