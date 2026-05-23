import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { urlFor } from "@/app/lib/sanity/image";

type Props = {
  blocks: PortableTextBlock[];
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="text-neutral-800">{children}</p>,
    h2: ({ children }) => (
      <h2 className="mt-12 text-2xl font-semibold tracking-tight text-amber-950 md:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 text-xl font-semibold tracking-tight text-amber-950">
        {children}
      </h3>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc space-y-2 pl-6 marker:text-amber-900">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal space-y-2 pl-6 marker:text-amber-900">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-amber-950">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ value, children }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          className="text-amber-900 underline decoration-amber-900/40 underline-offset-4 hover:decoration-amber-900"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    pullQuote: ({ value }) => {
      const { text, cite } = value as { text: string; cite?: string };
      return (
        <figure className="border-l-2 border-amber-900/40 bg-amber-50/50 px-6 py-5">
          <blockquote className="text-lg italic leading-8 text-amber-950">
            «{text}»
          </blockquote>
          {cite ? (
            <figcaption className="mt-3 text-xs uppercase tracking-widest text-amber-900/70">
              — {cite}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    figure: ({ value }) => {
      const v = value as { alt?: string; caption?: string };
      const src = urlFor(value as Parameters<typeof urlFor>[0])
        .width(1600)
        .quality(85)
        .url();
      return (
        <figure className="my-8">
          <Image
            src={src}
            alt={v.alt ?? ""}
            width={1600}
            height={1067}
            sizes="(min-width: 768px) 768px, 100vw"
            className="h-auto w-full rounded border border-amber-900/15"
          />
          {v.caption ? (
            <figcaption className="mt-2 text-center text-xs italic text-neutral-500">
              {v.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export function PublicationArticle({ blocks }: Props) {
  return (
    <div className="article-body space-y-6 text-[17px] leading-[1.85] text-neutral-800">
      <PortableText value={blocks} components={components} />
    </div>
  );
}
