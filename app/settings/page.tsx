"use client";

import { ArrowLeft, Settings, Bell, Lock, User, Eye, Globe, Shield, Save, Loader2, Music } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            alert("Einstellungen gespeichert!");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
            {/* Header */}
            <header className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Settings className="h-6 w-6 text-gray-400" />
                            <h1 className="text-xl font-bold">Einstellungen</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="space-y-6">
                    {/* Section: Account */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-4 px-4">Account</h3>
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-blue-400" />
                                    <div>
                                        <p className="font-bold">Profil bearbeiten</p>
                                        <p className="text-xs text-white/40">Name, Bio und Avatar ändern</p>
                                    </div>
                                </div>
                                <span className="text-gray-600 group-hover:translate-x-1 transition-transform">›</span>
                            </div>
                            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <Globe className="h-5 w-5 text-green-400" />
                                    <div>
                                        <p className="font-bold">Sprache</p>
                                        <p className="text-xs text-white/40">Deutsch (Standard)</p>
                                    </div>
                                </div>
                                <span className="text-gray-600 group-hover:translate-x-1 transition-transform">›</span>
                            </div>
                        </div>
                    </section>

                    {/* Section: Integrations */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-4 px-4">Integrationen</h3>
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#1DB954]/20 rounded-xl flex items-center justify-center">
                                        <Music className="h-5 w-5 text-[#1DB954]" />
                                    </div>
                                    <div>
                                        <p className="font-bold">Spotify</p>
                                        <p className="text-xs text-white/40">Alben direkt auf Spotify anhören</p>
                                    </div>
                                </div>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Fix for localhost vs 127.0.0.1 mismatch
                                        const isLocalhost = window.location.hostname === 'localhost';
                                        const targetOrigin = isLocalhost ? 'http://127.0.0.1:3000' : window.location.origin;
                                        window.location.href = `${targetOrigin}/api/spotify/auth/login`;
                                    }}
                                    className="px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-black uppercase tracking-widest rounded-full transition-all active:scale-95"
                                >
                                    Verbinden
                                </a>
                            </div>
                        </div>
                        <p className="mt-2 px-4 text-[10px] text-white/20 italic">
                            Hinweis: Erfordert Client ID in .env.local
                        </p>
                    </section>

                    {/* Section: Privacy */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-4 px-4">Sicherheit & Privatsphäre</h3>
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Eye className="h-5 w-5 text-purple-400" />
                                    <div>
                                        <p className="font-bold">Öffentliches Profil</p>
                                        <p className="text-xs text-white/40">Andere können deine Sammlung sehen</p>
                                    </div>
                                </div>
                                <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <Lock className="h-5 w-5 text-orange-400" />
                                    <div>
                                        <p className="font-bold">Passwort ändern</p>
                                        <p className="text-xs text-white/40">Zuletzt geändert vor 3 Monaten</p>
                                    </div>
                                </div>
                                <span className="text-gray-600 group-hover:translate-x-1 transition-transform">›</span>
                            </div>
                            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-red-400" />
                                    <div>
                                        <p className="font-bold">API Zugriff</p>
                                        <p className="text-xs text-white/40">Discogs OAuth Status: Aktiv</p>
                                    </div>
                                </div>
                                <span className="text-gray-600 group-hover:translate-x-1 transition-transform">›</span>
                            </div>
                        </div>
                    </section>

                    {/* Section: Notifications */}
                    <section>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-4 px-4">Benachrichtigungen</h3>
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Bell className="h-5 w-5 text-yellow-400" />
                                    <div>
                                        <p className="font-bold">Push-Benachrichtigungen</p>
                                        <p className="text-xs text-white/40">Bei neuen Releases in deiner Playlist</p>
                                    </div>
                                </div>
                                <div className="w-12 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white/20 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full mt-8 py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        <span>Änderungen speichern</span>
                    </button>
                </div>
            </main>

            <footer className="mt-20 py-8 text-center border-t border-white/5">
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
                    Version 1.2.0-Alpha &bull; build 2026.01.25
                </p>
            </footer>
        </div>
    );
}
