import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient } from "@/lib/oauth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        const accessToken = request.cookies.get("discogs_access_token")?.value;
        const accessTokenSecret = request.cookies.get("discogs_access_token_secret")?.value;

        const oauth = createOAuthClient();
        const token = accessToken && accessTokenSecret ? { key: accessToken, secret: accessTokenSecret } : undefined;
        const USER_AGENT = "DiscMaster/1.0";

        const searchUrl = `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&per_page=5&type=release`;

        const requestData = { url: searchUrl, method: "GET" };

        // If we have a token, use it for higher rate limits, otherwise just use public
        let headers: any = { "User-Agent": USER_AGENT };
        if (token) {
            const authHeader = oauth.toHeader(oauth.authorize(requestData, token));
            headers = { ...headers, ...authHeader };
        }

        const res = await fetch(searchUrl, { headers });

        if (!res.ok) {
            // Fallback for public if auth fails or not present
            const publicRes = await fetch(searchUrl, { headers: { "User-Agent": USER_AGENT } });
            if (!publicRes.ok) throw new Error("Search failed");
            const data = await publicRes.json();
            return NextResponse.json({ results: data.results || [] });
        }

        const data = await res.json();
        return NextResponse.json({ results: data.results || [] });
    } catch (error: any) {
        console.error("Suggestions error:", error);
        return NextResponse.json({ results: [] });
    }
}
