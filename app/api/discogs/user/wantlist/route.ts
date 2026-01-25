import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient } from "@/lib/oauth";

export async function GET(request: NextRequest) {
    try {
        const accessToken = request.cookies.get("discogs_access_token")?.value;
        const accessTokenSecret = request.cookies.get("discogs_access_token_secret")?.value;
        const rawUsername = request.cookies.get("discogs_username")?.value;
        const username = rawUsername ? decodeURIComponent(rawUsername) : null;

        if (!accessToken || !accessTokenSecret || !username) {
            return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        const per_page = searchParams.get("per_page") || "50";
        const sort = searchParams.get("sort") || "added";
        const sort_order = searchParams.get("sort_order") || "desc";

        const oauth = createOAuthClient();
        const token = { key: accessToken, secret: accessTokenSecret };
        const USER_AGENT = "DiscMaster/1.0";

        const wantlistUrl = `https://api.discogs.com/users/${encodeURIComponent(username)}/wants?page=${page}&per_page=${per_page}&sort=${sort}&sort_order=${sort_order}`;

        const requestData = { url: wantlistUrl, method: "GET" };
        const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

        const res = await fetch(wantlistUrl, {
            headers: { ...authHeader, "User-Agent": USER_AGENT },
        });

        if (!res.ok) {
            throw new Error(`Discogs API Fehler: ${res.status}`);
        }

        const data = await res.json();
        // Discogs wants API returns { pagination, wants: [] }
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Wantlist fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
