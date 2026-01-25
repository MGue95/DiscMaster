import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  const protocol = request.nextUrl.protocol;
  const host = request.headers.get("host") || "localhost:3000";
  const baseUrl = `${protocol}//${host}`;

  try {
    const searchParams = request.nextUrl.searchParams;
    const oauthToken = searchParams.get("oauth_token");
    const oauthVerifier = searchParams.get("oauth_verifier");

    console.log("OAuth Callback processing...");

    if (!oauthToken || !oauthVerifier) {
      console.error("Missing tokens in callback:", { oauthToken, oauthVerifier });
      return NextResponse.redirect(`${baseUrl}/profile?error=missing_callback_params`);
    }

    const oauthTokenSecret = request.cookies.get("oauth_token_secret")?.value;
    if (!oauthTokenSecret) {
      console.error("No temporary token secret found in cookies");
      return NextResponse.redirect(`${baseUrl}/profile?error=session_expired`);
    }

    const oauth = createOAuthClient();
    const accessTokenUrl = "https://api.discogs.com/oauth/access_token";

    const requestData = {
      url: accessTokenUrl,
      method: "POST",
      data: { oauth_verifier: oauthVerifier }
    };
    const token = { key: oauthToken, secret: oauthTokenSecret };

    const authData = oauth.authorize(requestData, token);
    const authHeader = oauth.toHeader(authData);

    const accessResponse = await fetch(accessTokenUrl, {
      method: "POST",
      headers: { ...authHeader, "User-Agent": "DiscMaster/1.0" },
    });

    if (!accessResponse.ok) {
      const errorText = await accessResponse.text();
      console.error("Access token error:", errorText);
      throw new Error(`Discogs Access Token Error: ${accessResponse.status}`);
    }

    const accessTokenText = await accessResponse.text();
    const accessTokenParams = new URLSearchParams(accessTokenText);
    const accessToken = accessTokenParams.get("oauth_token");
    const accessTokenSecret = accessTokenParams.get("oauth_token_secret");

    if (!accessToken || !accessTokenSecret) {
      throw new Error("Failed to parse access tokens");
    }

    // Get Identity
    const identityUrl = "https://api.discogs.com/oauth/identity";
    const identityToken = { key: accessToken, secret: accessTokenSecret };
    const identityRequestData = { url: identityUrl, method: "GET" };
    const identityAuthData = oauth.authorize(identityRequestData, identityToken);
    const identityAuthHeader = oauth.toHeader(identityAuthData);

    const identityResponse = await fetch(identityUrl, {
      headers: { ...identityAuthHeader, "User-Agent": "DiscMaster/1.0" },
    });

    let username = "DiscogsUser";
    if (identityResponse.ok) {
      const identityData = await identityResponse.json();
      username = identityData.username || username;
    }

    // Final Redirect
    const response = NextResponse.redirect(`${baseUrl}/profile?oauth=success`);

    // Cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 364, // 1 year
    };

    response.cookies.set("discogs_access_token", accessToken, cookieOptions);
    response.cookies.set("discogs_access_token_secret", accessTokenSecret, cookieOptions);
    response.cookies.set("discogs_username", username, { ...cookieOptions, httpOnly: false });

    // Clear temp secret using SAME options as set
    response.cookies.set("oauth_token_secret", "", { path: "/", maxAge: 0, httpOnly: true });

    console.log("Auth success for user:", username);
    return response;
  } catch (error: any) {
    console.error("Callback error:", error);
    const errorMsg = encodeURIComponent(error.message || "Unknown Error");
    return NextResponse.redirect(`${baseUrl}/profile?error=${errorMsg}`);
  }
}
