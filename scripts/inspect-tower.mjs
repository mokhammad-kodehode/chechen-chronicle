// Inspect the structure of tower.glb so we know where the small "ghost"
// tower lives — is it a separate mesh/node, a separate primitive, or an
// island inside the same primitive?
//
// node scripts/inspect-tower.mjs

import { NodeIO } from "@gltf-transform/core";
import path from "node:path";

const ioPath = path.resolve("public/models/tower.glb");
const io = new NodeIO();
const doc = await io.read(ioPath);
const root = doc.getRoot();

console.log("=== Scenes ===");
for (const scene of root.listScenes()) {
  console.log("scene:", scene.getName() || "(unnamed)");
}

console.log("\n=== Nodes ===");
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  const t = node.getTranslation();
  const s = node.getScale();
  console.log(
    "node:",
    node.getName() || "(unnamed)",
    "mesh:",
    mesh?.getName() || "(none)",
    "T:",
    t.map((x) => x.toFixed(2)).join(","),
    "S:",
    s.map((x) => x.toFixed(2)).join(",")
  );
}

console.log("\n=== Meshes / Primitives ===");
for (const mesh of root.listMeshes()) {
  console.log("\nmesh:", mesh.getName() || "(unnamed)");
  const prims = mesh.listPrimitives();
  console.log("  primitives:", prims.length);
  prims.forEach((p, i) => {
    const positions = p.getAttribute("POSITION");
    const indices = p.getIndices();
    const vertexCount = positions?.getCount() ?? 0;
    const triCount = indices ? indices.getCount() / 3 : vertexCount / 3;

    // Compute bounding box of vertices
    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;
    if (positions) {
      const arr = positions.getArray();
      const stride = 3;
      for (let v = 0; v < positions.getCount(); v++) {
        const x = arr[v * stride];
        const y = arr[v * stride + 1];
        const z = arr[v * stride + 2];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (z < minZ) minZ = z;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        if (z > maxZ) maxZ = z;
      }
    }

    console.log(
      `  [${i}] vertices: ${vertexCount}, triangles: ${triCount}`
    );
    console.log(
      `      bbox: X[${minX.toFixed(2)}..${maxX.toFixed(2)}] (w=${(maxX - minX).toFixed(2)})`,
      `Y[${minY.toFixed(2)}..${maxY.toFixed(2)}] (h=${(maxY - minY).toFixed(2)})`,
      `Z[${minZ.toFixed(2)}..${maxZ.toFixed(2)}] (d=${(maxZ - minZ).toFixed(2)})`
    );
  });
}
