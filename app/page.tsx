import HomeContent from "@/components/song/HomeContent";
import { getAllAuthors, getAllGenres, getAllPerformers, getAllSongs } from "@/lib/data/songs";

export default function HomePage() {
  return (
    <HomeContent
      songsByLang={{ en: getAllSongs("en"), vi: getAllSongs("vi") }}
      genresByLang={{ en: getAllGenres("en"), vi: getAllGenres("vi") }}
      authorsByLang={{ en: getAllAuthors("en"), vi: getAllAuthors("vi") }}
      performersByLang={{ en: getAllPerformers("en"), vi: getAllPerformers("vi") }}
    />
  );
}
