import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mobileGames } from "@/lib/producs";

interface ServiceCardProps {
  title: string;
  image: string;
  price?: string;
  rating?: number;
  category: string;
  buttonText?: string;
  isTopup?: boolean;
  isSubscription?: boolean;
}

const ServiceCard = ({ 
  title, 
  image, 
  price, 
  rating = 5, 
  category, 
  buttonText = "Buy Now",
  isTopup = false,
  isSubscription = false
}: ServiceCardProps) => {
  const navigate = useNavigate();
  // Only mobile games have details for now
  const isMobileGame = category === "MOBA" || category === "Action" || category === "Battle Royale" || category === "Strategy" || category === "RPG" || category === "Sandbox" || category === "Sports";
  const handleClick = () => {
    if (isMobileGame) {
      // Find the index of the game in the mobileGames array
      const idx = mobileGames.findIndex(g => g.title === title);
      if (idx !== -1) {
        navigate(`/mobile-games/${idx}`);
      }
    }
  };
  return (
    <Card
      className="bg-card border-2 border-border shadow-card hover:shadow-retro transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative h-32 sm:h-36 md:h-40 lg:h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 px-2 py-1 rounded-md">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < rating ? 'fill-retro-yellow text-retro-yellow' : 'text-muted-foreground'}`} 
            />
          ))}
        </div>
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-sans font-bold text-sm sm:text-base lg:text-lg text-foreground line-clamp-2 leading-tight max-w-[70%]">
            {title}
          </h3>
          {price && (
            <div className="text-right ml-2">
              <span className="font-pixel text-md sm:text-xl md:text-xl text-primary font-bold">
                ৳{price}
                {isSubscription && (
                  <span className="text-xs sm:text-sm text-muted-foreground font-sans font-normal ml-1 align-middle">/month</span>
                )}
              </span>
            </div>
          )}
        </div>
        <Button 
          variant={isTopup ? "destructive" : "default"} 
          className="w-full font-sans font-semibold text-xs sm:text-sm mt-auto"
          size="sm"
          tabIndex={-1}
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  );
};

export default ServiceCard;