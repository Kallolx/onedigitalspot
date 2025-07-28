import {
  Home03Icon,
  ShopSignIcon,
  CoinsDollarIcon,
  AiMagicIcon,
  GiftCardIcon,
  Tv01Icon,
  ArrowDown01Icon,
  MoreHorizontalSquare01Icon
} from "hugeicons-react";

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
        2xl:hidden fixed inset-x-0 top-[64px] bg-background border-b-4 border-border
        transition-all duration-300 transform origin-top z-50
        ${
          isOpen
            ? "translate-y-0 opacity-100 visible pointer-events-auto"
            : "-translate-y-full opacity-0 invisible pointer-events-none"
        }
      `}
    >
      <div className="container px-4 py-4 max-h-[calc(100vh-73px)] overflow-y-auto">
        <nav className="flex flex-col gap-2 mb-4 tracking-tighter">

          {/* Home */}
          <Link
            to="/"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2">
              <Home03Icon className="w-5 h-5" />
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
                <ShopSignIcon className="w-5 h-5" />
                <span className="font-semibold">Shop</span>
              </div>
              <ArrowDown01Icon
                className={`w-4 h-4 transition-transform ${
                  activeSubmenu === "shop" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeSubmenu === "shop" && (
              <div className="mt-2 space-y-1">
                {[
                  { name: "Mobile Games", path: "/mobile-games" },
                  { name: "PC Games", path: "/pc-games" },
                ].map((dropItem) => {
                  const productImages = {
                    "Mobile Games": "/assets/icons/mobile-games.svg",
                    "PC Games": "/assets/icons/pc-games.svg",
                  };
                  const imgSrc = productImages[dropItem.name] || "/src/assets/icons/placeholder.svg";
                  return (
                    <Link
                      key={dropItem.name}
                      to={dropItem.path}
                      className="block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      <span className="inline-block w-6 h-6 overflow-hidden flex-shrink-0">
                        <img
                          src={imgSrc}
                          alt={dropItem.name}
                          className="w-full h-full object-cover"
                        />
                      </span>
                      {dropItem.name}
                    </Link>
                  );
                })}
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
                <CoinsDollarIcon className="w-5 h-5" />
                <span className="font-semibold">Top Up</span>
              </div>
              <ArrowDown01Icon
                className={`w-4 h-4 transition-transform ${
                  activeSubmenu === "topup" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeSubmenu === "topup" && (
              <div className="mt-2 space-y-1">
                {[
                  { name: "Mobile Legends", path: "/top-up-games/mobile-legends" },
                  { name: "PUBG Mobile", path: "/top-up-games/pubg" },
                  { name: "Free Fire", path: "/top-up-games/free-fire" },
                  { name: "Roblox", path: "/top-up-games/roblox" },
                  { name: "More", path: "/top-up-games" },
                ].map((dropItem) => {
                  const productImages = {
                    "Mobile Legends": "/assets/icons/mobile-legends.svg",
                    "PUBG Mobile": "/assets/icons/pubg-mobile.svg",
                    "Free Fire": "/assets/icons/free-fire.svg",
                    "Roblox": "/assets/icons/roblox-banner.svg",
                  };
                  const imgSrc = productImages[dropItem.name] || "/src/assets/icons/placeholder.svg";
                  return (
                    <a
                      key={dropItem.name}
                      href={dropItem.path}
                      className="block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2"
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
                          <MoreHorizontalSquare01Icon className="w-3 h-3" />
                        </span>
                      )}
                    </a>
                  );
                })}
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
                <AiMagicIcon className="w-5 h-5" />
                <span className="font-semibold">AI Tools</span>
              </div>
              <ArrowDown01Icon
                className={`w-4 h-4 transition-transform ${
                  activeSubmenu === "aitools" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeSubmenu === "aitools" && (
              <div className="mt-2 space-y-1">
                {[
                  { name: "ChatGPT Pro", path: "/ai/chatgpt" },
                  { name: "Claude Pro", path: "/ai/claude" },
                  { name: "Midjourney Pro", path: "/ai/midjourney" },
                  { name: "Github Pro", path: "/ai/dalle" },
                  { name: "More", path: "/ai-tools" },
                ].map((dropItem) => {
                  const productImages = {
                    "ChatGPT Pro": "/assets/icons/chatgpt.svg",
                    "Claude Pro": "/assets/icons/claude.svg",
                    "Midjourney Pro": "/assets/icons/midjourney.svg",
                    "Github Pro": "/assets/icons/github.svg",
                  };
                  const imgSrc = productImages[dropItem.name] || "/src/assets/icons/placeholder.svg";
                  return (
                    <a
                      key={dropItem.name}
                      href={dropItem.path}
                      className="block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2"
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
                          <MoreHorizontalSquare01Icon className="w-3 h-3" />
                        </span>
                      )}
                    </a>
                  );
                })}
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
                <GiftCardIcon className="w-5 h-5" />
                <span className="font-semibold">Gift Cards</span>
              </div>
              <ArrowDown01Icon
                className={`w-4 h-4 transition-transform ${
                  activeSubmenu === "giftcards" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeSubmenu === "giftcards" && (
              <div className="mt-2 space-y-1">
                {[
                  { name: "Steam", path: "/gift/steam" },
                  { name: "Google Play", path: "/gift/google" },
                  { name: "Apple Store", path: "/gift/apple" },
                  { name: "PlayStation", path: "/gift/ps" },
                  { name: "More", path: "/gift-cards" },
                ].map((dropItem) => {
                  const productImages = {
                    "Steam": "/assets/icons/steam-card.svg",
                    "Google Play": "/assets/icons/google-play.svg",
                    "Apple Store": "/assets/icons/apple-store.svg",
                    "PlayStation": "/assets/icons/playstation.svg",
                  };
                  const imgSrc = productImages[dropItem.name] || "/src/assets/icons/placeholder.svg";
                  return (
                    <a
                      key={dropItem.name}
                      href={dropItem.path}
                      className="block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2"
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
                          <MoreHorizontalSquare01Icon className="w-3 h-3" />
                        </span>
                      )}
                    </a>
                  );
                })}
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
                <Tv01Icon className="w-5 h-5" />
                <span className="font-semibold">Subscriptions</span>
              </div>
              <ArrowDown01Icon
                className={`w-4 h-4 transition-transform ${
                  activeSubmenu === "subscriptions" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeSubmenu === "subscriptions" && (
              <div className="mt-2 space-y-1">
                {[
                  { name: "Netflix", path: "/sub/netflix" },
                  { name: "Crunchyroll", path: "/sub/crunchyroll" },
                  { name: "Tinder", path: "/sub/tinder" },
                  { name: "Youtube Premium", path: "/sub/youtube" },
                  { name: "More", path: "/subscriptions" },
                ].map((dropItem) => {
                  const productImages = {
                    "Netflix": "/assets/icons/netflix.svg",
                    "Crunchyroll": "/assets/icons/crunchyroll.svg",
                    "Tinder": "/assets/icons/tinder.svg",
                    "Youtube Premium": "/assets/icons/youtube-premium.svg",
                  };
                  const imgSrc = productImages[dropItem.name] || "/src/assets/icons/placeholder.svg";
                  return (
                    <a
                      key={dropItem.name}
                      href={dropItem.path}
                      className="block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2"
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
                          <MoreHorizontalSquare01Icon className="w-3 h-3" />
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
