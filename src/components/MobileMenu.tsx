import {
  Home03Icon,
  ShopSignIcon,
  CoinsDollarIcon,
  AiMagicIcon,
  GiftCardIcon,
  Tv01Icon,
  ArrowDown01Icon,
  MoreHorizontalSquare01Icon,
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
              onClick={() => toggleSubmenu("Gaming")}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShopSignIcon className="w-5 h-5" />
                <span className="font-semibold">Gaming</span>
              </div>
              <ArrowDown01Icon
                className={`w-4 h-4 transition-transform ${
                  activeSubmenu === "Gaming" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeSubmenu === "Gaming" && (
              <div className="mt-2 space-y-1">
                {[
                  {
                    name: "Mobile Legends",
                    path: "/mobile-games/mobile-legends",
                  },
                  { name: "PUBG Mobile", path: "/mobile-games/pubg-mobile" },
                  { name: "Free Fire", path: "/mobile-games/free-fire" },
                  { name: "Roblox", path: "/mobile-games/roblox" },
                  { name: "More", path: "/top-up-games" },
                ].map((dropItem) => {
                  const productImages = {
                    "Mobile Legends": "/assets/icons/mobile-legends.svg",
                    "PUBG Mobile": "/assets/icons/pubg-mobile.svg",
                    "Free Fire": "/assets/icons/free-fire.svg",
                    Roblox: "/assets/icons/roblox-banner.svg",
                  };
                  const imgSrc =
                    productImages[dropItem.name] ||
                    "/src/assets/icons/placeholder.svg";
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

          {/* Design Tools */}
          <div>
            <button
              onClick={() => toggleSubmenu("Design Tools")}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <CoinsDollarIcon className="w-5 h-5" />
                <span className="font-semibold">Design Tools</span>
              </div>
              <ArrowDown01Icon
                className={`w-4 h-4 transition-transform ${
                  activeSubmenu === "Design Tools" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeSubmenu === "Design Tools" && (
              <div className="mt-2 space-y-1">
                {[
                  {
                    name: "Canva Pro",
                    path: "/design-tools/canva",
                  },
                  { name: "CapCut Pro", path: "/design-tools/capcut" },
                  { name: "Tinder+", path: "/design-tools/tinder" },
                  { name: "Discord Nitro", path: "/design-tools/discord-nitro" },
                  { name: "More", path: "/design-tools" },
                ].map((dropItem) => {
                  const productImages = {
                    "Canva Pro": "/assets/icons/canva.svg",
                    "CapCut Pro": "/assets/icons/capcut.svg",
                    "Tinder+": "/assets/icons/tinder.svg",
                    "Discord Nitro": "/assets/icons/discord-nitro.svg",
                    "Free Fire": "/assets/icons/free-fire.svg",
                    "Roblox": "/assets/icons/roblox-banner.svg",
                  };
                  const imgSrc =
                    productImages[dropItem.name] ||
                    "/src/assets/icons/placeholder.svg";
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
                  { name: "ChatGPT Pro", path: "/ai-tools/chatgpt" },
                  { name: "Claude Pro", path: "/ai-tools/claude" },
                  { name: "Midjourney Pro", path: "/ai-tools/midjourney" },
                  { name: "Github Pro", path: "/ai-tools/github" },
                  { name: "More", path: "/ai-tools" },
                ].map((dropItem) => {
                  const productImages = {
                    "ChatGPT Pro": "/assets/icons/chatgpt.svg",
                    "Claude Pro": "/assets/icons/claude.svg",
                    "Midjourney Pro": "/assets/icons/midjourney.svg",
                    "Github Pro": "/assets/icons/github.svg",
                  };
                  const imgSrc =
                    productImages[dropItem.name] ||
                    "/src/assets/icons/placeholder.svg";
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
                  { name: "Steam", path: "/gift-cards/steam-wallet" },
                  { name: "Google Play", path: "/gift-cards/google-play" },
                  { name: "Apple Store", path: "/gift-cards/apple-store" },
                  { name: "PlayStation", path: "/gift-cards/playstation" },
                  { name: "More", path: "/gift-cards" },
                ].map((dropItem) => {
                  const productImages = {
                    Steam: "/assets/icons/steam-card.svg",
                    "Google Play": "/assets/icons/google-play.svg",
                    "Apple Store": "/assets/icons/apple-store.svg",
                    PlayStation: "/assets/icons/playstation.svg",
                  };
                  const imgSrc =
                    productImages[dropItem.name] ||
                    "/src/assets/icons/placeholder.svg";
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
                  { name: "Netflix", path: "/subscriptions/netflix" },
                  { name: "Crunchyroll", path: "/subscriptions/crunchyroll" },
                  { name: "Tinder", path: "/subscriptions/tinder" },
                  { name: "Youtube Premium", path: "/subscriptions/youtube" },
                  { name: "More", path: "/subscriptions" },
                ].map((dropItem) => {
                  const productImages = {
                    Netflix: "/assets/icons/netflix.svg",
                    Crunchyroll: "/assets/icons/crunchyroll.svg",
                    Tinder: "/assets/icons/tinder.svg",
                    "Youtube Premium": "/assets/icons/youtube-premium.svg",
                  };
                  const imgSrc =
                    productImages[dropItem.name] ||
                    "/src/assets/icons/placeholder.svg";
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
