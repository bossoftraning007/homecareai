"use client";

import { useTheme } from "next-themes";
import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Home", href: "/" },
    { label: "AI Chat", href: "/chat" },
    { label: "Voice Assistant", href: "/voice" },
    { label: "Wellness Tracker", href: "/tracker" },
    { label: "Health Insights", href: "/insights" },
    { label: "Symptom Timeline", href: "/symptoms-timeline" },
    { label: "Recovery", href: "/recovery" },
    { label: "Reminders", href: "/reminders" },
    { label: "Medications", href: "/medications" },
    { label: "Wellness Library", href: "/library" },
  ],
  aiWellness: [
    { label: "AI Wellness Assistant", href: "/chat" },
    { label: "Guided Assessment", href: "/questionnaire" },
    { label: "Symptoms", href: "/symptoms" },
    { label: "Recovery Plans", href: "/recovery" },
    { label: "Health Insights", href: "/insights" },
    { label: "Wellness Tracking", href: "/tracker" },
    { label: "My Health Journey", href: "/journey" },
    { label: "Multilingual Support", href: "/chat" },
  ],
  supportSafety: [
    { label: "Emergency Information", href: "/emergency" },
    { label: "Safety Guidelines", href: "/safety" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

const socialLinks = [
  { icon: "🐦", label: "Twitter", href: "#" },
  { icon: "📸", label: "Instagram", href: "#" },
  { icon: "💼", label: "LinkedIn", href: "#" },
  { icon: "📺", label: "YouTube", href: "#" },
];

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer className={`relative overflow-hidden ${isDark ? "bg-gray-900" : "bg-white"}`}>
      {/* Top Gradient Line */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      {/* Newsletter Section */}
      <div className={`py-10 ${isDark ? "bg-gray-800/50" : "bg-emerald-50/50"}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Stay Healthy, Stay Informed 🌿
              </h3>
              <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Get weekly health tips and updates delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 md:w-64 px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                  isDark
                    ? "bg-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500"
                    : "bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-emerald-500"
                }`}
              />
              <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
          {/* Product */}
          <div>
            <h4 className={`font-bold mb-4 text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
              Product
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isDark ? "text-gray-400 hover:text-emerald-400" : "text-gray-600 hover:text-emerald-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* AI & Wellness */}
          <div>
            <h4 className={`font-bold mb-4 text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
              AI & Wellness
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.aiWellness.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isDark ? "text-gray-400 hover:text-emerald-400" : "text-gray-600 hover:text-emerald-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Safety */}
          <div>
            <h4 className={`font-bold mb-4 text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
              Support & Safety
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.supportSafety.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isDark ? "text-gray-400 hover:text-emerald-400" : "text-gray-600 hover:text-emerald-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className={`font-bold mb-4 text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isDark ? "text-gray-400 hover:text-emerald-400" : "text-gray-600 hover:text-emerald-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Brand & Social */}
      <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                <span className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                  HomeCare<span className="text-emerald-500">AI</span>
                </span>
              </Link>
              <p className={`text-xs max-w-xs text-center md:text-left ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                AI-powered wellness support for your everyday journey.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isDark
                      ? "bg-gray-800 hover:bg-gray-700 text-gray-400"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              © {new Date().getFullYear()} HomeCare AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Made with 💚 for better health
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
              }`}>
                v2.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={`py-4 ${isDark ? "bg-gray-800/30" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            <strong>HomeCare AI</strong> is designed to provide general wellness information and AI-generated guidance. It does not provide medical diagnosis or replace professional healthcare advice. In an emergency, contact appropriate local emergency services or a qualified healthcare professional.
          </p>
        </div>
      </div>
    </footer>
  );
}
