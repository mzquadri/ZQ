import { writeFileSync } from "node:fs";
const H = { "User-Agent": "zq-audit" };
const repos = await (await fetch("https://api.github.com/users/mzquadri/repos?per_page=100", { headers: H })).json();
if (!Array.isArray(repos)) { console.error(repos); process.exit(1); }
const out = [];
for (const r of repos) {
  let tree = [];
  try {
    const t = await (await fetch(`https://api.github.com/repos/mzquadri/${r.name}/git/trees/${r.default_branch}?recursive=1`, { headers: H })).json();
    tree = (t.tree || []).filter((n) => n.type === "blob").map((n) => ({ p: n.path, s: n.size }));
  } catch {}
  out.push({
    name: r.name, fork: r.fork, lang: r.language, desc: r.description,
    branch: r.default_branch, size: r.size, license: r.license?.spdx_id ?? null,
    files: tree.length, tree,
  });
  process.stderr.write(`${r.name} ${tree.length}\n`);
}
writeFileSync("tools/.audit/repos.json", JSON.stringify(out, null, 1));
console.log("repos:", out.length, "| non-fork:", out.filter((r) => !r.fork).length);
