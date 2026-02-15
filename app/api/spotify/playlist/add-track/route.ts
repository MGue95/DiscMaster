import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDiscmasterPlaylist, addTrackToPlaylist } from "@/lib/spotify";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { trackUri } = body;

        if (!trackUri) {
            return NextResponse.json(
                { error: "Track URI is required" },
                { status: 400 }
            );
        }

        // Get access token from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("spotify_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: "Not authenticated with Spotify" },
                { status: 401 }
            );
        }

        // Get user profile to get user ID
        const userResponse = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userResponse.ok) {
            throw new Error("Failed to get user profile");
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Debug logging
        console.log("=== ADD TRACK TO PLAYLIST ===");
        console.log("Track URI received:", trackUri);
        console.log("User ID:", userId);
        console.log("Is track URI:", trackUri.includes("spotify:track:"));

        // Get or create Discmaster Favorites playlist
        const playlist = await getOrCreateDiscmasterPlaylist(accessToken, userId);
        console.log("Playlist found/created:", playlist.name, playlist.id);

        // Add track to playlist
        await addTrackToPlaylist(accessToken, playlist.id, trackUri);
        console.log("✅ Track added successfully");

        return NextResponse.json({
            success: true,
            playlistId: playlist.id,
            message: "Track added to Discmaster Favorites",
        });
    } catch (error: any) {
        console.error("Error adding track to playlist:", error);
        return NextResponse.json(
            { error: error.message || "Failed to add track to playlist" },
            { status: 500 }
        );
    }
}
