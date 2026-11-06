import { FAMILY_LIMITS } from "@/app/lib/familyArchiveShared";

// Downscale + re-encode a photo in the browser before upload.
//
//   • keeps the request under the hosting body limit (see
//     FAMILY_LIMITS.maxTotalBytes);
//   • re-encoding drops EXIF metadata — including GPS coordinates that
//     phones embed in photos — so a family's home location never
//     reaches the archive by accident.
//
// Throws when the browser can't decode the file (e.g. HEIC outside
// Safari); the form reports that per file.

async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // Older Safari doesn't accept the options bag.
    return await createImageBitmap(file);
  }
}

function encode(
  bitmap: ImageBitmap,
  maxSide: number,
  quality: number
): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("no 2d context"));
  // White matte so transparent PNGs don't turn black as JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))),
      "image/jpeg",
      quality
    )
  );
}

// Per-photo budget: a full set of photos must still fit the request cap.
const TARGET_BYTES = Math.floor(
  FAMILY_LIMITS.maxTotalBytes / FAMILY_LIMITS.maxImages
);

export async function prepareImage(file: File): Promise<Blob> {
  const bitmap = await decode(file);
  try {
    const attempts: [number, number][] = [
      [FAMILY_LIMITS.imageMaxSide, 0.85],
      [FAMILY_LIMITS.imageMaxSide, 0.72],
      [1600, 0.7],
      [1280, 0.68],
    ];
    let blob: Blob | null = null;
    for (const [side, quality] of attempts) {
      blob = await encode(bitmap, side, quality);
      if (blob.size <= TARGET_BYTES) break;
    }
    return blob!;
  } finally {
    bitmap.close();
  }
}
