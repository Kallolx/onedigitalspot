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
import Subscriptions from "./pages/Subscriptions";
import AiTools from "./pages/AiTools";
import MobileLegends from "@/game-details/mobile-games/MobileLegends";
import PUBGMobile from "@/game-details/mobile-games/PUBGMobile";
import SteamWallet from "./gift-cards/SteamWallet";
import ChatGPT from "./ai-tools/ChatGPT";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mobile-games" element={<MobileGames />} />
          <Route path="/pc-games" element={<PCGames />} />
          <Route path="/top-up-games" element={<TopUpGames />} />
          <Route path="/gift-cards" element={<GiftCards />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/ai-tools" element={<AiTools />} />
          <Route path="/mobile-games/mobile-legends" element={<MobileLegends />} />
          <Route path="/mobile-games/pubg-mobile" element={<PUBGMobile />} />
          <Route path="/gift-cards/steam-wallet" element={<SteamWallet />} />
          <Route path="/ai-tools/chatgpt" element={<ChatGPT />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ChatBubble />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
