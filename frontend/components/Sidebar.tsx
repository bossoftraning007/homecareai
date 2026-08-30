"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainFeatures = [
  { icon: "💬", label: "AI Chat", href: "/chat", desc: "Talk to AI for remedies", color: "from-emerald-500 to-teal-500" },
  { icon: "🌿", label: "Health Journey", href: "/journey", desc: "Your health timeline", color: "from-green-500 to-emerald-500" },
  { icon: "🧬", label: "Health Twin", href: "/recovery", desc: "Recovery predictions", color: "from-pink-500 to-rose-500" },
  { icon: "📊", label: "Wellness Tracker", href: "/tracker", desc: "Track mood & sleep", color: "from-blue-500 to-indigo-500" },
  { icon: "⏰", label: "Reminders", href: "/reminders", desc: "Medicine alerts", color: "from-purple-500 to-pink-500" },
  { icon: "💊", label: "Medication", href: "/medications", desc: "Daily tracking", color: "from-emerald-500 to-green-600" },
];

const moreFeatures = [
  { icon: "🎤", label: "Voice Mode", href: "/voice", desc: "Hands-free", color: "from-purple-500 to-pink-500" },
  { icon: "📋", label: "Assessment", href: "/questionnaire", desc: "Guided questions", color: "from-indigo-500 to-purple-500" },
  { icon: "📖", label: "Symptom Guide", href: "/symptoms", desc: "30+ remedies", color: "from-teal-500 to-cyan-500" },
  { icon: "📊", label: "Health Insights", href: "/insights", desc: "AI analysis", color: "from-blue-500 to-cyan-500" },
  { icon: "📆", label: "Timeline", href: "/symptoms-timeline", desc: "Patterns", color: "from-indigo-500 to-purple-500" },
  { icon: "🌦️", label: "Seasonal", href: "/seasonal", desc: "Season guide", color: "from-sky-500 to-blue-500" },
  { icon: "⭐", label: "Favorites", href: "/favorites", desc: "Saved remedies", color: "from-yellow-500 to-orange-500" },
  { icon: "🚨", label: "Emergency", href: "/emergency", desc: "Quick help", color: "from-red-500 to-orange-500" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  const isDark = theme === "dark";
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0];

  const isActive = (href: string) => pathname === href;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 shadow-2xl overflow-y-auto ${
              isDark ? "bg-gray-900" : "bg-white"
            }`}
          >
            {/* Header */}
            <div className={`sticky top-0 z-10 p-6 border-b ${
              isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-3xl"
                  >
                    🌿
                  </motion.span>
                  <div>
                    <span className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                      HomeCare<span className="text-emerald-500">AI</span>
                    </span>
                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Natural Healing</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl text-xl ${
                    isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-black/5 text-gray-500"
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* User Card */}
              {user && (
                <Link href="/profile" onClick={onClose}>
                  <div className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    isDark ? "bg-emerald-900/30 hover:bg-emerald-900/50" : "bg-emerald-50 hover:bg-emerald-100"
                  }`}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg font-bold">
                      {displayName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                        {displayName}
                      </div>
                      <div className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {user.email}
                      </div>
                    </div>
                    <svg className={`w-5 h-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )}
            </div>

            {/* Quick Stats */}
            {user && (
              <div className="px-6 py-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Streak", value: "🔥 7", color: "text-orange-500" },
                    { label: "Events", value: "📊 24", color: "text-blue-500" },
                    { label: "Score", value: "💯 85", color: "text-green-500" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`text-center p-2 rounded-xl ${
                        isDark ? "bg-gray-800/50" : "bg-gray-50"
                      }`}
                    >
                      <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                      <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="px-4 pb-6">
              {/* Main Features */}
              <div className={`text-xs font-bold tracking-wider mb-3 px-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                MAIN FEATURES
              </div>
              <nav className="space-y-1">
                {mainFeatures.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isActive(item.href)
                        ? isDark
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-emerald-50 text-emerald-700"
                        : isDark
                        ? "hover:bg-white/5 text-gray-300"
                        : "hover:bg-black/5 text-gray-700"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-lg shadow-lg`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {item.desc}
                      </div>
                    </div>
                    {isActive(item.href) && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </Link>
                ))}
              </nav>

              {/* More Features */}
              <button
                onClick={() => setExpanded(!expanded)}
                className={`w-full flex items-center justify-between text-xs font-bold tracking-wider mt-6 mb-3 px-2 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                <span>MORE FEATURES</span>
                <motion.svg
                  animate={{ rotate: expanded ? 180 : 0 }}
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.nav
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {moreFeatures.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          isActive(item.href)
                            ? isDark
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-emerald-50 text-emerald-700"
                            : isDark
                            ? "hover:bg-white/5 text-gray-400"
                            : "hover:bg-black/5 text-gray-600"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-sm`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">{item.label}</div>
                        </div>
                      </Link>
                    ))}
                  </motion.nav>
                )}
              </AnimatePresence>

              {/* Bottom Actions */}
              <div className={`mt-6 pt-4 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                <nav className="space-y-1">
                  <Link
                    href="/settings"
                    onClick={onClose}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isDark ? "hover:bg-white/5 text-gray-400" : "hover:bg-black/5 text-gray-600"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center text-sm">
                      ⚙️
                    </div>
                    <span className="text-sm">Settings</span>
                  </Link>
                  {user ? (
                    <button
                      onClick={() => {
                        signOut();
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isDark ? "hover:bg-red-500/10 text-red-400" : "hover:bg-red-50 text-red-500"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-sm">
                        🚪
                      </div>
                      <span className="text-sm">Logout</span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">
                        🔐
                      </div>
                      <span className="text-sm font-medium">Login / Signup</span>
                    </Link>
                  )}
                </nav>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
