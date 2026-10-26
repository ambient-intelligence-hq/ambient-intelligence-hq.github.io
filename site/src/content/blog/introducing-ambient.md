---
title: Any video in, any action out
description: Why we built Ambient as a video-understanding agent engine, and what "video to action" means when the agent watches instead of transcribes.
date: 2026-09-22
tag: Introducing
readingTime: 4 min read
draft: false
---

Most tools treat a video as a transcript problem. Get the words out, feed them to a model, call it understanding. But the words are the smallest part of what a video contains — the summit is reached in the pixels, not the caption.

## An engine, not a framework

Ambient is a video-understanding agent that reasons over long-form video and returns structured, citation-backed answers. We built it as an **engine**: something you run anywhere, drive with the Anthropic SDK, and point at any OpenAI-compatible model. It doesn't ask you to adopt a framework — it gives you a capability and gets out of the way.

## Watching, not skimming

The core idea is simple: don't stuff an hour of video into a context window. Let the agent **watch like an agent**. It searches for the relevant stretch with `search_clip`, focuses in with `focus_clip`, grabs exact frames when it needs to, and verifies bounding boxes and click-points before it trusts them. Every window is at most five minutes; the model only ever looks at what matters.

And the toolset adapts. If your model can see, Ambient hands it high-fidelity clips directly. If it can't, a vision sub-agent does the looking. Same loop, different shape.

## Action, not just answers

"Any action out" is the other half of the promise. The output isn't a paragraph you have to re-parse — it's:

- **Citations** that map back to the global video timeline, click-to-seek.
- **JSON-Schema output**, steered and validated against the shape you supply.
- **Boxes and click-points** on a normalized grid, drawn and verified.
- **Downloadable artifacts** — the agent can render a clip or extract data and hand back a URL.

## Fast, and honest about it

We took time-to-first-input from minutes down to **seconds** by decoupling description from readiness, and we read only the bytes a clip actually needs — often **1–2% of a multi-gigabyte source**. The whole pipeline caps at 768 pixels because nothing downstream needs more.

---

Want to try it? The [quickstart](../../docs/#quickstart) gets you from clone to answer with just ffmpeg and a model key.
