interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ReleasePage({ params }: Props) {
  const { slug } = await params;
  return (
    <main>
      <h1>Release: {slug}</h1>
    </main>
  );
}
