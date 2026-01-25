import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const storedState = request.cookies.get("spotify_auth_state")?.value;

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || `${request.nextUrl.origin}/api/spotify/auth/callback`;

    if (!state || state !== storedState) {
        return NextResponse.redirect(new URL("/settings?error=state_mismatch", request.url));
    }

    if (!code || !clientId || !clientSecret) {
        return NextResponse.redirect(new URL("/settings?error=missing_config", request.url));
    }

    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
            },
            body: new URLSearchParams({
                code: code,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error_description || "Failed to get token");
        }

        const res = NextResponse.redirect(new URL("/settings?spotify=success", request.url));

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
            maxAge: data.expires_in,
        };

        res.cookies.set("spotify_access_token", data.access_token, cookieOptions);
        if (data.refresh_token) {
            res.cookies.set("spotify_refresh_token", data.refresh_token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
        }

        // Clear state
        res.cookies.set("spotify_auth_state", "", { maxAge: 0 });

        return res;
    } catch (error: any) {
        console.error("Spotify Auth Error:", error);
        return NextResponse.redirect(new URL(`/settings?error=${encodeURIComponent(error.message)}`, request.url));
    }
}
