# Naver Blog Crosspost

Codex/OpenClaw skill for cross-posting an existing web article into Naver Blog Smart Editor with title, body, source attribution, tags, and all meaningful article images preserved.

## Install

Copy this repository into a Codex skills directory:

```bash
cp -R naver-blog-crosspost ~/.codex/skills/naver-blog-crosspost
```
<img width="329" height="54" alt="image" src="https://github.com/user-attachments/assets/b7c24d4a-7999-441c-b7bc-c528603cf272" />

For OpenClaw, copy the same directory into the OpenClaw skill roots used by the active agent.

The full directory is required, including `scripts/` and `agents/`; copying only `SKILL.md` is not enough.

## Use

Invoke the skill with a source article URL:

```text
$naver-blog-crosspost https://example.com/article
```
<img width="574" height="69" alt="image" src="https://github.com/user-attachments/assets/63bb99ad-38b4-4b89-8756-dcd14930e774" />

When the user asks to publish or deploy, the skill is allowed to click the final Naver `발행` confirmation button and must verify the public post URL afterward. For draft-only requests, it stops before final publish or saves a draft.

## Chrome CDP Helper

Prefer the user's already-open, logged-in Chrome session when possible:

```bash
node scripts/chrome_cdp_endpoint.mjs --url
```

The helper reads `DevToolsActivePort` from `CHROME_USER_DATA_DIR` or Chrome's default user-data directory. On Windows, that default is `%LOCALAPPDATA%\Google\Chrome\User Data`; override with `CHROME_CDP_WS_URL`, `CHROME_CDP_HOST`, or `CHROME_USER_DATA_DIR` when needed.

## OpenClaw WSL + Windows Companion

When OpenClaw runs from WSL but the logged-in browser is Windows Chrome, attach to the Windows browser host instead of launching a Linux browser:

```text
target=node
node=WindowsBrowserHost
profile=user
```

Good status signs are `driver: existing-session`, `transport: chrome-mcp`, `running: true`, `cdpReady: true`, and `pageReady: true`. If `pageReady` is false while Chrome/CDP are alive, restart only the browser attachment with the same target/node/profile.

Before final publish, verify Naver Smart Editor's internal model with `SmartEditor._editors.<id>.getDocumentData()`. This catches cases where the editor looks right but its model still has a missing title/body, a stray leading key, duplicated title text, or a misplaced source URL. After publish, verify the public post URL, clean body start, source link, image count, and separate tag chips.

## Validation

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py .
python3 scripts/normalize_naver_tags.py 'LLM#Coding-Agent#Artificial-Life'
node scripts/chrome_cdp_endpoint.mjs --help
```
