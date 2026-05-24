// Removes the "ghost" small tower from tower.glb based on X-position.
// The main tower sits at X ∈ [-0.69 .. -0.23]; the ghost lives at X > 0.55.
// We cut the geometry at X = -0.20 (well inside the empty gap).
//
// node scripts/clean-tower.mjs

import { NodeIO } from "@gltf-transform/core";
import { prune } from "@gltf-transform/functions";
import path from "node:path";

const INPUT = path.resolve("public/models/tower.glb");
const OUTPUT = path.resolve("public/models/tower.glb");
const X_THRESHOLD = -0.2;

const io = new NodeIO();
const doc = await io.read(INPUT);

for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const positions = prim.getAttribute("POSITION");
    const indices = prim.getIndices();
    if (!positions || !indices) continue;

    const posArr = positions.getArray();
    const indexArr = indices.getArray();
    const vertexCount = positions.getCount();
    const triBefore = indexArr.length / 3;

    // Keep a triangle iff ALL three vertices are inside the main tower (X <= threshold)
    const newIndices = [];
    for (let i = 0; i < indexArr.length; i += 3) {
      const a = indexArr[i],
        b = indexArr[i + 1],
        c = indexArr[i + 2];
      const xa = posArr[a * 3];
      const xb = posArr[b * 3];
      const xc = posArr[c * 3];
      if (xa <= X_THRESHOLD && xb <= X_THRESHOLD && xc <= X_THRESHOLD) {
        newIndices.push(a, b, c);
      }
    }

    const triAfter = newIndices.length / 3;
    console.log(
      `Triangles: ${triBefore.toLocaleString()} → ${triAfter.toLocaleString()} ` +
        `(removed ${(triBefore - triAfter).toLocaleString()})`
    );

    indices.setArray(new Uint32Array(newIndices));
  }
}

console.log("→ Pruning unused vertices…");
await doc.transform(prune());

console.log(`→ Writing to ${OUTPUT}`);
await io.write(OUTPUT, doc);
console.log("✓ Done");
