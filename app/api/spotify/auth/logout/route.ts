import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        // Clear Spotify cookies
        const cookieStore = await cookies();
        const response = NextResponse.redirect(new URL("/settings?spotify=logged_out", request.url));

        response.cookies.set("spotify_access_token", "", { maxAge: 0, path: "/" });
        response.cookies.set("spotify_refresh_token", "", { maxAge: 0, path: "/" });
        response.cookies.set("spotify_auth_state", "", { maxAge: 0, path: "/" });

        return response;
    } catch (error: any) {
        console.error("Logout error:", error);
        return NextResponse.redirect(new URL("/settings?error=logout_failed", request.url));
    }
}
