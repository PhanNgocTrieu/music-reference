interface PaginationProps {
  page: number;
  total: number;
  pageSize?: number;
  buildHref: (page: number) => string;
}

export default function Pagination({ page, total, pageSize = 24, buildHref }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 py-8" aria-label="Pagination">
      {page > 1 && (
        <a href={buildHref(page - 1)} className="rounded border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50">
          ← Previous
        </a>
      )}
      <span className="text-sm text-zinc-500">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <a href={buildHref(page + 1)} className="rounded border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50">
          Next →
        </a>
      )}
    </nav>
  );
}
