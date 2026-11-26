// Text-adventure engine: parsing, rooms, output queue, chips, autocomplete, ask.
import { WORLD, DIRECTIONS } from "./world.js";
import { pixelMapHTML } from "./pixelmap.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const isAscii = (s) => /^[\x00-\x7f]*$/.test(s);
const COMMANDS = ["help", "look", "go", "examine", "map", "quick", "resume", "contact", "lang", "ask", "clear", "replay"];

export class Game {
  constructor({ config, i18n, els, onReplay, onQuickView }) {
    this.config = config;
    this.i18n = i18n;
    this.els = els;
    this.onReplay = onReplay;
    this.onQuickView = onQuickView;
    this.room = WORLD.start;
    this.visited = new Set();
    this.history = [];
    this.hIdx = 0;
    this.queue = [];
    this.busy = false;
    this.fast = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.reduced = this.fast;
    this.askLog = [];
    this.aiData = null;
    this.buildMaps();
    this.bindInput();
  }

  t(k, v) { return this.i18n.t(k, v); }

  // ---------- vocabulary ----------
  buildMaps() {
    this.cmdMap = new Map();
    this.dirMap = new Map();
    for (const lang of new Set(["en", this.i18n.lang])) {
      const cmds = this.i18n.get("commands", lang) || {};
      for (const c of COMMANDS) {
        this.cmdMap.set(c, c);
        (cmds[c] || []).forEach((a) => this.cmdMap.set(a.toLowerCase(), c));
      }
      const dirs = this.i18n.get("directions", lang) || {};
      for (const d of DIRECTIONS) {
        this.dirMap.set(d, d);
        (dirs[d] || []).forEach((a) => this.dirMap.set(a.toLowerCase(), d));
      }
    }
    this.cmdAliases = [...this.cmdMap.keys()].sort((a, b) => b.length - a.length);
  }

  primary(cmd) { return (this.i18n.get(`commands.${cmd}`) || [cmd])[0]; }
  dirLabel(d) { return this.t(`ui.dirs.${d}`); }
  roomName(id) { return this.t(`rooms.${id}.name`); }

  // ---------- output ----------
  print(content, { cls = "", html = false, type = false } = {}) {
    this.queue.push({ content, cls, html, type });
    if (!this.busy) this.flush();
  }

  async flush() {
    this.busy = true;
    while (this.queue.length) {
      const it = this.queue.shift();
      const line = document.createElement("div");
      line.className = `line ${it.cls}`;
      this.els.output.appendChild(line);
      if (it.html) { line.classList.add("html"); line.innerHTML = it.content; }
      else if (it.type && !this.fast) await this.typeInto(line, it.content);
      else line.textContent = it.content;
      this.scroll();
    }
    this.busy = false;
    if (!this.reduced) this.fast = false;
  }

  typeInto(el, text) {
    return new Promise((res) => {
      let i = 0;
      const step = () => {
        if (this.fast) { el.textContent = text; return res(); }
        i = Math.min(text.length, i + 3);
        el.textContent = text.slice(0, i);
        this.scroll();
        if (i < text.length) setTimeout(step, 10); else res();
      };
      step();
    });
  }

  scroll() { this.els.screen.scrollTop = this.els.screen.scrollHeight; }
  gap() { this.print("", { cls: "gap" }); }

