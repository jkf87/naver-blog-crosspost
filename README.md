# Naver Blog Crosspost

Codex/OpenClaw skill for cross-posting an existing web article into Naver Blog Smart Editor with title, body, source attribution, tags, and all meaningful article images preserved.

## Install

Copy this repository into a Codex skills directory:

```bash
cp -R naver-blog-crosspost ~/.codex/skills/naver-blog-crosspost
```
<img width="329" height="54" alt="image" src="https://github.com/user-attachments/assets/b7c24d4a-7999-441c-b7bc-c528603cf272" />

For OpenClaw, copy the same directory into the OpenClaw skill roots used by the active agent.

## Use

Invoke the skill with a source article URL:

```text
$naver-blog-crosspost https://example.com/article
```

When the user asks to publish or deploy, the skill is allowed to click the final Naver `발행` confirmation button and must verify the public post URL afterward. For draft-only requests, it stops before final publish or saves a draft.

## Validation

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py .
python3 scripts/normalize_naver_tags.py 'LLM#Coding-Agent#Artificial-Life'
```
