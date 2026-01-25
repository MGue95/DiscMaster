import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const artist = searchParams.get("artist");
        const title = searchParams.get("title");

        if (!artist || !title) {
            return NextResponse.json({ error: "Missing artist or title" }, { status: 400 });
        }

        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            return NextResponse.json({ error: "Spotify not configured" }, { status: 500 });
        }

        // 1. Get Access Token (Client Credentials Flow)
        const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
            },
            body: "grant_type=client_credentials",
        });

        if (!tokenRes.ok) throw new Error("Failed to get Spotify token");
        const { access_token } = await tokenRes.json();

        // 2. Search for Album
        const searchUrl = `https://api.discogs.com/https://api.spotify.com/v1/search?q=album:${encodeURIComponent(title)} artist:${encodeURIComponent(artist)}&type=album&limit=1`;
        // Wait, the URL above has discogs in it by mistake from my mental template. Fixing:
        const correctSearchUrl = `https://api.spotify.com/v1/search?q=album:${encodeURIComponent(title)} artist:${encodeURIComponent(artist)}&type=album&limit=1`;

        const searchRes = await fetch(correctSearchUrl, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!searchRes.ok) throw new Error("Spotify search failed");
        const searchData = await searchRes.json();
        const album = searchData.albums?.items?.[0];

        if (!album) return NextResponse.json({ previewUrl: null });

        // 3. Get Tracks
        const tracksRes = await fetch(`https://api.spotify.com/v1/albums/${album.id}/tracks?limit=10`, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!tracksRes.ok) throw new Error("Failed to get album tracks");
        const tracksData = await tracksRes.json();

        // 4. Find first track with a preview_url
        const trackWithPreview = tracksData.items.find((t: any) => t.preview_url);

        return NextResponse.json({
            previewUrl: trackWithPreview?.preview_url || null,
            trackName: trackWithPreview?.name || null,
            spotifyUrl: album.external_urls.spotify
        });
    } catch (error: any) {
        console.error("Spotify Preview Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
