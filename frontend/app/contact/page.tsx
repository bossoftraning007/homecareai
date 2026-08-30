"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a backend
    setSubmitted(true);
  };

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">📬</div>
          <h1 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Contact Us
          </h1>
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Have questions? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className={`rounded-3xl p-8 ${isDark ? "bg-gray-800" : "bg-white"} shadow-xl`}>
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Message Sent!
                </h3>
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Thank you for reaching out. We&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${
                      isDark
                        ? "bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500"
                        : "bg-gray-50 text-gray-900 border border-gray-200 focus:border-emerald-500"
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-xl outline-none transition-all ${
                      isDark
                        ? "bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500"
                        : "bg-gray-50 text-gray-900 border border-gray-200 focus:border-emerald-500"
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl outline-none resize-none transition-all ${
                      isDark
                        ? "bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500"
                        : "bg-gray-50 text-gray-900 border border-gray-200 focus:border-emerald-500"
                    }`}
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className={`rounded-3xl p-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-xl`}>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Get in Touch
              </h3>
              <div className="space-y-4">
                {[
                  { icon: "📧", label: "Email", value: "support@homecareai.com" },
                  { icon: "🌐", label: "Website", value: "homecareai.vercel.app" },
                  { icon: "💬", label: "Response Time", value: "Within 24 hours" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>{item.label}</div>
                      <div className={isDark ? "text-gray-200" : "text-gray-700"}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-3xl p-6 ${isDark ? "bg-gray-800" : "bg-white"} shadow-xl`}>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Common Questions
              </h3>
              <div className="space-y-3">
                {[
                  { q: "Is HomeCare AI free?", a: "Yes! Our core features are free forever." },
                  { q: "Is my data safe?", a: "Yes, we use enterprise-grade security." },
                  { q: "Is this medical advice?", a: "No, we provide general wellness guidance only." },
                ].map((item) => (
                  <div key={item.q} className={`p-3 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                    <div className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{item.q}</div>
                    <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{item.a}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-3xl p-6 ${isDark ? "bg-emerald-900/30 border border-emerald-800" : "bg-emerald-50 border border-emerald-200"}`}>
              <p className={`text-sm ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                <strong>Emergency?</strong> If you have a medical emergency, please call your local emergency services immediately. HomeCare AI is not for emergencies.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
