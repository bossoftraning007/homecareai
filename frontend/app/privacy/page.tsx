"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Privacy Policy
          </h1>
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Your privacy matters to us. Last updated: August 2026
          </p>
        </div>

        {/* Content */}
        <div className={`rounded-3xl p-8 md:p-12 ${isDark ? "bg-gray-800" : "bg-white"} shadow-xl`}>
          <div className={`space-y-8 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Information We Collect
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Account information (email, name) when you sign up</li>
                <li>Health data you choose to track (symptoms, mood, sleep, etc.)</li>
                <li>Chat conversations with our AI assistant</li>
                <li>Usage data to improve our services</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                How We Use Your Data
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>To provide personalized health guidance</li>
                <li>To track your wellness progress</li>
                <li>To send you reminders and notifications</li>
                <li>To improve our AI and services</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Data Security
              </h2>
              <p className="leading-relaxed">
                We use industry-standard security measures to protect your data. All data is stored securely 
                using Supabase with Row Level Security (RLS) to ensure only you can access your information. 
                We never sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Your Rights
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Access your data anytime through your profile</li>
                <li>Export your data in a portable format</li>
                <li>Delete your account and all associated data</li>
                <li>Opt out of notifications and emails</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Cookies
              </h2>
              <p className="leading-relaxed">
                We use essential cookies to keep you logged in and to remember your preferences. 
                We do not use tracking cookies for advertising.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Contact Us
              </h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy or your data, please contact us at{" "}
                <Link href="/contact" className="text-emerald-500 hover:underline">
                  our contact page
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
