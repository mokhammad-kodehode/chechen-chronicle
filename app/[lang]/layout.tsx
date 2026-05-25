import type { Metadata } from "next";
import { Inter, Playfair_Display, IBM_Plex_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { isLocale, LOCALES, type Locale } from "@/app/lib/i18n/config";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: {
      default: `${dict.site.title} ${dict.site.subtitle.toLowerCase()}`,
      template: `%s — ${dict.site.title}`,
    },
    description: dict.publications.metaDescription,
    metadataBase: new URL("http://localhost:3000"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  return (
    <html
      lang={lang}
      className={`${inter.variable} ${playfair.variable} ${plexSans.variable}`}
    >
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <Header dict={dict} />
        <main>{children}</main>
        <Footer dict={dict} />
      </body>
    </html>
  );
}
