import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import {
  mobileGames,
  pcGames,
  topUpCards,
  giftCards,
  subscriptions,
  aiTools,
} from "@/lib/producs";

const GameCategories = () => (
  <section className="bg-background">
    <div className="container px-4 md:px-6">
      {/* Top Up Cards */}
      <div className="pt-8 md:pt-0">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
            Quick Top Up
          </h2>
          <a href="/top-up-games" className="hidden md:block">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-4">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {topUpCards.slice(0, 4).map((card, idx) => (
            <ServiceCard key={idx} {...card} />
          ))}
        </div>
        <a href="/top-up-games" className="block md:hidden mt-4">
          <Button variant="ghost" size="sm" className="w-full h-10">
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </a>
      </div>

      {/* AI Tools */}
      <div className="pt-8 md:pt-16">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
            AI Tools
          </h2>
          <a href="#" className="hidden md:block">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-4">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {aiTools.slice(0, 4).map((tool, idx) => (
            <ServiceCard key={idx} {...tool} isSubscription={true} />
          ))}
        </div>
        <a href="#" className="block md:hidden mt-4">
          <Button variant="ghost" size="sm" className="w-full h-10">
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </a>
      </div>

      {/* Mobile Games */}
      <div className="pt-8 md:pt-16">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
            Mobile Games
          </h2>
          <a href="#" className="hidden md:block">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-4">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {mobileGames.slice(0, 4).map((game, idx) => (
            <ServiceCard key={idx} {...game} />
          ))}
        </div>
        <a href="#" className="block md:hidden mt-4">
          <Button variant="ghost" size="sm" className="w-full h-10">
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </a>
      </div>

      {/* PC & Console Games */}
      <div className="pt-8 md:pt-16">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
            PC & Console Games
          </h2>
          <a href="#" className="hidden md:block">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-4">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {pcGames.slice(0, 4).map((game, idx) => (
            <ServiceCard key={idx} {...game} />
          ))}
        </div>
        <a href="#" className="block md:hidden mt-4">
          <Button variant="ghost" size="sm" className="w-full h-10">
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </a>
      </div>

      {/* Gift Cards */}
      <div className="pt-8 md:pt-16">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
            Gift Cards
          </h2>
          <a href="#" className="hidden md:block">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-4">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {giftCards.slice(0, 4).map((card, idx) => (
            <ServiceCard key={idx} {...card} />
          ))}
        </div>
        <a href="#" className="block md:hidden mt-4">
          <Button variant="ghost" size="sm" className="w-full h-10">
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </a>
      </div>

      {/* Subscriptions */}
      <div className="pt-8 md:pt-16">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
            Popular Subscriptions
          </h2>
          <a href="#" className="hidden md:block">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-4">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {subscriptions.slice(0, 4).map((sub, idx) => (
            <ServiceCard key={idx} {...sub} isSubscription={true} />
          ))}
        </div>
        <a href="#" className="block md:hidden mt-4">
          <Button variant="ghost" size="sm" className="w-full h-10">
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </a>
      </div>
    </div>
  </section>
);

export default GameCategories;
