import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    try {
        // Get access token from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("spotify_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: "Not authenticated with Spotify", connected: false },
                { status: 401 }
            );
        }

        // Get user profile from Spotify
        const response = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to get user profile", connected: false },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            connected: true,
            user: {
                id: data.id,
                display_name: data.display_name,
                email: data.email,
                images: data.images,
                product: data.product, // "premium" or "free"
                country: data.country,
            },
        });
    } catch (error: any) {
        console.error("Error getting Spotify profile:", error);
        return NextResponse.json(
            { error: error.message || "Failed to get profile", connected: false },
            { status: 500 }
        );
    }
}
