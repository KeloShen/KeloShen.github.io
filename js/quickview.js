// Quick View: renders content/quickview.<lang>.md (a one-page résumé) and the
// contact block shared with the terminal's `contact` command.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// **bold**, *italic*, `code`, [text](https://… or mailto:…)
function inline(text) {
  let s = esc(text);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  s = s.replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s;
}

/**
 * Small Markdown subset:
 *   # Title / ## Section / ### Entry title | right-aligned date
 *   - list item
 *   blank line = new paragraph; consecutive text lines = separate lines of one block
 */
export function renderMarkdown(md, vars = {}) {
  const text = md.replace(/\r\n/g, "\n").replace(/<!--[\s\S]*?-->/g, "").replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  const out = [];
  let list = null, para = null;
  const close = () => {
    if (list) { out.push(`<ul>${list.join("")}</ul>`); list = null; }
    if (para) { out.push(`<p>${para.join("<br>")}</p>`); para = null; }
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { close(); continue; }
    if ((m = line.match(/^###\s+(.+)$/))) {
      close();
      const [title, date] = m[1].split("|").map((x) => x.trim());
      out.push(`<div class="cv-entry"><span class="cv-title">${inline(title)}</span>${date ? `<span class="cv-date">${inline(date)}</span>` : ""}</div>`);
    } else if ((m = line.match(/^##\s+(.+)$/))) {
      close(); out.push(`<h2>${inline(m[1])}</h2>`);
    } else if ((m = line.match(/^#\s+(.+)$/))) {
      close(); out.push(`<h1>${inline(m[1])}</h1>`);
    } else if ((m = line.match(/^\s*[-*]\s+(.+)$/))) {
      if (para) { out.push(`<p>${para.join("<br>")}</p>`); para = null; }
      (list ||= []).push(`<li>${inline(m[1])}</li>`);
    } else {
      if (list) { out.push(`<ul>${list.join("")}</ul>`); list = null; }
      (para ||= []).push(inline(line.trim()));
    }
  }
  close();
  return out.join("\n");
}

// Simple generic line icons (stroke = currentColor)
const svg = (body) => `<svg class="ct-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const ICONS = {
  email: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>'),
  github: svg('<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m13.5 5-3 14"/>'),
  linkedin: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10.5" r="2.2"/><path d="M5.8 16.5c.6-1.8 1.8-2.7 3.2-2.7s2.6.9 3.2 2.7"/><path d="M14.5 9.5h4M14.5 13h4"/>'),
  website: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>'),
  resume: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>'),
};
const LABELS = { email: "Email", github: "GitHub", linkedin: "LinkedIn", website: "Website", resume: "Résumé" };

// Aligned contact rows: icon | label | link
export function contactHTML(contact, resumeUrl, resumeLabel) {
  const rows = [];
  const pretty = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  if (contact.email) rows.push(["email", `mailto:${contact.email}`, contact.email]);
  for (const k of ["github", "linkedin", "website"]) if (contact[k]) rows.push([k, contact[k], pretty(contact[k])]);
  if (resumeUrl) rows.push(["resume", resumeUrl, resumeLabel || "PDF"]);
  return `<div class="ct-grid">${rows.map(([k, href, text]) =>
    `${ICONS[k]}<span class="ct-label">${LABELS[k]}</span><a href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>`).join("")}</div>`;
}
