import CategorySwiper from "@/components/CategorySwiper";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  mobileGames,
  pcGames,
  giftCards,
  subscriptions,
  productivity,
  aiTools,
} from "@/lib/products";

import Lottie from "lottie-react";
import fireAnimation from "./assets/animated/fire.json";
import aiAnimation from "./assets/animated/ai.json";
import designAnimation from "./assets/animated/design.json";
import giftAnimation from "./assets/animated/gift.json";
import mobileAnimation from "./assets/animated/mobile.json";
import pcAnimation from "./assets/animated/pc.json";
import netflixAnimation from "./assets/animated/netflix.json";

// Collect all products from all categories
const allProducts = [
  ...mobileGames,
  ...pcGames,
  ...giftCards,
  ...subscriptions,
  ...productivity,
  ...aiTools,
];

// Filter popular products
const popularProducts = allProducts.filter((item) => item.popular);

const GameCategories = () => (
  <section className="bg-background">
    <div className="container px-4 md:px-6">
      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <div className="pt-6 md:pt-4 md:mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Lottie
                animationData={fireAnimation}
                loop={true}
                autoplay={true}
                style={{ width: 30, height: 30 }}
              />

              {/* Title */}
              <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
                Trending
              </h2>
            </div>
          </div>
          <CategorySwiper
            items={popularProducts}
            navigationPrevClass=".swiper-popular-prev"
            navigationNextClass=".swiper-popular-next"
          />
        </div>
      )}

      {/* AI Tools */}
      <div className="md:mb-4">
        <div className="flex items-center justify-between md:mb-2">
          <div className="flex items-center gap-2">
            {/* Fire Animation */}
            <Lottie
              animationData={aiAnimation}
              loop={true}
              autoplay={true}
              style={{ width: 30, height: 30 }}
            />

            {/* Title */}
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
              AI Tools
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* See All */}
            <a href="/ai-tools">
              <Button variant="link" size="sm" className="h-8 px-2 lg:px-4">
                See All
              </Button>
            </a>
            {/* Swiper Arrows */}
            <Button
              variant="ghost"
              size="sm"
              className="swiper-ai-prev h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="swiper-ai-next h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CategorySwiper
          items={aiTools}
          isSubscription={true}
          navigationPrevClass=".swiper-ai-prev"
          navigationNextClass=".swiper-ai-next"
        />
      </div>

      {/* Subscriptions */}
      <div className="md:mb-4">
        <div className="flex items-center justify-between md:mb-2">
          <div className="flex items-center gap-2">
            {/* Fire Animation */}
            <Lottie
              animationData={netflixAnimation}
              loop={true}
              autoplay={true}
              style={{ width: 40, height: 40 }}
            />

            {/* Title */}
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
              Subscriptions
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* See All */}
            <a href="/ai-tools">
              <Button variant="link" size="sm" className="h-8 px-2 lg:px-4">
                See All
              </Button>
            </a>

            {/* Swiper Arrows */}
            <Button
              variant="ghost"
              size="sm"
              className="swiper-sub-prev h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="swiper-sub-next h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CategorySwiper
          items={subscriptions}
          isSubscription={true}
          navigationPrevClass=".swiper-sub-prev"
          navigationNextClass=".swiper-sub-next"
        />
      </div>

      {/* Productivity */}
      <div className="md:mb-4">
        <div className="flex items-center justify-between md:mb-2">
          <div className="flex items-center gap-2">
            {/* Fire Animation */}
            <Lottie
              animationData={designAnimation}
              loop={true}
              autoplay={true}
              style={{ width: 30, height: 30 }}
            />

            {/* Title */}
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
              Productivity
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* See All */}
            <a href="/ai-tools">
              <Button variant="link" size="sm" className="h-8 px-2 lg:px-4">
                See All
              </Button>
            </a>

            {/* Swiper Arrows */}
            <Button
              variant="ghost"
              size="sm"
              className="swiper-prod-prev h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="swiper-prod-next h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CategorySwiper
          items={productivity}
          isSubscription={true}
          navigationPrevClass=".swiper-prod-prev"
          navigationNextClass=".swiper-prod-next"
        />
      </div>

      {/* Gift Cards */}
      <div className="md:mb-4">
        <div className="flex items-center justify-between md:mb-2">
          <div className="flex items-center gap-2">
            {/* Fire Animation */}
            <Lottie
              animationData={giftAnimation}
              loop={true}
              autoplay={true}
              style={{ width: 30, height: 30 }}
            />

            {/* Title */}
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
              Gift Cards
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* See All */}
            <a href="/ai-tools">
              <Button variant="link" size="sm" className="h-8 px-2 lg:px-4">
                See All
              </Button>
            </a>

            {/* Swiper Arrows */}
            <Button
              variant="ghost"
              size="sm"
              className="swiper-gift-prev h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="swiper-gift-next h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CategorySwiper
          items={giftCards}
          navigationPrevClass=".swiper-gift-prev"
          navigationNextClass=".swiper-gift-next"
        />
      </div>

      {/* Mobile Games */}
      <div className="md:mb-4">
        <div className="flex items-center justify-between md:mb-2">
          <div className="flex items-center gap-2">
            {/* Fire Animation */}
            <Lottie
              animationData={mobileAnimation}
              loop={true}
              autoplay={true}
              style={{ width: 30, height: 30 }}
            />

            {/* Title */}
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
              Mobile Games
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* See All */}
            <a href="/ai-tools">
              <Button variant="link" size="sm" className="h-8 px-2 lg:px-4">
                See All
              </Button>
            </a>

            {/* Swiper Arrows */}
            <Button
              variant="ghost"
              size="sm"
              className="swiper-mobile-prev h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="swiper-mobile-next h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CategorySwiper
          items={mobileGames}
          navigationPrevClass=".swiper-mobile-prev"
          navigationNextClass=".swiper-mobile-next"
        />
      </div>

      {/* PC & Console Games */}
      <div className="md:mb-4">
        <div className="flex items-center justify-between md:mb-2">
          <div className="flex items-center gap-2">
            {/* Fire Animation */}
            <Lottie
              animationData={pcAnimation}
              loop={true}
              autoplay={true}
              style={{ width: 30, height: 30 }}
            />

            {/* Title */}
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
              PC Games
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* See All */}
            <a href="/ai-tools">
              <Button variant="link" size="sm" className="h-8 px-2 lg:px-4">
                See All
              </Button>
            </a>

            {/* Swiper Arrows */}
            <Button
              variant="ghost"
              size="sm"
              className="swiper-pc-prev h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="swiper-pc-next h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CategorySwiper
          items={pcGames}
          navigationPrevClass=".swiper-pc-prev"
          navigationNextClass=".swiper-pc-next"
        />
      </div>
    </div>
  </section>
);

export default GameCategories;
