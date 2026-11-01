export default function Footer() {
  return (
    <footer className="border-t border-gold-200 bg-cream-50 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-sm text-navy-400">© {new Date().getFullYear()} Vision Worship Team</p>
      </div>
    </footer>
  );
}
