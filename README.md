# Kunxiang Shen · Digital Life

**Live:** https://keloshen.github.io

An interactive text-adventure portfolio. A Three.js particle intro (a static image turned into ~140k grains of sand by shaders) leads into a terminal where visitors explore rooms (About, Education, Projects, Work, Hobbies, AI journey) by typing commands, in English, Chinese or German.

## Editing content

Everything about me lives in [`content/`](content/): `profile.en.md` (plus `.zh` / `.de`) and `map.txt`. No code changes needed to add a project, an experience or even a whole room. See [`content/README.md`](content/README.md).

## Structure

- `content/` · profile, room map, UI strings
- `js/` · terminal engine, content parser, pixel map, intro (Three.js shaders)
- `vendor/three.min.js` · tree-shaken Three.js build, self-hosted
- `assets/` · intro image

The previous Hexo blog (2023) is preserved on the [`old-hexo-blog`](../../tree/old-hexo-blog) branch.

Built with Claude.
