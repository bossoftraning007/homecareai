"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/useAuth";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { icon: "🏠", label: "Home", href: "/" },
  { icon: "💬", label: "AI Chat", href: "/chat" },
  { icon: "🌿", label: "Health Journey", href: "/journey" },
  { icon: "🧬", label: "Health Twin", href: "/recovery" },
  { icon: "📊", label: "Wellness", href: "/tracker" },
  { icon: "⏰", label: "Reminders", href: "/reminders" },
  { icon: "💊", label: "Medication", href: "/medications" },
  { icon: "🎤", label: "Voice", href: "/voice" },
  { icon: "📋", label: "Assessment", href: "/questionnaire" },
  { icon: "📖", label: "Symptoms", href: "/symptoms" },
  { icon: "📊", label: "Insights", href: "/insights" },
  { icon: "⭐", label: "Favorites", href: "/favorites" },
  { icon: "🚨", label: "Emergency", href: "/emergency" },
];

const bottomItems = [
  { icon: "⚙️", label: "Settings", href: "/settings" },
];

export default function CollapsibleSidebar() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isDark = theme === "dark";
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <>
      <style>{`
        .collapsible-sidebar {
          position: fixed;
          z-index: 50;
          top: 0;
          left: 0;
          bottom: 0;
          width: 60px;
          background: ${isDark ? "#111827" : "#ffffff"};
          border-right: 1px solid ${isDark ? "#1f2937" : "#e5e7eb"};
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .collapsible-sidebar.open {
          width: 200px;
        }

        .collapsible-sidebar .inner {
          position: absolute;
          top: 0;
          left: 0;
          width: 200px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .collapsible-sidebar .sidebar-header {
          display: flex;
          align-items: center;
          height: 64px;
          padding: 0 12px 0 60px;
          border-bottom: 1px solid ${isDark ? "#1f2937" : "#e5e7eb"};
        }

        .collapsible-sidebar .sidebar-header .logo {
          height: 28px;
          opacity: 0;
          transition: opacity 0.25s;
        }

        .collapsible-sidebar.open .sidebar-header .logo {
          opacity: 1;
        }

        /* Burger Button */
        .sidebar-burger {
          position: fixed;
          z-index: 51;
          top: 0;
          left: 0;
          width: 60px;
          height: 64px;
          display: grid;
          place-items: center;
          background: transparent;
          border: 0;
          cursor: pointer;
          color: ${isDark ? "#f9f9f9" : "#1f2937"};
          transition: color 0.2s;
        }

        .sidebar-burger:hover {
          color: #10b981;
        }

        .sidebar-burger svg {
          width: 24px;
          height: 24px;
        }

        /* Navigation */
        .collapsible-sidebar nav {
          display: flex;
          flex-direction: column;
          padding: 8px 8px 16px;
          gap: 2px;
          flex: 1;
          overflow-y: auto;
        }

        .collapsible-sidebar nav::-webkit-scrollbar {
          width: 4px;
        }

        .collapsible-sidebar nav::-webkit-scrollbar-thumb {
          background: ${isDark ? "#374151" : "#d1d5db"};
          border-radius: 4px;
        }

        .collapsible-sidebar nav a,
        .collapsible-sidebar nav button {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 44px;
          width: 44px;
          font-family: inherit;
          font-size: 14px;
          text-transform: capitalize;
          line-height: 1;
          padding: 0 12px;
          border-radius: 10px;
          color: ${isDark ? "#9ca3af" : "#6b7280"};
          text-decoration: none;
          background: transparent;
          border: 0;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .collapsible-sidebar nav a span.icon,
        .collapsible-sidebar nav button span.icon {
          font-size: 20px;
          min-width: 20px;
          text-align: center;
        }

        .collapsible-sidebar nav a span.label,
        .collapsible-sidebar nav button span.label {
          opacity: 0;
          transition: opacity 0.25s;
          white-space: nowrap;
        }

        .collapsible-sidebar.open nav a,
        .collapsible-sidebar.open nav button {
          width: 100%;
        }

        .collapsible-sidebar.open nav a span.label,
        .collapsible-sidebar.open nav button span.label {
          opacity: 1;
        }

        .collapsible-sidebar nav a:hover,
        .collapsible-sidebar nav button:hover {
          background: ${isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)"};
          color: #10b981;
        }

        .collapsible-sidebar nav a.active {
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          color: #ffffff;
        }

        .collapsible-sidebar nav a.active:hover {
          color: #ffffff;
        }

        /* Tooltip when collapsed */
        .collapsible-sidebar:not(.open) nav a:hover span.label,
        .collapsible-sidebar:not(.open) nav button:hover span.label {
          opacity: 1;
          visibility: visible;
          position: absolute;
          left: 56px;
          top: 50%;
          transform: translateY(-50%);
          background: ${isDark ? "#1f2937" : "#374151"};
          color: #f9f9f9;
          padding: 6px 12px;
          font-size: 12px;
          border-radius: 6px;
          white-space: nowrap;
          z-index: 100;
        }

        .collapsible-sidebar:not(.open) nav a span.label,
        .collapsible-sidebar:not(.open) nav button span.label {
          visibility: hidden;
          position: absolute;
        }

        /* Bottom section */
        .collapsible-sidebar .sidebar-bottom {
          padding: 8px;
          border-top: 1px solid ${isDark ? "#1f2937" : "#e5e7eb"};
        }

        .collapsible-sidebar .sidebar-bottom button {
          width: 44px;
        }

        .collapsible-sidebar.open .sidebar-bottom button {
          width: 100%;
        }

        /* User section */
        .collapsible-sidebar .user-section {
          padding: 12px 8px;
          border-top: 1px solid ${isDark ? "#1f2937" : "#e5e7eb"};
        }

        .collapsible-sidebar .user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .collapsible-sidebar .user-card:hover {
          background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"};
        }

        .collapsible-sidebar .user-avatar {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          display: grid;
          place-items: center;
          color: #fff;
          font-weight: 600;
          font-size: 14px;
        }

        .collapsible-sidebar .user-info {
          opacity: 0;
          transition: opacity 0.25s;
          overflow: hidden;
        }

        .collapsible-sidebar.open .user-info {
          opacity: 1;
        }

        .collapsible-sidebar .user-name {
          font-size: 13px;
          font-weight: 600;
          color: ${isDark ? "#f9f9f9" : "#1f2937"};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .collapsible-sidebar .user-email {
          font-size: 11px;
          color: ${isDark ? "#6b7280" : "#9ca3af"};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Overlay for mobile */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40;
        }

        @media (width <= 768px) {
          .collapsible-sidebar {
            transform: translateX(-100%);
          }

          .collapsible-sidebar.open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            display: block;
          }

          .sidebar-overlay:not(.active) {
            display: none;
          }
        }
      `}</style>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Burger Button */}
      <button
        type="button"
        className="sidebar-burger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`collapsible-sidebar ${isOpen ? "open" : ""}`}>
        <div className="inner">
          {/* Header */}
          <div className="sidebar-header">
            <span className="logo" style={{ fontSize: 24 }}>🌿</span>
          </div>

          {/* Navigation */}
          <nav>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? "active" : ""}
                onClick={() => setIsOpen(false)}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          {user && (
            <div className="user-section">
              <Link href="/profile" className="user-card" onClick={() => setIsOpen(false)}>
                <div className="user-avatar">
                  {displayName?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{displayName}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </Link>
            </div>
          )}

          {/* Bottom */}
          <div className="sidebar-bottom">
            {bottomItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </Link>
            ))}
            {user && (
              <button onClick={signOut}>
                <span className="icon">🚪</span>
                <span className="label">Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
