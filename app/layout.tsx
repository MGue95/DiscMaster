import type { Metadata } from "next";
import "./globals.css";
import { PlayerProvider } from "./context/PlayerContext";
import GlobalPlayer from "./components/GlobalPlayer";

export const metadata: Metadata = {
  title: "Discogs App",
  description: "Eine moderne Discogs-Anwendung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">
        <PlayerProvider>
          {children}
          <GlobalPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
