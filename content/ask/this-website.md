---
name: this-website
description: How this portfolio website was designed and built: the Three.js sand intro, the text-adventure engine, the content system, three languages, the public AI chat log repo with automatic privacy check and AI summary, and this "ask" digital self with on-demand document loading. Also how I worked with AI to build it.
---

# This website (keloshen.github.io)

## Idea
A portfolio that recruiters can explore like Zork, a classic text adventure. Rooms stand for parts of my life (Foyer = about me, Library = education, Workshop = projects and skills, Office = work, Playroom = hobbies, Server Archive = how I use AI). Type "quick" for a one-page résumé if you're in a hurry. Languages: English, Chinese, German.

## How it is built
- Pure static site on GitHub Pages: ES modules, no framework, no build step.
- Intro: a static image turned into about 140k sand particles with Three.js; shaders move them with curl noise, then a sand storm whites out the screen and characters decode into the exact positions of the terminal text underneath, so the animation hands over seamlessly to the real page. Three.js is a tree-shaken custom bundle to keep it small.
- Engine: a command parser (go, examine, map, quick, contact, lang, ask…) with aliases in three languages; compass directions only; a pixel-art map generated from an ASCII map file.
- Content system: all text lives in Markdown files (one profile per language plus a résumé file) and is parsed at runtime into rooms and items. Editing one file changes the site, and the format is easy for both people and AI to edit.
- Design: black on white terminal; earlier versions used cyan, which I dropped because it looked generic.

## The AI journey (Server Archive)
- A separate public repo, KeloShen/ai-journey, holds AI conversations I chose to publish.
- On every push a GitHub Action first runs a privacy check (phone numbers, emails, ID numbers, API keys…); if it finds something, the run fails and I get an email, and nothing is published. Then a script asks an LLM (DeepSeek) to summarise what I asked and what I learned, and publishes summary.json, which the website reads.
- Why public: to show how I use AI and what I learn from it. I think hiring may one day go as far as judging candidates by their AI chat history, and I want to be ready.

## The "ask" digital self
- A Cloudflare Worker keeps the API key secret, rate-limits visitors and calls DeepSeek.
- Progressive loading, the same idea as the scenario skills in my thesis: the system prompt always holds a short profile plus a catalogue of documents (one line each); the model calls a tool to load the full documents only when a question needs them. Small talk loads nothing; a deep question about my thesis loads the thesis document. Adding knowledge means adding a Markdown file; a GitHub Action rebuilds the catalogue.

## How I built it with AI
Built together with Claude. I set direction and judged results: I rejected the first particle "digital life" effect, then hand-drawn figures as too crude, asked for black-and-white instead of cyan, removed motion that had no purpose, switched to compass directions, cut the quick view down to a résumé, and insisted on one content source that is easy to maintain. AI wrote most of the code; the product decisions, taste and iteration were mine.
