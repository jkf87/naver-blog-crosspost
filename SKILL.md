---
name: naver-blog-crosspost
description: Cross-post a published web article into Naver Blog from Chrome, especially from Quartz, GitHub Pages, or another existing blog/article URL. Use when the user asks to copy, mirror, draft, or publish an existing article to Naver Blog, preserve the source title/body/images, reconstruct Naver tags, handle login-expired draft recovery, handle the Smart Editor publish dialog, or repeat the recorded Naver Blog posting workflow.
---

# Naver Blog Crosspost

Use this skill to turn an existing published article page into a Naver Blog post through the user's logged-in browser. Prefer semantic browser/Computer Use actions over coordinate replay. Treat images as first-class content, not decoration.

## Source Evidence

The recorded workflow showed this reusable pattern:

1. Open Naver, enter Blog, then choose `글쓰기`.
2. Open the source article in another Chrome tab.
3. Copy the source article title, body, source link, and images into Naver Smart Editor.
4. Open Naver's `발행` panel, set/check category and visibility.
5. Copy source tags, normalize them for Naver, enter each tag in `태그 입력`.
6. Click final `발행` and wait for a publish state.

Do not hardcode the recorded account, blog URL, category, article title, or tags as defaults.

## Workflow

1. Confirm the task boundary.
   - If the user says publish/cross-post, final publishing is allowed.
   - If the user explicitly asks to publish/deploy, do not stop at the publish panel asking the user to click the last `발행`; complete the final click yourself and then verify the public post.
   - If the user says draft/prepare/copy, stop before the final publish button or use `저장`.
   - If no source URL is provided, use the currently focused/selected article page only when it is unambiguous; otherwise ask for the URL.

2. Collect source content.
   - Use Chrome state when available; otherwise use Computer Use.
   - Capture the source URL, page title, article body, tags, and every meaningful article image.
   - Prefer page-visible article content over navigation/sidebar text.
   - For Quartz/GitHub Pages pages, tags are often shown as `#Tag-One#Tag-Two`; extract them separately from the article body.
   - Resolve relative image URLs against the source URL. Download source images to a temporary work folder before opening Naver so they can be re-uploaded if rich paste drops them.
   - Keep an image manifest: original URL, local file path, and intended insertion point or nearby heading.

3. Prepare the Naver Blog editor.
   - In the logged-in Chrome session, open Naver Blog and choose `글쓰기`, or navigate to the user's Naver Blog write page if it is already open.
   - Wait until the Smart Editor shows the title/body entry area and the toolbar is stable.
   - If an old draft or unsaved post appears, do not overwrite it without a clear user request.

4. Fill title and body.
   - Paste the article title into the title field.
   - Paste the body into the Smart Editor body area.
   - Preserve headings, paragraphs, lists, tables, images, and links when the editor accepts rich paste.
   - If rich paste fails, paste clean text and preserve structure with headings and spacing.
   - Insert or upload the downloaded images after the surrounding text is in place. Do not finish a publish request with missing images unless the user explicitly says to omit them.
   - Add a final source attribution line when the original source URL is not already preserved as a link.

5. Add tags.
   - Run `scripts/normalize_naver_tags.py` on copied/source tags when they are compact, hashtagged, or hyphenated.
   - Enter one normalized tag at a time in `태그 입력`, committing each tag with Space or Enter as the editor requires.
   - Verify the tag chips appear in the publish panel. Do not leave a single concatenated tag such as `LLMCodingAgentRewardDesign`.
   - If a restored draft loses tags, re-enter all tags before publishing.

6. Publish or save.
   - Open the `발행` panel.
   - Check category, visibility, comment/scrap/search options, and `이 설정을 기본값으로 유지`.
   - When multiple `발행` buttons are visible, click the final confirmation button inside the publish panel, not the toolbar button that merely opens the panel.
   - For publish requests, click the final `발행`, wait for `발행 중입니다` to clear, then verify the result by observing the published post URL or success page.
   - For draft requests, save and report that no final publish action was taken.

## Login, Draft, and Tool Recovery

- If Naver shows `로그인이 필요합니다` after the final publish click, click the confirmation, use the already-saved browser login state when available, then reopen the Naver write URL.
- If Naver shows `작성 중인 글이 있습니다`, restore the draft and re-check the body, images, tags, visibility, and publish options. Draft restoration may preserve images but lose tags.
- If browser control disconnects after the publish panel is ready, reconnect to Chrome, claim the open `PostWriteForm.naver` tab, and continue from the visible editor state instead of reopening, refreshing, or rebuilding the post.
- If browser automation stalls, avoid destructive actions such as refresh, tab close, or Chrome restart. Check whether the macOS front app is `loginwindow`; if the screen is locked, report that publishing cannot continue until the screen is unlocked.
- If Computer Use is unavailable but Chrome DevTools is reachable, use it only for inspection or safe DOM interaction. Do not bypass Naver login, captcha, or account protections.

## Image Checklist

For each source image:

1. Download or otherwise capture it before composing.
2. Insert it into the correct part of the Smart Editor body.
3. Visually or structurally verify it appears in the restored editor before final publish.
4. After publish, open the public post and verify that the image count and major image content match the source.

## Validation

Before reporting success:

- Verify title and body are present in the Naver editor or published post.
- Verify all meaningful source images are present in the editor or published post.
- Verify tags are separate chips and reasonably match the source tags.
- Verify the final state matches the user's request: draft saved, publish panel ready, or post published.
- Report the public Naver Blog URL after publishing.
- Report any content that could not transfer cleanly, especially images, embeds, tables, or links.

## Tag Helper

Use the helper to transform source tags:

```bash
python3 scripts/normalize_naver_tags.py 'LLM#Coding-Agent#Reinforcement-Learning#Reward-Design#Verification#Qwen'
```

The default output removes leading `#`, removes hyphens, de-duplicates tags, and prints a space-separated sequence suitable for Naver tag entry.
