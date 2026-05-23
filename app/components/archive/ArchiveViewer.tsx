import Image from "next/image";
import type { ArchiveItem } from "@/app/lib/archive";

type Props = {
  item: ArchiveItem;
};

/**
 * Универсальный «вьюер» архивной записи. Показывает контент в зависимости от kind:
 *  - photo / manuscript / map / image-документ — большое изображение
 *  - document с PDF файлом — встроенный iframe + кнопка скачивания
 *  - audio — нативный <audio> плеер
 *  - всё остальное — placeholder
 */
export function ArchiveViewer({ item }: Props) {
  if (item.fileType === "pdf" && item.fileUrl) {
    return (
      <div className="overflow-hidden rounded-lg border border-amber-900/15 bg-stone-900 shadow-md">
        <iframe
          src={item.fileUrl}
          title={item.title}
          className="h-[70vh] w-full"
        />
      </div>
    );
  }

  if (item.kind === "audio" && item.fileUrl) {
    return (
      <div className="rounded-lg border border-amber-900/15 bg-gradient-to-br from-indigo-50 via-amber-50 to-stone-50 p-10 shadow-sm">
        <div className="mx-auto max-w-md">
          <p className="text-center text-xs uppercase tracking-widest text-indigo-900/60">
            {item.date}
          </p>
          <h3 className="mt-2 text-center text-lg font-semibold text-indigo-950">
            {item.title}
          </h3>
          <audio controls src={item.fileUrl} className="mt-6 w-full">
            Ваш браузер не поддерживает audio.
          </audio>
        </div>
      </div>
    );
  }

  if (item.imageUrl) {
    return (
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-amber-900/15 bg-amber-50 shadow-md">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          priority
          sizes="(min-width: 1024px) 600px, 100vw"
          className="object-contain"
        />
      </div>
    );
  }

  // Placeholder
  return (
    <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-lg border border-dashed border-amber-900/30 bg-amber-50/50 p-10 text-center">
      <p className="text-xs uppercase tracking-widest text-amber-900/50">
        {item.date}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-amber-950">{item.title}</h3>
      <p className="mt-3 max-w-xs text-xs text-neutral-500">
        Оригинал ещё не загружен
      </p>
    </div>
  );
}
