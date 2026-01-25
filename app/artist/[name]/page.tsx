"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Music, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Release {
  id: number;
  title: string;
  year: number | null;
  thumb: string;
  cover_image: string;
  resource_url: string;
  type: string;
  format?: string[];
  label?: string[];
  genre?: string[];
  style?: string[];
}

interface Artist {
  id: number;
  name: string;
  profile: string;
  images?: Array<{
    uri: string;
    height: number;
    width: number;
  }>;
  resource_url: string;
}

export default function ArtistPage() {
  const params = useParams();
  const router = useRouter();
  const artistName = decodeURIComponent(params.name as string);
  const [releases, setReleases] = useState<Release[]>([]);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArtistData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/discogs/artist/${encodeURIComponent(artistName)}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch artist data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setArtist(data.artist);
        setReleases(data.releases || []);
      } catch (err: any) {
        console.error("Error fetching artist data:", err);
        setError(err.message || "An error occurred while fetching artist data");
      } finally {
        setLoading(false);
      }
    }

    if (artistName) {
      fetchArtistData();
    }
  }, [artistName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-white/70 text-xl mb-4">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-50">
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
              <h1 className="text-2xl font-bold text-white">
                {artist?.name || artistName}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Artist Hero Section */}
      {artist && (
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto mb-16">
            {artist.images && artist.images.length > 0 && artist.images[0].uri && (
              <div className="mb-8">
                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={artist.images[0].uri}
                    alt={artist.name}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      console.error("Error loading artist image:", e);
                    }}
                  />
                </div>
              </div>
            )}
            {artist.profile && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
                <p className="text-white/80 leading-relaxed text-lg">
                  {artist.profile}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Releases Section - Magazine Style */}
      <main className="container mx-auto px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-2 px-2">
            Veröffentlichungen
          </h2>
          <p className="text-white/60 mb-12 px-2">
            Die neuesten 10 Veröffentlichungen
          </p>

          {releases.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/70 text-xl">
                Keine Veröffentlichungen gefunden
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {releases.map((release, index) => (
                <article
                  key={release.id}
                  className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 hover:border-gray-500 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/50 hover:-translate-y-2"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Cover Image - Magazine Style */}
                  <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 shadow-inner">
                    {release.cover_image ? (
                      <Image
                        src={release.cover_image}
                        alt={release.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        onError={(e) => {
                          console.error("Error loading cover image:", e);
                          // Fallback handled by parent div background
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800/30 to-black/30">
                        <Music className="h-20 w-20 text-white/20" />
                      </div>
                    )}
                    
                    {/* Year Badge - Magazine Style */}
                    {release.year !== null && release.year !== undefined && (
                      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-white text-sm font-bold tracking-wide">
                            {release.year}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Gradient Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Release Info - Typography focused */}
                  <div className="p-6 relative z-10">
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-gray-300 transition-colors leading-tight">
                      {release.title}
                    </h3>
                    
                    {/* Metadata - Magazine style tags */}
                    <div className="space-y-3 mt-4">
                      {release.format && release.format.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {release.format.slice(0, 2).map((format, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-gray-700/30 text-gray-300 text-xs font-semibold rounded-md border border-gray-600/30 uppercase tracking-wide"
                            >
                              {format}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {release.label && release.label.length > 0 && (
                        <p className="text-white/70 text-sm font-medium">
                          {release.label[0]}
                        </p>
                      )}
                      
                      {release.genre && release.genre.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {release.genre.slice(0, 2).map((genre, idx) => (
                            <span
                              key={idx}
                              className="text-white/50 text-xs italic"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Hover Overlay - Action Button */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <a
                        href={release.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-center transition-all duration-200 shadow-lg hover:shadow-gray-900/50 transform hover:scale-105 border border-gray-700"
                      >
                        Auf Discogs ansehen
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
