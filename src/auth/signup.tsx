import React, { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { account, databases } from "@/lib/appwrite";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft02Icon } from "hugeicons-react";
import { OAuthProvider } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_USERS_ID;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // If we were redirected back from OAuth, delay then reload once so the
  // browser can persist cross-site cookies before subsequent API calls.
  React.useEffect(() => {
    try {
      const alreadyReloaded = sessionStorage.getItem('appwrite_oauth_reloaded');
      const hasStateParam = new URLSearchParams(window.location.search).has('state');
      const hasHashOnly = window.location.hash === '#';

      if (!alreadyReloaded && (hasStateParam || hasHashOnly)) {
        sessionStorage.setItem('appwrite_oauth_reloaded', '1');
        setTimeout(() => {
          const cleanUrl = window.location.pathname + window.location.search;
          window.location.replace(cleanUrl);
        }, 450);
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleSignup = async () => {
    try {
      // Create OAuth2 session with Google
      await account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/`, // Success URL
        `${window.location.origin}/auth/signup` // Failure URL
      );
    } catch (error: any) {
      console.error('Google signup error:', error);
      toast.error('Google signup failed. Please try again.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      const msg = "Passwords do not match";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    // Basic validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      const msg = "Please fill in all fields";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      const msg = "Password must be at least 8 characters long";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      return;
    }

    try {
      // Create new user account
      await account.create(
        "unique()", // Auto-generate unique user ID
        email,
        password,
        name
      );

      // Automatically log in the user after successful signup
      await account.createEmailPasswordSession(email, password);

      // Get the logged-in user
      const user = await account.get();

      // Create a document in the users collection
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id, // Use Appwrite user ID as document ID
        {
          userId: user.$id,
          email: user.email,
          name: user.name,
          createdAt: user.$createdAt,
          labels: user.labels || [],
          status: "active",
          avatarUrl: user.prefs?.avatarUrl || "",
        }
      );

      // Redirect to dashboard or home page
      toast.success("Signed up successfully 🎉");
      window.location.href = "/";
    } catch (err) {
      const msg = err?.message || "Signup failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto p-6 px-2 relative">
        <div className="absolute flex left-0 top-1/2 transform -translate-y-1/2">
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

      <div className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row justify-center gap-6">
        {/* Signup Card */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <Card className="bg-white border border-border hover:shadow-retro transition-shadow duration-300">
            <CardHeader className="items-center  md:items-start pb-0">
              <h1 className="text-2xl font-semibold tracking-tighter text-foreground font-pixel">
                Create your account
              </h1>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Announce errors to screen readers; Sonner toasts handle visible notifications */}
              <div
                className="sr-only"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {error}
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground font-sans"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 border-2 focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground font-sans"
                  >
                    Email Address *
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
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground font-sans"
                  >
                    Password *
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
                      required
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
                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-sm font-medium text-foreground font-sans"
                  >
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 border-2 focus:border-primary transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  onClick={handleSignup}
                  className="w-full bg-primary hover:bg-primary/90 font-sans text-base"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Sign Up"}
                </Button>
              </div>
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
              <div className="w-full">
                <Button
                  variant="outline"
                  className="w-full font-sans border-2 hover:border-primary/50 hover:bg-primary/5"
                  type="button"
                  onClick={handleGoogleSignup}
                >
                  <img
                    src="/assets/icons/social/google.svg"
                    alt="Google logo"
                    className="w-5 h-5 mr-2"
                  />
                  Continue with Google
                </Button>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground font-sans">
                  Already have an account?{" "}
                  <a
                    href="/auth/login"
                    className="text-secondary hover:text-foreground/80 font-medium transition-colors"
                  >
                    Sign in here
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
