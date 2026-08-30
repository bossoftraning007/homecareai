"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">📜</div>
          <h1 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Terms of Service
          </h1>
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Please read these terms carefully. Last updated: August 2026
          </p>
        </div>

        {/* Content */}
        <div className={`rounded-3xl p-8 md:p-12 ${isDark ? "bg-gray-800" : "bg-white"} shadow-xl`}>
          <div className={`space-y-8 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By accessing and using HomeCare AI, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Service Description
              </h2>
              <p className="leading-relaxed">
                HomeCare AI provides AI-powered wellness guidance, natural remedy suggestions, and health 
                tracking tools. Our service is designed for general wellness information and educational purposes only.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Not Medical Advice
              </h2>
              <div className={`p-4 rounded-xl border-l-4 border-red-500 ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
                <p>
                  <strong>Important:</strong> HomeCare AI does not provide medical diagnosis or replace 
                  professional healthcare advice. Always consult a qualified healthcare professional for 
                  serious or persistent symptoms. In an emergency, call your local emergency services immediately.
                </p>
              </div>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                User Accounts
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>You must provide accurate information when creating an account</li>
                <li>You are responsible for keeping your account secure</li>
                <li>You must be at least 13 years old to use our service</li>
                <li>One account per person</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Acceptable Use
              </h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Use the service only for lawful purposes</li>
                <li>Do not share harmful or misleading health information</li>
                <li>Do not attempt to access other users&apos; data</li>
                <li>Do not use the service to self-diagnose serious conditions</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Data Ownership
              </h2>
              <p className="leading-relaxed">
                You own all data you input into HomeCare AI. You can export or delete your data at any time 
                through your account settings.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Limitation of Liability
              </h2>
              <p className="leading-relaxed">
                HomeCare AI is provided &quot;as is&quot; without warranties of any kind. We are not liable for any 
                damages arising from your use of our service. Always verify health information with qualified professionals.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Changes to Terms
              </h2>
              <p className="leading-relaxed">
                We may update these terms from time to time. We will notify you of significant changes via email 
                or through the app. Continued use of the service after changes means you accept the new terms.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Contact
              </h2>
              <p className="leading-relaxed">
                For questions about these terms, please{" "}
                <Link href="/contact" className="text-emerald-500 hover:underline">
                  contact us
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
