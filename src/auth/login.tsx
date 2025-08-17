import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { account } from "@/lib/appwrite";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft02Icon } from "hugeicons-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('auth.email'));
  });
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get("redirect") || "/";

  useEffect(() => {
    const saved = localStorage.getItem('auth.email');
    if (saved) setEmail(saved);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await account.createEmailPasswordSession(email, password);
      // Fetch user info to check labels
      const user = await account.get();
      // Appwrite labels are usually in user.labels or user.prefs.labels
      const labels = user.labels || user.prefs?.labels || [];

      if (Array.isArray(labels) && labels.includes("admin")) {
        window.location.href = "/admin";
      } else {
        navigate(redirectPath);
      }
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (remember) {
      localStorage.setItem('auth.email', email);
    } else {
      localStorage.removeItem('auth.email');
    }
  }, [remember, email]);

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header spanning both columns: back button on the left, logo centered */}
      <header className="w-full max-w-4xl mx-auto p-6 px-2 relative">
        {/* Back button on the left */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => window.history.back()}
            className="flex items-center rounded-full border gap-2 text-sm p-2"
            aria-label="Back to site"
          >
            <ArrowLeft02Icon className="w-5 h-5" />
          </button>
        </div>

        {/* Centered logo --- absolute center so it doesn't shift when back button present */}
        <div className="w-full flex justify-center">
          <a href="/" className="flex items-center gap-2">
            <img src="/assets/logo-av.avif" alt="logo" className="h-24 w-auto" />
          </a>
        </div>
      </header>

      <div className="w-full max-w-4xl pt-4 mx-auto flex flex-col lg:flex-row items-stretch gap-6">
        {/* Image Section */}
        <div className="hidden lg:block w-full lg:w-1/2 h-96 lg:h-auto rounded-lg overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            alt="Login illustration"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Login Card */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <Card className="bg-white border border-border hover:shadow-retro transition-shadow duration-300">
            <CardHeader className="items-center md:items-start pb-4">
              <h1 className="text-2xl font-semibold tracking-tighter text-foreground font-pixel">
                Welcome Back!
              </h1>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground font-sans"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-2 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground font-sans"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 border-2 focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="rounded border-gray-300 text-foreground focus:ring-primary"
                    />
                    <span className="text-secondary font-sans">Remember me</span>
                  </label>
                  <button
                    onClick={() => navigate('/auth/forgot')}
                    className="text-sm text-secondary hover:text-foreground/80 font-medium font-sans transition-colors"
                    type="button"
                  >
                    Forgot password?
                  </button>
                </div>
                {error && (
                  <div className="text-red-500 text-sm text-center font-sans">
                    {error}
                  </div>
                )}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 font-sans text-base"
                  size="lg"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "LogIn"}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground font-sans">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="font-sans border-2 hover:border-primary/50 hover:bg-primary/5"
                    type="button"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="font-sans border-2 hover:border-primary/50 hover:bg-primary/5"
                    type="button"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                    Twitter
                  </Button>
                </div>
              </form>
              <div className="text-center">
                <p className="text-sm text-muted-foreground font-sans">
                  Don't have an account?{" "}
                  <a
                    href="/auth/signup"
                    className="text-secondary hover:text-foreground/80 font-medium transition-colors"
                  >
                    Sign up here
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
