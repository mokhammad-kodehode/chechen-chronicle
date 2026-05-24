// Rebuilds the geometry of public/models/tower.glb so that ONLY vertices
// actually referenced by the triangle index buffer remain in the position
// buffer (and matching attributes — normals, UVs, etc.).
//
// `prune()` from gltf-transform removes unused nodes/materials but does
// not compact a mesh's vertex attributes. Three.js's Box3.setFromObject
// looks at the raw position buffer, so leftover orphan vertices skew the
// auto-centering. This script eliminates them at the source.
//
// node scripts/compact-tower.mjs [path]

import { NodeIO } from "@gltf-transform/core";
import path from "node:path";

const filePath = process.argv[2] || "public/models/tower.glb";
const target = path.resolve(filePath);

const io = new NodeIO();
const doc = await io.read(target);

for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const indices = prim.getIndices();
    if (!indices) continue;

    const indexArr = indices.getArray();
    if (!indexArr) continue;

    // Find which old vertex indices are actually referenced
    const usedSet = new Set();
    for (let i = 0; i < indexArr.length; i++) {
      usedSet.add(indexArr[i]);
    }

    const positions = prim.getAttribute("POSITION");
    if (!positions) continue;
    const oldVertexCount = positions.getCount();
    const usedCount = usedSet.size;

    if (usedCount === oldVertexCount) {
      console.log(
        `  All ${oldVertexCount.toLocaleString()} vertices used — nothing to compact.`
      );
      continue;
    }

    console.log(
      `  Vertices: ${oldVertexCount.toLocaleString()} → ${usedCount.toLocaleString()} (will remove ${(
        oldVertexCount - usedCount
      ).toLocaleString()} orphans)`
    );

    // Build remap: old index → new index
    const sortedUsed = [...usedSet].sort((a, b) => a - b);
    const remap = new Int32Array(oldVertexCount);
    remap.fill(-1);
    sortedUsed.forEach((oldIdx, newIdx) => {
      remap[oldIdx] = newIdx;
    });

    // Rebuild each attribute keeping only used vertices
    const attributeSemantics = prim.listSemantics();
    for (const semantic of attributeSemantics) {
      const attr = prim.getAttribute(semantic);
      if (!attr) continue;
      const oldArr = attr.getArray();
      if (!oldArr) continue;
      const itemSize = attr.getElementSize();
      const newArrCtor = oldArr.constructor;
      // @ts-expect-error — TypedArray ctor
      const newArr = new newArrCtor(usedCount * itemSize);
      sortedUsed.forEach((oldIdx, newIdx) => {
        for (let k = 0; k < itemSize; k++) {
          newArr[newIdx * itemSize + k] = oldArr[oldIdx * itemSize + k];
        }
      });
      attr.setArray(newArr);
    }

    // Remap indices
    const newIndexArr = new Uint32Array(indexArr.length);
    for (let i = 0; i < indexArr.length; i++) {
      newIndexArr[i] = remap[indexArr[i]];
    }
    indices.setArray(newIndexArr);
  }
}

console.log(`→ Writing to ${target}`);
await io.write(target, doc);
console.log("✓ Done");
