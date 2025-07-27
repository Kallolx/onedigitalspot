import ServiceCard from "@/components/ServiceCard";

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import {
  mobileGames,
  pcGames,
  topUpCards,
  giftCards,
  subscriptions,
} from "@/lib/producs";


const GameCategories = () => (
  <section className="py-6 md:py-12 space-y-8 md:space-y-16 bg-background">
    <div className="container px-4 md:px-6">
      {/* Top Up Cards */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel">
            Quick Top Up
          </h2>
          <a href="/top-up-games">      
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex h-8 px-2 lg:px-4"
          >
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {topUpCards.slice(0, 4).map((card, idx) => (
            <ServiceCard key={idx} {...card} />
          ))}
        </div>
      </div>

      
      {/* Mobile Games */}
      <div  className="pt-8 md:pt-16">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel">
            Mobile Games
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex h-8 px-2 lg:px-4"
          >
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {mobileGames.slice(0, 4).map((game, idx) => (
            <ServiceCard key={idx} {...game} />
          ))}
        </div>
      </div>
     
      {/* PC & Console Games */}
      <div className="pt-8 md:pt-16">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel">
            PC & Console Games
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex h-8 px-2 lg:px-4"
          >
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {pcGames.slice(0, 4).map((game, idx) => (
            <ServiceCard key={idx} {...game} />
          ))}
        </div>
      </div>

      {/* Gift Cards */}
      <div className="pt-8 md:pt-16">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel">
            Gift Cards
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex h-8 px-2 lg:px-4"
          >
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {giftCards.slice(0, 4).map((card, idx) => (
            <ServiceCard key={idx} {...card} />
          ))}
        </div>
      </div>

      {/* Subscriptions */}
      <div className="pt-8 md:pt-16">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel">
            Popular Subscriptions
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex h-8 px-2 lg:px-4"
          >
            See All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {subscriptions.slice(0, 4).map((sub, idx) => (
            <ServiceCard key={idx} {...sub} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default GameCategories;
