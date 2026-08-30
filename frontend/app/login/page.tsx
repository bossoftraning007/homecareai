"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";

const features = [
  { icon: "💬", text: "AI-powered health chat" },
  { icon: "🌿", text: "Natural home remedies" },
  { icon: "📊", text: "Track your wellness" },
  { icon: "🧬", text: "Recovery predictions" },
];

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
    if (user) router.push("/chat");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields!");
      return;
    }

    setLoading(true);

    if (mode === "signup") {
      if (!fullName) {
        toast.error("Please enter your name!");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Check your email 📧", {
          icon: "🎉",
          duration: 5000,
        });
        try {
          await fetch("/api/auth/webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "signup",
              user_id: email,
              email: email,
              full_name: fullName,
            }),
          });
        } catch {}
        setMode("login");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back!", { icon: "🌿" });
        router.push("/chat");
      }
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome! 🌿", { icon: "🎉" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Left Side - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-12 flex-col justify-between">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 left-20 text-8xl opacity-20"
          >
            🌿
          </motion.div>
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
            className="absolute top-40 right-20 text-7xl opacity-20"
          >
            🍃
          </motion.div>
          <motion.div
            animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, delay: 2 }}
            className="absolute bottom-32 left-32 text-8xl opacity-20"
          >
            🌱
          </motion.div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-5xl"
            >
              🌿
            </motion.span>
            <span className="text-4xl font-black text-white tracking-tight">
              HomeCare<span className="text-emerald-200">AI</span>
            </span>
          </Link>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Your AI-powered
            <br />
            health companion
          </h2>
          <div className="space-y-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4 text-white/90"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-lg">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-white/60 text-sm">
          Made with 💚 for better health
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={`flex-1 flex items-center justify-center p-6 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-4xl"
              >
                🌿
              </motion.span>
              <span className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                HomeCare<span className="text-emerald-500">AI</span>
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {mode === "login" ? "Welcome back!" : "Create account"}
            </h1>
            <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {mode === "login"
                ? "Sign in to continue your health journey"
                : "Start your natural healing journey"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className={`flex p-1 rounded-xl mb-6 ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-emerald-500 text-white shadow-lg"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-emerald-500 text-white shadow-lg"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-emerald-500"
                        : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500"
                    }`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-emerald-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  minLength={6}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none transition-all ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-emerald-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Please wait...
                </span>
              ) : mode === "login" ? (
                "🔐 Sign In"
              ) : (
                "🌱 Create Account"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
            <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>OR</span>
            <div className={`flex-1 h-px ${isDark ? "bg-gray-700" : "bg-gray-200"}`} />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className={`w-full py-3 rounded-xl border font-medium flex items-center justify-center gap-3 transition-all ${
              isDark
                ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Guest Link */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className={`text-sm ${isDark ? "text-gray-400 hover:text-emerald-400" : "text-gray-500 hover:text-emerald-600"} transition-colors`}
            >
              ← Continue as guest
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
