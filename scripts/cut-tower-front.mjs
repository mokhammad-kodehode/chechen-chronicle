// Cuts the front face of a tower .glb by removing triangles whose vertices
// are above Z > Z_THRESHOLD AND within an X/Y band. Result: a tower with
// a rectangular opening on one side, like an architectural cross-section.
//
// node scripts/cut-tower-front.mjs

import { NodeIO } from "@gltf-transform/core";
import { prune } from "@gltf-transform/functions";
import path from "node:path";

const INPUT = path.resolve("public/models/tower-watchtower.glb");
const OUTPUT = path.resolve("public/models/tower-cut.glb");

// Cut window: only remove triangles INSIDE this 3D box (in original model
// coordinates). Outside the box — leave intact.
//   Z > Z_MIN          → front half only
//   X within X_RANGE   → leave side walls intact (don't punch through corners)
//   Y within Y_RANGE   → leave roof + ground intact
const Z_MIN = 0.0; // remove front 50% (where Z > 0)
const X_MIN = -0.6,
  X_MAX = 0.6; // basically full width
const Y_MIN = -0.85,
  Y_MAX = 0.85; // leave roof (Y > 0.85) and base intact

const io = new NodeIO();
const doc = await io.read(INPUT);

for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const positions = prim.getAttribute("POSITION");
    const indices = prim.getIndices();
    if (!positions || !indices) continue;

    const posArr = positions.getArray();
    const indexArr = indices.getArray();
    const triBefore = indexArr.length / 3;

    // For each triangle: if ALL THREE vertices fall inside the cut box,
    // remove it. (If just one is inside, keep — preserves cut edges.)
    const newIndices = [];
    let removed = 0;
    for (let i = 0; i < indexArr.length; i += 3) {
      const a = indexArr[i],
        b = indexArr[i + 1],
        c = indexArr[i + 2];
      const inside = (vi) => {
        const x = posArr[vi * 3];
        const y = posArr[vi * 3 + 1];
        const z = posArr[vi * 3 + 2];
        return (
          z > Z_MIN &&
          x > X_MIN &&
          x < X_MAX &&
          y > Y_MIN &&
          y < Y_MAX
        );
      };
      if (inside(a) && inside(b) && inside(c)) {
        removed++;
      } else {
        newIndices.push(a, b, c);
      }
    }

    const triAfter = newIndices.length / 3;
    console.log(
      `Triangles: ${triBefore.toLocaleString()} → ${triAfter.toLocaleString()} ` +
        `(removed ${removed.toLocaleString()})`
    );

    indices.setArray(new Uint32Array(newIndices));
  }
}

console.log("→ Pruning unused vertices…");
await doc.transform(prune());

console.log(`→ Writing to ${OUTPUT}`);
await io.write(OUTPUT, doc);
console.log("✓ Done");
