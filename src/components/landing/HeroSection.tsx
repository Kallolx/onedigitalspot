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
import SearchComponent from "../SearchComponent";

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
                  <span className="text-secondary underline">Bangladesh</span>{" "}
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
                  <TooltipProvider>
                    <div className="flex items-center gap-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href="https://facebook.com/oneditialspot"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src="/assets/facebook.svg"
                              alt="Facebook"
                              className="w-10 h-10"
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
                          >
                            <img
                              src="/assets/instagram.svg"
                              alt="Instagram"
                              className="w-10 h-10"
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
                          >
                            <img
                              src="/assets/tiktok.svg"
                              alt="TikTok"
                              className="w-10 h-10"
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
                          >
                            <img
                              src="/assets/whatsapp.svg"
                              alt="WhatsApp"
                              className="w-10 h-10"
                            />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>@oneditialspot</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
                {/* Add search input and button below */}
                <div className="mt-2 w-full max-w-md">
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
                            loading="lazy"
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
