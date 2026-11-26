"""Build content/ask/index.json from the front matter of content/ask/*.md.
Files whose name starts with "_" are skipped. Run: python3 scripts/build_ask_index.py"""
import json, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent / "content" / "ask"
docs, errors = [], []
for f in sorted(root.glob("*.md")):
    if f.name.startswith("_"):
        continue
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", f.read_text(encoding="utf-8"), re.S)
    meta = dict(re.findall(r"^(\w+):\s*(.+?)\s*$", m.group(1), re.M)) if m else {}
    if not meta.get("name") or not meta.get("description"):
        errors.append(f"{f.name}: needs 'name' and 'description' in the front matter")
        continue
    docs.append({"name": meta["name"], "description": meta["description"], "file": f.name})
names = [d["name"] for d in docs]
if len(names) != len(set(names)):
    errors.append("duplicate names: " + ", ".join(n for n in names if names.count(n) > 1))
if errors:
    sys.exit("\n".join(errors))
(root / "index.json").write_text(json.dumps({"docs": docs}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"index.json: {len(docs)} document(s): {', '.join(names)}")
