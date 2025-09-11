// public/photos/manifest.json을 불러와서, 걸음수에 맞는 그룹에서
// 날짜+걸음수 기반 '안 흔들리는 랜덤' 1장을 반환

export async function loadPhotosManifest() {
  if (window.__photosManifest) return window.__photosManifest;
 const base = location.protocol === "file:" ? "" : "/";
 const res = await fetch(`${base}photos/manifest.json`, { cache: "no-store" });
  if (!res.ok) throw new Error("manifest fetch failed");
  const json = await res.json();
  window.__photosManifest = json;
  return json;
}

export function pickPhotoUrl(steps, seedDate, manifest) {
  const group = steps < 4000 ? "under4k" : steps < 10000 ? "4k-10k" : "over10k";
  const list = manifest?.[group] ?? [];
  if (!list.length) return null;

  const idx = deterministicIndex(list.length, `${seedDate}-${steps}`);
  const file = list[idx];
  return `/photos/${group}/${file}`;
}

// 간단한 결정적 해시 → 0..n-1
function deterministicIndex(n, seed) {
  let h = 2166136261 >>> 0;           // FNV 기반 가벼운 해시
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h % n;
}
