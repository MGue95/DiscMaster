"use client";

import { Heart, ArrowLeft, Search, Filter, Loader2, Disc, User, Calendar, Tag, ChevronDown, Music, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";

interface CollectionItem {
  id: number;
  instance_id: number;
  date_added: string;
  rating: number;
  basic_information: {
    id: number;
    title: string;
    year: number;
    thumb: string;
    cover_image: string;
    artists: Array<{ name: string }>;
    labels: Array<{ name: string }>;
    formats: Array<{ name: string }>;
    genres: string[];
    styles: string[];
  };
}

export default function CollectionPage() {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("added");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterFormat, setFilterFormat] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Update sort order automatically based on field
  useEffect(() => {
    if (sortBy === "added") {
      setSortOrder("desc");
    } else {
      setSortOrder("asc");
    }
    setPage(1);
  }, [sortBy]);

  const fetchCollection = useCallback(async (pageNum: number, isNew: boolean) => {
    if (isNew) setIsLoading(true);
    else setIsMoreLoading(true);

    setError(null);
    try {
      const perPage = 50;
      const url = `/api/discogs/user/collection?page=${pageNum}&per_page=${perPage}&sort=${sortBy}&sort_order=${sortOrder}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) throw new Error("Nicht angemeldet");
        throw new Error("Fehler beim Laden");
      }

      const data = await response.json();
      const newItems = data.releases || [];

      if (isNew) {
        setCollection(newItems);
      } else {
        setCollection(prev => [...prev, ...newItems]);
      }

      setTotalItems(data.pagination?.items || 0);
      setHasMore(data.pagination?.page < data.pagination?.pages);
      setPage(data.pagination?.page);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsMoreLoading(false);
    }
  }, [sortBy, sortOrder, searchQuery]);

  useEffect(() => {
    fetchCollection(1, true);
  }, [fetchCollection]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const loadMore = () => {
    if (!isMoreLoading && hasMore) {
      fetchCollection(page + 1, false);
    }
  };

  const filteredCollection = useMemo(() => {
    return collection.filter((item) => {
      if (filterFormat === "all") return true;
      return item.basic_information.formats.some(f => f.name.toLowerCase().includes(filterFormat.toLowerCase()));
    });
  }, [collection, filterFormat]);

  const formats = useMemo(() => {
    const allFormats = new Set<string>();
    collection.forEach(item => {
      item.basic_information.formats.forEach(f => allFormats.add(f.name));
    });
    return Array.from(allFormats).sort();
  }, [collection]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3 p-1 pr-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20">
                  <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-black tracking-tighter">DiscMaster</span>
              </Link>
              <div className="h-4 w-[1px] bg-white/10 hidden md:block"></div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                <h1 className="text-lg font-bold">Sammlung</h1>
              </div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hidden md:block">
              {totalItems} Alben gefunden
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="max-w-7xl mx-auto mb-10">
          <form onSubmit={handleSearchSubmit} className="grid md:grid-cols-4 gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-sm">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
              <input
                type="text"
                placeholder="In kompletter Sammlung suchen (Enter)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3 bg-black/50 border border-white/5 rounded-2xl focus:outline-none transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <option value="added">Hinzugefügt (Zuerst)</option>
                <option value="artist">Künstler (A - Z)</option>
                <option value="title">Titel (A - Z)</option>
                <option value="year">Jahr (Alt - Neu)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
            </div>

            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
              <select
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3 bg-black/50 border border-white/5 rounded-2xl focus:outline-none transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <option value="all">Alle Formate</option>
                {formats.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
            </div>
          </form>
        </div>

        {/* Content */}
        {isLoading && page === 1 ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest animate-pulse">Lade deine Sammlung...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center p-12 bg-white/5 border border-white/10 rounded-3xl">
            <Disc className="h-12 w-12 text-red-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Fehler</h3>
            <p className="text-white/50 mb-6 text-sm">{error}</p>
            <Link href="/profile" className="inline-block px-8 py-3 bg-white text-black rounded-full font-bold text-sm">
              Zum Profil
            </Link>
          </div>
        ) : filteredCollection.length === 0 ? (
          <div className="text-center p-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <Disc className="h-12 w-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 font-medium">Keine Alben in diesem Filter/Suche gefunden.</p>
            <button onClick={() => { setSearchQuery(""); setSearchInput(""); }} className="mt-4 text-sm text-blue-400 hover:underline">Suche zurücksetzen</button>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
              {filteredCollection.map((item, idx) => (
                <Link
                  key={`${item.instance_id}-${idx}`}
                  href={`/release/${item.basic_information.id}`}
                  className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-2 shadow-2xl cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-900">
                    {item.basic_information.cover_image ? (
                      <img
                        src={item.basic_information.cover_image}
                        alt={item.basic_information.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <Disc className="h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <span className="text-[9px] px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-md uppercase font-black tracking-widest text-white/70 border border-white/10">
                        {item.basic_information.formats?.[0]?.name || "Vinyl"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-blue-400 transition-colors mb-1">
                      {item.basic_information.title}
                    </h3>
                    <div className="flex items-center gap-1 text-white/40 text-xs mb-4">
                      <span className="line-clamp-1 font-medium">{item.basic_information.artists[0].name}</span>
                    </div>

                    <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-black uppercase tracking-widest">
                        <Calendar className="h-3 w-3" />
                        <span>{item.basic_information.year || "----"}</span>
                      </div>
                      <div className="max-w-[100px] truncate text-[10px] text-white/20 font-bold uppercase italic">
                        {item.basic_information.labels?.[0]?.name}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pb-10">
                <button
                  onClick={loadMore}
                  disabled={isMoreLoading}
                  className="px-10 py-4 bg-white/5 hover:bg-white text-white hover:text-black border border-white/10 rounded-2xl transition-all font-black uppercase tracking-[0.3em] text-xs disabled:opacity-50 active:scale-95 group"
                >
                  {isMoreLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    "Mehr Alben laden"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-20 text-center border-t border-white/5 mt-10">
        <div className="flex justify-center gap-8 mb-6 opacity-20">
          <Disc className="h-4 w-4" />
          <Music className="h-4 w-4" />
          <Heart className="h-4 w-4" />
        </div>
        <p className="text-white/10 text-[9px] uppercase tracking-[0.5em] font-black">
          DiscMaster &bull; Pure Analog Fidelity
        </p>
      </footer>
    </div>
  );
}
