// i18n + content loader.
//   content/ui.<lang>.json     interface strings
//   content/profile.<lang>.md  your content (parsed into rooms / items / meta)
// Anything missing in a language falls back to English.
import { parseProfile } from "./profile.js";
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

export class I18n {
  constructor(config) {
    this.config = config;
    this.cache = {};
    this.lang = config.defaultLang;
    this.dict = {};
    this.listeners = [];
  }

  async load(lang) {
    if (!this.cache[lang]) {
      const [ui, md] = await Promise.all([
        fetch(`content/ui.${lang}.json`, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : {})),
        fetch(`content/profile.${lang}.md`, { cache: "no-cache" }).then((r) => (r.ok ? r.text() : "")),
      ]);
      const profile = parseProfile(md);
      this.cache[lang] = { ...ui, rooms: profile.rooms, meta: profile.meta, roomOrder: profile.order };
    }
    return this.cache[lang];
  }

  // Front-matter value for the current language, falling back to English
  meta(key) {
    const v = this.cache[this.lang]?.meta?.[key];
    return v ? v : this.cache.en?.meta?.[key] || "";
  }

  // Item ids in a room: this language's order, plus any English-only items appended
  itemsOf(room) {
    const own = this.cache[this.lang]?.rooms?.[room]?.order || [];
    const en = this.cache.en?.rooms?.[room]?.order || [];
    return [...own, ...en.filter((id) => !own.includes(id))];
  }

  async init() {
    const codes = Object.keys(this.config.languages);
    const fromUrl = new URLSearchParams(location.search).get("lang");
    const pick = [fromUrl, store.get("lang"), this.config.defaultLang].find((l) => l && codes.includes(l));
    await this.load("en");
    await this.set(pick || "en", { persist: !!fromUrl });
  }

  async set(lang, { persist = true } = {}) {
    this.dict = await this.load(lang);
    this.lang = lang;
    if (persist) store.set("lang", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    this.listeners.forEach((fn) => fn(lang));
  }

  onChange(fn) { this.listeners.push(fn); }

  // Raw value lookup with English fallback
  get(path, lang = this.lang) {
    const dig = (obj) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
    const v = dig(this.cache[lang] || this.dict);
    return v === undefined ? dig(this.cache.en) : v;
  }

  // String lookup: arrays join with newlines, {vars} interpolated
  t(path, vars = {}) {
    let v = this.get(path);
    if (v === undefined) return path;
    if (Array.isArray(v)) v = v.join("\n");
    if (typeof v !== "string") return String(v);
    const all = { name: this.config.name, ...vars };
    return v.replace(/\{(\w+)\}/g, (m, k) => (k in all ? all[k] : m));
  }

  // Pick a localized value from data like {en:"..", zh:".."} or a plain string
  pick(v) {
    if (v == null) return "";
    if (typeof v === "string" || typeof v === "number") return String(v);
    return v[this.lang] ?? v.en ?? Object.values(v)[0] ?? "";
  }
}
