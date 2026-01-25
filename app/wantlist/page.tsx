"use client";

import { Heart, ArrowLeft, Search, Filter, Loader2, Disc, User, Calendar, Tag, ChevronDown, Music, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";

interface WantlistItem {
    id: number;
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

export default function WantlistPage() {
    const [wants, setWants] = useState<WantlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [sortBy, setSortBy] = useState("added");
    const [sortOrder, setSortOrder] = useState("desc");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        if (sortBy === "added") setSortOrder("desc");
        else setSortOrder("asc");
    }, [sortBy]);

    const fetchWants = useCallback(async (pageNum: number, isNew: boolean) => {
        if (isNew) setIsLoading(true);
        else setIsMoreLoading(true);

        setError(null);
        try {
            const url = `/api/discogs/user/wantlist?page=${pageNum}&per_page=50&sort=${sortBy}&sort_order=${sortOrder}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error("Fehler beim Laden");

            const data = await response.json();
            const newItems = data.wants || [];

            if (isNew) setWants(newItems);
            else setWants(prev => [...prev, ...newItems]);

            setTotalItems(data.pagination?.items || 0);
            setHasMore(data.pagination?.page < data.pagination?.pages);
            setPage(data.pagination?.page);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setIsMoreLoading(false);
        }
    }, [sortBy, sortOrder]);

    useEffect(() => {
        fetchWants(1, true);
    }, [fetchWants]);

    const filteredWants = useMemo(() => {
        return wants.filter((item) => {
            const query = searchInput.toLowerCase();
            return item.basic_information.title.toLowerCase().includes(query) ||
                item.basic_information.artists.some(a => a.name.toLowerCase().includes(query));
        });
    }, [wants, searchInput]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
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
                                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                <h1 className="text-lg font-bold">Wantlist</h1>
                            </div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/30">
                            {totalItems} Wünsche
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto mb-10">
                    <div className="grid md:grid-cols-3 gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                            <input
                                type="text"
                                placeholder="In Wantlist suchen..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-black/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 text-sm"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full appearance-none pl-10 pr-10 py-3 bg-black/50 border border-white/5 rounded-2xl focus:outline-none text-xs font-bold uppercase tracking-wider"
                            >
                                <option value="added">Zuletzt Hinzugefügt</option>
                                <option value="artist">Künstler A-Z</option>
                                <option value="title">Titel A-Z</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {isLoading && page === 1 ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="h-10 w-10 text-yellow-500 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
                        {filteredWants.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all hover:-translate-y-2 shadow-2xl">
                                <div className="relative aspect-square overflow-hidden bg-gray-900">
                                    <img src={item.basic_information.thumb} alt={item.basic_information.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{item.basic_information.title}</h3>
                                    <p className="text-white/40 text-xs line-clamp-1">{item.basic_information.artists[0].name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
