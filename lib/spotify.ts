/**
 * Spotify API Utility Functions
 * Handles playlist management, user profile, and API interactions
 */

const DISCMASTER_PLAYLIST_NAME = "Discmaster Favorites";
const DISCMASTER_PLAYLIST_DESCRIPTION = "Your favorite tracks discovered through Discmaster";

interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string }>;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  uri: string;
}

/**
 * Get the current user's Spotify profile
 */
export async function getUserProfile(accessToken: string): Promise<SpotifyUser> {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get user profile: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all playlists for the current user
 */
async function getUserPlaylists(accessToken: string, userId: string): Promise<SpotifyPlaylist[]> {
  const playlists: SpotifyPlaylist[] = [];
  let url = "https://api.spotify.com/v1/me/playlists?limit=50";

  while (url) {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get playlists: ${response.statusText}`);
    }

    const data = await response.json();
    playlists.push(...data.items);
    url = data.next;
  }

  return playlists;
}

/**
 * Find the Discmaster Favorites playlist, or return null if not found
 */
async function findDiscmasterPlaylist(
  accessToken: string,
  userId: string
): Promise<SpotifyPlaylist | null> {
  const playlists = await getUserPlaylists(accessToken, userId);
  return (
    playlists.find(
      (playlist: any) =>
        playlist.name === DISCMASTER_PLAYLIST_NAME &&
        playlist.owner?.id === userId
    ) || null
  );
}

/**
 * Create the Discmaster Favorites playlist
 */
async function createDiscmasterPlaylist(
  accessToken: string,
  userId: string
): Promise<SpotifyPlaylist> {
  const response = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: DISCMASTER_PLAYLIST_NAME,
        description: DISCMASTER_PLAYLIST_DESCRIPTION,
        public: false,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create playlist: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get or create the Discmaster Favorites playlist
 */
export async function getOrCreateDiscmasterPlaylist(
  accessToken: string,
  userId: string
): Promise<SpotifyPlaylist> {
  // Try to find existing playlist first
  const existing = await findDiscmasterPlaylist(accessToken, userId);
  if (existing) {
    return existing;
  }

  // Create new playlist if not found
  return createDiscmasterPlaylist(accessToken, userId);
}

/**
 * Add a track to a playlist
 */
export async function addTrackToPlaylist(
  accessToken: string,
  playlistId: string,
  trackUri: string
): Promise<void> {
  // Check if track already exists in playlist to avoid duplicates
  const checkResponse = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=items(track(uri))`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (checkResponse.ok) {
    const data = await checkResponse.json();
    const trackExists = data.items.some(
      (item: any) => item.track?.uri === trackUri
    );

    if (trackExists) {
      // Track already in playlist, skip
      return;
    }
  }

  // Add track to playlist
  const response = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [trackUri],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to add track to playlist: ${response.statusText}`);
  }
}

/**
 * Get tracks from an album
 */
export async function getAlbumTracks(
  accessToken: string,
  albumId: string
): Promise<any[]> {
  const response = await fetch(
    `https://api.spotify.com/v1/albums/${albumId}/tracks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get album tracks: ${response.statusText}`);
  }

  const data = await response.json();
  return data.items;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }

  return response.json();
}
