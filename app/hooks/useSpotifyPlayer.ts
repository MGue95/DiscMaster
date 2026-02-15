"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface SpotifyPlayer {
    connect: () => Promise<boolean>;
    disconnect: () => void;
    addListener: (event: string, callback: (data: any) => void) => void;
    removeListener: (event: string, callback?: (data: any) => void) => void;
    getCurrentState: () => Promise<any>;
    setName: (name: string) => Promise<void>;
    getVolume: () => Promise<number>;
    setVolume: (volume: number) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    togglePlay: () => Promise<void>;
    seek: (position_ms: number) => Promise<void>;
    previousTrack: () => Promise<void>;
    nextTrack: () => Promise<void>;
    activateElement: () => Promise<void>;
}

interface SpotifyPlayerState {
    paused: boolean;
    position: number;
    duration: number;
    track_window: {
        current_track: {
            uri: string;
            id: string;
            name: string;
            artists: Array<{ name: string }>;
            album: {
                name: string;
                images: Array<{ url: string }>;
            };
        };
    };
}

interface UseSpotifyPlayerReturn {
    player: SpotifyPlayer | null;
    deviceId: string | null;
    isReady: boolean;
    isActive: boolean;
    isPaused: boolean;
    currentTrack: SpotifyPlayerState["track_window"]["current_track"] | null;
    position: number;
    duration: number;
    error: string | null;

    // Player controls
    play: (uri?: string) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    skipNext: () => Promise<void>;
    skipPrevious: () => Promise<void>;
    seek: (position: number) => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
}

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void;
        Spotify: {
            Player: new (options: {
                name: string;
                getOAuthToken: (cb: (token: string) => void) => void;
                volume: number;
            }) => SpotifyPlayer;
        };
    }
}

/**
 * Custom hook to manage Spotify Web Playback SDK
 * Requires Spotify Premium account
 */
export function useSpotifyPlayer(accessToken: string | null): UseSpotifyPlayerReturn {
    const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [currentTrack, setCurrentTrack] = useState<SpotifyPlayerState["track_window"]["current_track"] | null>(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    // Initialize Spotify Player
    useEffect(() => {
        if (!accessToken) {
            setError("No access token available");
            return;
        }

        // Wait for SDK to load
        if (!window.Spotify) {
            setError("Spotify SDK not loaded");
            return;
        }

        const initPlayer = () => {
            try {
                const spotifyPlayer = new window.Spotify.Player({
                    name: "Discmaster Player",
                    getOAuthToken: (cb) => {
                        cb(accessToken);
                    },
                    volume: 0.5,
                });

                // Error handling
                spotifyPlayer.addListener("initialization_error", ({ message }) => {
                    console.error("Initialization Error:", message);
                    setError(`Initialization error: ${message}`);
                });

                spotifyPlayer.addListener("authentication_error", ({ message }) => {
                    console.error("Authentication Error:", message);
                    setError(`Authentication error: ${message}`);
                });

                spotifyPlayer.addListener("account_error", ({ message }) => {
                    console.error("Account Error:", message);
                    setError(`Account error: ${message}. Spotify Premium required.`);
                });

                spotifyPlayer.addListener("playback_error", ({ message }) => {
                    console.error("Playback Error:", message);
                    setError(`Playback error: ${message}`);
                });

                // Ready
                spotifyPlayer.addListener("ready", ({ device_id }) => {
                    console.log("Ready with Device ID:", device_id);
                    setDeviceId(device_id);
                    setIsReady(true);
                    setError(null);
                });

                // Not Ready
                spotifyPlayer.addListener("not_ready", ({ device_id }) => {
                    console.log("Device ID has gone offline:", device_id);
                    setIsReady(false);
                });

                // Player state changes
                spotifyPlayer.addListener("player_state_changed", (state: SpotifyPlayerState) => {
                    if (!state) {
                        setIsActive(false);
                        return;
                    }

                    setIsActive(true);
                    setIsPaused(state.paused);
                    setCurrentTrack(state.track_window.current_track);
                    setPosition(state.position);
                    setDuration(state.duration);
                });

                // Connect player
                spotifyPlayer.connect();
                setPlayer(spotifyPlayer);

            } catch (err: any) {
                console.error("Failed to initialize player:", err);
                setError(`Failed to initialize player: ${err.message}`);
            }
        };

        initPlayer();

        return () => {
            if (player) {
                player.disconnect();
            }
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [accessToken]);

    // Update position every second when playing
    useEffect(() => {
        if (!isPaused && isActive) {
            progressInterval.current = setInterval(() => {
                setPosition((prev) => Math.min(prev + 1000, duration));
            }, 1000);
        } else {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
                progressInterval.current = null;
            }
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [isPaused, isActive, duration]);

    // Player controls
    const play = useCallback(async (uri?: string) => {
        if (!accessToken || !deviceId) {
            setError("Player not ready");
            return;
        }

        try {
            const body: any = {};

            if (uri) {
                // Determine if it's a track, album, or playlist
                if (uri.includes("track:")) {
                    body.uris = [uri];
                } else if (uri.includes("album:") || uri.includes("playlist:")) {
                    body.context_uri = uri;
                }
            }

            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            setError(null);
        } catch (err: any) {
            console.error("Play error:", err);
            setError(`Play error: ${err.message}`);
        }
    }, [accessToken, deviceId]);

    const pause = useCallback(async () => {
        if (!player) return;
        try {
            await player.pause();
            setError(null);
        } catch (err: any) {
            console.error("Pause error:", err);
            setError(`Pause error: ${err.message}`);
        }
    }, [player]);

    const resume = useCallback(async () => {
        if (!player) return;
        try {
            await player.resume();
            setError(null);
        } catch (err: any) {
            console.error("Resume error:", err);
            setError(`Resume error: ${err.message}`);
        }
    }, [player]);

    const skipNext = useCallback(async () => {
        if (!player) return;
        try {
            await player.nextTrack();
            setError(null);
        } catch (err: any) {
            console.error("Skip next error:", err);
            setError(`Skip error: ${err.message}`);
        }
    }, [player]);

    const skipPrevious = useCallback(async () => {
        if (!player) return;
        try {
            await player.previousTrack();
            setError(null);
        } catch (err: any) {
            console.error("Skip previous error:", err);
            setError(`Skip error: ${err.message}`);
        }
    }, [player]);

    const seek = useCallback(async (position: number) => {
        if (!player) return;
        try {
            await player.seek(position);
            setPosition(position);
            setError(null);
        } catch (err: any) {
            console.error("Seek error:", err);
            setError(`Seek error: ${err.message}`);
        }
    }, [player]);

    const setVol = useCallback(async (volume: number) => {
        if (!player) return;
        try {
            await player.setVolume(volume);
            setError(null);
        } catch (err: any) {
            console.error("Volume error:", err);
            setError(`Volume error: ${err.message}`);
        }
    }, [player]);

    return {
        player,
        deviceId,
        isReady,
        isActive,
        isPaused,
        currentTrack,
        position,
        duration,
        error,
        play,
        pause,
        resume,
        skipNext,
        skipPrevious,
        seek,
        setVolume: setVol,
    };
}
