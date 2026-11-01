"use client";

import { useState, useTransition } from "react";

interface RatingStarsProps {
  releaseId: string;
  initialRating: number | null;
}

export default function RatingStars({ releaseId, initialRating }: RatingStarsProps) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [hover, setHover] = useState(0);
  const [isPending, startTransition] = useTransition();

  async function rate(score: number) {
    startTransition(async () => {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ releaseId, score }),
      });
      if (res.ok) setRating(score);
    });
  }

  const display = hover || rating;

  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={isPending}
          onClick={() => rate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`text-xl transition-colors ${display >= star ? "text-amber-400" : "text-zinc-300"} hover:text-amber-400`}
          aria-label={`Rate ${star} star`}
        >
          ★
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-1 text-xs text-zinc-400">{rating}/5</span>
      )}
    </div>
  );
}
