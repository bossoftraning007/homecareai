"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/useAuth";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

gsap.registerPlugin(ScrollTrigger, SplitText);

const symptoms = [
  { icon: "🤧", label: "Cold", value: "I have a cold and blocked nose" },
  { icon: "😷", label: "Cough", value: "I have a cough" },
  { icon: "🤒", label: "Sore Throat", value: "I have a sore throat" },
  { icon: "🤕", label: "Headache", value: "I have a headache" },
  { icon: "🤢", label: "Acidity", value: "I have acidity and indigestion" },
  { icon: "😴", label: "Constipation", value: "I have constipation" },
  { icon: "🌡️", label: "Fever", value: "I have a mild fever" },
  { icon: "💤", label: "Sleep Issues", value: "I have trouble sleeping" },
];

const features = [
  {
    icon: "💬",
    title: "AI Health Chat",
    desc: "Talk to AI in your language for natural remedies. Get instant, safe guidance for minor symptoms.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: "🧬",
    title: "Health Twin",
    desc: "Predictive recovery timeline with personalized milestones. Track your healing journey.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: "📊",
    title: "Wellness Tracker",
    desc: "Track mood, sleep, water intake, and symptoms. Get AI-powered insights.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: "⏰",
    title: "Smart Reminders",
    desc: "Never miss a medication or wellness activity. Personalized reminder schedules.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: "🎤",
    title: "Voice Mode",
    desc: "Hands-free conversation for elderly and accessibility. Speak in your language.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: "🌿",
    title: "Health Journey",
    desc: "Your complete health timeline. See patterns and progress over time.",
    color: "from-green-500 to-emerald-500",
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "30+", label: "Symptoms Covered" },
  { value: "15+", label: "Languages" },
  { value: "4.9★", label: "User Rating" },
];

