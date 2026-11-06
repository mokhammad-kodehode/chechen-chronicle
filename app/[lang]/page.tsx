import { notFound } from "next/navigation";
import { MuseumHero } from "@/app/components/home/MuseumHero";
import { HomeStoriesPreview } from "@/app/components/home/HomeStoriesPreview";
import { MuseumCollections } from "@/app/components/home/MuseumCollections";
import { HomeFamilyArchive } from "@/app/components/home/HomeFamilyArchive";
import { HomeJournal } from "@/app/components/home/HomeJournal";
import { HomeTimelinePreview } from "@/app/components/home/HomeTimelinePreview";
import { getLatestFamilyStories } from "@/app/lib/familyArchive";
import {
  getAllPublications,
  getHomeCuration,
  pickForHomeJournal,
  type Publication,
} from "@/app/lib/publications";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/app/lib/i18n/config";

export const revalidate = 60;

// Museum home page:
//   I.   Entrance        — title + two ways in (halls / share a story)
//   II.  Halls           — the 3D exhibition (dwellings, weapons, warriors)
//   III. Collections     — Archive · Family Archive · Journal
//   IV.  Family Archive  — latest reader stories + the invitation
//   V.   Journal         — a short shelf of articles (hidden when empty)
//   VI.  Timeline        — key milestones
//
// Unlike the old newspaper front page, nothing here needs a steady
// stream of new posts to look alive.

async function getJournalShelf(lang: Locale): Promise<Publication[]> {
  try {
    const [all, curation] = await Promise.all([
      getAllPublications(lang),
      getHomeCuration(lang),
    ]);
    return pickForHomeJournal(all, curation.featured, curation.pinnedIds);
  } catch (err) {
    // The journal is one shelf of the museum — never let it take the
    // whole home page down.
    console.error("[home] Failed to load journal:", err);
    return [];
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, familyStories, journal] = await Promise.all([
    getDictionary(lang),
    getLatestFamilyStories(2),
    getJournalShelf(lang),
  ]);
  const museum = dict.home.museum;

  return (
    <>
      <MuseumHero dict={museum.hero} />
      <HomeStoriesPreview dict={dict} heading={museum.halls} />
      <MuseumCollections dict={museum.collections} />
      <HomeFamilyArchive
        stories={familyStories}
        dict={museum.family}
        familyDict={dict.family}
      />
      <HomeJournal publications={journal} lang={lang} dict={dict} />
      <HomeTimelinePreview dict={dict.home.timeline} />
    </>
  );
}
