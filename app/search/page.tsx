"use client";

import { Search, Music, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/artist/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <div className="flex items-center gap-2">
              <Music className="h-8 w-8 text-gray-300" />
              <h1 className="text-2xl font-bold text-white">Suchen</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suche nach Künstlern, Alben, Labels..."
              className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-600"
            />
          </form>

          {/* Quick Links */}
          <div className="mt-8">
            <p className="text-white/60 mb-4">Beliebte Künstler:</p>
            <div className="flex flex-wrap gap-3">
              {["Daft Punk", "The Beatles", "Pink Floyd", "Radiohead", "Daft Punk"].map((artist) => (
                <Link
                  key={artist}
                  href={`/artist/${encodeURIComponent(artist)}`}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white transition-colors"
                >
                  {artist}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
