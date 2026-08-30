"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const isDark = theme === "dark";
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0];

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      localStorage.setItem("initial_message", searchQuery);
      router.push("/chat");
    }
  };

  const quickActions = [
    { icon: "💬", label: "Chat", href: "/chat" },
    { icon: "📊", label: "Tracker", href: "/tracker" },
    { icon: "⏰", label: "Reminders", href: "/reminders" },
    { icon: "🚨", label: "Emergency", href: "/emergency" },
  ];

  if (!mounted) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? isDark
              ? "bg-gray-900/95 backdrop-blur-xl shadow-lg shadow-black/20"
              : "bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5"
            : isDark
            ? "bg-gray-900/70 backdrop-blur-xl"
            : "bg-white/70 backdrop-blur-xl"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-3">
              {onMenuClick && (
                <button
                  onClick={onMenuClick}
                  className={`p-2.5 rounded-xl transition-all ${
                    isDark
                      ? "hover:bg-white/10 text-white"
                      : "hover:bg-black/5 text-gray-700"
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <Link href="/" className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-2xl"
                >
                  🌿
                </motion.span>
                <span className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                  HomeCare<span className="text-emerald-500">AI</span>
                </span>
              </Link>
            </div>

            {/* Center: Quick Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isDark
                      ? "hover:bg-white/10 text-gray-300 hover:text-white"
                      : "hover:bg-black/5 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </Link>
              ))}
            </div>

            {/* Right: Search + Theme + User */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearch}
                    className="overflow-hidden"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search symptoms..."
                      autoFocus
                      className={`w-full px-4 py-2 rounded-xl text-sm outline-none ${
                        isDark
                          ? "bg-white/10 text-white placeholder:text-gray-400"
                          : "bg-black/5 text-gray-900 placeholder:text-gray-500"
                      }`}
                    />
                  </motion.form>
                )}
              </AnimatePresence>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2.5 rounded-xl transition-all ${
                  isDark ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-gray-700"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className={`p-2.5 rounded-xl transition-all ${
                  isDark
                    ? "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {isDark ? "☀️" : "🌙"}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative group">
                  <button
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                      isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                      {displayName?.charAt(0).toUpperCase()}
                    </div>
                    <span className={`hidden sm:block text-sm font-medium ${isDark ? "text-white" : "text-gray-700"}`}>
                      {displayName}
                    </span>
                    <svg className={`w-4 h-4 transition-transform group-hover:rotate-180 ${isDark ? "text-gray-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <div className={`absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                    isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"
                  }`}>
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                          isDark ? "hover:bg-white/10 text-gray-200" : "hover:bg-black/5 text-gray-700"
                        }`}
                      >
                        <span>👤</span> Profile
                      </Link>
                      <Link
                        href="/journey"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                          isDark ? "hover:bg-white/10 text-gray-200" : "hover:bg-black/5 text-gray-700"
                        }`}
                      >
                        <span>🌿</span> Health Journey
                      </Link>
                      <Link
                        href="/settings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
                          isDark ? "hover:bg-white/10 text-gray-200" : "hover:bg-black/5 text-gray-700"
                        }`}
                      >
                        <span>⚙️</span> Settings
                      </Link>
                      <hr className={`my-2 ${isDark ? "border-gray-700" : "border-gray-100"}`} />
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-500/10 w-full"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Quick Actions */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t safe-bottom ${
        isDark ? "bg-gray-900/95 border-gray-800" : "bg-white/95 border-gray-100"
      } backdrop-blur-xl`}>
        <div className="flex items-center justify-around py-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-xs font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
