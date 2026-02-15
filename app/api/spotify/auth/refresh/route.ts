import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/spotify";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        // Get refresh token from cookies
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("spotify_refresh_token")?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: "No refresh token available" },
                { status: 401 }
            );
        }

        // Refresh the access token
        const data = await refreshAccessToken(refreshToken);

        // Update cookies with new tokens
        const response = NextResponse.json({ success: true });

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
            maxAge: data.expires_in,
        };

        response.cookies.set("spotify_access_token", data.access_token, cookieOptions);

        // Update refresh token if a new one was provided
        if (data.refresh_token) {
            response.cookies.set("spotify_refresh_token", data.refresh_token, {
                ...cookieOptions,
                maxAge: 60 * 60 * 24 * 30
            });
        }

        return response;
    } catch (error: any) {
        console.error("Token refresh error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to refresh token" },
            { status: 500 }
        );
    }
}
