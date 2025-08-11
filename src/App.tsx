import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ChatBubble from "./components/ChatBubble";
import NotFound from "./pages/NotFound";
import MobileGames from "./pages/MobileGames";
import PCGames from "./pages/PcGames";
import TopUpGames from "./pages/TopUpGames";
import GiftCards from "./pages/GiftCards";
import AiTools from "./pages/AiTools";
import MyOrders from "./pages/MyOrders";
import MobileLegends from "@/game-details/mobile-games/MobileLegends";
import PUBGMobile from "@/game-details/mobile-games/PUBGMobile";
import Valorant from "@/game-details/pc-games/Valorant";
import SteamWallet from "./gift-cards/SteamWallet";
import GooglePlay from "./gift-cards/GooglePlay";
import PlayStation from "./gift-cards/PlayStation";
import ValorantGiftCard from "./gift-cards/Valorant";
import ITunes from "./gift-cards/iTunes";
import Amazon from "./gift-cards/Amazon";
import Apple from "./gift-cards/Apple";
import DiscordNitro from "./gift-cards/DiscordNitro";
import GameStop from "./gift-cards/GameStop";
import Roblox from "./gift-cards/Roblox";
import Spotify from "./gift-cards/Spotify";
import ChatGPT from "./ai-tools/ChatGPT";
import Netflix from "./subscriptions/Netflix";
import Login from "./auth/login";
import Signup from "./auth/signup";
import AdminGuard from "./admin/AdminGuard";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Orders from "./admin/Orders";
import Products from "./admin/Products";
import Stock from "./admin/Stock";
import Users from "./admin/Users";
import Subscriptions from "./pages/Subscriptions";

import Settings from "./admin/Settings";
import GenshinImpact from "./game-details/mobile-games/GenshinImpact";
import FreeFire from "./game-details/mobile-games/FreeFire";
import Proplexity from "./ai-tools/Proplexity";
import Claude from "./ai-tools/Claude";
import Grok from "./ai-tools/Grok";
import Gemini from "./ai-tools/Gemini";
import Github from "./ai-tools/Github";
import Cursor from "./ai-tools/Cursor";
import Windsurf from "./ai-tools/Windsurf";
import AppleMusic from "./subscriptions/AppleMusic";
import AmazonPrime from "./subscriptions/AmazonPrime";
import AppleTV from "./subscriptions/AppleTV";
import CanvaPro from "./subscriptions/CanvaPro";
import DisneyPlus from "./subscriptions/DisneyPlus";
import Duolingo from "./subscriptions/Duolingo";
import Zee5 from "./subscriptions/Zee5";
import Ullu from "./subscriptions/Ullu";
import SonyLiv from "./subscriptions/SonyLiv";
import CapCut from "./subscriptions/CapCut";
import GoogleOne from "./subscriptions/GoogleOne";
import Grammarly from "./subscriptions/Grammerly";
import Hulu from "./subscriptions/Hulu";
import LinkedIn from "./subscriptions/LinkedIn";
import Office365 from "./subscriptions/Office365";
import Photoshop from "./subscriptions/Photoshop";
import Shopify from "./subscriptions/Shopify";
import YoutubePremium from "./subscriptions/YoutubePremium";
import ZoomPro from "./subscriptions/ZoomPro";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Main Pages */}
            <Route path="/" element={<Index />} />
            <Route path="/my-orders" element={<MyOrders />} />

            {/* Authentication Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />

            {/* Category Pages */}
            <Route path="/mobile-games" element={<MobileGames />} />
            <Route path="/pc-games" element={<PCGames />} />
            <Route path="/top-up-games" element={<TopUpGames />} />
            <Route path="/gift-cards" element={<GiftCards />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/ai-tools" element={<AiTools />} />

            {/* Mobile Games Routes */}
            <Route
              path="/mobile-games/mobile-legends"
              element={<MobileLegends />}
            />
            <Route path="/mobile-games/pubg-mobile" element={<PUBGMobile />} />
            <Route path="/mobile-games/free-fire" element={<FreeFire />} />
            <Route
              path="/mobile-games/genshin-impact"
              element={<GenshinImpact />}
            />

            {/* PC Games Routes */}
            <Route path="/pc-games/valorant" element={<Valorant />} />

            {/* Gift Cards Routes */}
            <Route path="/gift-cards/steam-wallet" element={<SteamWallet />} />
            <Route path="/gift-cards/google-play" element={<GooglePlay />} />
            <Route path="/gift-cards/playstation" element={<PlayStation />} />
            <Route path="/gift-cards/valorant" element={<ValorantGiftCard />} />
            <Route path="/gift-cards/itunes" element={<ITunes />} />
            <Route path="/gift-cards/amazon" element={<Amazon />} />
            <Route path="/gift-cards/apple" element={<Apple />} />
            <Route
              path="/gift-cards/discord-nitro"
              element={<DiscordNitro />}
            />
            <Route path="/gift-cards/gamestop" element={<GameStop />} />
            <Route path="/gift-cards/roblox" element={<Roblox />} />
            <Route path="/gift-cards/spotify" element={<Spotify />} />

            {/* AI Tools Routes */}
            <Route path="/ai-tools/chatgpt" element={<ChatGPT />} />
            <Route path="/ai-tools/proplexity" element={<Proplexity />} />
            <Route path="/ai-tools/claude" element={<Claude />} />
            <Route path="/ai-tools/grok" element={<Grok />} />
            <Route path="/ai-tools/gemini" element={<Gemini />} />
            <Route path="/ai-tools/github" element={<Github />} />
            <Route path="/ai-tools/cursor" element={<Cursor />} />
            <Route path="/ai-tools/windsurf" element={<Windsurf />} />

            {/* Subscriptions Routes */}
            <Route path="/subscriptions/netflix" element={<Netflix />} />
            <Route
              path="/subscriptions/amazon-prime"
              element={<AmazonPrime />}
            />
            <Route path="/subscriptions/apple-music" element={<AppleMusic />} />
            <Route path="/subscriptions/apple-tv" element={<AppleTV />} />
            <Route path="/subscriptions/canva-pro" element={<CanvaPro />} />
            <Route path="/subscriptions/disney-plus" element={<DisneyPlus />} />
            <Route path="/subscriptions/duolingo" element={<Duolingo />} />
            <Route path="/subscriptions/zee5" element={<Zee5 />} />
            <Route path="/subscriptions/ullu" element={<Ullu />} />
            <Route path="/subscriptions/sonyliv" element={<SonyLiv />} />
            <Route path="/subscriptions/capcut-pro" element={<CapCut />} />
            <Route path="/subscriptions/google-one" element={<GoogleOne />} />
            <Route path="/subscriptions/grammarly" element={<Grammarly />} />
            <Route path="/subscriptions/hulu" element={<Hulu />} />
            <Route path="/subscriptions/linkedin" element={<LinkedIn />} />
            <Route path="/subscriptions/office-365" element={<Office365 />} />
            <Route path="/subscriptions/photoshop" element={<Photoshop />} />
            <Route path="/subscriptions/shopify" element={<Shopify />} />
            <Route
              path="/subscriptions/youtube-premium"
              element={<YoutubePremium />}
            />
            <Route path="/subscriptions/zoom-pro" element={<ZoomPro />} />

            {/* Admin Panel Routes */}
            <Route path="/admin" element={<AdminGuard />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="products" element={<Products />} />
                <Route path="stock" element={<Stock />} />
                <Route path="users" element={<Users />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBubble />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
