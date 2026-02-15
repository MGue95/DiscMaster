"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSpotifyPlayer } from "../hooks/useSpotifyPlayer";

interface Track {
    uri: string;
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        images: Array<{ url: string }>;
    };
}

interface PlayerContextType {
    // Legacy iframe support
    albumId: string | null;
    isVisible: boolean;
    isMinimized: boolean;
    playAlbum: (id: string) => void;
    closePlayer: () => void;
    toggleMinimize: () => void;

    // SDK player state
    currentTrack: Track | null;
    isPlaying: boolean;
    position: number;
    duration: number;
    isReady: boolean;
    error: string | null;
    useSDK: boolean; // Whether Web Playback SDK is active

    // SDK player controls
    playTrack: (uri: string) => Promise<void>;
    playAlbumUri: (uri: string) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    skipNext: () => Promise<void>;
    skipPrevious: () => Promise<void>;
    seek: (position: number) => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
    likeCurrentTrack: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [albumId, setAlbumId] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Get Spotify access token from cookies
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        // Check for Spotify access token in cookies
        const cookies = document.cookie.split(";");
        const tokenCookie = cookies.find((c) => c.trim().startsWith("spotify_access_token="));
        if (tokenCookie) {
            const token = tokenCookie.split("=")[1];
            setAccessToken(token);
        }
    }, []);

    // Initialize Spotify Web Playback SDK
    const spotifyPlayer = useSpotifyPlayer(accessToken);

    // Determine if we should use SDK or iframe fallback
    const useSDK = !!(accessToken && spotifyPlayer.isReady && !spotifyPlayer.error?.includes("Premium"));

    const playAlbum = (id: string) => {
        // Legacy iframe support
        if (id === albumId) {
            setIsVisible(true);
            setIsMinimized(false);
            return;
        }

        setAlbumId(id);
        setIsVisible(true);
        setIsMinimized(false);

        // If SDK is ready, also play via SDK
        if (useSDK && spotifyPlayer.deviceId) {
            const albumUri = `spotify:album:${id}`;
            spotifyPlayer.play(albumUri);
        }
    };

    const playAlbumUri = async (uri: string) => {
        if (!useSDK) {
            // Fallback: extract album ID and use iframe
            const match = uri.match(/spotify:album:([a-zA-Z0-9]+)/);
            if (match) {
                playAlbum(match[1]);
            }
            return;
        }

        setIsVisible(true);
        setIsMinimized(false);
        await spotifyPlayer.play(uri);
    };

    const playTrack = async (uri: string) => {
        if (!useSDK) {
            console.warn("Track playback requires Spotify Premium and SDK");
            return;
        }

        setIsVisible(true);
        setIsMinimized(false);
        await spotifyPlayer.play(uri);
    };

    const closePlayer = () => {
        setIsVisible(false);
        setAlbumId(null);

        if (useSDK) {
            spotifyPlayer.pause();
        }
    };

    const toggleMinimize = () => {
        setIsMinimized((prev) => !prev);
    };

    const likeCurrentTrack = async () => {
        if (!spotifyPlayer.currentTrack || !accessToken) {
            console.error("No current track or access token");
            return;
        }

        try {
            const trackUri = spotifyPlayer.currentTrack.uri;

            // Debug logging
            console.log("=== LIKING TRACK ===");
            console.log("Track Name:", spotifyPlayer.currentTrack.name);
            console.log("Track URI:", trackUri);
            console.log("Is Track URI:", trackUri.includes("spotify:track:"));
            console.log("Track ID:", spotifyPlayer.currentTrack.id);

            // Call API to add track to Discmaster Favorites playlist
            const response = await fetch("/api/spotify/playlist/add-track", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    trackUri: trackUri,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error("Failed to add track to playlist");
            }

            const result = await response.json();
            console.log("✅ Success:", result.message);
            console.log("Playlist ID:", result.playlistId);
        } catch (error) {
            console.error("Error liking track:", error);
        }
    };

    return (
        <PlayerContext.Provider
            value={{
                // Legacy iframe
                albumId,
                isVisible,
                isMinimized,
                playAlbum,
                closePlayer,
                toggleMinimize,

                // SDK state
                currentTrack: spotifyPlayer.currentTrack,
                isPlaying: !spotifyPlayer.isPaused && spotifyPlayer.isActive,
                position: spotifyPlayer.position,
                duration: spotifyPlayer.duration,
                isReady: spotifyPlayer.isReady,
                error: spotifyPlayer.error,
                useSDK,

                // SDK controls
                playTrack,
                playAlbumUri,
                pause: spotifyPlayer.pause,
                resume: spotifyPlayer.resume,
                skipNext: spotifyPlayer.skipNext,
                skipPrevious: spotifyPlayer.skipPrevious,
                seek: spotifyPlayer.seek,
                setVolume: spotifyPlayer.setVolume,
                likeCurrentTrack,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
}
