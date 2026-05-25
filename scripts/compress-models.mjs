// Compress every .glb under public/models/ with gltfpack.
//
// Usage:
//   npm run models:compress
//
// Flags applied:
//   -c   meshopt geometry compression (requires MeshoptDecoder in the
//        loader; we set it up in app/lib/three/gltfSetup.ts)
//   -tc  KTX2 textures with BasisU supercompression — disabled by
//        default to avoid the extra KTX2 loader dependency. Flip the
//        ENABLE_KTX2 flag below if you set up the loader.
//
// The script:
//   1. Lists .glb files in public/models/
//   2. Runs gltfpack to a temp file
//   3. If output is smaller, replaces original; otherwise keeps it
//   4. Prints a summary

import { readdir, stat, rename, unlink } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";

const MODELS_DIR = "public/models";
const ENABLE_KTX2 = false; // flip when you wire up KTX2Loader

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function pct(before, after) {
  if (before === 0) return "0%";
  const saved = ((before - after) / before) * 100;
  return `${saved >= 0 ? "-" : "+"}${Math.abs(saved).toFixed(0)}%`;
}

async function fileSize(path) {
  const s = await stat(path);
  return s.size;
}

function runGltfpack(input, output) {
  return new Promise((resolve, reject) => {
    const args = ["gltfpack", "-i", input, "-o", output, "-c"];
    if (ENABLE_KTX2) args.push("-tc");
    const proc = spawn("npx", args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
    });
    let stderr = "";
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    proc.stdout.on("data", () => {
      // gltfpack prints progress; suppress to keep output clean
    });
    proc.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`gltfpack exited ${code}\n${stderr}`));
    });
    proc.on("error", reject);
  });
}

async function main() {
  let files;
  try {
    files = (await readdir(MODELS_DIR)).filter((f) =>
      f.toLowerCase().endsWith(".glb")
    );
  } catch (e) {
    console.error(`Cannot read ${MODELS_DIR}:`, e.message);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log(`No .glb files in ${MODELS_DIR}`);
    return;
  }

  console.log(`Compressing ${files.length} GLB file(s) in ${MODELS_DIR}\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  const results = [];

  for (const file of files) {
    const input = join(MODELS_DIR, file);
    const tmp = join(MODELS_DIR, `__packed_${file}`);

    const before = await fileSize(input);
    totalBefore += before;

    process.stdout.write(`  ${file}  ${formatBytes(before)} → `);

    try {
      await runGltfpack(input, tmp);
      const after = await fileSize(tmp);

      if (after < before) {
        await rename(tmp, input);
        totalAfter += after;
        results.push({ file, before, after, replaced: true });
        process.stdout.write(`${formatBytes(after)}  ${pct(before, after)}\n`);
      } else {
        await unlink(tmp);
        totalAfter += before; // unchanged
        results.push({ file, before, after: before, replaced: false });
        process.stdout.write(
          `${formatBytes(after)}  (kept original, output not smaller)\n`
        );
      }
    } catch (e) {
      try {
        await unlink(tmp);
      } catch {}
      totalAfter += before;
      process.stdout.write(`FAILED: ${e.message}\n`);
    }
  }

  console.log("\n— Summary —");
  console.log(`  Before: ${formatBytes(totalBefore)}`);
  console.log(`  After:  ${formatBytes(totalAfter)}`);
  console.log(`  Saved:  ${pct(totalBefore, totalAfter)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
