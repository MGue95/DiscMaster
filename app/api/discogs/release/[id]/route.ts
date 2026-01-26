import { NextRequest, NextResponse } from "next/server";

// Enable caching for 1 hour
export const revalidate = 3600;

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const token = request.cookies.get("discogs_access_token")?.value;

    if (!token) {
        return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 }
        );
    }

    try {
        const response = await fetch(
            `https://api.discogs.com/releases/${id}`,
            {
                headers: {
                    Authorization: `Discogs token=${token}`,
                    "User-Agent": "DiscMaster/1.0",
                },
                next: { revalidate: 3600 }, // Cache for 1 hour
            }
        );

        if (!response.ok) {
            throw new Error(`Discogs API error: ${response.status}`);
        }

        const data = await response.json();

        // Add cache headers
        const res = NextResponse.json(data);
        res.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');

        return res;
    } catch (error: any) {
        console.error("Error fetching release:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch release" },
            { status: 500 }
        );
    }
}
