import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Search,
  ChevronDown,
  ChevronRight,
  Home,
  Store,
  Gamepad,
  Gift,
  Brain,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface MobileMenuProps {
  isOpen: boolean;
}

const MobileMenu = ({ isOpen }: MobileMenuProps) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (menu: string) => {
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  };

  return (
    <div
      className={`
        md:hidden fixed inset-x-0 top-[64px] bg-background border-b-4 border-border
        transition-all duration-300 transform origin-top z-50
        ${
          isOpen
            ? "translate-y-0 opacity-100 visible pointer-events-auto"
            : "-translate-y-full opacity-0 invisible pointer-events-none"
        }
      `}
    >
      <div className="container px-4 py-4 max-h-[calc(100vh-73px)] overflow-y-auto">
        <nav className="flex flex-col gap-2 mb-4">
          {/* Home */}
          <Link
            to="/"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              <span className="font-semibold">Home</span>
            </div>
          </Link>

          {/* Shop */}
          <div>
            <button
              onClick={() => toggleSubmenu("shop")}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                <span className="font-semibold">Shop</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeSubmenu === "shop" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeSubmenu === "shop" && (
              <div className="ml-6 mt-2 space-y-1">
                <Link
                  to="/mobile-games"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Mobile Games
                </Link>
                <Link
                  to="/pc-games"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  PC Games
                </Link>
              </div>
            )}
          </div>

          {/* Top Up */}
          <div>
            <button
              onClick={() => toggleSubmenu("topup")}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <Gamepad className="w-5 h-5" />
                <span className="font-semibold">Top Up</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeSubmenu === "topup" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeSubmenu === "topup" && (
              <div className="ml-6 mt-2 space-y-1">
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Mobile Legends
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  PUBG Mobile
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Free Fire
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Roblox
                </a>
                <a
                  href="/top-up-games"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm flex items-center gap-2"
                >
                  More <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* AI Tools */}
          <div>
            <button
              onClick={() => toggleSubmenu("aitools")}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                <span className="font-semibold">AI Tools</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeSubmenu === "aitools" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeSubmenu === "aitools" && (
              <div className="ml-6 mt-2 space-y-1">
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  ChatGPT Pro
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Claude Pro
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Midjourney Pro
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  DALL-E Credits
                </a>
                <a
                  href="/ai-tools"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm flex items-center gap-2"
                >
                  More <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Gift Cards */}
          <div>
            <button
              onClick={() => toggleSubmenu("giftcards")}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                <span className="font-semibold">Gift Cards</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeSubmenu === "giftcards" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeSubmenu === "giftcards" && (
              <div className="ml-6 mt-2 space-y-1">
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Steam
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Google Play
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Apple Store
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  PlayStation
                </a>
                <a
                  href="/gift-cards"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm flex items-center gap-2"
                >
                  More <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Subscriptions */}
          <div>
            <button
              onClick={() => toggleSubmenu("subscriptions")}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                <span className="font-semibold">Subscriptions</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  activeSubmenu === "subscriptions" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeSubmenu === "subscriptions" && (
              <div className="ml-6 mt-2 space-y-1">
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Netflix
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Crunchyroll
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Tinder
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm"
                >
                  Youtube Premium
                </a>
                <a
                  href="/subscriptions"
                  className="block px-3 py-2 rounded hover:bg-muted text-sm flex items-center gap-2"
                >
                  More <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
