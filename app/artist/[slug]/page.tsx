interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  return (
    <main>
      <h1>Artist: {slug}</h1>
    </main>
  );
}
