"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/lib/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) router.push("/chat");
  }, [user, router]);

  const toggleView = () => {
    setActiveView(activeView === "login" ? "register" : "login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields!");
      return;
    }

    setLoading(true);

    if (activeView === "register") {
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
        setActiveView("login");
        setPassword("");
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
    <>
      <style>{`
        .login-card-container * {
          box-sizing: border-box;
        }

        .login-card-container {
          margin: 0;
          height: 100vh;
          display: grid;
          place-items: center;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .login-card {
          position: relative;
          overflow: hidden;
          width: 700px;
          max-width: 95vw;
          height: 480px;
          border-radius: 24px;
          background: #ffffff;
          border: 8px solid #ffffff;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.15);
        }

        .login-card .card-bg {
          position: absolute;
          z-index: 2;
          top: 0;
          left: 0;
          bottom: 0;
          width: 50%;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%);
          border-radius: 18px;
          transition: 0.65s ease-in-out;
        }

        .login-card .card-bg.login {
          transform: translateX(100%);
        }

        .login-card .hero,
        .login-card .form {
          position: absolute;
          width: 50%;
          height: 100%;
          opacity: 0;
          visibility: hidden;
          transition: 0.65s ease-in-out;
        }

        .login-card .hero.active,
        .login-card .form.active {
          opacity: 1;
          visibility: visible;
        }

        .login-card .form.register {
          left: 50%;
        }

        .login-card .hero.login {
          left: 50%;
          transform: translateX(100%);
        }

        .login-card .hero.login.active {
          transform: translateX(0);
        }

        .login-card .hero.register {
          transform: translateX(-100%);
        }

        .login-card .hero.register.active {
          transform: translateX(0);
        }

        .login-card .hero {
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: #ffffff;
          text-align: center;
          padding: 0 32px;
        }

        .login-card .hero h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }

        .login-card .hero p {
          margin: 0;
          opacity: 0.9;
          line-height: 1.6;
          font-size: 14px;
        }

        .login-card .hero button {
          padding: 14px 44px;
          border-radius: 32px;
          letter-spacing: 1.5px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          color: inherit;
          border: 2px solid #ffffff;
          background: transparent;
          transition: 0.3s;
          cursor: pointer;
          margin-top: 8px;
        }

        .login-card .hero button:hover {
          color: #10b981;
          background: #ffffff;
        }

        .login-card .form {
          background: #ffffff;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 14px;
          padding: 36px;
        }

        .login-card .form h2 {
          font-size: 24px;
          color: #1f2937;
          margin: 0 0 8px;
          text-align: center;
        }

        .login-card .form form {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          width: 100%;
        }

        .login-card .form input {
          font-family: inherit;
          border-radius: 12px;
          border: 0;
          background: #f3f4f6;
          padding: 14px 16px;
          color: #1f2937;
          width: 100%;
          font-size: 14px;
          transition: 0.2s;
        }

        .login-card .form input:focus {
          outline: none;
          background: #e5e7eb;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .login-card .form input::placeholder {
          color: #9ca3af;
        }

        .login-card .form button[type="submit"] {
          border: 0;
          padding: 14px 0;
          border-radius: 32px;
          font-family: inherit;
          letter-spacing: 1.5px;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          width: 160px;
          margin-top: 8px;
          background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
          cursor: pointer;
          transition: 0.3s;
        }

        .login-card .form button[type="submit"]:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }

        .login-card .form button[type="submit"]:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .login-card .sso {
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .login-card .sso a {
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f3f4f6;
          font-size: 18px;
          cursor: pointer;
          transition: 0.2s;
          text-decoration: none;
        }

        .login-card .sso a:hover {
          background: #e5e7eb;
          transform: translateY(-2px);
        }

        .login-card .form p {
          margin: 0;
          text-align: center;
          opacity: 0.5;
          font-size: 12px;
          color: #6b7280;
        }

        .login-card .form .forgot-link {
          font-size: 13px;
          color: #10b981;
          text-decoration: none;
          opacity: 0.8;
          transition: 0.2s;
        }

        .login-card .form .forgot-link:hover {
          opacity: 1;
        }

        .login-card .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          color: #9ca3af;
          font-size: 12px;
        }

        .login-card .divider::before,
        .login-card .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          background: #ffffff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: 0.2s;
        }

        .google-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .guest-link {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 13px;
          color: #6b7280;
          text-decoration: none;
          opacity: 0.7;
          transition: 0.2s;
        }

        .guest-link:hover {
          opacity: 1;
          color: #10b981;
        }

        @media (max-width: 640px) {
          .login-card {
            height: auto;
            min-height: 500px;
          }

          .login-card .card-bg {
            display: none;
          }

          .login-card .hero {
            display: none;
          }

          .login-card .form {
            width: 100%;
            left: 0 !important;
          }

          .login-card .form.register,
          .login-card .form.login {
            transform: translateX(0) !important;
          }
        }
      `}</style>

      <Toaster position="top-center" />

      <div className="login-card-container">
        <div className="login-card">
          {/* Animated Background */}
          <div className={`card-bg ${activeView === "login" ? "login" : ""}`} />

          {/* Register Hero Panel */}
          <div className={`hero register ${activeView === "register" ? "active" : ""}`}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🌿</div>
            <h2>Welcome Back!</h2>
            <p>Login to continue your health journey and track your wellness progress.</p>
            <button type="button" onClick={toggleView}>
              LOGIN
            </button>
          </div>

          {/* Register Form */}
          <div className={`form register ${activeView === "register" ? "active" : ""}`}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>🌱</div>
            <h2>Create Account</h2>
            <div className="sso">
              <a onClick={handleGoogleLogin} title="Sign up with Google">🌐</a>
              <a title="Sign up with Facebook">📘</a>
              <a title="Sign up with Twitter">🐦</a>
            </div>
            <div className="divider">or use your email</div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                minLength={6}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "SIGN UP"}
              </button>
            </form>
          </div>

          {/* Login Hero Panel */}
          <div className={`hero login ${activeView === "login" ? "active" : ""}`}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>💚</div>
            <h2>Hello There!</h2>
            <p>Start your natural healing journey with AI-powered home care guidance.</p>
            <button type="button" onClick={toggleView}>
              SIGN UP
            </button>
          </div>

          {/* Login Form */}
          <div className={`form login ${activeView === "login" ? "active" : ""}`}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>🌿</div>
            <h2>Welcome Back</h2>
            <div className="sso">
              <a onClick={handleGoogleLogin} title="Login with Google">🌐</a>
              <a title="Login with Facebook">📘</a>
              <a title="Login with Twitter">🐦</a>
            </div>
            <div className="divider">or use your email</div>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <a className="forgot-link" href="#">
                Forgot password?
              </a>
              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "LOGIN"}
              </button>
            </form>
          </div>
        </div>

        {/* Guest Link */}
        <a className="guest-link" href="/">
          ← Continue as guest
        </a>
      </div>
    </>
  );
}
