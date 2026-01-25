import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  try {
    const consumerKey = process.env.DISCOGS_CONSUMER_KEY;
    const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET;

    // Dynamically determine the app URL
    const protocol = request.nextUrl.protocol;
    const host = request.headers.get("host") || "localhost:3000";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}//${host}`;
    const callbackUrl = `${appUrl}/api/discogs/auth/callback`;

    console.log("Login initiation:", { appUrl, callbackUrl, host });

    if (!consumerKey || !consumerSecret) {
      console.error("Missing OAuth configuration in .env.local");
      return NextResponse.redirect(
        new URL("/profile?error=oauth_not_configured", request.url)
      );
    }

    const oauth = createOAuthClient();
    const requestTokenUrl = "https://api.discogs.com/oauth/request_token";

    // Step 1: Get request token with callback URL
    // Correct way for oauth-1.0a: include callback in data
    const requestData = {
      url: requestTokenUrl,
      method: "POST",
      data: { oauth_callback: callbackUrl }
    };

    const authData = oauth.authorize(requestData);
    const authHeader = oauth.toHeader(authData);

    const tokenResponse = await fetch(requestTokenUrl, {
      method: "POST",
      headers: {
        ...authHeader,
        "User-Agent": "DiscMaster/1.0",
      },
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("OAuth request token error:", errorText);
      throw new Error(`Discogs API: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }

    const tokenText = await tokenResponse.text();
    const tokenParams = new URLSearchParams(tokenText);
    const oauthToken = tokenParams.get("oauth_token");
    const oauthTokenSecret = tokenParams.get("oauth_token_secret");

    if (!oauthToken || !oauthTokenSecret) {
      console.error("Failed to extract tokens from response");
      throw new Error("Invalid response from Discogs");
    }

    const authorizeUrl = `https://www.discogs.com/oauth/authorize?oauth_token=${oauthToken}`;
    const response = NextResponse.redirect(authorizeUrl, { status: 302 });

    // Store token secret in httpOnly cookie
    response.cookies.set("oauth_token_secret", oauthTokenSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error: any) {
    console.error("OAuth login error:", error);
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
