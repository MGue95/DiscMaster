"use client";

import { usePlayer } from "../context/PlayerContext";
import { X, Minus, Maximize2, Music, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function GlobalPlayer() {
    const { albumId, isVisible, isMinimized, closePlayer, toggleMinimize } = usePlayer();
    const [isLoading, setIsLoading] = useState(true);

    // Reset loading when album changes
    useEffect(() => {
        if (albumId) {
            setIsLoading(true);
        }
    }, [albumId]);

    if (!isVisible || !albumId) return null;

    return (
        <div
            className={`fixed bottom-4 right-4 z-[100] transition-all duration-300 ease-in-out shadow-2xl border border-white/10 overflow-hidden bg-black/90 backdrop-blur-xl ${isMinimized
                    ? "w-72 h-16 rounded-full"
                    : "w-80 h-[200px] rounded-2xl"
                }`}
        >
            {/* Header / Controls */}
            <div className={`flex items-center justify-between px-4 ${isMinimized ? "h-full" : "h-12 bg-white/5 border-b border-white/5"}`}>

                {/* Title area (visible in mini and full) */}
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                    <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <Music className="h-4 w-4 text-[#1DB954]" />
                    </div>
                    {isMinimized && (
                        <span className="text-sm font-bold text-white truncate">
                            Spotify Player
                        </span>
                    )}
                    {!isMinimized && (
                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">
                            Now Playing
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMinimize}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                        title={isMinimized ? "Maximieren" : "Minimieren"}
                    >
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={closePlayer}
                        className="p-1.5 hover:bg-red-500/20 rounded-full transition-colors text-white/60 hover:text-red-400"
                        title="Schließen"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Main Player Content (Hidden when minimized) */}
            {!isMinimized && (
                <div className="w-full h-[calc(100%-3rem)] bg-black relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                            <Loader2 className="h-8 w-8 text-[#1DB954] animate-spin" />
                        </div>
                    )}
                    <iframe
                        src={`https://open.spotify.com/embed/album/${albumId}?utm_source=generator&theme=0`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        onLoad={() => setIsLoading(false)}
                        className="bg-black"
                    ></iframe>
                </div>
            )}
        </div>
    );
}
