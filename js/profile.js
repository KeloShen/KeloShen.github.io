// Parsers for the two human-editable content files:
//   content/profile.<lang>.md  -> everything about you (rooms, items, contact)
//   content/map.txt            -> how the rooms are laid out and connected
// See content/README.md for the format.

const slug = (s) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "item";

// "---\nkey: value\n---" at the top of the file
function frontMatter(md) {
  const m = md.match(/^﻿?---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { meta: {}, body: md };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^\s*([\w-]+)\s*:\s*(.*?)\s*$/);
    if (kv && !line.trim().startsWith("#")) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return { meta, body: md.slice(m[0].length) };
}

// "id: Title | extra"  or  "Title | extra"  or  "Title"
function splitHeading(h) {
  let id = null, rest = h.trim();
  const idm = rest.match(/^([a-z0-9_-]+)\s*:\s*(.+)$/i);
  if (idm) { id = idm[1].toLowerCase(); rest = idm[2]; }
  const [title, extra = ""] = rest.split("|").map((s) => s.trim());
  return { id, title, extra };
}

const tidy = (lines) => lines.join("\n").replace(/^\n+|\n+$/g, "").replace(/\n{3,}/g, "\n\n");

/**
 * Profile Markdown:
 *   # roomId: Room name | Section label
 *   > game narration shown when the visitor enters (blockquote)
 *   plain paragraphs = your own summary (Quick View + digital self)
 *   ## itemId: label | alias, alias      (id and aliases optional)
 *   text shown when the visitor examines it
 *   <!-- game-only -->   item hidden from Quick View
 *   <!-- ai: stats | learned | recent -->  item filled from the AI-journey data
 */
export function parseProfile(md) {
  const { meta, body } = frontMatter(md.replace(/\r\n/g, "\n"));
  const rooms = {};
  const order = [];
  let room = null, item = null, buf = [], quote = [];
  const flush = () => {
    if (item) {
      item.text = tidy(buf);
      rooms[room].items[item.id] = item;
    } else if (room) {
      rooms[room].desc = tidy(quote);
      rooms[room].quick = tidy(buf);
    }
    buf = []; quote = [];
  };
  for (const raw of body.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    const h1 = line.match(/^#\s+(.+)$/), h2 = line.match(/^##\s+(.+)$/);
    if (h1) {
      flush();
      const { id, title, extra } = splitHeading(h1[1]);
      room = id || slug(title);
      item = null;
      rooms[room] = { id: room, name: title, section: extra || title, desc: "", quick: "", order: [], items: {} };
      order.push(room);
      continue;
    }
    if (!room) continue;
    if (h2) {
      flush();
      const { id, title, extra } = splitHeading(h2[1]);
      const iid = id || slug(title);
      const names = extra ? extra.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const plain = title.replace(/^(a|an|the|ein|eine|einen|der|die|das|一个|一张|一本|一面|一排|一幅|一台|一份|一叠)\s*/i, "");
      item = { id: iid, label: title, names: [...names, plain, iid].filter((v, i, a) => v && a.indexOf(v) === i), text: "", gameOnly: false, ai: null };
      rooms[room].order.push(iid);
      continue;
    }
    const flag = line.match(/^\s*<!--\s*(.+?)\s*-->\s*$/);
    if (flag) {
      const f = flag[1].toLowerCase();
      if (item && f === "game-only") item.gameOnly = true;
      const ai = f.match(/^ai\s*:\s*(\w+)/);
      if (item && ai) { item.ai = ai[1]; item.gameOnly = true; }
      continue;
    }
    if (!item && /^>\s?/.test(line)) { quote.push(line.replace(/^>\s?/, "")); continue; }
    buf.push(line);
  }
  flush();
  return { meta, rooms, order };
}

/**
 * ASCII map. Room ids are words; "-" joins rooms on the same line (east/west),
 * "|" joins rooms vertically (north/south), ":" joins vertically as up/down.
 *
 *           library
 *              |
 *   playroom - foyer - workshop
 *              :
 *           archive
 */
export function parseMap(txt) {
  const lines = txt.replace(/\r\n/g, "\n").split("\n").filter((l) => !l.trim().startsWith("#"));
  const tokens = [];
  lines.forEach((line, y) => {
    for (const m of line.matchAll(/[a-z0-9_]+/gi)) tokens.push({ id: m[0].toLowerCase(), y, x0: m.index, x1: m.index + m[0].length - 1 });
  });
  const exits = {};
  for (const t of tokens) exits[t.id] = exits[t.id] || {};
  const link = (a, b, dirAB, dirBA) => { exits[a][dirAB] = b; exits[b][dirBA] = a; };
  // horizontal: two tokens on one line with only spaces/dashes between them, at least one dash
  for (const t of tokens) {
    const right = tokens.filter((u) => u.y === t.y && u.x0 > t.x1).sort((a, b) => a.x0 - b.x0)[0];
    if (!right) continue;
    const between = lines[t.y].slice(t.x1 + 1, right.x0);
    if (/^[\s-]*-[\s-]*$/.test(between)) link(t.id, right.id, "east", "west");
  }
  // vertical: a "|" or ":" below a token leads (straight down) to the next token
  for (const t of tokens) {
    for (let x = t.x0; x <= t.x1; x++) {
      const ch = lines[t.y + 1]?.[x];
      if (ch !== "|" && ch !== ":") continue;
      let y = t.y + 1;
      while (lines[y] && (lines[y][x] === "|" || lines[y][x] === ":")) y++;
      const below = tokens.find((u) => u.y === y && u.x0 <= x && u.x1 >= x);
      if (below) ch === ":" ? link(t.id, below.id, "down", "up") : link(t.id, below.id, "south", "north");
      break;
    }
  }
  // grid positions for the pixel map (walk the graph from the first room)
  const grid = {};
  const step = { east: [1, 0], west: [-1, 0], north: [0, -1], south: [0, 1], up: [0, -1], down: [0, 1] };
  const start = tokens[0]?.id;
  if (start) {
    grid[start] = [0, 0];
    const queue = [start];
    while (queue.length) {
      const id = queue.shift();
      for (const [d, to] of Object.entries(exits[id])) {
        if (grid[to]) continue;
        grid[to] = [grid[id][0] + step[d][0], grid[id][1] + step[d][1]];
        queue.push(to);
      }
    }
    const minX = Math.min(...Object.values(grid).map((g) => g[0])), minY = Math.min(...Object.values(grid).map((g) => g[1]));
    for (const id in grid) grid[id] = [grid[id][0] - minX, grid[id][1] - minY];
  }
  return { exits, grid };
}
