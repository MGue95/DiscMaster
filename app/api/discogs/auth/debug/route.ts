import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const config = {
    consumerKeyPresent: !!process.env.DISCOGS_CONSUMER_KEY,
    consumerSecretPresent: !!process.env.DISCOGS_CONSUMER_SECRET,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "not set (default: http://localhost:3000)",
    env: process.env.NODE_ENV,
  };

  const cookies = {
    accessToken: !!request.cookies.get("discogs_access_token"),
    accessTokenSecret: !!request.cookies.get("discogs_access_token_secret"),
    username: request.cookies.get("discogs_username")?.value || "not set",
    tempSecret: !!request.cookies.get("oauth_token_secret"),
  };

  return NextResponse.json({
    config,
    cookies,
    timestamp: new Date().toISOString(),
  });
}
