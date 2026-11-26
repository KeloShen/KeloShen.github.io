// World structure, built at startup from content/map.txt (layout + exits)
// and content/profile.en.md (which rooms exist, their order, the start room).
import { parseMap } from "./profile.js";

export const DIRECTIONS = ["north", "south", "east", "west", "up", "down"];

export const WORLD = { start: null, rooms: {}, order: [] };

export function buildWorld(mapText, profileEn) {
  const map = parseMap(mapText);
  const inProfile = profileEn.roomOrder || Object.keys(profileEn.rooms || {});
  WORLD.rooms = {};
  for (const id of Object.keys(map.exits)) {
    if (!inProfile.includes(id)) { console.warn(`map.txt: room "${id}" has no "# ${id}:" section in profile.en.md`); continue; }
    WORLD.rooms[id] = { exits: {}, grid: map.grid[id] || [0, 0] };
    for (const [d, to] of Object.entries(map.exits[id])) if (inProfile.includes(to)) WORLD.rooms[id].exits[d] = to;
  }
  for (const id of inProfile) if (!WORLD.rooms[id]) console.warn(`profile.en.md: room "${id}" is not on map.txt, so visitors can't reach it`);
  WORLD.order = inProfile.filter((id) => WORLD.rooms[id]);
  const wanted = profileEn.meta?.start;
  WORLD.start = WORLD.rooms[wanted] ? wanted : WORLD.order[0];
  return WORLD;
}
