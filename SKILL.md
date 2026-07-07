---
name: "naver-blog-crosspost"
description: "Cross-post to Naver Blog via logged-in Windows Chrome and repair Smart Editor state."
---

# Naver Blog Crosspost

Use this skill to turn an existing published article page into a Naver Blog post through the user's logged-in browser. When the user asks to use the already-open Windows Chrome, do exactly that; do not substitute WSL/Linux Chrome or a fresh automation-only browser unless the user changes the requirement.

## Workflow

1. Confirm the boundary.
   - If the user asks to publish/cross-post, final publishing is allowed.
   - If the user asks only to draft/prepare/copy, stop before final `발행` or use `저장`.
   - If no source URL is provided, use the focused article page only when unambiguous.

2. Attach to the correct browser.
   - For this user's Windows/WSL OpenClaw setup, first use OpenClaw browser with `target="node"`, `node="WindowsBrowserHost"`, `profile="user"`.
   - Good status signs: `driver: existing-session`, `transport: chrome-mcp`, `running: true`, `cdpReady: true`, `pageReady: true`, and detected `C:\Program Files\Google\Chrome\Application\chrome.exe`.
   - If Chrome/CDP are alive but `pageReady` is false, call browser `action="start"` with the same target/node/profile to reattach.
   - List tabs before opening new ones. Reuse current Naver/write/source tabs when clearly related.
   - If `act` rejects a stable handle like `t13` with `action targetId must match request targetId`, retry with that tab's raw `targetId` from `tabs`.
   - When using raw Chrome DevTools Protocol instead of OpenClaw browser, prefer the already-open Chrome browser-level WebSocket URL. Run `node scripts/chrome_cdp_endpoint.mjs --url` to read `DevToolsActivePort` and construct it.
   - If `/json/version` or `/json/list` is 404, do not treat that alone as fatal. Chrome may still be reachable via the two-line `DevToolsActivePort` file.

3. Collect source content.
   - Capture source URL, title, article body, tags, and every meaningful article image.
   - Prefer the visible article content, not navigation/sidebar text.
   - For GitHub Pages/Quartz pages, extract compact hashtag lists separately from body text.
   - Resolve relative image URLs, download images to a work folder, and keep an image manifest.

4. Compose in Naver Smart Editor.
   - Open Naver Blog in the logged-in Chrome session and choose `글쓰기`, or use an already-open write tab.
   - Preserve headings, paragraphs, lists, tables, images, and links by rich paste when possible.
   - Prefer real editor input events. Direct DOM mutation can make the page look correct while Naver's internal model remains stale.
   - Add a final source attribution line when the source URL is not already preserved.

5. Verify and repair Smart Editor's internal model before publishing.
   - Naver Smart Editor exposes an instance under `SmartEditor._editors.<id>` inside the write-page iframe.
   - Use model APIs for checks:

```javascript
const w = document.querySelector('iframe').contentWindow;
const ed = w.SmartEditor._editors[Object.keys(w.SmartEditor._editors)[0]];
const data = ed.getDocumentData();
const title = ed.getDocumentTitle();
const text = ed.getContentText();
const images = ed.getComponentsByCtype ? ed.getComponentsByCtype('image') : [];
```

   - Confirm the internal title matches the intended title, the body starts cleanly, the source URL is present, and the image count matches the source.
   - If the visible editor looks correct but the final `발행` button does nothing, suspect internal model drift instead of repeatedly clicking.
   - If necessary, repair `data.document.components` and call `ed.setDocumentData(data)`. Use this only for authorized content and never to bypass login, captcha, account protections, or consent.
   - Common repairs: remove stray leading keystrokes such as `v`; restore a dropped first character; remove duplicated trailing title text; add or move source attribution; verify image components remain present.

6. Add tags.
   - Run `scripts/normalize_naver_tags.py` on compact/source tags.
   - Enter tags one at a time in `태그 입력`, committing with Space or Enter.
   - Verify separate tag chips. Do not leave one concatenated tag.

7. Publish.
   - Open the `발행` panel.
   - Check category, visibility, comment/share/search settings, and default-setting checkbox.
   - Click the final confirmation `발행` inside the panel, not the toolbar `발행` that merely opens the panel.
   - If a `beforeunload` dialog appears after final publish, accept only when it is part of confirmed publish navigation or after state is verified.
   - Wait for a public Naver post URL/PostView state.

## Recovery Notes

- If login expires, use the logged-in browser state and restore the draft. Re-check body/images/tags/options after restoration.
- If browser control disconnects after the panel is ready, reconnect to the existing Chrome session and claim the open write tab. Avoid refresh, tab close, Chrome restart, or profile switching unless the user explicitly asks.
- If `Windows Node (DESKTOP-HK1F7D6)` cannot expose `browser.proxy`, `file.fetch`, or `node_exec`, switch the automation route to `WindowsBrowserHost` before asking the user to restart Chrome.

## Chrome CDP Helper

Use the bundled helper when the logged-in Chrome has remote debugging enabled and you need a browser-level CDP WebSocket URL:

```bash
node scripts/chrome_cdp_endpoint.mjs --url
```

The helper first honors `CHROME_CDP_WS_URL`. Otherwise it reads `DevToolsActivePort` from `CHROME_USER_DATA_DIR`, or from Chrome's default user-data directory. On Windows, the default is `%LOCALAPPDATA%\Google\Chrome\User Data`, so the workflow does not hardcode a username. Use `CHROME_CDP_HOST` when the endpoint host is not `127.0.0.1`.

## Validation

Before reporting success, verify the public post:

- URL is the intended Naver post URL.
- Title and body are present.
- Body start is clean and not prefixed by accidental keystrokes.
- No duplicated title block remains in the body.
- Source URL appears if attribution was intended.
- All meaningful source images are present.
- Tags are separate chips and match source tags reasonably.

Useful published-post check:

```javascript
const root = document.querySelector('iframe')?.contentDocument || document;
const text = root.body.innerText;
const imgs = Array.from(root.querySelectorAll('img')).filter(img =>
  img.naturalWidth > 100 && img.naturalHeight > 100 &&
  !/profile|banner|promo|logo|spc|static\/blog/i.test(img.currentSrc || img.src || '')
);
({
  titlePresent: text.includes(expectedTitle),
  bodyStartsClean: text.includes(expectedFirstSentence) && !text.includes('v' + expectedFirstSentence),
  duplicateTitlePair: text.includes(expectedTitle + expectedTitle),
  sourcePresent: text.includes(sourceUrl),
  imageCount: imgs.length,
  tagCount: (text.match(/#\S+/g) || []).length
});
```

## Tag Helper

```bash
python3 scripts/normalize_naver_tags.py 'LLM#Coding-Agent#Reinforcement-Learning#Reward-Design#Verification#Qwen'
```

The helper removes leading `#`, removes hyphens, de-duplicates tags, and prints a space-separated sequence suitable for Naver tag entry.
