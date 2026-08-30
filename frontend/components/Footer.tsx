"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { motion } from "framer-motion";

const footerLinks = {
  product: [
    { label: "AI Chat", href: "/chat" },
    { label: "Health Journey", href: "/journey" },
    { label: "Health Twin", href: "/recovery" },
    { label: "Wellness Tracker", href: "/tracker" },
    { label: "Medication", href: "/medications" },
    { label: "Reminders", href: "/reminders" },
  ],
  resources: [
    { label: "Symptom Guide", href: "/symptoms" },
    { label: "Health Insights", href: "/insights" },
    { label: "Seasonal Guide", href: "/seasonal" },
    { label: "Assessment", href: "/questionnaire" },
    { label: "Emergency", href: "/emergency" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
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
      <div className={`py-12 ${isDark ? "bg-gray-800/50" : "bg-emerald-50/50"}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Stay Healthy, Stay Informed 🌿
              </h3>
              <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Get weekly health tips and updates delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 md:w-64 px-5 py-3 rounded-xl outline-none transition-all ${
                  isDark
                    ? "bg-gray-700 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500"
                    : "bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-emerald-500"
                }`}
              />
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-3xl"
              >
                🌿
              </motion.span>
              <span className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                HomeCare<span className="text-emerald-500">AI</span>
              </span>
            </Link>
            <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              AI-powered natural home care assistant. Get safe remedies, ancient wisdom, and know when to see a doctor.
            </p>
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

          {/* Product Links */}
          <div>
            <h4 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
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

          {/* Resources Links */}
          <div>
            <h4 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
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

          {/* Company Links */}
          <div>
            <h4 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
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

      {/* Bottom Bar */}
      <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              © {new Date().getFullYear()} HomeCare AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Made with 💚 for better health
              </span>
              <span className={`text-xs px-3 py-1 rounded-full ${
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
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            ⚠️ Disclaimer: HomeCare AI provides guidance for minor symptoms only. Not a substitute for professional medical advice. Always consult a doctor for serious conditions.
          </p>
        </div>
      </div>
    </footer>
  );
}
