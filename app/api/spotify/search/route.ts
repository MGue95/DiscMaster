import { NextRequest, NextResponse } from "next/server";

// Cache for access token
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getSpotifyToken() {
    // Return cached token if still valid
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken.token;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Spotify credentials not configured");
    }

    // Get token using Client Credentials Flow (no user auth needed)
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        throw new Error("Failed to get Spotify token");
    }

    const data = await response.json();

    // Cache token (expires in 1 hour)
    cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000, // Refresh 1 min early
    };

    return cachedToken.token;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const artist = searchParams.get("artist");
    const album = searchParams.get("album");

    if (!artist || !album) {
        return NextResponse.json(
            { error: "Missing artist or album parameter" },
            { status: 400 }
        );
    }

    try {
        // Get access token (no user auth required)
        const accessToken = await getSpotifyToken();

        // Search for the album on Spotify
        const query = encodeURIComponent(`artist:${artist} album:${album}`);
        const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${query}&type=album&limit=1`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!searchResponse.ok) {
            throw new Error(`Spotify API error: ${searchResponse.status}`);
        }

        const data = await searchResponse.json();
        const foundAlbum = data.albums?.items?.[0] || null;

        return NextResponse.json({
            album: foundAlbum ? {
                id: foundAlbum.id,
                uri: foundAlbum.uri,
                name: foundAlbum.name,
                external_urls: foundAlbum.external_urls,
                images: foundAlbum.images
            } : null
        });
    } catch (error: any) {
        console.error("Spotify search error:", error);
        return NextResponse.json(
            {
                error: error.message || "Failed to search Spotify",
                album: null
            },
            { status: 500 }
        );
    }
}
