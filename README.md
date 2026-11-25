# Use-Case Hub

A gallery of published AI agent use cases, each reproduced from its original prompts with a general model (Claude on Amazon Bedrock by default, or GPT through the OpenAI API). No vendor agent is installed. Every case keeps the real outputs and the full conversation, so you can compare the reproduction with the source post.

## Use cases

| # | Use case | Source | Outputs |
|---|---|---|---|
| 01 | [Design a Printable Café Menu](cases/cafe-menu/case.json) | [AutoClaw Blog · Tutorial](https://autoclaw.z.ai/en/blog/tutorial/autoclaw-ai-cafe-menu-design/) | A4 menu as editable SVG + 300 DPI PNG, v1 and v2 |
| 02 | [Draft a B2B Contract Package](cases/contract-package/case.json) | [AutoClaw Blog · Tutorial](https://autoclaw.z.ai/en/blog/tutorial/Draft%20a%20Contract%20with%20AutoClaw/) | 9 editable Word documents |

Only posts in the AutoClaw blog's **Tutorial** category are included. News, Product and Model posts are out of scope.

## How it works

Each use case is one declarative file, `cases/<slug>/case.json`:

- `source`: the post it reproduces (URL, category, publish date, the original agent setup)
- `system`: the role the original product's workspace supplied (for example "Design" or "Legal, country United Kingdom")
- `turns`: the user prompts in order, copied from the post where the post gives them. A turn with `"review": true` is followed by a self-check: the runner renders the files, attaches the images and asks the model to fix what it sees.
- `convert`: what each delivered file becomes (`.svg` → `.png` at a pixel size, `.md` → `.docx`)

The runner sends the turns in one conversation. The model returns files in `<file name="…">…</file>` blocks; the runner saves them to `cases/<slug>/output/`, converts them, and writes `output/transcript.json` with every prompt, reply, file and token count. The build step turns all cases into `gallery.json`, which the static page reads.

```
cases/<slug>/case.json ──hub.run──▶ cases/<slug>/output/{files, transcript.json} ──hub.build──▶ gallery.json ──▶ index.html
```

## Run it

Requirements: Python 3.11+, `pandoc` and `rsvg-convert` (`brew install pandoc librsvg`), and `sips` (built into macOS) for preview images.

```bash
pip install -r requirements.txt

# View the committed gallery
python -m hub.build
python -m http.server 8000      # open http://localhost:8000

# Regenerate one case (replaces cases/<slug>/output/)
python -m hub.run cafe-menu                          # Claude on Bedrock, uses your AWS credentials
HUB_PROVIDER=openai python -m hub.run cafe-menu      # GPT, needs OPENAI_API_KEY
python -m hub.build
```

| Variable | Default | Meaning |
|---|---|---|
| `HUB_PROVIDER` | `bedrock` | `bedrock` or `openai` |
| `HUB_MODEL` | `us.anthropic.claude-opus-5-5` (Bedrock), `gpt-5` (OpenAI) | Model ID |
| `HUB_MAX_TOKENS` | `64000` | Output cap per turn. A reply that hits it fails the run instead of saving a truncated file |
| `AWS_REGION` | `us-east-1` | Bedrock region |

## Add a use case

1. Create `cases/<new-slug>/case.json` with the fields above. Copy prompts from the source post verbatim. Put what the original product's UI supplied (workspace, country, mode) in `system`, and write any UI interaction (such as answering a clarification form) as an explicit turn.
2. Run `python -m hub.run <new-slug>`, then `python -m hub.build`.
3. Look at the outputs in the gallery before committing them.

## Notes

- Outputs are committed exactly as the model produced them. Reruns differ.
- The contract documents are model-drafted working drafts with fictional parties, copied from the tutorial's scenario. They are not legal advice.
- Source posts belong to their publishers. This repo links to them and reuses their prompts to compare results.
