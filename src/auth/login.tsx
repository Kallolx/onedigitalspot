import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { account } from "@/lib/appwrite";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft02Icon } from "hugeicons-react";
import { toast } from "sonner"; // ✅ import Sonner
import Footer from "@/components/landing/Footer";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState<boolean>(() => {
    return Boolean(localStorage.getItem("auth.email"));
  });
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get("redirect") || "/";

  useEffect(() => {
    const saved = localStorage.getItem("auth.email");
    if (saved) setEmail(saved);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      await account.createEmailPasswordSession(email, password);

      const user = await account.get();
      const labels = user.labels || user.prefs?.labels || [];

      toast.success("Logged in successfully 🎉");

      if (Array.isArray(labels) && labels.includes("admin")) {
        window.location.href = "/admin";
      } else {
        navigate(redirectPath);
      }
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (remember) {
      localStorage.setItem("auth.email", email);
    } else {
      localStorage.removeItem("auth.email");
    }
  }, [remember, email]);

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto p-6 px-2 relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => window.history.back()}
            className="flex items-center rounded-full border gap-2 text-sm p-2"
            aria-label="Back to site"
          >
            <ArrowLeft02Icon className="w-5 h-5" />
          </button>
        </div>
        <div className="w-full flex justify-center">
          <a href="/" className="flex items-center gap-2">
            <img
              src="/assets/logo-av.avif"
              alt="logo"
              className="h-24 w-auto"
            />
          </a>
        </div>
      </header>

      <div className="w-full max-w-4xl pt-4 mx-auto flex flex-col lg:flex-row items-stretch gap-6">
        {/* Image Section */}
        <div className="hidden lg:block w-full lg:w-1/2 h-96 lg:h-auto rounded-lg overflow-hidden">
          <img
            src="/assets/login.png"
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
                {/* Email */}
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

                {/* Password */}
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

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="rounded border-gray-300 text-foreground focus:ring-primary"
                    />
                    <span className="text-secondary font-sans">
                      Remember me
                    </span>
                  </label>
                  <button
                    onClick={() => navigate("/auth/forgot")}
                    className="text-sm text-secondary hover:text-foreground/80 font-medium font-sans transition-colors"
                    type="button"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 font-sans text-base"
                  size="lg"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                {/* Divider */}
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

                {/* Social logins */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="font-sans border-2 hover:border-primary/50 hover:bg-primary/5"
                    type="button"
                  >
                    <img
                      src="/assets/icons/social/google.svg"
                      alt="Google logo"
                      className="w-5 h-5"
                    />
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="font-sans border-2 hover:border-primary/50 hover:bg-primary/5"
                    type="button"
                  >
                    <img
                      src="/assets/icons/social/facebook.svg"
                      alt="Facebook logo"
                      className="w-5 h-5"
                    />
                    Facebook
                  </Button>
                </div>
              </form>

              {/* Sign up link */}
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
