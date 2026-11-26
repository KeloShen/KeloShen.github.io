import { CONFIG } from "./config.js";
import { WORLD, buildWorld } from "./world.js";
import { I18n } from "./i18n.js";
import { Game } from "./engine.js";
import { runIntro } from "./intro.js";
import { renderMarkdown, contactHTML } from "./quickview.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

const i18n = new I18n(CONFIG);
await i18n.init();
buildWorld(await fetch("content/map.txt", { cache: "no-cache" }).then((r) => r.text()), i18n.cache.en);

// Identity and contact details come from the front matter of content/profile.<lang>.md
function applyProfileMeta() {
  const m = (k) => i18n.meta(k);
  const gh = m("github");
  CONFIG.name = m("name") || "Your Name";
  CONFIG.tagline = m("tagline");
  CONFIG.github = gh;
  CONFIG.resumeUrl = m("resume");
  CONFIG.contact = {
    email: m("email"),
    github: gh && !/^https?:/.test(gh) ? `https://github.com/${gh}` : gh,
    linkedin: m("linkedin"),
    website: m("website"),
  };
}
applyProfileMeta();

// ---------- static UI text ----------
function paintUI() {
  applyProfileMeta();
  $("intro-name").textContent = CONFIG.name;
  document.title = `${CONFIG.name} · ${i18n.t("ui.pageTitle")}`;
  $("brand-name").textContent = CONFIG.name;
  $("brand-tag").textContent = CONFIG.tagline;
  $("cmd").placeholder = i18n.t("ui.placeholder");
  $("skip").textContent = i18n.t("ui.skip");
  $("intro-hello").textContent = i18n.t("ui.introHello");
  $("quick-btn").textContent = i18n.t("ui.quickView");
  $("quick-close").setAttribute("aria-label", i18n.t("ui.close"));
  document.querySelectorAll(".lang-btn").forEach((b) => b.classList.toggle("active", b.dataset.lang === i18n.lang));
}

const langBox = $("langs");
for (const [code, label] of Object.entries(CONFIG.languages)) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "lang-btn";
  b.dataset.lang = code;
  b.textContent = label;
  b.onclick = () => { if (code !== i18n.lang) game.run(`lang ${code}`); };
  langBox.appendChild(b);
}
i18n.onChange(() => { paintUI(); if (!$("quick").hidden) openQuickView(); game?.refreshChips(); });
paintUI();

// ---------- Quick View (plain résumé-style page) ----------
// Quick View = content/quickview.<lang>.md rendered as a one-page résumé,
// followed by the contact block (from the profile front matter).
const quickCache = {};
async function loadQuickView(lang) {
  if (!(lang in quickCache)) {
    quickCache[lang] = await fetch(`content/quickview.${lang}.md`, { cache: "no-cache" })
      .then((r) => (r.ok ? r.text() : null)).catch(() => null);
  }
  return quickCache[lang];
}
async function openQuickView() {
  const md = (await loadQuickView(i18n.lang)) ?? (await loadQuickView("en")) ?? `# ${CONFIG.name}`;
  let html = renderMarkdown(md, { name: CONFIG.name });
  const ai = await game.loadAI();
  if (ai && !ai.sample) html += `<p class="dim cv-note">${esc(i18n.t("ui.ai.meta", { n: ai.totalChats ?? 0, updated: ai.updated || "—" }))}</p>`;
  html += `<h2>${esc(i18n.t("ui.contact"))}</h2>${contactHTML(CONFIG.contact, CONFIG.resumeUrl, i18n.t("ui.downloadResume"))}`;
  $("quick-body").innerHTML = html;
  $("quick").hidden = false;
  $("quick-close").focus();
}
const closeQuickView = () => { $("quick").hidden = true; $("cmd").focus(); };
$("quick-btn").onclick = openQuickView;
$("quick-close").onclick = closeQuickView;
$("quick").addEventListener("click", (e) => { if (e.target.id === "quick") closeQuickView(); });
window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("quick").hidden) closeQuickView(); });

// ---------- intro ----------
// Positions of every visible character in the terminal UI, so the intro can
// "decode" its final characters exactly on top of the real text.
function collectGlyphs() {
  const out = [];
  const root = document.querySelector(".app");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const vh = innerHeight;
  for (let node = walker.nextNode(); node && out.length < 3000; node = walker.nextNode()) {
    const el = node.parentElement;
    if (!el || !node.textContent.trim()) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    const font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const text = node.textContent;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (/\s/.test(ch)) continue;
      range.setStart(node, i); range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > vh) continue;
      out.push({ ch, x: r.left, y: r.top + r.height / 2, font, color: cs.color });
    }
  }
  return out;
}
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

let started = false;
function startGame(instant) {
  if (started) return;
  started = true;
  document.body.classList.add("ready");
  if (instant) game.startInstant(); else game.start();
}

function intro(firstRun) {
  return runIntro({
    overlay: $("intro"),
    statusEl: $("intro-status"),
    textEl: $("intro-text"),
    skipBtn: $("skip"),
    labels: { sub: i18n.t("ui.introSub"), entering: i18n.t("ui.introEntering") },
    name: CONFIG.name,
    config: CONFIG.intro,
    // called on the white screen: lay out the terminal underneath, return its glyphs
    reveal: async () => {
      if (firstRun) startGame(true);
      await nextFrame();
      await new Promise((r) => setTimeout(r, 300));   // let line fade-in animations settle
      return collectGlyphs();
    },
  });
}
$("intro-name").textContent = CONFIG.name;
$("intro-hello").textContent = i18n.t("ui.introHello");

// ---------- game ----------
const game = new Game({
  config: CONFIG,
  i18n,
  els: { screen: $("screen"), output: $("output"), form: $("prompt"), input: $("cmd"), chips: $("chips") },
  onReplay: async () => { await intro(false); $("cmd").focus(); },
  onQuickView: openQuickView,
});

const forceIntro = new URLSearchParams(location.search).has("intro");
const skip = CONFIG.intro.skipOnRepeat && store.get("introSeen") && !forceIntro;
if (!skip) {
  await intro(true);
  store.set("introSeen", "1");
}
startGame(false);   // no-op if the intro already started it
$("cmd").focus({ preventScroll: true });
