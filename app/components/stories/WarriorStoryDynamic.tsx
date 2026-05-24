"use client";

import dynamic from "next/dynamic";

declare global {
  interface Window {
    __warriorCreateRootPatch?: boolean;
  }
}

// Same dev-time warning filter as the tower story — drei's <Scroll html>
// triggers a benign createRoot warning under Next 16 + Turbopack HMR.
if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  !window.__warriorCreateRootPatch
) {
  window.__warriorCreateRootPatch = true;
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("createRoot()") && msg.includes("already been passed")) {
      return;
    }
    originalError(...args);
  };
}

export const WarriorStoryDynamic = dynamic(
  () => import("./WarriorStory").then((m) => m.WarriorStory),
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
