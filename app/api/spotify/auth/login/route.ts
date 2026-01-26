import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: NextRequest) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || `${request.nextUrl.origin} /api/spotify / auth / callback`;

    if (!clientId) {
        console.error("Missing SPOTIFY_CLIENT_ID");
        return NextResponse.redirect(new URL("/settings?error=spotify_not_configured", request.url));
    }

    const state = crypto.randomBytes(16).toString("hex");
    const scope = "user-read-private user-read-email user-library-read streaming user-read-playback-state user-modify-playback-state";

    const params = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state,
    });

    const response = NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);

    // Set cookie without domain restriction to work with both localhost and 127.0.0.1
    response.cookies.set("spotify_auth_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600,
        path: "/",
    });

    return response;
}
