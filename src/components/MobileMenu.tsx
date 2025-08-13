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
}

const MENU_SECTIONS: MenuSection[] = [
  {
    id: "gaming",
    title: "Gaming",
    icon: ShopSignIcon,
    items: [
      { name: "PUBG Mobile", path: "/mobile-games/pubg-mobile", icon: "/assets/icons/games/pubg-mobile.svg" },
      { name: "Free Fire", path: "/mobile-games/free-fire", icon: "/assets/icons/games/free-fire.svg" },
      { name: "Valorant", path: "/pc-games/valorant", icon: "/assets/icons/gift-cards/valorant.svg" },
      { name: "Apex Legends", path: "/pc-games/apex-legends", icon: "/assets/icons/games/apex.svg" },
      { name: "More", path: "/all-games" },
    ],
  },
  {
    id: "design-tools",
    title: "Design Tools",
    icon: CoinsDollarIcon,
    items: [
      { name: "Canva Pro", path: "/design-tools/canva", icon: "/assets/icons/design/canva.svg" },
      { name: "CapCut Pro", path: "/design-tools/capcut", icon: "/assets/icons/design/capcut.svg" },
      { name: "Figma Pro", path: "/design-tools/figma", icon: "/assets/icons/design/figma.svg" },
      { name: "Telegram Stars", path: "/design-tools/discord-nitro", icon: "/assets/icons/design/telegram.svg" },
      { name: "More", path: "/design-tools" },
    ],
  },
  {
    id: "ai-tools",
    title: "AI Tools",
    icon: AiMagicIcon,
    items: [
      { name: "ChatGPT Pro", path: "/ai-tools/chatgpt", icon: "/assets/icons/ai-tools/chatgpt.svg" },
      { name: "Claude Pro", path: "/ai-tools/claude", icon: "/assets/icons/ai-tools/claude.svg" },
      { name: "Cursor Pro", path: "/ai-tools/midjourney", icon: "/assets/icons/ai-tools/cursor.svg" },
      { name: "Github Pro", path: "/ai-tools/github", icon: "/assets/icons/ai-tools/github.svg" },
      { name: "More", path: "/ai-tools" },
    ],
  },
  {
    id: "gift-cards",
    title: "Gift Cards",
    icon: GiftCardIcon,
    items: [
      { name: "Steam", path: "/gift-cards/steam-wallet", icon: "/assets/icons/gift-cards/steam-card.svg" },
      { name: "Google Play", path: "/gift-cards/google-play", icon: "/assets/icons/gift-cards/google-play.svg" },
      { name: "Apple Store", path: "/gift-cards/apple-store", icon: "/assets/icons/subscriptions/apple.svg" },
      { name: "Discord Nitro", path: "/gift-cards/playstation", icon: "/assets/icons/gift-cards/discord.svg" },
      { name: "More", path: "/gift-cards" },
    ],
  },
  {
    id: "subscriptions",
    title: "Subscriptions",
    icon: Tv01Icon,
    items: [
      { name: "Netflix", path: "/subscriptions/netflix", icon: "/assets/icons/subscriptions/netflix.svg" },
      { name: "Crunchyroll", path: "/subscriptions/crunchyroll", icon: "/assets/icons/subscriptions/crunchyroll.svg" },
      { name: "Disney+", path: "/subscriptions/tinder", icon: "/assets/icons/subscriptions/disney.svg" },
      { name: "Spotify", path: "/subscriptions/youtube", icon: "/assets/icons/subscriptions/spotify.svg" },
      { name: "More", path: "/subscriptions" },
    ],
  },
];

const MenuButton = ({ 
  section, 
  isActive, 
  onToggle 
}: { 
  section: MenuSection; 
  isActive: boolean; 
  onToggle: () => void; 
}) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
  >
    <div className="flex items-center gap-2">
      <section.icon className="w-5 h-5" />
      <span className="font-medium">{section.title}</span>
    </div>
    <ArrowDown01Icon
      className={`w-4 h-4 transition-transform ${isActive ? "rotate-180" : ""}`}
    />
  </button>
);

const MenuItemLink = ({ item }: { item: MenuItem }) => (
  <Link
    to={item.path}
    className="block px-3 py-2 rounded hover:bg-muted text-sm font-medium text-foreground flex items-center gap-2"
  >
    {item.icon && item.name !== "More" && (
      <span className="inline-block w-6 h-6 overflow-hidden flex-shrink-0">
        <img
          src={item.icon}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </span>
    )}
    {item.name}
    {item.name === "More" && (
      <MoreHorizontalSquare01Icon className="w-3 h-3" />
    )}
  </Link>
);

const MenuSection = ({ 
  section, 
  activeSubmenu, 
  onToggleSubmenu 
}: { 
  section: MenuSection; 
  activeSubmenu: string | null; 
  onToggleSubmenu: (id: string) => void; 
}) => {
  const isActive = activeSubmenu === section.id;

  return (
    <div>
      <MenuButton
        section={section}
        isActive={isActive}
        onToggle={() => onToggleSubmenu(section.id)}
      />
      {isActive && (
        <div className="mt-2 space-y-1">
          {section.items.map((item) => (
            <MenuItemLink key={item.name} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

const MobileMenu = ({ isOpen }: MobileMenuProps) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (menuId: string) => {
    setActiveSubmenu(activeSubmenu === menuId ? null : menuId);
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
          {/* Home Link */}
          <Link
            to="/"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2">
              <Home03Icon className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </div>
          </Link>

          {/* Dynamic Menu Sections */}
          {MENU_SECTIONS.map((section) => (
            <MenuSection
              key={section.id}
              section={section}
              activeSubmenu={activeSubmenu}
              onToggleSubmenu={toggleSubmenu}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;