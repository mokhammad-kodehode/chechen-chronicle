"use client";

import dynamic from "next/dynamic";

// Client-only wrapper for the R3F particle canvas. SSR is disabled
// because three.js and WebGL aren't available on the server.

export const StoriesBannerCanvasDynamic = dynamic(
  () =>
    import("./StoriesBannerCanvas").then((m) => m.StoriesBannerCanvas),
  {
    ssr: false,
    // No loading fallback — the banner already has a dark background
    // and static heading, so the canvas just fades in once ready.
    loading: () => null,
  }
);
