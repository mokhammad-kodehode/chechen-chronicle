"use client";

import dynamic from "next/dynamic";

// ──────────────────────────────────────────────
// Suppress one specific dev-time warning.
//
// Next.js 16 + Turbopack + @react-three/drei <Scroll html> trigger a noisy
// "ReactDOMClient.createRoot() on a container that has already been passed
// to createRoot() before" warning on every HMR re-render. The warning is
// harmless: the portal still renders correctly, and the warning never
// appears in production builds. It just covers the page with the Next.js
// dev error overlay.
//
// We filter ONLY this exact message and let every other console.error
// through untouched.
// ──────────────────────────────────────────────
declare global {
  interface Window {
    __towerCreateRootPatch?: boolean;
  }
}

if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  !window.__towerCreateRootPatch
) {
  window.__towerCreateRootPatch = true;
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (
      msg.includes("createRoot()") &&
      msg.includes("already been passed")
    ) {
      return;
    }
    originalError(...args);
  };
}

// Force client-only rendering for the actual story component.
export const TowerStoryDynamic = dynamic(
  () => import("./TowerStory").then((m) => m.TowerStory),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 grid h-[100svh] w-full place-items-center bg-[#0c0805] text-amber-100/70">
        <p className="text-xs font-semibold uppercase tracking-widest">
          Загрузка истории…
        </p>
      </div>
    ),
  }
);
