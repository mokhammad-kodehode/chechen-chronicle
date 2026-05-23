"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h2 className="text-3xl font-semibold tracking-tight text-amber-950">
        Не удалось открыть запись
      </h2>
      <p className="mt-4 text-sm text-neutral-600">
        Что-то пошло не так. Попробуйте ещё раз.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex h-11 items-center justify-center rounded border border-amber-900 bg-amber-900 px-6 text-sm font-semibold text-white hover:bg-amber-800"
      >
        Попробовать снова
      </button>
    </section>
  );
}
