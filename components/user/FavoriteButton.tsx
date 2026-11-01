"use client";

import { useState, useTransition } from "react";

interface FavoriteButtonProps {
  initialFavorited: boolean;
  artistId?: string;
  releaseId?: string;
}

export default function FavoriteButton({ initialFavorited, artistId, releaseId }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  async function toggle() {
    startTransition(async () => {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId, releaseId }),
      });
      if (res.ok) {
        const { favorited: next } = await res.json();
        setFavorited(next);
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
        favorited
          ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"
      }`}
    >
      <span>{favorited ? "♥" : "♡"}</span>
      <span>{favorited ? "Favorited" : "Favorite"}</span>
    </button>
  );
}
