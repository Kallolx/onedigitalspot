import {
  Home03Icon,
  AiMagicIcon,
  GiftCardIcon,
  Tv01Icon,
  ArrowDown01Icon,
  MoreHorizontalSquare01Icon,
  GameController03Icon,
  Backpack03Icon,
  Cancel01Icon,
  GiftIcon,
} from "hugeicons-react";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SearchComponent from "./SearchComponent";

interface MenuItem {
  name: string;
  path: string;
  icon?: string;
}

interface MenuSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items: MenuItem[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_SECTIONS: MenuSection[] = [
  {
    id: "ai-tools",
    title: "AI Tools",
    icon: AiMagicIcon,
    items: [
      {
        name: "ChatGPT Pro",
        path: "/ai-tools/chatgpt",
        icon: "/assets/icons/ai-tools/chatgpt.svg",
      },
      {
        name: "Claude Pro",
        path: "/ai-tools/claude",
        icon: "/assets/icons/ai-tools/claude.svg",
      },
      {
        name: "Cursor Pro",
        path: "/ai-tools/cursor",
        icon: "/assets/icons/ai-tools/cursor.svg",
      },
      {
        name: "Github Pro",
        path: "/ai-tools/github",
        icon: "/assets/icons/ai-tools/github.svg",
      },
      { name: "More", path: "/ai-tools" },
    ],
  },
  {
    id: "Productivity",
    title: "Productivity",
    icon: Backpack03Icon,
    items: [
      {
        name: "Canva Pro",
        path: "/subscriptions/canva-pro",
        icon: "/assets/icons/design/canva.svg",
      },
      {
        name: "CapCut Pro",
        path: "/subscriptions/capcut-pro",
        icon: "/assets/icons/design/capcut.svg",
      },
      {
        name: "Figma Pro",
        path: "/subscriptions/figma-pro",
        icon: "/assets/icons/design/figma.svg",
      },
      { name: "More", path: "/productivity" },
    ],
  },
  {
    id: "gaming",
    title: "Gaming",
    icon: GameController03Icon,
    items: [
      {
        name: "PUBG Mobile",
        path: "/mobile-games/pubg-mobile",
        icon: "/assets/icons/games/pubg-mobile.svg",
      },
      {
        name: "Free Fire",
        path: "/mobile-games/free-fire",
        icon: "/assets/icons/games/free-fire.svg",
      },
      {
        name: "Valorant",
        path: "/pc-games/valorant",
        icon: "/assets/icons/gift-cards/valorant.svg",
      },
      {
        name: "Apex Legends",
        path: "/pc-games/apex-legends",
        icon: "/assets/icons/games/apex.svg",
      },
      {
        name: "Mobile Games", path: "/mobile-games",
      },
      { name: "PC Games", path: "/pc-games" },
    ],
  },
  {
    id: "gift-cards",
    title: "Gift Cards",
    icon: GiftIcon,
    items: [
      {
        name: "Steam",
        path: "/gift-cards/steam-wallet",
        icon: "/assets/icons/gift-cards/steam-card.svg",
      },
      {
        name: "Google Play",
        path: "/gift-cards/google-play",
        icon: "/assets/icons/gift-cards/google-play.svg",
      },
      {
        name: "Apple Store",
        path: "/gift-cards/apple-store",
        icon: "/assets/icons/subscriptions/apple.svg",
      },
      {
        name: "Discord Nitro",
        path: "/gift-cards/playstation",
        icon: "/assets/icons/gift-cards/discord.svg",
      },
      { name: "More", path: "/gift-cards" },
    ],
  },
  {
    id: "subscriptions",
    title: "Subscriptions",
    icon: Tv01Icon,
    items: [
      {
        name: "Netflix",
        path: "/subscriptions/netflix",
        icon: "/assets/icons/subscriptions/netflix.svg",
      },
      {
        name: "Crunchyroll",
        path: "/subscriptions/crunchyroll",
        icon: "/assets/icons/subscriptions/crunchyroll.svg",
      },
      {
        name: "Disney+",
        path: "/subscriptions/tinder",
        icon: "/assets/icons/subscriptions/disney.svg",
      },
      {
        name: "Spotify",
        path: "/subscriptions/youtube",
        icon: "/assets/icons/subscriptions/spotify.svg",
      },
      { name: "More", path: "/subscriptions" },
    ],
  },
];

const MenuItemLink = ({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose: () => void;
}) => (
  <Link
    to={item.path}
    onClick={onClose}
    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-all duration-150"
  >
    {item.icon && item.name !== "More" && (
      <img
        src={item.icon}
        alt={item.name}
        className="w-6 h-6 flex-shrink-0 object-contain"
      />
    )}
    <span className="text-sm font-medium text-foreground">{item.name}</span>
    {(item.name === "More" || item.name === "PC Games" || item.name === "Mobile Games") && (
      <MoreHorizontalSquare01Icon className="w-4 h-4 ml-auto" />
    )}
  </Link>
);

const MenuSection = ({
  section,
  activeSubmenu,
  onToggleSubmenu,
  onClose,
}: {
  section: MenuSection;
  activeSubmenu: string | null;
  onToggleSubmenu: (id: string) => void;
  onClose: () => void;
}) => {
  const isActive = activeSubmenu === section.id;

  return (
    <div className="overflow-hidden relative">
      <div className="flex items-stretch gap-0">
        {/* left column: icon + vertical connector */}
        <div className="w-12 flex flex-col items-center relative">
          <div className="mt-4 z-10">
            <section.icon className="w-6 h-6 text-foreground" />
          </div>
          {/* vertical line connector - stretches to match submenu height when active */}
          <div
            className={`absolute top-12 left-1/2 -translate-x-1/2 w-px bg-muted/60 transition-all duration-300 ${
              isActive ? "opacity-100 bottom-3" : "opacity-0 h-0"
            }`}
          />
        </div>

        {/* right column: header button and submenu */}
        <div className="flex-1">
          <button
            onClick={() => onToggleSubmenu(section.id)}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium tracking-tighter text-foreground">
                {section.title}
              </span>
            </div>
            <ArrowDown01Icon
              className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                isActive ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isActive ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pl-0 pr-4 pb-2 space-y-1">
              {section.items.map((item) => (
                <MenuItemLink key={item.name} item={item} onClose={onClose} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const location = useLocation();

  const toggleSubmenu = (menuId: string) => {
    setActiveSubmenu(activeSubmenu === menuId ? null : menuId);
  };

  // Auto-close menu when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);



  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-all duration-300 lg:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background/95 backdrop-blur-xl border-r shadow-2xl z-50 lg:hidden transition-all duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="grid grid-cols-3 items-center p-4 border-b bg-background/50">
          <div className="flex items-center justify-start">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center border border-border bg-transparent hover:bg-muted/10 text-foreground transition-all duration-200"
              aria-label="Close menu"
            >
              <Cancel01Icon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center">
            <img
              src="/assets/logo-av.avif"
              alt="Logo"
              className="h-12 w-auto"
            />
          </div>

          <div className="flex items-center justify-end" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          {/* Search */}
          <div className="mb-6">
            <SearchComponent className="w-full" showFullResults={true} />
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {/* Dynamic Menu Sections */}
            {MENU_SECTIONS.map((section) => (
              <MenuSection
                key={section.id}
                section={section}
                activeSubmenu={activeSubmenu}
                onToggleSubmenu={toggleSubmenu}
                onClose={onClose}
              />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