  // ---------- input ----------
  bindInput() {
    const { form, input } = this.els;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = input.value;
      input.value = "";
      if (this.busy) this.fast = true;
      this.run(v);
    });
    input.addEventListener("keydown", (e) => {
      if (this.busy && e.key !== "Tab") this.fast = true;
      if (e.key === "ArrowUp") {
        if (this.hIdx > 0) { this.hIdx--; input.value = this.history[this.hIdx]; }
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (this.hIdx < this.history.length) { this.hIdx++; input.value = this.history[this.hIdx] || ""; }
        e.preventDefault();
      } else if (e.key === "Tab") {
        e.preventDefault();
        this.autocomplete();
      }
    });
    this.els.screen.addEventListener("click", () => {
      if (this.busy) this.fast = true;
      if (!window.getSelection().toString()) input.focus({ preventScroll: true });
    });
  }

  completions(value) {
    const low = value.toLowerCase();
    const parts = low.split(/\s+/);
    if (parts.length <= 1) {
      return [...new Set(COMMANDS.map((c) => this.primary(c)).concat(COMMANDS))].filter((c) => c.startsWith(low)).map((c) => c + " ");
    }
    const [cmdWord, ...rest] = parts;
    const cmd = this.cmdMap.get(cmdWord);
    const tail = rest.join(" ");
    let pool = [];
    if (cmd === "go") pool = Object.keys(WORLD.rooms[this.room].exits).map((d) => (this.i18n.get(`directions.${d}`) || [d])[0]);
    if (cmd === "examine") pool = this.i18n.itemsOf(this.room).map((id) => this.itemNames(id)[0]);
    if (cmd === "lang") pool = Object.keys(this.config.languages);
    return pool.filter((p) => p.toLowerCase().startsWith(tail)).map((p) => `${cmdWord} ${p}`);
  }

  autocomplete() {
    const { input } = this.els;
    const opts = this.completions(input.value.trim());
    if (opts.length === 1) input.value = opts[0];
    else if (opts.length > 1) this.print(opts.map((o) => o.trim()).join("   "), { cls: "dim" });
  }

  echo(text) { this.print(`<span class="prompt">&gt;</span> ${esc(text)}`, { html: true, cls: "echo" }); }

  // ---------- parsing ----------
  split(input) {
    const low = input.toLowerCase();
    for (const a of this.cmdAliases) {
      if (low === a) return [this.cmdMap.get(a), ""];
      if (low.startsWith(a) && (low[a.length] === " " || !isAscii(a))) return [this.cmdMap.get(a), input.slice(a.length).trim()];
    }
    return [null, input];
  }

  dirOf(s) { return this.dirMap.get(String(s).trim().toLowerCase()); }

  async run(raw) {
    const input = raw.trim();
    if (!input) return;
    this.echo(input);
    this.history.push(input);
    this.hIdx = this.history.length;

    const low = input.toLowerCase();
    if (low === "xyzzy") return this.print(this.t("ui.egg.xyzzy"), { type: true });
    if (/^sudo\s+hire\s+me/.test(low)) return this.print(this.t("ui.egg.sudo"), { type: true, cls: "accent" });

    const [cmd, rest] = this.split(input);
    if (!cmd) {
      const d = this.dirOf(input);
      if (d) return this.go(d);
      return this.unknown(input);
    }
    try {
      await this[`cmd_${cmd}`](rest);
    } catch (err) {
      console.error(err);
      this.print(this.t("ui.error"), { cls: "error" });
    }
    this.refreshChips();
  }

  unknown(input) {
    this.print(this.t("ui.unknown", { input }), { cls: "dim" });
    if (this.config.askEndpoint) this.print(this.t("ui.unknownAsk", { ask: this.primary("ask") }), { cls: "dim" });
  }

  // ---------- rooms ----------
  // Print the opening instantly (used when the intro decodes the text itself)
  startInstant() {
    const keep = this.reduced;
    this.fast = true; this.reduced = true;
    this.start();
    this.reduced = keep; this.fast = keep;
  }

  start() {
    this.print(this.t("ui.welcome"), { cls: "banner", type: true });
    this.gap();
    this.enter(WORLD.start);
    this.els.input.focus({ preventScroll: true });
  }

  enter(id) {
    this.room = id;
    const first = !this.visited.has(id);
    this.visited.add(id);
    this.describe(first);
    if (this.i18n.itemsOf(id).some((it) => this.itemAI(id, it))) this.loadAI().then(() => this.print(this.aiTeaser(), { cls: "accent" }));
    this.refreshChips();
  }

  describe() {
    const r = WORLD.rooms[this.room];
    this.print(`${this.roomName(this.room)}  ·  ${this.t(`rooms.${this.room}.section`)}`, { cls: "title" });
    this.print(this.t(`rooms.${this.room}.desc`), { type: true });
    const items = this.i18n.itemsOf(this.room).map((id) => this.t(`rooms.${this.room}.items.${id}.label`)).join(", ");
    this.print(`${this.t("ui.youSee")} ${items}`, { cls: "dim" });
    const exits = Object.entries(r.exits).map(([d, to]) => `${this.dirLabel(d)} → ${this.roomName(to)}`).join("   ");
    this.print(`${this.t("ui.exits")} ${exits}`, { cls: "dim" });
  }

  go(dir) {
    const to = WORLD.rooms[this.room].exits[dir];
    if (!to) return this.print(this.t("ui.cantGo"), { cls: "dim" });
    this.gap();
    this.enter(to);
  }

  itemAI(room, id) { return this.i18n.get(`rooms.${room}.items.${id}.ai`) || null; }

  itemNames(id) {
    const names = this.i18n.get(`rooms.${this.room}.items.${id}.names`) || [];
    const en = this.i18n.get(`rooms.${this.room}.items.${id}.names`, "en") || [];
    return [...names, ...en, id];
  }

  findItem(q) {
    const s = q.toLowerCase().replace(/^(the|a|an)\s+/, "");
    const items = this.i18n.itemsOf(this.room);
    return items.find((id) => this.itemNames(id).some((n) => n.toLowerCase() === s))
      || items.find((id) => this.itemNames(id).some((n) => n.toLowerCase().includes(s) || s.includes(n.toLowerCase())));
  }

  // ---------- commands ----------
  cmd_help() { this.print(this.t("ui.help"), { cls: "help" }); }
  cmd_look() { this.describe(); }
  cmd_clear() { this.els.output.innerHTML = ""; }

  cmd_go(rest) {
    const d = this.dirOf(rest);
    if (!d) return this.print(this.t("ui.goWhere"), { cls: "dim" });
    this.go(d);
  }

  async cmd_examine(rest) {
    if (!rest) return this.describe();
    const id = this.findItem(rest);
    if (!id) return this.print(this.t("ui.noItem", { item: rest }), { cls: "dim" });
    const dyn = this.itemAI(this.room, id);
    if (dyn) { await this.loadAI(); return this.renderAI(dyn); }
    this.print(this.t(`rooms.${this.room}.items.${id}.text`), { type: true });
  }

  cmd_map() {
    const map = pixelMapHTML({ here: this.room, roomName: (id) => this.roomName(id), section: (id) => this.t(`rooms.${id}.section`) });
    this.print(`${map}<div class="dim px-legend">${esc(this.t("ui.mapLegend"))}</div>`, { html: true });
  }

  cmd_quick() { this.onQuickView?.(); }

  cmd_resume() {
    const url = this.config.resumeUrl;
    if (!url) return this.print(this.t("ui.resumeNone", { contact: this.primary("contact") }), { cls: "dim" });
    this.print(`${esc(this.t("ui.resume"))} <a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a>`, { html: true });
    window.open(url, "_blank", "noopener");
  }

  cmd_contact() {
    const c = this.config.contact;
    const rows = [];
    if (c.email) rows.push(`✉  <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`);
    for (const k of ["github", "linkedin", "website"]) if (c[k]) rows.push(`↗  ${k}: <a href="${esc(c[k])}" target="_blank" rel="noopener">${esc(c[k])}</a>`);
    this.print(`${esc(this.t("ui.contact"))}<br>${rows.join("<br>")}`, { html: true });
  }

  async cmd_lang(rest) {
    const code = rest.trim().toLowerCase();
    const langs = this.config.languages;
    if (!code || !langs[code]) {
      const list = Object.entries(langs).map(([k, v]) => `${k} (${v})`).join(", ");
      return this.print(this.t("ui.langList", { list }), { cls: "dim" });
    }
    await this.i18n.set(code);
    this.buildMaps();
    this.print(this.t("ui.langSwitched"), { cls: "accent" });
    this.gap();
    this.describe();
  }

  cmd_replay() { this.onReplay?.(); }

  async cmd_ask(rest) {
    const q = rest.trim();
    if (!q) return this.print(this.t("ui.askUsage", { ask: this.primary("ask") }), { cls: "dim" });
    if (!this.config.askEndpoint) return this.print(this.t("ui.askOffline"), { cls: "dim" });

    const id = `think-${Date.now()}`;
    this.print(`<span id="${id}" class="thinking">${esc(this.t("ui.askThinking"))}</span>`, { html: true, cls: "dim" });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(this.config.askEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, lang: this.i18n.lang, history: this.askLog.slice(-6) }),
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => ({}));
      document.getElementById(id)?.closest(".line")?.remove();
      if (res.status === 429) return this.print(this.t("ui.askLimited"), { cls: "dim" });
      if (!res.ok || !data.answer) throw new Error(data.error || res.status);
      this.askLog.push({ role: "user", content: q }, { role: "assistant", content: data.answer });
      this.print(`◈ ${this.config.name}:`, { cls: "accent" });
      this.print(data.answer, { type: true, cls: "answer" });
    } catch (err) {
      console.warn(err);
      document.getElementById(id)?.closest(".line")?.remove();
      this.print(this.t("ui.askError"), { cls: "error" });
    } finally {
      clearTimeout(timer);
    }
  }

  // ---------- AI journey ----------
  aiSources() {
    const a = this.config.aiJourney;
    const list = [];
    if (a.url) list.push(a.url);
    else if (this.config.github && !this.config.github.startsWith("your-")) {
      list.push(`https://raw.githubusercontent.com/${this.config.github}/${a.repo}/${a.branch}/${a.file}`);
    }
    list.push(a.fallback);
    return list;
  }

  async loadAI() {
    if (this.aiData) return this.aiData;
    for (const url of this.aiSources()) {
      try {
        const res = await fetch(url, { cache: "no-cache" });
        if (res.ok) {
          this.aiData = await res.json();
          this.aiData._src = url;
          this.aiData.sample = url === this.config.aiJourney.fallback;   // placeholder data: don't show fake numbers
          return this.aiData;
        }
      } catch { /* try next */ }
    }
    this.aiData = { totalChats: 0, tools: {}, topics: [], learned: [], recent: [] };
    return this.aiData;
  }

  aiTeaser() {
    const d = this.aiData || {};
    if (d.sample) return this.t("ui.ai.soonTeaser");
    return this.t("ui.ai.teaser", { n: d.totalChats ?? 0, topics: (d.topics || []).length });
  }

  repoUrl(path = "") {
    const a = this.config.aiJourney;
    const base = `https://github.com/${this.config.github}/${a.repo}`;
    return path ? `${base}/blob/${a.branch}/${path}` : base;
  }

  bars(entries) {
    const max = Math.max(1, ...entries.map((e) => e[1]));
    return entries.map(([label, n]) => {
      const w = Math.round((n / max) * 100);
      return `<div class="bar-row"><span class="bar-label">${esc(label)}</span><span class="meter"><i style="width:${w}%"></i></span><span class="bar-n">${n}</span></div>`;
    }).join("");
  }

  renderAI(kind) {
    const d = this.aiData;
    if (d.sample) return this.print(this.t("ui.ai.soon"), { cls: "dim" });
    const p = (v) => this.i18n.pick(v);
    if (kind === "stats") {
      const tools = Object.entries(d.tools || {}).sort((a, b) => b[1] - a[1]);
      const topics = (d.topics || []).slice(0, 6).map((t) => [p(t.name), t.count]);
      this.print(
        `<div class="title">${esc(this.t("ui.ai.statsTitle"))}</div>
         <div class="dim">${esc(this.t("ui.ai.meta", { n: d.totalChats ?? 0, updated: d.updated || "—" }))}</div>
         <div class="sub">${esc(this.t("ui.ai.tools"))}</div>${this.bars(tools)}
         <div class="sub">${esc(this.t("ui.ai.topics"))}</div>${this.bars(topics)}`,
        { html: true },
      );
    } else if (kind === "learned") {
      const items = (d.learned || []).map((l) => `<li>${esc(p(l))}</li>`).join("");
      this.print(
        `<div class="title">${esc(this.t("ui.ai.learnedTitle"))}</div>
         ${d.headline ? `<p>${esc(p(d.headline))}</p>` : ""}<ul>${items}</ul>`,
        { html: true },
      );
    } else if (kind === "recent") {
      const rows = (d.recent || []).map((r) => {
        const title = esc(p(r.title));
        const link = r.path && !this.config.github.startsWith("your-") ? `<a href="${esc(this.repoUrl(r.path))}" target="_blank" rel="noopener">${title}</a>` : title;
        return `<li><span class="dim">${esc(r.date || "")}</span> ${link} <span class="tag">${esc(r.tool || "")}</span></li>`;
      }).join("");
      const repo = this.config.github.startsWith("your-") ? "" : `<div><a href="${esc(this.repoUrl())}" target="_blank" rel="noopener">${esc(this.t("ui.ai.openRepo"))} ↗</a></div>`;
      this.print(`<div class="title">${esc(this.t("ui.ai.recentTitle"))}</div><ul>${rows}</ul>${repo}`, { html: true });
    }
  }

  // ---------- chips ----------
  refreshChips() {
    const r = WORLD.rooms[this.room];
    const chips = [];
    chips.push({ label: this.primary("look"), cmd: this.primary("look") });
    for (const d of Object.keys(r.exits)) {
      chips.push({ label: `${this.dirLabel(d)} · ${this.roomName(r.exits[d])}`, cmd: `${this.primary("go")} ${(this.i18n.get(`directions.${d}`) || [d])[0]}`, cls: "go" });
    }
    for (const id of this.i18n.itemsOf(this.room)) {
      chips.push({ label: `${this.primary("examine")} ${this.itemNames(id)[0]}`, cmd: `${this.primary("examine")} ${this.itemNames(id)[0]}` });
    }
    chips.push({ label: `${this.primary("ask")}…`, fill: `${this.primary("ask")} `, cls: "ask" });
    chips.push({ label: this.primary("map"), cmd: this.primary("map") });
    chips.push({ label: this.primary("help"), cmd: this.primary("help") });

    const box = this.els.chips;
    box.innerHTML = "";
    for (const c of chips) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `chip ${c.cls || ""}`;
      b.textContent = c.label;
      b.onclick = () => {
        if (c.fill) { this.els.input.value = c.fill; this.els.input.focus(); return; }
        if (this.busy) this.fast = true;
        this.run(c.cmd);
      };
      box.appendChild(b);
    }
  }
}
