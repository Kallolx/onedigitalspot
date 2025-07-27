import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  User,
  ChevronDown,
  Menu,
  X,
  Store,
  Gamepad,
  Gift,
} from "lucide-react";
import MobileMenu from "./MobileMenu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = { pathname: "/" }; // Mock location for demo

  const navigationItems = [
    {
      name: "Shop",
      icon: Store,
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
      icon: Gamepad,
      dropdown: [
        { name: "Mobile Legends", path: "/top-up-games/mobile-legends" },
        { name: "PUBG Mobile", path: "/top-up-games/pubg" },
        { name: "Free Fire", path: "/top-up-games/free-fire" },
        { name: "Roblox", path: "/top-up-games/roblox" },
        { name: "More", path: "/top-up-games" },
      ],
    },
    {
      name: "AI Tools",
      path: "/ai-tools",
      icon: Gift,
      dropdown: [
        { name: "ChatGPT Pro", path: "/ai/chatgpt" },
        { name: "Claude Pro", path: "/ai/claude" },
        { name: "Midjourney Pro", path: "/ai/midjourney" },
        { name: "DALL-E Credits", path: "/ai/dalle" },
        { name: "More", path: "/ai-tools" },
      ],
    },
    {
      name: "Gift Cards",
      path: "/gift-cards",
      icon: Gift,
      dropdown: [
        { name: "Steam", path: "/gift/steam" },
        { name: "Google Play", path: "/gift/google" },
        { name: "Apple Store", path: "/gift/apple" },
        { name: "PlayStation", path: "/gift/ps" },
        { name: "More", path: "/gift-cards" },
      ],
    },
    {
      name: "Subscriptions",
      path: "/subscriptions",
      icon: Gift,
      dropdown: [
        { name: "Netflix", path: "/sub/netflix" },
        { name: "Crunchyroll", path: "/sub/crunchyroll" },
        { name: "Tinder", path: "/sub/tinder" },
        { name: "Youtube Premium", path: "/sub/youtube" },
        { name: "More", path: "/subscriptions" },
      ],
    },
  ];

  // Broadcast ticker always visible, no close button

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 w-full bg-background">
        <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-8 py-4">
          {/* Single Top Bar */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-4">
              <div className="flex font-anekbangla font-bold text-2xl md:text-3xl text-primary gap-2">
                <img
                  src="/src/assets/logo.svg"
                  alt="LootBox Logo"
                  className="w-6 h-6 md:w-10 md:h-10"
                />
                লুটবক্স
              </div>
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
                      <Icon className="w-4 h-4" />
                      {item.name}
                      {item.dropdown && <ChevronDown className="w-4 h-4" />}
                    </a>
                    {/* Desktop Dropdown */}
                    {item.dropdown && (
                      <div className="absolute hidden group-hover:block top-full left-0 w-48 p-2 bg-background border-2 border-border rounded-md shadow-card text-foreground z-50">
                        <div className="space-y-1">
                          {item.dropdown.map((dropItem) => (
                            <a
                              key={dropItem.name}
                              href={dropItem.path}
                              className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2"
                            >
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
                          ))}
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
                <ShoppingCart className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-semibold text-primary-foreground rounded-full flex items-center justify-center">
                  0
                </span>
              </Button>
              {/* Login Button */}
              <Button variant="pixel" size="default" className="h-10 px-4">
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">LOG IN</span>
              </Button>
              {/* Mobile Menu Toggle (below xl) */}
              <Button
                variant="outline"
                size="icon"
                className="xl:hidden h-10 w-10 mobile-menu-container"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
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
                className="marquee-loop flex whitespace-nowrap font-normal  text-primary-foreground font-anekbangla tracking-wide"
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
