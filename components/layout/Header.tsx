"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Header() {
  const { lang, setLang } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-b border-gold-200 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold text-navy-900 hover:text-navy-700">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, logo.png is a fixed local asset */}
          <img src={`${basePath}/logo.png`} alt="Vision Worship Team logo" className="h-9 w-9 rounded-full object-cover" />
          Vision Worship Team
        </Link>

        <div className="ml-auto flex items-center rounded-full border border-navy-100 bg-white p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setLang("vi")}
            aria-pressed={lang === "vi"}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              lang === "vi" ? "bg-navy-800 text-gold-300" : "text-navy-400 hover:text-navy-700"
            }`}
          >
            VI
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            aria-pressed={lang === "en"}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              lang === "en" ? "bg-navy-800 text-gold-300" : "text-navy-400 hover:text-navy-700"
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
