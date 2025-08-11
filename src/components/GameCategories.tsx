
import CategorySwiper from "@/components/CategorySwiper";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import {
  mobileGames,
  pcGames,
  giftCards,
  subscriptions,
  ProductivityCards,
  aiTools,
} from "@/lib/products";

// Collect all products from all categories
const allProducts = [
  ...mobileGames,
  ...pcGames,
  ...giftCards,
  ...subscriptions,
  ...ProductivityCards,
  ...aiTools,
];

// Filter popular products
const popularProducts = allProducts.filter((item) => item.popular);

const GameCategories = () => (
  <section className="bg-background mt-2">
    <div className="container px-4 md:px-6">
      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <div className="pt-6 md:pt-4">
          <div className="flex items-center justify-between md:mb-2">
            <div className="flex items-center gap-2">
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
      <div>
        <div className="flex items-center justify-between md:mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
              AI Tools
            </h2>
          </div>
          <a href="/ai-tools">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-4">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
        <CategorySwiper
          items={aiTools}
          isSubscription={true}
          navigationPrevClass=".swiper-ai-prev"
          navigationNextClass=".swiper-ai-next"
        />
      </div>

      {/* Subscriptions */}
      <div>
        <div className="flex items-center justify-between md:mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
              Subscriptions
            </h2>
          </div>
          <a href="/subscriptions">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-4">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
        <CategorySwiper
          items={subscriptions}
          isSubscription={true}
          navigationPrevClass=".swiper-sub-prev"
          navigationNextClass=".swiper-sub-next"
        />
      </div>

      {/* Productivity */}
      <div>
        <div className="flex items-center justify-between md:mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
              Design & Productivity
            </h2>
          </div>
          <a href="/productivity">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-4">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
        <CategorySwiper
          items={ProductivityCards}
          isSubscription={true}
          navigationPrevClass=".swiper-sub-prev"
          navigationNextClass=".swiper-sub-next"
        />
      </div>


      {/* Gift Cards */}
      <div>
        <div className="flex items-center justify-between md:mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
              Gift Cards
            </h2>
          </div>
          <a href="/gift-cards">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-4">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
        <CategorySwiper
          items={giftCards}
          navigationPrevClass=".swiper-gift-prev"
          navigationNextClass=".swiper-gift-next"
        />
      </div>

      {/* Mobile Games */}
      <div>
        <div className="flex items-center justify-between md:mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
              Mobile Games
            </h2>
          </div>
          <a href="/mobile-games">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-4">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
        <CategorySwiper
          items={mobileGames}
          navigationPrevClass=".swiper-mobile-prev"
          navigationNextClass=".swiper-mobile-next"
        />
      </div>

      {/* PC & Console Games */}
      <div>
        <div className="flex items-center justify-between md:mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold font-pixel tracking-tighter">
              PC & Console Games
            </h2>
          </div>
          <a href="/pc-games">
            <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-4">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
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
