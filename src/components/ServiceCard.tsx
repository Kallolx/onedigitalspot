import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ServiceCardProps {
  title: string;
  image: string;
  price?: string;
  rating?: number;
  category: string;
  buttonText?: string;
  isTopup?: boolean;
  isSubscription?: boolean;
  route?: string;
  popular?: boolean;
}

const ServiceCard = ({ 
  title, 
  image, 
  price, 
  rating = 5,  
  buttonText = "Buy Now",
  isTopup = false,
  route,
  }: ServiceCardProps) => {
  const navigate = useNavigate();

  // Utility to convert English digits to Bangla digits
  const toBanglaNumber = (num: string | number) => {
    const en = "0123456789";
    const bn = "০১২৩৪৫৬৭৮৯";
    // Format with commas (Indian system)
    const formatted = Number(num).toLocaleString("en-IN");
    // Convert to Bangla digits
    return formatted
      .split("")
      .map((c) => (en.includes(c) ? bn[en.indexOf(c)] : c))
      .join("");
  };

  return (
    <Card
      className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xs bg-card border-2 border-border shadow-card hover:shadow-retro transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer"
      onClick={() => route && navigate(route)}
    >
      <div className="relative aspect-square w-full bg-white flex items-center justify-center overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-contain"
        />
        <div className="absolute top-4 left-2 gap-1 px-2 py-1 rounded-md hidden sm:flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < rating ? 'fill-retro-yellow text-retro-yellow' : 'text-muted-foreground'}`} 
            />
          ))}
        </div>
      </div>
      <div className="p-2 sm:p-3 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-sans font-bold text-sm sm:text-base lg:text-lg text-foreground line-clamp-2 leading-tight tracking-tighter max-w-[70%]">
            {title}
          </h3>
          {price && (
            <div className="text-right ml-2 flex flex-col items-end">          
              <span className="font-anekbangla text-lg md:text-xl font-bold text-secondary flex items-center gap-1">
                ৳{toBanglaNumber(price)}
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