"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/lib/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, signUp, signInWithGoogle, signInWithFacebook, signInWithTwitter } = useAuth();
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

  const handleFacebookLogin = async () => {
    const { error } = await signInWithFacebook();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome! 🌿", { icon: "🎉" });
    }
  };

  const handleTwitterLogin = async () => {
    const { error } = await signInWithTwitter();
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
          background: linear-gradient(135deg, #065f46 0%, #047857 30%, #059669 60%, #10b981 100%);
          border-radius: 18px;
          transition: 0.65s ease-in-out;
          overflow: hidden;
        }

        .login-card .card-bg::before {
          content: "🌿";
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          font-size: 120px;
          opacity: 0.15;
          animation: float 6s ease-in-out infinite;
        }

        .login-card .card-bg::after {
          content: "💚";
          position: absolute;
          bottom: 15%;
          right: 20%;
          font-size: 60px;
          opacity: 0.1;
          animation: float 8s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-20px); }
        }

        .login-card .card-bg.login {
          transform: translateX(100%);
        }

        .login-card .card-bg.login::before {
          content: "🌱";
          left: auto;
          right: 30%;
          top: 25%;
        }

        .login-card .card-bg.login::after {
          content: "✨";
          left: 25%;
          right: auto;
          bottom: 20%;
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

        .login-card .sso-icon {
          display: block;
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
            <div style={{ fontSize: 64, marginBottom: 8, animation: "float 4s ease-in-out infinite" }}>🌿</div>
            <h2>Welcome Back!</h2>
            <p>Login to continue your health journey with AI-powered natural remedies.</p>
            <button type="button" onClick={toggleView}>
              LOGIN
            </button>
          </div>

          {/* Register Form */}
          <div className={`form register ${activeView === "register" ? "active" : ""}`}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>🌱</div>
            <h2>Create Account</h2>
            <div className="sso">
              <a onClick={handleGoogleLogin} title="Sign up with Google" style={{ cursor: "pointer" }}>
                <svg className="sso-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </a>
              <a onClick={handleFacebookLogin} title="Sign up with Facebook" style={{ cursor: "pointer" }}>
                <svg className="sso-icon" viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a onClick={handleTwitterLogin} title="Sign up with Twitter" style={{ cursor: "pointer" }}>
                <svg className="sso-icon" viewBox="0 0 24 24" width="20" height="20" fill="#1DA1F2">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
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
            <div style={{ fontSize: 64, marginBottom: 8, animation: "float 5s ease-in-out infinite" }}>💚</div>
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
              <a onClick={handleGoogleLogin} title="Login with Google" style={{ cursor: "pointer" }}>
                <svg className="sso-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </a>
              <a onClick={handleFacebookLogin} title="Login with Facebook" style={{ cursor: "pointer" }}>
                <svg className="sso-icon" viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a onClick={handleTwitterLogin} title="Login with Twitter" style={{ cursor: "pointer" }}>
                <svg className="sso-icon" viewBox="0 0 24 24" width="20" height="20" fill="#1DA1F2">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
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
