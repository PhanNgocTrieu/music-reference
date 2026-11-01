import { notFound } from "next/navigation";
import SongDetails from "@/components/song/SongDetails";
import { getAllSongs, getSongBySlug } from "@/lib/data/songs";

export function generateStaticParams() {
  return [...getAllSongs("en"), ...getAllSongs("vi")].map((song) => ({ slug: song.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = getSongBySlug(slug);
  if (!song) return {};
  return {
    title: song.title,
    description: `${song.title} by ${song.author}, performed by ${song.performedBy}.`,
  };
}

export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const song = getSongBySlug(slug);
  if (!song) notFound();

  return <SongDetails song={song} />;
}
