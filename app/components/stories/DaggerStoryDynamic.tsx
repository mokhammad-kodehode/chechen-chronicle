"use client";

import dynamic from "next/dynamic";

declare global {
  interface Window {
    __daggerCreateRootPatch?: boolean;
  }
}

if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  !window.__daggerCreateRootPatch
) {
  window.__daggerCreateRootPatch = true;
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("createRoot()") && msg.includes("already been passed")) {
      return;
    }
    originalError(...args);
  };
}

export const DaggerStoryDynamic = dynamic(
  () => import("./DaggerStory").then((m) => m.DaggerStory),
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
