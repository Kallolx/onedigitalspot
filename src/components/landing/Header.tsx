import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ShopSignIcon,
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
  WebDesign01Icon,
} from "hugeicons-react";
import { account } from "@/lib/appwrite";
import { getUserOrders } from "@/lib/orders";
import MobileMenu from "../MobileMenu";
import SearchComponent from "../SearchComponent";
import MobileSearch from "./MobileSearch";

// Types
interface DropdownItem {
  name: string;
  path: string;
  isHeader?: boolean;
}

interface NavigationItem {
  name: string;
  path?: string;
  icon: React.ComponentType<any>;
  isActive?: boolean;
  dropdown?: DropdownItem[];
}

interface User {
  $id: string;
  name?: string;
  email: string;
  emailVerification: boolean;
  labels?: string[];
}

// Constants
const PRODUCT_IMAGES = {
  // Gift Cards
  "Discord Nitro": "/assets/icons/gift-cards/discord.svg",
  "Steam": "/assets/icons/gift-cards/steam-card.svg",
  "Google Play": "/assets/icons/gift-cards/google-play.svg",
  "Apple Store": "/assets/icons/subscriptions/apple.svg",
  "PlayStation": "/assets/icons/gift-cards/playstation.svg",
  
  // Design Tools
  "Canva Pro": "/assets/icons/design/canva.svg",
  "Figma Pro": "/assets/icons/design/figma.svg",
  "CapCut Pro": "/assets/icons/design/capcut.svg",
  "Telegram Stars": "/assets/icons/design/telegram.svg",
  
  // Games
  "Valorant": "/assets/icons/gift-cards/valorant.svg",
  "Apex Legends": "/assets/icons/games/apex.svg",
  "PUBG Mobile": "/assets/icons/games/pubg-mobile.svg",
  "Free Fire": "/assets/icons/games/free-fire.svg",
  
  // Subscriptions
  "Netflix": "/assets/icons/subscriptions/netflix.svg",
  "Crunchyroll": "/assets/icons/subscriptions/crunchyroll.svg",
  "Disney+": "/assets/icons/subscriptions/disney.svg",
  "Spotify": "/assets/icons/subscriptions/spotify.svg",
  
  // AI Tools
  "ChatGPT Pro": "/assets/icons/ai-tools/chatgpt.svg",
  "Claude Pro": "/assets/icons/ai-tools/claude.svg",
  "Cursor Pro": "/assets/icons/ai-tools/cursor.svg",
  "Github Pro": "/assets/icons/ai-tools/github.svg",
} as const;

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: "Gaming",
    icon: ShopSignIcon,
    dropdown: [
      { name: "PUBG Mobile", path: "/mobile-games/pubg-mobile" },
      { name: "Free Fire", path: "/mobile-games/free-fire" },
      { name: "Valorant", path: "/pc-games/valorant" },
      { name: "Apex Legends", path: "/pc-games/apex-legends" },
      { name: "More", path: "/all-games" },
    ],
  },
  {
    name: "Productivity",
    path: "/productivity",
    icon: AiMagicIcon,
    dropdown: [
      { name: "Canva Pro", path: "/design-tools/canva" },
      { name: "CapCut Pro", path: "/design-tools/capcut" },
      { name: "Figma Pro", path: "/design-tools/figma" },
      { name: "More", path: "/productivity" },
      { name: "--- AI Tools ---", path: "#", isHeader: true },
      { name: "ChatGPT Pro", path: "/ai-tools/chatgpt" },
      { name: "Claude Pro", path: "/ai-tools/claude" },
      { name: "Cursor Pro", path: "/ai-tools/cursor" },
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
      { name: "Discord Nitro", path: "/gift-cards/discord-nitro" },
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
      { name: "Disney+", path: "/subscriptions/disney-plus" },
      { name: "Spotify", path: "/subscriptions/spotify" },
      { name: "More", path: "/subscriptions" },
    ],
  },
];

// Utility Components
const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="3" cy="8" r="1.5" fill="currentColor" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="13" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

