"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🌿</div>
          <h1 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            About HomeCare AI
          </h1>
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            AI-powered wellness for everyone, everywhere.
          </p>
        </div>

        {/* Content */}
        <div className={`rounded-3xl p-8 md:p-12 ${isDark ? "bg-gray-800" : "bg-white"} shadow-xl`}>
          <div className={`space-y-8 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Our Mission
              </h2>
              <p className="leading-relaxed">
                HomeCare AI was built with a simple mission: make natural wellness guidance accessible to everyone. 
                We combine modern AI technology with traditional healing wisdom to help you find safe, natural 
                remedies for minor symptoms — in your own language.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                What We Do
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>AI-powered health chat in 15+ languages</li>
                <li>Natural remedy recommendations for 30+ symptoms</li>
                <li>Wellness tracking (mood, sleep, water, exercise)</li>
                <li>Recovery predictions with personalized milestones</li>
                <li>Smart medication and wellness reminders</li>
                <li>Voice mode for hands-free guidance</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Our Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: "🌿", title: "Natural First", desc: "We prioritize natural, safe remedies" },
                  { icon: "🌍", title: "Accessible", desc: "Free forever, available in multiple languages" },
                  { icon: "🔒", title: "Private", desc: "Your data stays yours, always" },
                  { icon: "💚", title: "Safe", desc: "We tell you when to see a doctor" },
                ].map((item) => (
                  <div key={item.title} className={`p-4 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <h3 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{item.title}</h3>
                    <p className="text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Important Note
              </h2>
              <div className={`p-4 rounded-xl border-l-4 border-yellow-500 ${isDark ? "bg-yellow-900/20" : "bg-yellow-50"}`}>
                <p>
                  HomeCare AI provides general wellness information and AI-generated guidance. It does not provide 
                  medical diagnosis or replace professional healthcare advice. Always consult a qualified healthcare 
                  professional for serious or persistent symptoms.
                </p>
              </div>
            </section>

            <section className="pt-4 text-center">
              <Link
                href="/chat"
                className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Try HomeCare AI Free →
              </Link>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
