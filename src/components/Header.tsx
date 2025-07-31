import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ShopSignIcon,
  CoinsDollarIcon,
  AiMagicIcon,
  GiftCardIcon,
  Tv01Icon,
  ShoppingCart02Icon,
  Logout03Icon,
  Menu03Icon,
  Cancel01Icon,
  ArrowDown01Icon,
  Settings02Icon,
  UserIcon,
  MailValidation01Icon,
} from "hugeicons-react";
import { account } from "@/lib/appwrite";

import MobileMenu from "./MobileMenu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = { pathname: "/" };

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setIsUserMenuOpen(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSendVerification = async () => {
    try {
      await account.createVerification(window.location.origin + "/verify");
      alert("Verification email sent! Please check your inbox.");
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error("Failed to send verification:", error);
      alert("Failed to send verification email. Please try again.");
    }
  };

  const navigationItems = [
    {
      name: "Shop",
      icon: ShopSignIcon,
      isActive: ["/mobile-games", "/pc-games"].some((p) =>
        location.pathname.startsWith(p)
      ),
      dropdown: [
        { name: "Mobile Games", path: "/mobile-games" },
        { name: "PC Games", path: "/pc-games" },
      ],
    },
    {
      name: "Top Up",
      path: "/top-up-games",
      icon: CoinsDollarIcon,
      dropdown: [
        { name: "Mobile Legends", path: "/mobile-games/mobile-legends" },
        { name: "PUBG Mobile", path: "/mobile-games/pubg-mobile" },
        { name: "Free Fire", path: "/mobile-games/free-fire" },
        { name: "Roblox", path: "/mobile-games/roblox" },
        { name: "More", path: "/top-up-games" },
      ],
    },
    {
      name: "AI Tools",
      path: "/ai-tools",
      icon: AiMagicIcon,
      dropdown: [
        { name: "ChatGPT Pro", path: "/ai-tools/chatgpt" },
        { name: "Claude Pro", path: "/ai-tools/claude" },
        { name: "Midjourney Pro", path: "/ai-tools/midjourney" },
        { name: "Github Pro", path: "/ai-tools/dalle" },
        { name: "More", path: "/ai-tools" },
      ],
    },
    {
      name: "Gift Cards",
      path: "/gift-cards",
      icon: GiftCardIcon,
      dropdown: [
        { name: "Steam", path: "/gift-cards/steam-wallet" },
        { name: "Google Play", path: "/gift-cards/google-play" },
        { name: "Apple Store", path: "/gift-cards/apple-store" },
        { name: "PlayStation", path: "/gift-cards/playstation" },
        { name: "More", path: "/gift-cards" },
      ],
    },
    {
      name: "Subscriptions",
      path: "/subscriptions",
      icon: Tv01Icon,
      dropdown: [
        { name: "Netflix", path: "/subscriptions/netflix" },
        { name: "Crunchyroll", path: "/subscriptions/crunchyroll" },
        { name: "Tinder", path: "/subscriptions/tinder" },
        { name: "Youtube Premium", path: "/subscriptions/youtube" },
        { name: "More", path: "/subscriptions" },
      ],
    },
  ];

  // Get user's first name or fallback to email prefix
  const getUserDisplayName = () => {
    if (!user) return "";
    if (user.name) {
      return user.name.split(" ")[0]; // Get first name only
    }
    return user.email.split("@")[0]; // Use email prefix as fallback
  };

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 w-full bg-background">
        <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-8 py-4">
          {/* Single Top Bar */}
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center h-full">
              <img
                src="/assets/logo.svg"
                alt="LootBox Logo"
                className="h-full object-contain"
                style={{ width: "auto", maxHeight: "48px" }}
              />
            </a>
            {/* Desktop Navigation - Middle (xl and up) */}
            <nav className="hidden xl:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="relative group">
                    <a
                      href={item.path}
                      className={`px-4 py-2 font-sans font-semibold rounded-md transition-colors inline-flex items-center gap-2 ${
                        item.isActive
                          ? "text-primary-foreground bg-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                      {item.dropdown && <ArrowDown01Icon className="w-4 h-4" />}
                    </a>
                    {/* Desktop Dropdown */}
                    {item.dropdown && (
                      <div className="absolute hidden group-hover:block top-full left-0 w-48 p-2 bg-background border-2 border-border rounded-md shadow-card text-foreground z-50">
                        <div className="space-y-1">
                          {item.dropdown.map((dropItem) => {
                            // Map product names to images (fallback to placeholder)
                            const productImages = {
                              "Mobile Games": "/assets/icons/mobile-games.svg",
                              "PC Games": "/assets/icons/pc-games.svg",
                              "Mobile Legends":
                                "/assets/icons/mobile-legends.svg",
                              "PUBG Mobile": "/assets/icons/pubg-mobile.svg",
                              "Free Fire": "/assets/icons/free-fire.svg",
                              Roblox: "/assets/icons/roblox-banner.svg",
                              Steam: "/assets/icons/steam-card.svg",
                              "Google Play": "/assets/icons/google-play.svg",
                              "Apple Store": "/assets/icons/apple-store.svg",
                              PlayStation: "/assets/icons/playstation.svg",
                              Netflix: "/assets/icons/netflix.svg",
                              Crunchyroll: "/assets/icons/crunchyroll.svg",
                              Tinder: "/assets/icons/tinder.svg",
                              "Youtube Premium":
                                "/assets/icons/youtube-premium.svg",
                              "ChatGPT Pro": "/assets/icons/chatgpt.svg",
                              "Claude Pro": "/assets/icons/claude.svg",
                              "Midjourney Pro": "/assets/icons/midjourney.svg",
                              "Github Pro": "/assets/icons/github.svg",
                            };
                            const imgSrc =
                              productImages[dropItem.name] ||
                              "/assets/icons/placeholder.svg";
                            return (
                              <a
                                key={dropItem.name}
                                href={dropItem.path}
                                className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2"
                              >
                                {dropItem.name !== "More" && (
                                  <span className="inline-block w-6 h-6 overflow-hidden flex-shrink-0">
                                    <img
                                      src={imgSrc}
                                      alt={dropItem.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </span>
                                )}
                                {dropItem.name}
                                {dropItem.name === "More" && (
                                  <span className="inline-block">
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <circle
                                        cx="3"
                                        cy="8"
                                        r="1.5"
                                        fill="currentColor"
                                      />
                                      <circle
                                        cx="8"
                                        cy="8"
                                        r="1.5"
                                        fill="currentColor"
                                      />
                                      <circle
                                        cx="13"
                                        cy="8"
                                        r="1.5"
                                        fill="currentColor"
                                      />
                                    </svg>
                                  </span>
                                )}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Cart Button */}
              <Button
                variant="outline"
                size="icon"
                className="relative p-1 h-9 w-9 min-w-0 hidden xl:inline-flex"
              >
                <ShoppingCart02Icon className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-semibold text-primary-foreground rounded-full flex items-center justify-center">
                  0
                </span>
              </Button>

              {/* Authentication Section */}
              {loading ? (
                <div className="w-10 h-10 bg-muted animate-pulse rounded-md"></div>
              ) : user ? (
                /* User Menu */
                <div className="relative">
                  <Button
                    variant="default"
                    className="h-10 px-3 flex items-center gap-2"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span className="text-md font-medium">
                      {getUserDisplayName()}
                    </span>
                    <ArrowDown01Icon className="w-3 h-3" />
                  </Button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-background border-2 border-border rounded-md shadow-card text-foreground z-50">
                      <div className="space-y-1">
                        <div className="px-3 py-2 border-b border-border">
                          <p className="text-sm font-medium text-foreground">
                            {user.name || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>

                        {/* Show verify account option for unverified users */}
                        {!user.emailVerification && (
                          <button
                            onClick={handleSendVerification}
                            className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-orange-600 flex items-center gap-2"
                          >
                            <MailValidation01Icon className="w-4 h-4" />
                            Verify Account
                          </button>
                        )}

                        {/* Admin Panel link for admin users */}
                        {Array.isArray(user?.labels) &&
                          user.labels.includes("admin") && (
                            <a
                              href="/admin"
                              className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-blue-600 flex items-center gap-2"
                            >
                              <Settings02Icon className="w-4 h-4" />
                              Admin Panel
                            </a>
                          )}
                        <a
                          href="/profile"
                          className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4" />
                          Profile
                        </a>
                        <a
                          href="/orders"
                          className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <ShoppingCart02Icon className="w-4 h-4" />
                          Orders
                        </a>
                        <a
                          href="/settings"
                          className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <Settings02Icon className="w-4 h-4" />
                          Settings
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-red-600 flex items-center gap-2"
                        >
                          <Logout03Icon className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Login Button */
                <Button
                  asChild
                  variant="pixel"
                  size="default"
                  className="h-10 px-4"
                >
                  <a href="/auth/login" className="flex items-center gap-2">
                    <Logout03Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">LOG IN</span>
                  </a>
                </Button>
              )}

              {/* Mobile Menu Toggle (below xl) */}
              <Button
                variant="outline"
                size="icon"
                className="xl:hidden h-10 w-10 mobile-menu-container"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <Cancel01Icon className="w-5 h-5" />
                ) : (
                  <Menu03Icon className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu (below xl) */}
          <div className="xl:hidden">
            <MobileMenu isOpen={isMobileMenuOpen} />
          </div>
        </div>

        {/* Broadcast Ticker - sticky below navbar, seamless infinite loop */}
        <div className="sticky top-[64px] z-40 w-full bg-gradient-to-r from-primary to-primary/80 border-b border-primary/30 shadow-sm">
          <div className="w-full max-w-[1440px] mx-auto flex items-center px-2 sm:px-4 lg:px-8 py-1 relative">
            <div className="flex-1 overflow-hidden">
              <div
                className="marquee-loop flex whitespace-nowrap font-normal text-primary-foreground font-anekbangla tracking-wide"
                style={{ fontFamily: "Hind Siliguri, sans-serif" }}
              >
                <span className="inline-block min-w-max pr-12">
                  🎮লুটবক্স-এ স্বাগতম! রোবলক্স টপ-আপে 70% ছাড় • 🎁 ৳1000+
                  কেনাকাটায় ফ্রি গিফট কার্ড • 🌟 নতুন ইউজারদের জন্য অতিরিক্ত
                  10% ছাড়• ⚡ সব টপ-আপে তাৎক্ষণিক ডেলিভারি •
                </span>
                <span
                  className="inline-block min-w-max pr-12"
                  aria-hidden="true"
                >
                  🎮 লুটবক্স-এ স্বাগতম! রোবলক্স টপ-আপে 70% ছাড় • 🎁 ৳1000+
                  কেনাকাটায় ফ্রি গিফট কার্ড • 🌟 নতুন ইউজারদের জন্য অতিরিক্ত
                  10% ছাড় • ⚡ সব টপ-আপে তাৎক্ষণিক ডেলিভারি •
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