const DropdownLink = ({ item }: { item: DropdownItem }) => {
  const imgSrc = PRODUCT_IMAGES[item.name as keyof typeof PRODUCT_IMAGES] || "/assets/icons/placeholder.svg";
  const isMore = item.name === "More";
  
  // Section header styling
  if (item.isHeader) {
    return (
      <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-t border-border mt-2 pt-2">
        {item.name.replace(/---/g, '').trim()}
      </div>
    );
  }

  return (
    <a
      href={item.path}
      className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2"
    >
      {!isMore && (
        <span className="inline-block w-6 h-6 overflow-hidden flex-shrink-0">
          <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
        </span>
      )}
      {item.name}
      {isMore && (
        <span className="inline-block">
          <MoreIcon />
        </span>
      )}
    </a>
  );
};

const NavigationDropdown = ({ item }: { item: NavigationItem }) => {
  if (!item.dropdown) return null;

  return (
    <div className="absolute hidden group-hover:block top-full left-0 w-48 p-2 bg-background border-2 border-border rounded-md shadow-card text-foreground z-50">
      <div className="space-y-1">
        {item.dropdown.map((dropItem, index) => (
          <DropdownLink key={`${dropItem.name}-${index}`} item={dropItem} />
        ))}
      </div>
    </div>
  );
};

const NavigationItem = ({ item, location }: { item: NavigationItem; location: { pathname: string } }) => {
  const Icon = item.icon;
  const isActive = item.isActive || (item.path && location.pathname.startsWith(item.path));

  return (
    <div className="relative group">
      <a
        href={item.path}
        className={`px-4 py-2 font-sans font-medium rounded-md transition-colors inline-flex items-center gap-2 ${
          isActive
            ? "text-primary-foreground bg-primary"
            : "text-foreground hover:bg-muted"
        }`}
      >
        <Icon className="w-5 h-5" />
        {item.name}
        {item.dropdown && <ArrowDown01Icon className="w-4 h-4" />}
      </a>
      <NavigationDropdown item={item} />
    </div>
  );
};

