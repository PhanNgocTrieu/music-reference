interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  return (
    <main>
      <h1>Search{q ? `: ${q}` : ""}</h1>
    </main>
  );
}
