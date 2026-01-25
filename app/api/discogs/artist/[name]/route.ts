import { NextRequest, NextResponse } from "next/server";
import { getArtistReleases, getArtistInfo } from "@/lib/discogs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const artistName = decodeURIComponent(name);
    const token = process.env.DISCOGS_USER_TOKEN;

    const [releases, artistInfo] = await Promise.all([
      getArtistReleases(artistName, token),
      getArtistInfo(artistName, token),
    ]);

    return NextResponse.json({
      artist: artistInfo,
      releases,
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch artist data" },
      { status: 500 }
    );
  }
}
