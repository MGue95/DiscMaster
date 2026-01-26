"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface PlayerContextType {
    albumId: string | null;
    isVisible: boolean;
    isMinimized: boolean;
    playAlbum: (id: string) => void;
    closePlayer: () => void;
    toggleMinimize: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [albumId, setAlbumId] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const playAlbum = (id: string) => {
        // If same album, just ensure visible and maximized
        if (id === albumId) {
            setIsVisible(true);
            setIsMinimized(false);
            return;
        }

        // New album
        setAlbumId(id);
        setIsVisible(true);
        setIsMinimized(false);
    };

    const closePlayer = () => {
        setIsVisible(false);
        setAlbumId(null);
    };

    const toggleMinimize = () => {
        setIsMinimized((prev) => !prev);
    };

    return (
        <PlayerContext.Provider
            value={{
                albumId,
                isVisible,
                isMinimized,
                playAlbum,
                closePlayer,
                toggleMinimize,
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
