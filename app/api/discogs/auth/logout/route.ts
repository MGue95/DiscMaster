import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const response = NextResponse.redirect(new URL("/profile", request.url));

    const cookieOptions = {
        path: "/",
        expires: new Date(0),
        maxAge: 0,
    };

    response.cookies.set("discogs_access_token", "", cookieOptions);
    response.cookies.set("discogs_access_token_secret", "", cookieOptions);
    response.cookies.set("discogs_username", "", cookieOptions);
    response.cookies.set("oauth_token_secret", "", cookieOptions);

    return response;
}
