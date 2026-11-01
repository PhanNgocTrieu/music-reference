import HomeContent from "@/components/song/HomeContent";
import { getAllSongs } from "@/lib/data/songs";

export default function HomePage() {
  return <HomeContent songs={getAllSongs()} />;
}
