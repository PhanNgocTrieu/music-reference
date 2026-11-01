"use client";

import SongsExplorer from "@/components/song/SongsExplorer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Song } from "@/lib/data/songs";

export default function HomeContent({ songs }: { songs: Song[] }) {
  const { t, lang } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <section className="mb-12 rounded-2xl bg-navy-900 px-6 py-14 text-center shadow-sm">
        <h1 className="text-4xl font-semibold tracking-tight text-gold-300">{t("heroTitle")}</h1>
        <p className="mt-3 text-navy-100">{t("heroTag")}</p>
      </section>

      {songs.length === 0 ? (
        <p className="text-center text-navy-400">{t("noSongsYet")}</p>
      ) : (
        // Remount on language switch: resets stale filter/sort selections that
        // don't apply to the newly visible (language-filtered) song subset.
        <SongsExplorer key={lang} songs={songs} />
      )}
    </div>
  );
}
