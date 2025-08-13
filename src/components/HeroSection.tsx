import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import * as React from "react";
import {
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  SearchIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { AvatarCircles } from "@/components/ui/AvatarCircles";
import { Input } from "./ui/input";
import { SearchCircleIcon } from "hugeicons-react";

const avatars = [
  {
    imageUrl: "https://avatars.githubusercontent.com/u/16860528",
    profileUrl: "https://github.com/dillionverma",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/20110627",
    profileUrl: "https://github.com/tomonarifeehan",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/106103625",
    profileUrl: "https://github.com/BankkRoll",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/59228569",
    profileUrl: "https://github.com/safethecode",
  }
];

const heroSlides = [
  {
    imageDesktop: "/assets/1.png",
    title: "Roblox",
    discount: "70% OFF",
  },
  {
    imageDesktop: "/assets/2.png",
    title: "PUBG Mobile",
    discount: "50% OFF",
  },
  {
    imageDesktop: "/assets/3.png",
    title: "Mobile Legends",
    discount: "30% OFF",
  },
];

const HeroSection = () => {
  const [api, setApi] = React.useState<CarouselApi>();

  React.useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="w-full bg-background md:py-4">
      <div className="md:container px-4">
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          {/* Aspect ratio wrapper for both columns */}
          <div className="w-full flex aspect-[2/1] max-h-[400px]">
            <div className="hide-1250 hidden md:flex p-2 w-2/5 h-full">
              <div className="w-full h-full rounded-xl flex flex-col -ml-8 justify-center items-start px-8">
                <h1 className="flex gap-2 text-5xl font-semibold tracking-tighter text-black mb-2 text-left">
                  <img
                    src="/assets/only-icon.svg"
                    alt="onedigitalspot"
                    className="h-10 mt-2"
                  />
                  Stop Platform for
                </h1>
                <h1 className="flex gap-2 text-5xl font-semibold tracking-tighter text-black mb-2 text-left">
                  <span className="text-secondary">All Digital</span> Products
                </h1>
                <p className="text-base tracking-tight leading-tighter md:text-lg text-muted-foreground mb-5 text-left max-w-md mt-2">
                  Buy digital products in{" "}
                  <span className="text-green-600 underline">Bangladesh</span>{" "}
                  using bKash, Nagad, Rocket & more Fast, Easy & Reliable!
                </p>
                <div className="flex items-center gap-8 mb-4">
                  <Button
                    variant="default"
                    className="px-6 py-3 text-white text-md font-bold"
                  >
                    Explore
                    <ArrowRight className="w-5 h-5 text-white" />
                  </Button>
                  <div className="flex items-center mt-2 gap-2">
                    <AvatarCircles numPeople={99} avatarUrls={avatars} />
                    <h1 className="text-sm font-medium text-muted-foreground hover:underline cursor-pointer">
                      Join <br /> Community
                    </h1>
                  </div>
                </div>
                {/* Add search input and button below */}
                <div className="relative mt-2 w-full max-w-md">
                  <Input
                    type="text"
                    placeholder="Search any products..."
                    className="flex-1 h-12 rounded-full border border-secondary/40 pl-4"
                  />
                  <button className="absolute right-1 top-1  text-white p-2 font-semibold rounded-full transition active:scale-90 focus:outline-none">
                    <SearchIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            {/* Right: Carousel section */}
            <div className="w-full md:w-3/5 h-full flex items-center grow-1250 pt-0 md:pt-8">
              <div className="w-full h-full">
                <Carousel
                  setApi={setApi}
                  className="w-full h-full rounded-xl overflow-hidden"
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                >
                  <CarouselContent className="pt-4 md:pt-0 h-full">
                    {heroSlides.map((slide, index) => (
                      <CarouselItem key={index} className="pl-4 h-full">
                        <Card className="relative overflow-hidden rounded-lg md:rounded-xl border border-border/50 md:border-2 group h-full">
                          <img
                            src={slide.imageDesktop}
                            alt={slide.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {slide.discount && (
                            <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full font-pixel text-xs md:text-sm animate-pulse">
                              {slide.discount}
                            </div>
                          )}
                          {/* Gradient overlay for better text contrast */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
