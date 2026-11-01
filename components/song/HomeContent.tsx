"use client";

import SongsExplorer from "@/components/song/SongsExplorer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Lang } from "@/lib/i18n/dictionary";
import type { Song } from "@/lib/data/songs";

interface HomeContentProps {
  songsByLang: Record<Lang, Song[]>;
  genresByLang: Record<Lang, string[]>;
  authorsByLang: Record<Lang, string[]>;
  performersByLang: Record<Lang, string[]>;
}

export default function HomeContent({ songsByLang, genresByLang, authorsByLang, performersByLang }: HomeContentProps) {
  const { t, lang } = useLanguage();
  const songs = songsByLang[lang];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <section className="mb-12 rounded-2xl bg-navy-900 px-6 py-14 text-center shadow-sm">
        <h1 className="text-4xl font-semibold tracking-tight text-gold-300">{t("heroTitle")}</h1>
        <p className="mt-3 text-navy-100">{t("heroTag")}</p>
      </section>

      {songs.length === 0 ? (
        <p className="text-center text-navy-400">{t("noSongsYet")}</p>
      ) : (
        <SongsExplorer
          key={lang}
          songs={songs}
          genres={genresByLang[lang]}
          authors={authorsByLang[lang]}
          performers={performersByLang[lang]}
        />
      )}
    </div>
  );
}
