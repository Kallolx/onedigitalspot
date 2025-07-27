
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import * as React from "react";


const heroSlides = [
  {
    image: "/src/assets/roblox-banner.jpg",
    title: "Roblox",
    discount: "70% OFF"
  },
  {
    image: "/src/assets/pubg-mobile.jpg",
    title: "PUBG Mobile",
    discount: "50% OFF"
  },
  {
    image: "/src/assets/mobile-legends.jpg",
    title: "Mobile Legends",
    discount: "30% OFF"
  }
];

const HeroSection = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  React.useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 3500); // 3.5 seconds per slide
    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="w-full bg-background md:py-8">
      <div className="md:container px-4">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="pt-8 md:pt-0">
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index} className="pl-4">
                <Card className="relative overflow-hidden rounded-lg md:rounded-xl border border-border/50 md:border-2">
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className="h-[200px] md:h-[400px] w-full object-cover"
                  />
                  {slide.discount && (
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-full font-pixel text-xs md:text-sm">
                      {slide.discount}
                    </div>
                  )}
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default HeroSection;