const UserMenu = ({ 
  user, 
  isOpen, 
  onToggle, 
  onLogout, 
  onSendVerification, 
  pendingOrdersCount 
}: {
  user: User;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  onSendVerification: () => void;
  pendingOrdersCount: number;
}) => {
  const getUserDisplayName = () => {
    if (user.name) {
      return user.name.split(" ")[0];
    }
    return user.email.split("@")[0];
  };

  const isAdmin = Array.isArray(user?.labels) && user.labels.includes("admin");

  return (
    <div className="relative">
      <Button
        variant="default"
        className="h-10 px-3 flex items-center gap-2"
        onClick={onToggle}
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-md font-medium">{getUserDisplayName()}</span>
        <ArrowDown01Icon className="w-3 h-3" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-background border-2 border-border rounded-md shadow-card text-foreground z-50">
          <div className="space-y-1">
            {/* User Info */}
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium text-foreground">{user.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            {/* Verify Account (for unverified users) */}
            {!user.emailVerification && (
              <button
                onClick={onSendVerification}
                className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-orange-600 flex items-center gap-2"
              >
                <MailValidation01Icon className="w-4 h-4" />
                Verify Account
              </button>
            )}

            {/* Admin Panel (for admins) */}
            {isAdmin && (
              <a
                href="/admin"
                className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-blue-600 flex items-center gap-2"
              >
                <Settings02Icon className="w-4 h-4" />
                Admin Panel
              </a>
            )}

            {/* My Orders */}
            <a
              href="/my-orders"
              className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2 relative"
            >
              <ShoppingCart02Icon className="w-4 h-4" />
              My Orders
              {pendingOrdersCount > 0 && (
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {pendingOrdersCount > 9 ? "9+" : pendingOrdersCount}
                </span>
              )}
            </a>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="w-full text-left block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-red-600 flex items-center gap-2"
            >
              <Logout03Icon className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BroadcastTicker = () => (
  <div className="sticky top-[64px] z-40 w-full bg-gradient-to-r from-primary to-primary/80 border-b border-primary/30 shadow-sm">
    <div className="w-full max-w-[1440px] mx-auto flex items-center px-2 sm:px-4 lg:px-8 py-1 relative">
      <div className="flex-1 overflow-hidden">
        <div
          className="marquee-loop flex whitespace-nowrap font-normal text-primary-foreground font-anekbangla tracking-wide"
          style={{ fontFamily: "Hind Siliguri, sans-serif" }}
        >
          <span className="inline-block min-w-max pr-12">
            🎮লুটবক্স-এ স্বাগতম! রোবলক্স টপ-আপে 70% ছাড় • 🎁 ৳1000+ কেনাকাটায় ফ্রি গিফট কার্ড • 🌟 নতুন ইউজারদের জন্য অতিরিক্ত 10% ছাড়• ⚡ সব টপ-আপে তাৎক্ষণিক ডেলিভারি •
          </span>
          <span className="inline-block min-w-max pr-12" aria-hidden="true">
            🎮 লুটবক্স-এ স্বাগতম! রোবলক্স টপ-আপে 70% ছাড় • 🎁 ৳1000+ কেনাকাটায় ফ্রি গিফট কার্ড • 🌟 নতুন ইউজারদের জন্য অতিরিক্ত 10% ছাড় • ⚡ সব টপ-আপে তাৎক্ষণিক ডেলিভারি •
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Main Component
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  const location = { pathname: "/" };

  // Effects
  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPendingOrdersCount();
      const interval = setInterval(fetchPendingOrdersCount, 30000);
      return () => clearInterval(interval);
    } else {
      setPendingOrdersCount(0);
    }
  }, [user]);

  // Handlers
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

  const fetchPendingOrdersCount = async () => {
    if (!user) return;

    try {
      const orders = await getUserOrders(user.$id);
      const pendingCount = orders.filter(
        (order) => order.status && order.status.toLowerCase() === "pending"
      ).length;
      setPendingOrdersCount(pendingCount);
    } catch (error) {
      console.error("Failed to fetch pending orders count:", error);
      setPendingOrdersCount(0);
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

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 w-full bg-background">
        <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center h-full">
              <img
                src="/assets/logo-av.avif"
                alt="LootBox Logo"
                className="h-full object-contain"
                style={{ width: "auto", maxHeight: "48px" }}
              />
            </a>

            {/* Desktop Navigation - Changed from xl:flex to lg:flex */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAVIGATION_ITEMS.map((item) => (
                <NavigationItem key={item.name} item={item} location={location} />
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">

              {/* Cart Button - Changed from xl:inline-flex to lg:inline-flex */}
              <Button
                variant="default"
                size="icon"
                className="relative p-1 h-9 w-9 min-w-0 hidden lg:inline-flex"
              >
                <ShoppingCart02Icon className="w-4 h-4 text-secondary" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-medium text-primary-foreground rounded-full flex items-center justify-center">
                  0
                </span>
              </Button>

              {/* Authentication Section */}
              {loading ? (
                <div className="w-10 h-10 bg-muted animate-pulse rounded-md"></div>
              ) : user ? (
                <UserMenu
                  user={user}
                  isOpen={isUserMenuOpen}
                  onToggle={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onLogout={handleLogout}
                  onSendVerification={handleSendVerification}
                  pendingOrdersCount={pendingOrdersCount}
                />
              ) : (
                <Button asChild variant="pixel" size="default" className="h-10 px-4">
                  <a href="/auth/login" className="flex items-center gap-2">
                    <Logout03Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">LOG IN</span>
                  </a>
                </Button>
              )}

              {/* Mobile Menu Toggle - Changed from xl:hidden to lg:hidden */}
              <Button
                variant="default"
                size="icon"
                className="lg:hidden h-10 w-10 mobile-menu-container"
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

          {/* Mobile Menu - Changed from xl:hidden to lg:hidden */}
          <div className="lg:hidden">
            <MobileMenu isOpen={isMobileMenuOpen} />
          </div>
        </div>

        {/* Broadcast Ticker */}
        <BroadcastTicker />
      </header>
    </>
  );
};

export default Header;