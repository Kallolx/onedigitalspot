import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MainLayout from "./layouts/MainLayout";
import NotFound from "./pages/NotFound";
import MobileGames from "./pages/routes/MobileGames";
import PCGames from "./pages/routes/PcGames";
import GiftCards from "./pages/routes/GiftCards";
import AiTools from "./pages/routes/AiTools";
import MyOrders from "./pages/MyOrders";
import MyProfile from "./pages/MyProfile";
import EmailTest from "./pages/EmailTest";
import MobileLegends from "./Products/game-details/mobile-games/MobileLegends";
import PUBGMobile from "./Products/game-details/mobile-games/PUBGMobile";
import Valorant from "./Products/game-details/pc-games/Valorant";
import SteamWallet from "./Products/gift-cards/SteamWallet";
import GooglePlay from "./Products/gift-cards/GooglePlay";
import PlayStation from "./Products/gift-cards/PlayStation";
import ValorantGiftCard from "./Products/gift-cards/Valorant";
import ITunes from "./Products/gift-cards/Apple";
import Amazon from "./Products/gift-cards/Amazon";
import Apple from "./Products/gift-cards/Apple";
import DiscordNitro from "./Products/gift-cards/DiscordNitro";
import GameStop from "./Products/gift-cards/GameStop";
import Roblox from "./Products/gift-cards/Roblox";
import SpotifyGiftCard from "./Products/gift-cards/Spotify";
import SpotifySubscription from "./Products/subscriptions/Spotify";
import ChatGPT from "./Products/ai-tools/ChatGPT";
import Netflix from "./Products/subscriptions/Netflix";
import Login from "./auth/login";
import Signup from "./auth/signup";
import ForgotPasswordPage from "./auth/forgot";
import ResetPasswordPage from "./auth/reset-password";
import AdminGuard from "./admin/AdminGuard";
import RequireAuth from "./admin/RequireAuth";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import Orders from "./admin/Orders";
import Products from "./admin/Products";
import ReviewsManagement from "./admin/ReviewsManagement";
import Users from "./admin/Users";
import Subscriptions from "./pages/routes/Subscriptions";
import Settings from "./admin/Settings";
const AdminHeroBanners = React.lazy(() => import("./admin/HeroBanners"));
import GenshinImpact from "./Products/game-details/mobile-games/GenshinImpact";
import CodMobile from "./Products/game-details/mobile-games/CodMobile";
import FreeFire from "./Products/game-details/mobile-games/FreeFire";
import Proplexity from "./Products/ai-tools/Proplexity";
import Claude from "./Products/ai-tools/Claude";
import Grok from "./Products/ai-tools/Grok";
import Gemini from "./Products/ai-tools/Gemini";
import Github from "./Products/ai-tools/Github";
import Cursor from "./Products/ai-tools/Cursor";
import Windsurf from "./Products/ai-tools/Windsurf";
import AppleMusic from "./Products/subscriptions/AppleMusic";
import AmazonPrime from "./Products/subscriptions/AmazonPrime";
import AppleTV from "./Products/subscriptions/AppleTV";
import CanvaPro from "./Products/design/CanvaPro";
import DisneyPlus from "./Products/subscriptions/DisneyPlus";
import Duolingo from "./Products/design/Duolingo";
import Zee5 from "./Products/subscriptions/Zee5";
import Ullu from "./Products/subscriptions/Ullu";
import SonyLiv from "./Products/subscriptions/SonyLiv";
import CapCut from "./Products/design/CapCut";
import GoogleOne from "./Products/design/GoogleOne";
import Grammarly from "./Products/design/Grammerly";
import Hulu from "./Products/subscriptions/Hulu";
import LinkedIn from "./Products/design/LinkedIn";
import Office365 from "./Products/design/Office365";
import Photoshop from "./Products/design/Photoshop";
import YoutubePremium from "./Products/subscriptions/YoutubePremium";
import ZoomPro from "./Products/design/ZoomPro";
import Productivity from "./pages/routes/Productivity";
import TawkToWidget from "./components/custom/TawkToWidget";
import CookieConsent from "@/components/consent/CookieConsent";
import DeltaForce from "./Products/game-details/mobile-games/DeltaForce";
import BloodStrike from "./Products/game-details/mobile-games/BloodStrike";
import ClashOfClans from "./Products/game-details/mobile-games/ClashOfClans";
import ClashRoyale from "./Products/game-details/mobile-games/ClashRoyale";
import BrawlStars from "./Products/game-details/mobile-games/BrawlStars";
import Standoff2 from "./Products/game-details/mobile-games/Standoff2";
import WutheringWaves from "./Products/game-details/mobile-games/WutheringWaves";
import Efootball from "./Products/game-details/mobile-games/Efootball";
import FifaMobile from "./Products/game-details/mobile-games/FifaMobile";
import RobloxGame from "./Products/game-details/mobile-games/RobloxGame";
import { PerformanceOptimization } from "@/components/custom/PerformanceOptimization";
import AllProducts from "./pages/routes/AllProducts";
import ContactUs from "./pages/ContactUs";
import RefundPolicy from "./pages/RefundPolicy";
import ProductDelivery from "./pages/ProductDelivery";
import AltBalaji from "./Products/subscriptions/AltBalaji";
import HboMax from "./Products/subscriptions/HboMax";
import Crunchyroll from "./Products/subscriptions/Crunchyroll";
import UbisoftPlus from "./Products/subscriptions/Ubisoft";
import XboxGamePass from "./Products/subscriptions/Xbox";
import Quillbot from "./Products/design/Quillbot";
import Figma from "./Products/design/Figma";
import Notion from "./Products/design/Notion";
import Icloud from "./Products/design/Icloud";
import CodePen from "./Products/design/CodePen";
import NordVPN from "./Products/design/NordVPN";
import ExpressVPN from "./Products/design/ExpressVPN";
import TinderPlus from "./Products/design/Tinder";
import Bumble from "./Products/design/Bumble";
import TelegramStars from "./Products/design/Telegram";
import Checkout from "./pages/Checkout";
import CartPage from "./pages/Cart";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PerformanceOptimization />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
            <Route
              path="/auth/reset-password"
              element={<ResetPasswordPage />}
            />

            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/my-orders" element={<RequireAuth><MyOrders /></RequireAuth>} />
              <Route path="/my-profile" element={<RequireAuth><MyProfile /></RequireAuth>} />
              <Route path="/email-test" element={<EmailTest />} />

              {/* Category Pages */}
              <Route path="/mobile-games" element={<MobileGames />} />
              <Route path="/pc-games" element={<PCGames />} />
              <Route path="/gift-cards" element={<GiftCards />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/ai-tools" element={<AiTools />} />
              <Route path="/productivity" element={<Productivity />} />
              <Route path="/all-products" element={<AllProducts />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/product-delivery" element={<ProductDelivery />} />

              {/* Mobile Games Routes */}
              <Route
                path="/mobile-games/mobile-legends"
                element={<MobileLegends />}
              />
              <Route
                path="/mobile-games/pubg-mobile"
                element={<PUBGMobile />}
              />
              <Route path="/mobile-games/free-fire" element={<FreeFire />} />
              <Route
                path="/mobile-games/genshin-impact"
                element={<GenshinImpact />}
              />
              <Route path="/mobile-games/cod-mobile" element={<CodMobile />} />
              <Route
                path="/mobile-games/delta-force"
                element={<DeltaForce />}
              />
              <Route
                path="/mobile-games/blood-strike"
                element={<BloodStrike />}
              />
              <Route
                path="/mobile-games/clash-of-clans"
                element={<ClashOfClans />}
              />
              <Route
                path="/mobile-games/clash-royale"
                element={<ClashRoyale />}
              />
              <Route
                path="/mobile-games/brawl-stars"
                element={<BrawlStars />}
              />
              <Route path="/mobile-games/standoff-2" element={<Standoff2 />} />
              <Route
                path="/mobile-games/wuthering-waves"
                element={<WutheringWaves />}
              />
              <Route path="/mobile-games/roblox" element={<RobloxGame />} />
              <Route path="/mobile-games/efootball" element={<Efootball />} />
              <Route
                path="/mobile-games/fifa-mobile"
                element={<FifaMobile />}
              />

              {/* PC Games Routes */}
              <Route path="/pc-games/valorant" element={<Valorant />} />

              {/* Gift Cards Routes */}
              <Route
                path="/gift-cards/steam-wallet"
                element={<SteamWallet />}
              />
              <Route path="/gift-cards/google-play" element={<GooglePlay />} />
              <Route path="/gift-cards/playstation" element={<PlayStation />} />
              <Route
                path="/gift-cards/valorant"
                element={<ValorantGiftCard />}
              />
              <Route path="/gift-cards/itunes" element={<ITunes />} />
              <Route path="/gift-cards/amazon" element={<Amazon />} />
              <Route path="/gift-cards/apple" element={<Apple />} />
              <Route
                path="/gift-cards/discord-nitro"
                element={<DiscordNitro />}
              />
              <Route path="/gift-cards/gamestop" element={<GameStop />} />
              <Route path="/gift-cards/roblox" element={<Roblox />} />
              <Route path="/gift-cards/spotify" element={<SpotifyGiftCard />} />

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
              <Route
                path="/subscriptions/apple-music"
                element={<AppleMusic />}
              />
              <Route path="/subscriptions/apple-tv" element={<AppleTV />} />
              <Route path="/subscriptions/canva-pro" element={<CanvaPro />} />
              <Route
                path="/subscriptions/disney-plus"
                element={<DisneyPlus />}
              />
              <Route path="/subscriptions/duolingo" element={<Duolingo />} />
              <Route path="/subscriptions/zee5" element={<Zee5 />} />
              <Route path="/subscriptions/hbo-max" element={<HboMax />} />
              <Route path="/subscriptions/ullu" element={<Ullu />} />
              <Route path="/subscriptions/alt-balaji" element={<AltBalaji />} />
              <Route path="/subscriptions/sonyliv" element={<SonyLiv />} />
              <Route path="/subscriptions/capcut-pro" element={<CapCut />} />
              <Route path="/subscriptions/google-one" element={<GoogleOne />} />
              <Route path="/subscriptions/grammarly" element={<Grammarly />} />
              <Route path="/subscriptions/hulu" element={<Hulu />} />
              <Route path="/subscriptions/linkedin" element={<LinkedIn />} />
              <Route path="/subscriptions/office-365" element={<Office365 />} />
              <Route path="/subscriptions/photoshop" element={<Photoshop />} />
              <Route path="/subscriptions/spotify" element={<SpotifySubscription />} />
              <Route
                path="/subscriptions/crunchyroll"
                element={<Crunchyroll />}
              />
              <Route
                path="/subscriptions/xbox-game-pass"
                element={<XboxGamePass />}
              />
              <Route
                path="/subscriptions/ubisoft-plus"
                element={<UbisoftPlus />}
              />
              <Route path="/subscriptions/quillbot" element={<Quillbot />} />
              <Route path="/subscriptions/figma-pro" element={<Figma />} />
              <Route path="/subscriptions/notion-pro" element={<Notion />} />
              <Route path="/subscriptions/icloud-plus" element={<Icloud />} />
              <Route path="/subscriptions/codepen-pro" element={<CodePen />} />
              <Route path="/subscriptions/nordvpn" element={<NordVPN />} />
              <Route
                path="/subscriptions/expressvpn"
                element={<ExpressVPN />}
              />
              <Route
                path="/subscriptions/tinder-plus"
                element={<TinderPlus />}
              />
              <Route path="/subscriptions/bumble-plus" element={<Bumble />} />
              <Route
                path="/subscriptions/telegram-stars"
                element={<TelegramStars />}
              />

              <Route
                path="/subscriptions/youtube-premium"
                element={<YoutubePremium />}
              />
              <Route path="/subscriptions/zoom-pro" element={<ZoomPro />} />
            </Route>

            {/* Admin Panel Routes */}
            <Route path="/admin" element={<AdminGuard />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="products" element={<Products />} />
                <Route path="users" element={<Users />} />
                <Route path="reviews" element={<ReviewsManagement />} />
                <Route path="hero-banners" element={
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <AdminHeroBanners />
                  </React.Suspense>
                } />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
          <TawkToWidget />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
