import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { PlayerProvider } from "./context/PlayerContext";
import GlobalPlayer from "./components/GlobalPlayer";

export const metadata: Metadata = {
  title: "DiscMaster - Your Vinyl Collection Manager",
  description: "Manage your vinyl collection with Discogs integration and Spotify playback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <Script
          src="https://sdk.scdn.co/spotify-player.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased">
        <PlayerProvider>
          {children}
          <GlobalPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
