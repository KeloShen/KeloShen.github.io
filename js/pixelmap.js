// Pixel-art map: 12x12 sprites per room, pixel corridors, blinking player.
import { WORLD } from "./world.js";

// '#' = ink, '.' = empty
const SPRITES = {
  foyer: [      // door
    "...######...",
    "..#......#..",
    ".#........#.",
    ".#........#.",
    ".#........#.",
    ".#........#.",
    ".#......#.#.",
    ".#......#.#.",
    ".#........#.",
    ".#........#.",
    ".#........#.",
    "############",
  ],
  library: [    // open book
    "............",
    ".####..####.",
    "#....##....#",
    "#.##.##.##.#",
    "#....##....#",
    "#.##.##.##.#",
    "#....##....#",
    "#.##.##.##.#",
    "#....##....#",
    ".####..####.",
    ".....##.....",
    "............",
  ],
  workshop: [   // hammer
    "............",
    "..#######...",
    ".#########..",
    ".#######.#..",
    "..#######...",
    ".....##.....",
    ".....##.....",
    ".....##.....",
    ".....##.....",
    ".....##.....",
    "....####....",
    "............",
  ],
  playroom: [   // gamepad
    "............",
    "............",
    "..########..",
    ".#........#.",
    "#..#....#..#",
    "#.###..#.#.#",
    "#..#....#..#",
    "#.....##...#",
    "#..........#",
    ".#.######.#.",
    "..#......#..",
    "............",
  ],
  office: [     // briefcase
    "............",
    "....####....",
    "...#....#...",
    ".##########.",
    "#..........#",
    "#..........#",
    "#####..#####",
    "#....##....#",
    "#..........#",
    "#..........#",
    ".##########.",
    "............",
  ],
  archive: [    // server rack
    ".##########.",
    ".#........#.",
    ".#.####.#.#.",
    ".#........#.",
    ".##########.",
    ".#........#.",
    ".#.####.#.#.",
    ".#........#.",
    ".##########.",
    ".#.####.#.#.",
    ".#........#.",
    ".##########.",
  ],
};
// Used for rooms without their own sprite (add one above with the room id as key)
const DEFAULT = [
  "............",
  "..########..",
  ".#........#.",
  ".#.######.#.",
  ".#.#....#.#.",
  ".#.#.##.#.#.",
  ".#.#.##.#.#.",
  ".#.#....#.#.",
  ".#.######.#.",
  ".#........#.",
  "..########..",
  "............",
];
const PLAYER = [
  "..##..",
  "..##..",
  ".####.",
  "#.##.#",
  "..##..",
  ".#..#.",
  ".#..#.",
];

const cache = new Map();
function spriteURL(rows, color, scale = 3) {
  const key = rows.join("") + color + scale;
  if (cache.has(key)) return cache.get(key);
  const cv = document.createElement("canvas");
  cv.width = rows[0].length * scale; cv.height = rows.length * scale;
  const g = cv.getContext("2d");
  g.fillStyle = color;
  rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === "#") g.fillRect(x * scale, y * scale, scale, scale); }));
  const url = cv.toDataURL();
  cache.set(key, url);
  return url;
}

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Returns HTML for the map. Grid: rooms on even cells, corridors between them.
export function pixelMapHTML({ here, roomName, section }) {
  const ids = Object.keys(WORLD.rooms);
  const cells = new Map();   // "col,row" -> html
  for (const id of ids) {
    const [x, y] = WORLD.rooms[id].grid;
    const isHere = id === here;
    const icon = `<img class="px-icon" alt="" src="${spriteURL(SPRITES[id] || DEFAULT, isHere ? "#fff" : "#111")}">`;
    const me = isHere ? `<img class="px-me" alt="" src="${spriteURL(PLAYER, "#fff", 3)}">` : "";
    cells.set(`${x * 2},${y * 2}`, `<div class="px-room${isHere ? " here" : ""}" style="grid-column:${x * 2 + 1};grid-row:${y * 2 + 1}">
      <div class="px-art">${icon}${me}</div><b>${esc(roomName(id))}</b><small>${esc(section(id))}</small></div>`);
    for (const to of Object.values(WORLD.rooms[id].exits)) {
      const [tx, ty] = WORLD.rooms[to].grid;
      const cx = x + tx, cy = y + ty;              // midpoint on the doubled grid
      const key = `${cx},${cy}`;
      if (cells.has(key)) continue;
      const dir = cx % 2 ? "h" : "v";
      cells.set(key, `<div class="px-hall ${dir}" style="grid-column:${cx + 1};grid-row:${cy + 1}"><i></i></div>`);
    }
  }
  const maxX = Math.max(...ids.map((id) => WORLD.rooms[id].grid[0]));
  const maxY = Math.max(...ids.map((id) => WORLD.rooms[id].grid[1]));
  const cols = Array.from({ length: maxX * 2 + 1 }, (_, i) => (i % 2 ? "var(--px-hall)" : "minmax(0, var(--px-room))")).join(" ");
  const rows = Array.from({ length: maxY * 2 + 1 }, (_, i) => (i % 2 ? "var(--px-hall-v)" : "auto")).join(" ");
  return `<div class="px-map" style="grid-template-columns:${cols};grid-template-rows:${rows}">${[...cells.values()].join("")}</div>`;
}
