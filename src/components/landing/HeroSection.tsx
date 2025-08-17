import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import * as React from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import SearchComponent from "../custom/SearchComponent";

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
  },
];

const heroSlides = [
  {
    imageDesktop: "/assets/banners/welcome.avif",
    title: "Welcome",
  },
  {
    imageDesktop: "/assets/banners/ai-promo.avif",
    title: "AI Promo",
  },
  {
    imageDesktop: "/assets/banners/tools-promo.avif",
    title: "Tools Promo",
  },
];

const HeroSection = () => {
  const [api, setApi] = React.useState<CarouselApi>();

  React.useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="w-full md:py-4">
      <div className="md:container px-4">
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          {/* Aspect ratio wrapper for both columns */}
          <div className="w-full flex aspect-[2/1] max-h-[400px]">

            <div className="hide-1250 hidden md:flex p-2 w-2/5 h-full">
              <div className="w-full h-full rounded-xl flex flex-col -ml-8 justify-center items-start px-4 lg:px-8">
                <h1 className="flex flex-wrap gap-2 text-3xl lg:text-5xl xl:text-5xl font-semibold tracking-tighter text-black mb-2 text-left leading-tight">
                  <img
                    src="/assets/only-icon.svg"
                    alt="onedigitalspot"
                    className="h-8 lg:h-10 mt-1 lg:mt-2 flex-shrink-0"
                  />
                  <span className="whitespace-nowrap">Platform for all</span>{" "}
                </h1>
                <h1 className="flex flex-wrap gap-2 text-3xl lg:text-5xl xl:text-5xl font-semibold tracking-tighter text-black mb-2 text-left leading-tight">
                  <span className="text-secondary whitespace-nowrap">Digital</span>{" "}
                  <span className="whitespace-nowrap">Products</span>
                </h1>
                <p className="text-sm lg:text-base tracking-tight leading-tight text-muted-foreground mb-4 lg:mb-5 text-left max-w-sm lg:max-w-md mt-2">
                  Buy digital products in{" "}
                  <span className="text-secondary underline">Bangladesh</span>{" "}
                  using bKash, Nagad, Rocket & more Fast, Easy & Reliable!
                </p>
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 mb-3 lg:mb-4 w-full">
                  <a href="/all-products">
                    <Button
                      variant="default"
                      className="px-4 lg:px-6 py-2 lg:py-3 text-white text-sm lg:text-md font-bold"
                    >
                      Explore
                      <ArrowRight className="w-4 lg:w-5 h-4 lg:h-5 text-white ml-1" />
                    </Button>
                  </a>
                  <TooltipProvider>
                    <div className="flex items-center gap-2 lg:gap-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href="https://facebook.com/oneditialspot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform"
                          >
                            <img
                              src="/assets/facebook.svg"
                              alt="Facebook"
                              className="w-8 lg:w-10 h-8 lg:h-10"
                            />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>@oneditialspot</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href="https://instagram.com/oneditialspot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform"
                          >
                            <img
                              src="/assets/instagram.svg"
                              alt="Instagram"
                              className="w-8 lg:w-10 h-8 lg:h-10"
                            />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>@oneditialspot</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href="https://tiktok.com/@oneditialspot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform"
                          >
                            <img
                              src="/assets/tiktok.svg"
                              alt="TikTok"
                              className="w-8 lg:w-10 h-8 lg:h-10"
                            />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>@oneditialspot</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href="https://whatsapp.com/@oneditialspot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform"
                          >
                            <img
                              src="/assets/whatsapp.svg"
                              alt="WhatsApp"
                              className="w-8 lg:w-10 h-8 lg:h-10"
                            />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>@oneditialspot</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
                {/* Add search input and button below */}
                <div className="mt-1 lg:mt-2 w-full max-w-sm lg:max-w-md">
                  <SearchComponent
                    placeholder="Search any products..."
                    className="w-full"
                  />
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
                        <Card className="relative overflow-hidden rounded-lg md:rounded-xl  h-full">
                          <img
                            src={slide.imageDesktop}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
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
