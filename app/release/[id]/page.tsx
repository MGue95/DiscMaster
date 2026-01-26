"use client";

import { ArrowLeft, Disc, Calendar, Tag, Music, ExternalLink, Loader2, Clock, Building2, Globe, Play, Keyboard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlayer } from "../../context/PlayerContext";

interface Release {
    id: number;
    title: string;
    artists: Array<{ name: string; id: number }>;
    labels: Array<{ name: string; catno: string }>;
    year: number;
    genres: string[];
    styles: string[];
    formats: Array<{ name: string; qty: string; descriptions?: string[] }>;
    tracklist: Array<{
        position: string;
        title: string;
        duration: string;
        type_: string;
    }>;
    images: Array<{ uri: string; type: string }>;
    uri: string;
    released: string;
    country: string;
    notes?: string;
}

export default function ReleasePage() {
    const params = useParams();
    const router = useRouter();
    const { playAlbum } = usePlayer();
    const id = params?.id as string;
    const [release, setRelease] = useState<Release | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Spotify Data State (still needed to get the ID)
    const [spotifyAlbumId, setSpotifyAlbumId] = useState<string | null>(null);
    const [spotifyLoading, setSpotifyLoading] = useState(false);
    const [spotifyError, setSpotifyError] = useState<string | null>(null);

    // Keyboard navigation
    const [showKeyboardHint, setShowKeyboardHint] = useState(false);

    // Client-side caching with localStorage
    useEffect(() => {
        const fetchRelease = async () => {
            if (!id) return;

            // Try to load from cache first
            const cacheKey = `release_${id}`;
            const cached = localStorage.getItem(cacheKey);

            if (cached) {
                try {
                    const cachedData = JSON.parse(cached);
                    const cacheAge = Date.now() - cachedData.timestamp;

                    // Use cache if less than 1 hour old
                    if (cacheAge < 3600000) {
                        setRelease(cachedData.data);
                        setIsLoading(false);
                        // Still fetch in background to update cache
                        fetchFromAPI();
                        return;
                    }
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            await fetchFromAPI();
        };

        const fetchFromAPI = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/discogs/release/${id}`);

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Nicht angemeldet");
                    }
                    throw new Error("Fehler beim Laden");
                }

                const data = await response.json();
                setRelease(data);

                // Cache the result
                localStorage.setItem(`release_${id}`, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRelease();
    }, [id]);

    // Fetch Spotify Album ID
    useEffect(() => {
        const fetchSpotifyAlbum = async () => {
            if (!release) return;

            const artistName = release.artists?.[0]?.name || "";
            const albumTitle = release.title;

            setSpotifyLoading(true);
            setSpotifyError(null);
            setSpotifyAlbumId(null);

            try {
                const response = await fetch(
                    `/api/spotify/search?artist=${encodeURIComponent(artistName)}&album=${encodeURIComponent(albumTitle)}`
                );

                const data = await response.json();

                if (response.ok) {
                    if (data.album?.id) {
                        setSpotifyAlbumId(data.album.id);
                    } else {
                        // No album found, but no error
                    }
                } else {
                    setSpotifyError(data.error || "Spotify-Suche fehlgeschlagen");
                }
            } catch (err) {
                console.error("Spotify search error:", err);
                setSpotifyError("Verbindung zu Spotify fehlgeschlagen");
            } finally {
                setSpotifyLoading(false);
            }
        };

        fetchSpotifyAlbum();
    }, [release]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // ESC - Go back to collection
            if (e.key === "Escape") {
                router.push("/collection");
                return;
            }

            // Show keyboard hint on first key press
            if (!showKeyboardHint && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
                setShowKeyboardHint(true);
                setTimeout(() => setShowKeyboardHint(false), 3000);
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [router, showKeyboardHint]);

    const mainImage = release?.images?.find(img => img.type === "primary") || release?.images?.[0];
    const artistName = release?.artists?.[0]?.name || "Unknown Artist";
    const spotifySearchUrl = release
        ? `https://open.spotify.com/search/${encodeURIComponent(artistName + " " + release.title)}`
        : "#";

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
            {/* Keyboard Hint */}
            {showKeyboardHint && (
                <div className="fixed top-20 right-4 z-50 bg-blue-500/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-2xl animate-in slide-in-from-right">
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <Keyboard className="h-4 w-4" />
                        <span>ESC: Zurück</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/collection" className="flex items-center gap-3 p-1 pr-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group">
                                <ArrowLeft className="h-5 w-5" />
                                <span className="text-sm font-bold">Zurück zur Sammlung</span>
                            </Link>
                        </div>
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20">
                                <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-sm font-black tracking-tighter">DiscMaster</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                        <p className="text-white/30 text-xs font-bold uppercase tracking-widest animate-pulse">Lade Album-Details...</p>
                    </div>
                ) : error ? (
                    <div className="max-w-md mx-auto text-center p-12 bg-white/5 border border-white/10 rounded-3xl">
                        <Disc className="h-12 w-12 text-red-400 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">Fehler</h3>
                        <p className="text-white/50 mb-6 text-sm">{error}</p>
                        <Link href="/collection" className="inline-block px-8 py-3 bg-white text-black rounded-full font-bold text-sm">
                            Zurück zur Sammlung
                        </Link>
                    </div>
                ) : release ? (
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            {/* Album Cover */}
                            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-900 border border-white/10 shadow-2xl">
                                {mainImage ? (
                                    <img
                                        src={mainImage.uri}
                                        alt={release.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/10">
                                        <Disc className="h-32 w-32" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40"></div>
                            </div>

                            {/* Album Info */}
                            <div className="flex flex-col justify-between">
                                <div>
                                    <div className="mb-6">
                                        <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                                            {release.title}
                                        </h1>
                                        <p className="text-2xl text-white/60 font-bold mb-4">
                                            {artistName}
                                        </p>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {release.year && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-white/30" />
                                                <span className="text-white/70 font-medium">{release.year}</span>
                                            </div>
                                        )}

                                        {release.labels?.[0] && (
                                            <div className="flex items-center gap-3">
                                                <Building2 className="h-5 w-5 text-white/30" />
                                                <span className="text-white/70 font-medium">
                                                    {release.labels[0].name}
                                                    {release.labels[0].catno && ` • ${release.labels[0].catno}`}
                                                </span>
                                            </div>
                                        )}

                                        {release.formats?.[0] && (
                                            <div className="flex items-center gap-3">
                                                <Disc className="h-5 w-5 text-white/30" />
                                                <span className="text-white/70 font-medium">
                                                    {release.formats[0].name}
                                                    {release.formats[0].descriptions && ` • ${release.formats[0].descriptions.join(", ")}`}
                                                </span>
                                            </div>
                                        )}

                                        {release.country && (
                                            <div className="flex items-center gap-3">
                                                <Globe className="h-5 w-5 text-white/30" />
                                                <span className="text-white/70 font-medium">{release.country}</span>
                                            </div>
                                        )}

                                        {release.genres && release.genres.length > 0 && (
                                            <div className="flex items-start gap-3">
                                                <Tag className="h-5 w-5 text-white/30 mt-0.5" />
                                                <div className="flex flex-wrap gap-2">
                                                    {release.genres.map((genre, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider"
                                                        >
                                                            {genre}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {release.styles && release.styles.length > 0 && (
                                            <div className="flex flex-wrap gap-2 ml-8">
                                                {release.styles.map((style, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-0.5 bg-white/5 rounded-md text-[10px] font-medium text-white/50"
                                                    >
                                                        {style}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <a
                                        href={spotifySearchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#1DB954] hover:bg-[#1ed760] text-black rounded-2xl transition-all font-bold active:scale-95"
                                    >
                                        <Music className="h-5 w-5" />
                                        Auf Spotify öffnen
                                    </a>
                                    <a
                                        href={`https://www.discogs.com${release.uri}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all font-bold active:scale-95"
                                    >
                                        <ExternalLink className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Spotify Embed Player (Global Trigger) */}
                        {(spotifyLoading || spotifyAlbumId || spotifyError) && (
                            <div className="bg-gradient-to-br from-[#1DB954]/10 to-[#1DB954]/5 border border-[#1DB954]/20 rounded-3xl p-6 md:p-8 mb-8">
                                <h2 className="text-2xl font-black mb-4 flex items-center gap-3 text-[#1DB954]">
                                    <Music className="h-6 w-6" />
                                    Spotify Player
                                </h2>

                                {spotifyLoading ? (
                                    <div className="flex items-center gap-3 text-white/50 py-4">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <p className="text-sm">Suche Album auf Spotify...</p>
                                    </div>
                                ) : spotifyError ? (
                                    <div className="text-white/50 text-sm py-2">
                                        <p>{spotifyError}</p>
                                    </div>
                                ) : spotifyAlbumId ? (
                                    <div className="flex flex-col gap-6">
                                        {/* Inline Player */}
                                        <div className="rounded-2xl overflow-hidden shadow-2xl bg-black/50">
                                            <iframe
                                                src={`https://open.spotify.com/embed/album/${spotifyAlbumId}?utm_source=generator`}
                                                width="100%"
                                                height="152"
                                                frameBorder="0"
                                                allowFullScreen
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                loading="lazy"
                                                className="w-full"
                                            ></iframe>
                                        </div>

                                        {/* Miniplayer Trigger */}
                                        <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                                            <div className="text-xs text-white/50 font-medium">
                                                Möchtest du weiterhören beim Stöbern?
                                            </div>
                                            <button
                                                onClick={() => playAlbum(spotifyAlbumId)}
                                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all active:scale-95 flex items-center gap-2 border border-white/10"
                                            >
                                                <Play className="h-3 w-3 fill-current" />
                                                Im Miniplayer öffnen
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-white/30 text-sm py-2">
                                        Kein passendes Album auf Spotify gefunden.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tracklist */}
                        {release.tracklist && release.tracklist.length > 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                                    <Music className="h-6 w-6" />
                                    Tracklist
                                </h2>
                                <div className="space-y-2">
                                    {release.tracklist.map((track, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all group"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <span className="text-white/30 font-black text-sm w-8 text-right">
                                                    {track.position || idx + 1}
                                                </span>
                                                <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                                    {track.title}
                                                </span>
                                            </div>
                                            {track.duration && (
                                                <div className="flex items-center gap-2 text-white/30 text-sm">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="font-mono">{track.duration}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {release.notes && (
                            <div className="mt-8 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
                                <h2 className="text-xl font-black mb-4">Notizen</h2>
                                <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                                    {release.notes}
                                </p>
                            </div>
                        )}
                    </div>
                ) : null}
            </main>

            <footer className="py-20 text-center border-t border-white/5 mt-10">
                <div className="flex justify-center gap-8 mb-6 opacity-20">
                    <Disc className="h-4 w-4" />
                    <Music className="h-4 w-4" />
                    <Keyboard className="h-4 w-4" />
                </div>
                <p className="text-white/10 text-[9px] uppercase tracking-[0.5em] font-black">
                    DiscMaster • Pure Analog Fidelity
                </p>
            </footer>
        </div>
    );
}
