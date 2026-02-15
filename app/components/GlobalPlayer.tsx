"use client";

import { usePlayer } from "../context/PlayerContext";
import { X, Minus, Maximize2, Music, Loader2, Play, Pause, SkipForward, SkipBack, Volume2, Heart } from "lucide-react";
import { useState, useEffect } from "react";

export default function GlobalPlayer() {
    const {
        albumId,
        isVisible,
        isMinimized,
        closePlayer,
        toggleMinimize,
        useSDK,
        currentTrack,
        isPlaying,
        position,
        duration,
        pause,
        resume,
        skipNext,
        skipPrevious,
        seek,
        setVolume,
        likeCurrentTrack,
    } = usePlayer();

    const [isLoading, setIsLoading] = useState(true);
    const [volume, setVolumeState] = useState(50);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    // Reset loading when album changes
    useEffect(() => {
        if (albumId) {
            setIsLoading(true);
        }
    }, [albumId]);

    if (!isVisible || (!albumId && !currentTrack)) return null;

    // Format time helper
    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handlePlayPause = async () => {
        if (isPlaying) {
            await pause();
        } else {
            await resume();
        }
    };

    const handleSkipNext = async () => {
        await skipNext();
    };

    const handleSkipPrevious = async () => {
        await skipPrevious();
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPosition = parseInt(e.target.value);
        seek(newPosition);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolumeState(newVolume);
        setVolume(newVolume / 100);
    };

    const handleLike = async () => {
        setIsLiked(true);
        await likeCurrentTrack();

        // Show feedback
        setTimeout(() => {
            setIsLiked(false);
        }, 2000);
    };

    // SDK Player UI
    if (useSDK && currentTrack) {
        return (
            <div
                className={`fixed bottom-4 right-4 z-[100] transition-all duration-300 ease-in-out shadow-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-black to-gray-900 backdrop-blur-xl ${isMinimized
                        ? "w-80 h-20 rounded-full"
                        : "w-96 h-[280px] rounded-2xl"
                    }`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-4 ${isMinimized ? "h-full" : "h-12 bg-white/5 border-b border-white/5"}`}>
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 flex items-center justify-center flex-shrink-0 ring-2 ring-[#1DB954]/30 animate-pulse">
                            <Music className="h-4 w-4 text-[#1DB954]" />
                        </div>
                        {!isMinimized && (
                            <span className="text-xs font-black text-white/50 uppercase tracking-widest">
                                Now Playing
                            </span>
                        )}
                        {isMinimized && currentTrack && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">{currentTrack.name}</p>
                                <p className="text-[10px] text-white/40 truncate">{currentTrack.artists[0]?.name}</p>
                            </div>
                        )}
                    </div>

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

                {/* Player Content */}
                {!isMinimized && (
                    <div className="p-4 space-y-4">
                        {/* Track Info */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 shadow-lg flex-shrink-0">
                                {currentTrack.album.images[0] && (
                                    <img
                                        src={currentTrack.album.images[0].url}
                                        alt={currentTrack.album.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="font-bold text-white text-sm truncate mb-1">
                                    {currentTrack.name}
                                </h3>
                                <p className="text-xs text-white/60 truncate">
                                    {currentTrack.artists.map(a => a.name).join(", ")}
                                </p>
                                <p className="text-[10px] text-white/40 truncate mt-0.5">
                                    {currentTrack.album.name}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={position}
                                onChange={handleSeek}
                                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1DB954] 
                                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                                hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                            />
                            <div className="flex justify-between text-[10px] text-white/30 font-mono">
                                <span>{formatTime(position)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between">
                            {/* Left: Like Button */}
                            <button
                                onClick={handleLike}
                                className={`p-2 rounded-full transition-all ${isLiked
                                        ? "bg-[#1DB954] text-black scale-110"
                                        : "hover:bg-white/10 text-white/60 hover:text-white"
                                    }`}
                                title="Zu Discmaster Favorites hinzufügen"
                            >
                                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                            </button>

                            {/* Center: Playback Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSkipPrevious}
                                    className="p-2 hover:bg-white/10 rounded-full transition-all text-white/80 hover:text-white active:scale-95"
                                >
                                    <SkipBack className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handlePlayPause}
                                    className="p-3 bg-[#1DB954] hover:bg-[#1ed760] rounded-full transition-all text-black active:scale-95 shadow-lg"
                                >
                                    {isPlaying ? (
                                        <Pause className="h-5 w-5" />
                                    ) : (
                                        <Play className="h-5 w-5 ml-0.5" />
                                    )}
                                </button>
                                <button
                                    onClick={handleSkipNext}
                                    className="p-2 hover:bg-white/10 rounded-full transition-all text-white/80 hover:text-white active:scale-95"
                                >
                                    <SkipForward className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Right: Volume */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                                    title="Lautstärke"
                                >
                                    <Volume2 className="h-4 w-4" />
                                </button>

                                {showVolumeSlider && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={volume}
                                            onChange={handleVolumeChange}
                                            className="w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer rotate-0
                                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
                                            [&::-webkit-slider-thumb]:cursor-pointer"
                                        />
                                        <p className="text-center text-[10px] text-white/50 mt-2 font-mono">{volume}%</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="text-center">
                            <span className="text-[9px] text-[#1DB954] font-black uppercase tracking-widest px-2 py-1 bg-[#1DB954]/10 rounded-full border border-[#1DB954]/20">
                                Spotify Premium
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Fallback: Iframe Player
    return (
        <div
            className={`fixed bottom-4 right-4 z-[100] transition-all duration-300 ease-in-out shadow-2xl border border-white/10 overflow-hidden bg-black/90 backdrop-blur-xl ${isMinimized
                    ? "w-72 h-16 rounded-full"
                    : "w-80 h-[200px] rounded-2xl"
                }`}
        >
            {/* Header / Controls */}
            <div className={`flex items-center justify-between px-4 ${isMinimized ? "h-full" : "h-12 bg-white/5 border-b border-white/5"}`}>
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
