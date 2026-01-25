const DISCOGS_API_BASE = "https://api.discogs.com";
const USER_AGENT = "DiscMaster/1.0";

export interface DiscogsRelease {
  id: number;
  title: string;
  year: number | null;
  thumb: string;
  cover_image: string;
  resource_url: string;
  type: string;
  format?: string[];
  label?: string[];
  genre?: string[];
  style?: string[];
}

export interface DiscogsArtist {
  id: number;
  name: string;
  profile: string;
  images?: Array<{
    uri: string;
    height: number;
    width: number;
  }>;
  resource_url: string;
}

export interface DiscogsSearchResponse {
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
  };
  results: DiscogsRelease[];
}

export async function getArtistReleases(
  artistName: string,
  token?: string
): Promise<DiscogsRelease[]> {
  try {
    // First, search for the artist
    const searchUrl = `${DISCOGS_API_BASE}/database/search?q=${encodeURIComponent(
      artistName
    )}&type=artist&per_page=1`;
    
    const searchHeaders: HeadersInit = {
      "User-Agent": USER_AGENT,
    };
    
    if (token) {
      searchHeaders["Authorization"] = `Discogs token=${token}`;
    }

    const searchResponse = await fetch(searchUrl, {
      headers: searchHeaders,
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text().catch(() => searchResponse.statusText);
      throw new Error(`Discogs API error: ${searchResponse.status} ${errorText}`);
    }

    const searchData = await searchResponse.json().catch(() => ({}));
    
    if (!searchData.results || searchData.results.length === 0) {
      return [];
    }

    const artistId = searchData.results[0].id;

    // Get artist releases
    const releasesUrl = `${DISCOGS_API_BASE}/artists/${artistId}/releases?sort=year&sort_order=desc&per_page=10`;
    
    const releasesResponse = await fetch(releasesUrl, {
      headers: searchHeaders,
    });

    if (!releasesResponse.ok) {
      const errorText = await releasesResponse.text().catch(() => releasesResponse.statusText);
      throw new Error(`Discogs API error: ${releasesResponse.status} ${errorText}`);
    }

    const releasesData = await releasesResponse.json().catch(() => ({ releases: [] }));
    
    // Get detailed release information
    const detailedReleases = await Promise.all(
      releasesData.releases.slice(0, 10).map(async (release: any) => {
        try {
          const releaseUrl = release.resource_url || `${DISCOGS_API_BASE}/releases/${release.id}`;
          const releaseResponse = await fetch(releaseUrl, {
            headers: searchHeaders,
          });
          
          if (releaseResponse.ok) {
            const releaseData = await releaseResponse.json();
            return {
              id: releaseData.id,
              title: releaseData.title,
              year: releaseData.year || (releaseData.released ? new Date(releaseData.released).getFullYear() : null),
              thumb: releaseData.thumb || releaseData.images?.[0]?.uri || "",
              cover_image: releaseData.images?.[0]?.uri || releaseData.thumb || "",
              resource_url: releaseData.resource_url,
              type: releaseData.type || "release",
              format: releaseData.formats?.map((f: any) => f.name) || [],
              label: releaseData.labels?.map((l: any) => l.name) || [],
              genre: releaseData.genres || [],
              style: releaseData.styles || [],
            };
          }
        } catch (error) {
          console.error(`Error fetching release ${release.id}:`, error);
        }
        
        // Fallback to basic release data
        return {
          id: release.id,
          title: release.title,
          year: release.year || null,
          thumb: release.thumb || "",
          cover_image: release.thumb || "",
          resource_url: release.resource_url,
          type: release.type || "release",
        };
      })
    );

    return detailedReleases.filter((r) => r !== null && r !== undefined);
  } catch (error) {
    console.error("Error fetching artist releases:", error);
    throw error;
  }
}

export async function getArtistInfo(
  artistName: string,
  token?: string
): Promise<DiscogsArtist | null> {
  try {
    const searchUrl = `${DISCOGS_API_BASE}/database/search?q=${encodeURIComponent(
      artistName
    )}&type=artist&per_page=1`;
    
    const headers: HeadersInit = {
      "User-Agent": USER_AGENT,
    };
    
    if (token) {
      headers["Authorization"] = `Discogs token=${token}`;
    }

    const searchResponse = await fetch(searchUrl, { headers });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text().catch(() => searchResponse.statusText);
      throw new Error(`Discogs API error: ${searchResponse.status} ${errorText}`);
    }

    const searchData = await searchResponse.json().catch(() => ({}));
    
    if (!searchData.results || searchData.results.length === 0) {
      return null;
    }

    const artistId = searchData.results[0].id;
    const artistUrl = `${DISCOGS_API_BASE}/artists/${artistId}`;
    
    const artistResponse = await fetch(artistUrl, { headers });

    if (!artistResponse.ok) {
      const errorText = await artistResponse.text().catch(() => artistResponse.statusText);
      throw new Error(`Discogs API error: ${artistResponse.status} ${errorText}`);
    }

    const artistData = await artistResponse.json().catch(() => null);
    
    if (!artistData) {
      return null;
    }
    
    return {
      id: artistData.id,
      name: artistData.name,
      profile: artistData.profile || "",
      images: artistData.images || [],
      resource_url: artistData.resource_url,
    };
  } catch (error) {
    console.error("Error fetching artist info:", error);
    return null;
  }
}
