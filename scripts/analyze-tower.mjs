// Histograms vertex distribution for any .glb file passed as argument.
// Usage:
//   node scripts/analyze-tower.mjs public/models/tower.glb
//   node scripts/analyze-tower.mjs public/models/tower-section.glb

import { NodeIO } from "@gltf-transform/core";

const file = process.argv[2] || "public/models/tower.glb";
const io = new NodeIO();
const doc = await io.read(file);

console.log(`\n=== ${file} ===\n`);

for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const positions = prim.getAttribute("POSITION");
    if (!positions) continue;
    const arr = positions.getArray();
    const count = positions.getCount();

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    for (let i = 0; i < count; i++) {
      const x = arr[i * 3];
      const y = arr[i * 3 + 1];
      const z = arr[i * 3 + 2];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    console.log(
      `Vertices: ${count.toLocaleString()}, triangles: ${(prim.getIndices()?.getCount() / 3).toLocaleString()}`
    );
    console.log(
      `bbox: X[${minX.toFixed(3)} .. ${maxX.toFixed(3)}] (w=${(maxX - minX).toFixed(3)})`
    );
    console.log(
      `      Y[${minY.toFixed(3)} .. ${maxY.toFixed(3)}] (h=${(maxY - minY).toFixed(3)})`
    );
    console.log(
      `      Z[${minZ.toFixed(3)} .. ${maxZ.toFixed(3)}] (d=${(maxZ - minZ).toFixed(3)})`
    );

    // X histogram
    const BINS = 30;
    const bins = new Array(BINS).fill(0);
    const width = maxX - minX;
    for (let i = 0; i < count; i++) {
      const x = arr[i * 3];
      const idx = Math.min(
        BINS - 1,
        Math.floor(((x - minX) / width) * BINS)
      );
      bins[idx]++;
    }
    const maxBin = Math.max(...bins);
    console.log("\nX-histogram:");
    bins.forEach((c, i) => {
      const xLow = minX + (i / BINS) * width;
      const xHigh = minX + ((i + 1) / BINS) * width;
      const bar = "█".repeat(Math.round((c / maxBin) * 50));
      console.log(
        `  [${xLow.toFixed(2).padStart(6)} .. ${xHigh
          .toFixed(2)
          .padStart(6)}] ${String(c).padStart(6)} ${bar}`
      );
    });
  }
}
