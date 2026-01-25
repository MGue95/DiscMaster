import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
