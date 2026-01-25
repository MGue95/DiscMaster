"use client";

import { User, ArrowLeft, Settings, LogOut, CheckCircle, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface UserStats {
  collectionCount: number;
  wantlistCount: number;
  inventoryCount: number;
}

interface UserData {
  username: string;
  name: string;
  avatarUrl: string;
  stats: UserStats;
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const oauthSuccess = searchParams.get("oauth") === "success";
  const oauthError = searchParams.get("error") || searchParams.get("message");

  const [username, setUsername] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const cookies = document.cookie.split(";");
      const usernameCookie = cookies.find((c) => c.trim().startsWith("discogs_username="));
      if (usernameCookie) {
        try {
          const val = usernameCookie.split("=")[1];
          const decoded = decodeURIComponent(val);
          setUsername(decoded);
          return decoded;
        } catch (e) {
          console.error("Cookie decode error", e);
        }
      }
      return null;
    };

    const currentUsername = checkLogin();
    if (currentUsername) {
      fetchUserStats();
    }
  }, []);

  const fetchUserStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/discogs/user/stats");
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Verbindungsfehler" }));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }
      const data = await response.json();
      setUserData(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/discogs/auth/logout";
  };

  const checkDebug = async () => {
    try {
      const res = await fetch("/api/discogs/auth/debug");
      const data = await res.json();
      setDebugInfo(data);
      setShowDebug(true);
    } catch (e) {
      alert("Debug endpoint not available");
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Alerts */}
      {oauthSuccess && (
        <div className="mb-6 bg-green-500/10 border border-green-500/50 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="text-green-200">Erfolgreich mit Discogs verbunden!</p>
        </div>
      )}

      {oauthError && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <div>
            <p className="text-red-200 font-semibold">Verbindungsfehler</p>
            <p className="text-red-300/80 text-sm">{oauthError}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-orange-500/10 border border-orange-500/50 p-4 rounded-xl flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            <p className="text-orange-200">{error}</p>
          </div>
          <button
            onClick={fetchUserStats}
            className="text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 py-1 px-3 rounded-md self-start transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Profile Details */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 bg-gray-800 rounded-full flex items-center justify-center border-2 border-white/10 overflow-hidden shadow-inner">
              {userData?.avatarUrl ? (
                <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-14 w-14 text-gray-500" />
              )}
            </div>
            {isLoading && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>

          <h2 className="text-3xl font-bold mb-1">
            {userData?.name || username || "Gast"}
          </h2>
          <p className="text-gray-400 mb-6">
            {username ? `@${username}` : "Melde dich an für vollen Zugriff"}
          </p>

          {!username ? (
            <a
              href="/api/discogs/auth/login"
              className="bg-white text-black px-10 py-3 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/5"
            >
              Mit Discogs anmelden
            </a>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-6 py-2 rounded-full text-sm font-medium transition-colors"
              >
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Sammlung", val: userData?.stats.collectionCount, unit: "Alben" },
          { label: "Wants", val: userData?.stats.wantlistCount, unit: "Items" },
          { label: "Verkauf", val: userData?.stats.inventoryCount, unit: "Angebote" },
        ].map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-center group hover:bg-white/10 transition-all cursor-default">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 group-hover:text-gray-300">{s.label}</p>
            <p className="text-2xl font-black">
              {isLoading ? "..." : (s.val ?? 0)}
            </p>
            <p className="text-[10px] text-gray-500 group-hover:text-gray-400">{s.unit}</p>
          </div>
        ))}
      </div>

      {/* Settings / Extra */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
        <Link
          href="/settings"
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-3 text-gray-300 group-hover:text-white">
            <Settings className="h-5 w-5" />
            <span>Einstellungen</span>
          </div>
          <span className="text-gray-600">›</span>
        </Link>

        <button
          onClick={checkDebug}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors group text-left"
        >
          <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-300">
            <RefreshCw className="h-5 w-5" />
            <span className="text-sm">Troubleshooting / Debugging</span>
          </div>
        </button>
      </div>

      {showDebug && debugInfo && (
        <div className="mt-8 p-6 bg-black border border-yellow-500/30 rounded-xl text-xs font-mono overflow-auto animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-yellow-500 font-bold uppercase">System Debug Info</h3>
            <button onClick={() => setShowDebug(false)} className="text-gray-500">Close</button>
          </div>
          <pre className="text-blue-300">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 p-1 pr-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20">
                <img src="/images/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-black tracking-tighter">DiscMaster</span>
            </Link>
          </div>
        </div>
      </header>

      <Suspense fallback={
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
      }>
        <ProfileContent />
      </Suspense>

      <footer className="mt-8 mb-4 text-center text-gray-600 text-[10px] uppercase tracking-tighter">
        DiscMaster App &bull; Crafted for Vinyl Lovers
      </footer>
    </div>
  );
}
