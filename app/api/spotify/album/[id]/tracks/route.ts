import { NextRequest, NextResponse } from "next/server";
import { getAlbumTracks } from "@/lib/spotify";
import { cookies } from "next/headers";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const albumId = id;

        // Try to get access token from cookies (for user-specific features)
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("spotify_access_token")?.value;

        // If no user token, use client credentials
        let token = accessToken;

        if (!token) {
            // Get token using client credentials flow
            const clientId = process.env.SPOTIFY_CLIENT_ID;
            const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

            if (!clientId || !clientSecret) {
                throw new Error("Spotify credentials not configured");
            }

            const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
                },
                body: "grant_type=client_credentials",
            });

            if (!tokenResponse.ok) {
                throw new Error("Failed to get Spotify token");
            }

            const tokenData = await tokenResponse.json();
            token = tokenData.access_token;
        }

        // Ensure we have a token
        if (!token) {
            throw new Error("Failed to get access token");
        }

        // Get album tracks
        const tracks = await getAlbumTracks(token, albumId);

        return NextResponse.json({
            tracks: tracks.map((track: any) => ({
                id: track.id,
                uri: track.uri,
                name: track.name,
                duration_ms: track.duration_ms,
                track_number: track.track_number,
                preview_url: track.preview_url,
                artists: track.artists.map((a: any) => ({ name: a.name })),
            })),
        });
    } catch (error: any) {
        console.error("Error getting album tracks:", error);
        return NextResponse.json(
            { error: error.message || "Failed to get album tracks" },
            { status: 500 }
        );
    }
}
