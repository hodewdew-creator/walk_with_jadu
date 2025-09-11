// node scripts/build-photo-manifest.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BASE = path.join(ROOT, "public", "photos");
const GROUPS = ["under4k", "4k-10k", "over10k"];
const ALLOWED = new Set([".webp", ".jpg", ".jpeg", ".png"]);

function list(group) {
  const dir = path.join(BASE, group);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => ALLOWED.has(path.extname(f).toLowerCase()))
    // 숫자 정렬 우선, 그 다음 사전순
    .sort((a, b) => {
      const na = parseInt(a.replace(/\D+/g, ""), 10);
      const nb = parseInt(b.replace(/\D+/g, ""), 10);
      if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb;
      return a.localeCompare(b);
    });
}

const manifest = Object.fromEntries(GROUPS.map(g => [g, list(g)]));

const outFile = path.join(BASE, "manifest.json");
fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2));
console.log("Wrote", outFile);
console.log(manifest);
