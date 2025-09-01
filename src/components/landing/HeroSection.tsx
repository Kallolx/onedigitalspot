import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { ArrowRight, Camera } from "lucide-react";

import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import SearchComponent from "../custom/SearchComponent";

const fetchHeroBanners = async () => {
  const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const HERO_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_BANNER_ID;
  if (!DATABASE_ID || !HERO_COLLECTION_ID) return [];
  try {
    const res = await databases.listDocuments(DATABASE_ID, HERO_COLLECTION_ID, [
      Query.orderAsc("order"),
    ]);
    return res.documents.map((d: any) => {
      // Cloudinary upload responses or admin save may store the URL under different keys.
      const imageUrl =
        d.imageUrl ||
        d.url ||
        d.secure_url ||
        d.image?.secure_url ||
        d.asset?.secure_url ||
        d.imageUrlSecure ||
        (d.fields && (d.fields.imageUrl || d.fields.url)) ||
        "";

      if (!imageUrl) console.warn("Hero banner document has no image URL:", d);

      return { imageDesktop: imageUrl, title: d.title || d.name || "" };
    });
  } catch (err) {
    console.error("Error fetching hero banners:", err);
    return [];
  }
};

const HeroSection = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const { data: dynamicSlides = [] } = useQuery<any[], Error>({
    queryKey: ["hero-banners-public"],
    queryFn: fetchHeroBanners,
  });

  React.useEffect(() => {
    // Helpful debug log when slides are fetched; remove in production if noisy.
    console.debug("HeroSection - dynamicSlides:", dynamicSlides);
  }, [dynamicSlides]);

  const [loadStatus, setLoadStatus] = React.useState<Record<number, string>>(
    {}
  );

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
                    src="/assets/only-icon-green.svg"
                    alt="onedigitalspot"
                    className="h-8 lg:h-10 mt-1 lg:mt-2 flex-shrink-0"
                  />
                  <span className="whitespace-nowrap">Platform for</span>
                  <span className="whitespace-nowrap text-secondary">all</span>
                </h1>
                <h1 className="flex flex-wrap gap-2 text-3xl lg:text-5xl xl:text-5xl font-semibold tracking-tighter text-black mb-2 text-left leading-tight">
                  <span className="text-secondary whitespace-nowrap">
                    Digital
                  </span>{" "}
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
                              src="/assets/icons/social/facebook.svg"
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
                              src="/assets/icons/social/instagram.svg"
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
                              src="/assets/icons/social/tiktok.svg"
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
                              src="/assets/icons/social/whatsapp.svg"
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
                  <SearchComponent className="w-full" />
                </div>
              </div>
            </div>
            {/* Right: Carousel section */}
            <div className="w-full md:w-3/5 h-full flex items-center grow-1250 pt-0 md:pt-8">
              <div className="w-full h-full">
                {dynamicSlides.length > 0 ? (
                  <Carousel
                    setApi={setApi}
                    className="w-full h-full rounded-xl overflow-hidden"
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                  >
                    <CarouselContent className="pt-4 md:pt-0 h-full">
                      {dynamicSlides.map((slide, index) => (
                        <CarouselItem key={index} className="pl-4 h-full">
                          <Card className="relative overflow-hidden rounded-lg md:rounded-xl  h-full">
                            <img
                              src={slide.imageDesktop}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onLoad={() =>
                                setLoadStatus((prev) => ({
                                  ...prev,
                                  [index]: "ok",
                                }))
                              }
                              onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                console.warn(
                                  "Hero image failed to load, falling back:",
                                  img.src
                                );
                                setLoadStatus((prev) => ({
                                  ...prev,
                                  [index]: "error",
                                }));
                                img.onerror = null;
                                img.src = "/assets/banners/welcome.avif";
                              }}
                            />
                            {/* Gradient overlay for better text contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                ) : (
                                     // Custom skeleton loader with image placeholder and pulsing animation
                   <div className="w-full h-full md:h-[320px] pt-4 md:pt-0">
                     <div className="w-full h-full rounded-lg md:rounded-xl overflow-hidden bg-muted-foreground/20 relative flex items-center justify-center animate-pulse">
                       {/* Image placeholder icon */}
                       <div className="text-muted-foreground/40">
                           <img src="/assets/only-icon-green.svg" alt="Hero placeholder" className="h-10" />
                       </div>
                     </div>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