const testimonials = [
  {
    name: "Priya S.",
    role: "Working Mom",
    text: "HomeCare AI helped me find natural remedies for my son's cold. The AI chat is like having a doctor on call!",
    avatar: "👩",
  },
  {
    name: "Rajesh M.",
    role: "Senior Citizen",
    text: "Voice mode is a blessing! I can get health advice without typing. The reminders help me stay on track.",
    avatar: "👨",
  },
  {
    name: "Anita K.",
    role: "Yoga Instructor",
    text: "I love the wellness tracker and health insights. It's helped me understand my body better.",
    avatar: "🧘",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroButtonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Hero animations
    const tl = gsap.timeline();

    if (heroTitleRef.current) {
      const split = new SplitText(heroTitleRef.current, { type: "chars,words" });
      tl.from(split.chars, {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.03,
        ease: "power4.out",
      });
    }

    if (heroSubtitleRef.current) {
      tl.from(
        heroSubtitleRef.current,
        {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.5"
      );
    }

    if (heroButtonsRef.current) {
      tl.from(
        heroButtonsRef.current.children,
        {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
        },
        "-=0.3"
      );
    }

    // Stats animation
    if (statsRef.current) {
      gsap.from(statsRef.current.children, {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });
    }

    // Features animation
    if (featuresRef.current) {
      const featureCards = featuresRef.current.querySelectorAll(".feature-card");
      gsap.from(featureCards, {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 75%",
        },
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });
    }

    // CTA animation
    if (ctaRef.current) {
      gsap.from(ctaRef.current, {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
        },
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
      });
    }

    // Parallax effect on hero
    if (heroRef.current) {
      gsap.to(heroRef.current.querySelector(".hero-bg"), {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 200,
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [mounted]);

  const handleStartHealing = () => {
    if (user) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  };

  const handleBrowseRemedies = () => {
    router.push("/symptoms");
  };

  const filteredSymptoms = symptoms.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className={`min-h-screen overflow-x-hidden ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      >
        {/* Animated Background */}
        <div
          className={`hero-bg absolute inset-0 ${isDark
            ? "bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900"
            : "bg-gradient-to-br from-emerald-50 via-white to-teal-50"
          }`}
        >
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute top-20 left-10 text-6xl opacity-20 animate-bounce ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
              🌿
            </div>
            <div className={`absolute top-40 right-20 text-5xl opacity-20 animate-pulse ${isDark ? "text-teal-400" : "text-teal-600"}`}>
              🍃
            </div>
            <div className={`absolute bottom-40 left-1/4 text-7xl opacity-10 animate-bounce ${isDark ? "text-green-400" : "text-green-600"}`} style={{ animationDelay: "1s" }}>
              🌱
            </div>
            <div className={`absolute top-1/3 right-1/4 text-4xl opacity-15 animate-pulse ${isDark ? "text-cyan-400" : "text-cyan-600"}`} style={{ animationDelay: "0.5s" }}>
              ✨
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>
            <span className="animate-pulse">🌿</span>
            <span>AI-Powered Natural Healing</span>
          </div>

          <h1
            ref={heroTitleRef}
            className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Natural
            <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Healing.
            </span>
          </h1>

          <p
            ref={heroSubtitleRef}
            className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            Get AI-powered natural remedies in your language. Track wellness,
            predict recovery, and take control of your health journey.
          </p>

          {/* CTA Buttons */}
          <div
            ref={heroButtonsRef}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleStartHealing}
              className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              <span className="flex items-center gap-2">
                Start Healing Free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button
              onClick={handleBrowseRemedies}
              className={`px-8 py-4 font-bold rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${isDark
                ? "border-gray-600 text-white hover:border-emerald-500 hover:bg-emerald-500/10"
                : "border-gray-300 text-gray-700 hover:border-emerald-500 hover:bg-emerald-50"
              }`}
            >
              Browse Remedies
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className={`w-6 h-6 ${isDark ? "text-gray-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-20 ${isDark ? "bg-gray-800/50" : "bg-white"}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div
            ref={statsRef}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`text-4xl md:text-5xl font-black mb-2 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className={`py-20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Everything You Need
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              AI-powered features to help you track, understand, and improve your health naturally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`feature-card group p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${isDark
                  ? "bg-gray-800/50 border-gray-700 hover:border-emerald-500/50"
                  : "bg-white border-gray-100 hover:border-emerald-200"
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Symptoms Quick Access */}
      <section className={`py-20 ${isDark ? "bg-gray-800/50" : "bg-white"}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              What&apos;s Bothering You?
            </h2>
            <p className={`text-lg mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Tap any symptom for instant natural remedies
            </p>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search symptoms..."
              className={`w-full max-w-md px-5 py-3 rounded-full text-sm outline-none border ${isDark
                ? "bg-gray-700 text-white placeholder:text-gray-400 border-gray-600 focus:border-emerald-500"
                : "bg-white text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-emerald-500"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredSymptoms.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  localStorage.setItem("initial_message", s.value);
                  router.push("/chat");
                }}
                className={`group p-5 rounded-2xl border text-center transition-all hover:-translate-y-1 hover:shadow-lg ${isDark
                  ? "bg-gray-800/50 border-gray-700 hover:border-emerald-500/50"
                  : "bg-white border-gray-100 hover:border-emerald-200"
                }`}
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <div className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {s.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-20 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-5xl font-black mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Loved by Thousands
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`p-6 rounded-3xl border ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-100"}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{t.avatar}</div>
                  <div>
                    <div className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{t.name}</div>
                    <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{t.role}</div>
                  </div>
                </div>
                <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-4 text-yellow-500">★★★★★</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className={`py-20 ${isDark ? "bg-gray-800/50" : "bg-white"}`}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className={`p-8 md:p-12 rounded-3xl text-center ${isDark
            ? "bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-800"
            : "bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100"
          }`}>
            <div className="text-5xl mb-4">🌿</div>
            <h2 className={`text-3xl md:text-4xl font-black mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Start Your Health Journey Today
            </h2>
            <p className={`text-lg mb-8 max-w-xl mx-auto ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Join thousands of users who are taking control of their health with AI-powered natural remedies.
            </p>
            <button
              onClick={handleStartHealing}
              className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              Get Started Free →
            </button>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className={`py-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            ⚠️ <strong>Important:</strong> For minor symptoms only. Not a substitute for professional medical advice. Always consult a doctor for serious conditions.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
