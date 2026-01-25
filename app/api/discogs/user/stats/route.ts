import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient } from "@/lib/oauth";

export async function GET(request: NextRequest) {
    try {
        const accessToken = request.cookies.get("discogs_access_token")?.value;
        const accessTokenSecret = request.cookies.get("discogs_access_token_secret")?.value;
        const rawUsername = request.cookies.get("discogs_username")?.value;

        // Crucial: some browsers/frameworks might encode the cookie value
        const username = rawUsername ? decodeURIComponent(rawUsername) : null;

        if (!accessToken || !accessTokenSecret || !username) {
            return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
        }

        const oauth = createOAuthClient();
        const token = { key: accessToken, secret: accessTokenSecret };
        const USER_AGENT = "DiscMaster/1.0";

        const authFetch = async (url: string) => {
            const requestData = { url, method: "GET" };
            const authHeader = oauth.toHeader(oauth.authorize(requestData, token));
            const res = await fetch(url, {
                headers: { ...authHeader, "User-Agent": USER_AGENT },
            });
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error(`Discogs API: Unauthorized (${res.status}). Bitte erneut anmelden.`);
                }
                throw new Error(`Discogs API Fehler: ${res.status}`);
            }
            return res.json();
        };

        // Parallel fetching
        const [profile, collection, wantlist] = await Promise.all([
            authFetch(`https://api.discogs.com/users/${encodeURIComponent(username)}`),
            authFetch(`https://api.discogs.com/users/${encodeURIComponent(username)}/collection/folders/0`),
            authFetch(`https://api.discogs.com/users/${encodeURIComponent(username)}/wants`)
        ]);

        return NextResponse.json({
            username: profile.username,
            name: profile.name,
            avatarUrl: profile.avatar_url,
            stats: {
                collectionCount: collection.count || 0,
                wantlistCount: wantlist.pagination?.items || 0,
                inventoryCount: profile.num_for_sale || 0,
            }
        });
    } catch (error: any) {
        console.error("Stats fetch error detail:", {
            message: error.message,
            stack: error.stack,
        });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
