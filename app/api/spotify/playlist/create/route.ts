import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDiscmasterPlaylist } from "@/lib/spotify";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    try {
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

        // Get or create playlist
        const playlist = await getOrCreateDiscmasterPlaylist(accessToken, userId);

        return NextResponse.json({
            playlist,
        });
    } catch (error: any) {
        console.error("Error creating playlist:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create playlist" },
            { status: 500 }
        );
    }
}
