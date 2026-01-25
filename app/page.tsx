"use client";

import { Search, Music, User, Heart, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UserProfile {
  username: string;
  avatarUrl: string;
}

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`/api/discogs/search/suggestions?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.results || []);
        }
      } catch (e) {
        console.error("Suggestions fetch error", e);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchProfile = async () => {
      const cookies = document.cookie.split(";");
      const usernameCookie = cookies.find((c) => c.trim().startsWith("discogs_username="));

      if (usernameCookie) {
        setIsLoading(true);
        try {
          const res = await fetch("/api/discogs/user/stats");
          if (res.ok) {
            const data = await res.json();
            setUser({
              username: data.username,
              avatarUrl: data.avatarUrl
            });
          }
        } catch (e) {
          console.error("Failed to fetch profile in header", e);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform">
                <img src="/images/logo.png" alt="DiscMaster" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tighter">DiscMaster</h1>
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/search"
                className="hidden md:flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                <Search className="h-4 w-4" />
                <span>Suchen</span>
              </Link>
              <Link
                href="/collection"
                className="hidden md:flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                <Heart className="h-4 w-4" />
                <span>Sammlung</span>
              </Link>
              <Link
                href="/wantlist"
                className="hidden md:flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Wantlist</span>
              </Link>

              {!user && !isLoading ? (
                <a
                  href="/api/discogs/auth/login"
                  className="px-5 py-2 bg-white text-black hover:bg-gray-200 rounded-full transition-all font-bold text-sm active:scale-95 shadow-lg shadow-white/5"
                >
                  Verbinden
                </a>
              ) : (
                <Link
                  href="/profile"
                  className="flex items-center gap-3 p-1 pr-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-gray-800">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white group-hover:text-white/80 transition-colors">
                    {user?.username || "Profil"}
                  </span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-none">
            DEINE MUSIK.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">NEU ERLEBT.</span>
          </h2>
          <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto font-medium">
            Verwalte deine Sammlung, finde seltene Pressungen und entdecke neue Künstler in einem modernen Interface.
          </p>

          {/* Search Bar with Suggestions */}
          <div className="max-w-2xl mx-auto mb-12 relative">
            <form
              action="/search"
              method="get"
              className="relative group z-20"
              onSubmit={(e) => {
                e.preventDefault();
                if (query) {
                  window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }
              }}
            >
              <div className="absolute inset-0 bg-white/10 blur-xl group-focus-within:bg-blue-500/20 transition-all opacity-50"></div>
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/30" />
                <input
                  type="text"
                  name="query"
                  autoComplete="off"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Künstler, Album oder Label suchen..."
                  className="w-full pl-16 pr-8 py-5 rounded-2xl bg-black border border-white/10 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all text-lg shadow-2xl"
                />
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0) && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-gray-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-4 duration-300"
                onMouseLeave={() => setShowSuggestions(false)}
              >
                <div className="p-2">
                  {suggestions.map((s: any) => (
                    <Link
                      key={s.id}
                      href={`/search?q=${encodeURIComponent(s.title)}`}
                      className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-2xl transition-all group"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                        <img src={s.thumb} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-bold line-clamp-1 text-sm group-hover:text-blue-400 transition-colors">
                          {s.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] uppercase font-black tracking-widest text-white/30">{s.year || "N/A"}</span>
                          <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                          <span className="text-[10px] font-bold text-white/20 truncate max-w-[150px]">{s.label?.[0]}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <button
                  onClick={() => window.location.href = `/search?q=${encodeURIComponent(query)}`}
                  className="w-full p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white hover:bg-white/5 transition-all border-t border-white/5"
                >
                  Alle Ergebnisse für "{query}"
                </button>
              </div>
            )}
          </div>

          {/* Quick Artist Links */}
          <div className="flex flex-wrap justify-center gap-3">
            {["Daft Punk", "The Beatles", "Pink Floyd", "Radiohead"].map((artist) => (
              <Link
                key={artist}
                href={`/artist/${artist}`}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl text-white/70 hover:text-white transition-all text-sm font-medium"
              >
                {artist}
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Sections */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <Link href="/search" className="group">
            <div className="h-full bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
              <Search className="h-10 w-10 text-gray-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Suchen</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Durchsuche die weltweite Discogs-Datenbank nach neuen Schätzen.
              </p>
            </div>
          </Link>

          <Link href="/collection" className="group">
            <div className="h-full bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
              <Heart className="h-10 w-10 text-gray-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Sammlung</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Deine persönliche Vinyl-Sammlung immer griffbereit und sortiert.
              </p>
            </div>
          </Link>

          <Link href="/profile" className="group">
            <div className="h-full bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
              <User className="h-10 w-10 text-gray-400 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Profil</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Verwalte deinen Account und sieh deine Statistiken auf einen Blick.
              </p>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6 text-white" />
              <span className="font-black text-white uppercase tracking-tighter">DiscMaster</span>
            </div>
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
              © 2026 Crafted with Passion
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
