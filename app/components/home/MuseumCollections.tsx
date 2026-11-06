import { LocalizedLink } from "@/app/components/common/LocalizedLink";
import { Reveal } from "@/app/components/common/Reveal";
import type { Dictionary } from "@/app/lib/i18n/shared";

// «Фонды музея» — the three text-and-document collections that sit
// beside the 3D halls: primary-source Archive, the readers' Family
// Archive, and the Journal.

type Props = {
  dict: Dictionary["home"]["museum"]["collections"];
};

type Item = {
  numeral: string;
  href: string;
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
};

export function MuseumCollections({ dict }: Props) {
  const items: Item[] = [
    { numeral: "I", href: "/archive", ...dict.archive, icon: <ScrollIcon /> },
    { numeral: "II", href: "/family-archive", ...dict.family, icon: <FamilyIcon /> },
    { numeral: "III", href: "/publications", ...dict.journal, icon: <BookIcon /> },
  ];

  return (
    <section className="relative overflow-hidden bg-[#F4EFE3] py-20 text-amber-950 md:py-28">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-900/25 to-transparent"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-amber-800/70">
            {dict.kicker}
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
            {dict.title}
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden border border-amber-900/15 bg-amber-900/15 md:grid-cols-3">
          {items.map((item, idx) => (
            <Reveal key={item.href} delay={idx * 110} className="bg-[#FBF7F0]">
              <LocalizedLink
                href={item.href}
                className="group/col flex h-full flex-col gap-5 p-8 transition-colors duration-300 hover:bg-white md:p-10"
              >
                <div className="flex items-start justify-between">
                  <span className="text-amber-900/45 transition-colors duration-300 group-hover/col:text-amber-900">
                    {item.icon}
                  </span>
                  <span
                    aria-hidden
                    className="font-display text-3xl font-semibold leading-none text-amber-800/30"
                  >
                    {item.numeral}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  {item.title}
                </h3>
                <p className="text-sm leading-[1.65] text-amber-900/75 md:text-[15px]">
                  {item.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-900 md:text-[11px]">
                  <span>{item.link}</span>
                  <span
                    aria-hidden
                    className="transition-transform duration-300 group-hover/col:translate-x-1.5"
                  >
                    →
                  </span>
                </span>
              </LocalizedLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const iconCls = "h-9 w-9";

function ScrollIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className={iconCls} aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function FamilyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className={iconCls} aria-hidden>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="6" cy="13" r="2" />
      <circle cx="18" cy="13" r="2" />
      <path d="M12 7.2V10M12 10H6v1M12 10h6v1" />
      <path d="M3.5 20.5c.4-2.2 1.3-3.5 2.5-3.5s2.1 1.3 2.5 3.5M15.5 20.5c.4-2.2 1.3-3.5 2.5-3.5s2.1 1.3 2.5 3.5" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className={iconCls} aria-hidden>
      <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
