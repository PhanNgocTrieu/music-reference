import { notFound } from "next/navigation";
import SongDetails from "@/components/song/SongDetails";
import { titleFor } from "@/lib/data/song-display";
import { getAllSongs, getSongBySlug } from "@/lib/data/songs";

export function generateStaticParams() {
  return getAllSongs().map((song) => ({ slug: song.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = getSongBySlug(slug);
  if (!song) return {};
  const title = titleFor(song, "vi");
  return {
    title,
    description: `${title} by ${song.author}, performed by ${song.performedBy}.`,
  };
}

export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = getSongBySlug(slug);
  if (!song) notFound();

  return <SongDetails song={song} />;
}
