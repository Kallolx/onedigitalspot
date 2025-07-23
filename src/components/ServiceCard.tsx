import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ServiceCardProps {
  title: string;
  image: string;
  price?: string;
  rating?: number;
  category: string;
  buttonText?: string;
  isTopup?: boolean;
}

const ServiceCard = ({ 
  title, 
  image, 
  price, 
  rating = 5, 
  category, 
  buttonText = "Buy Now",
  isTopup = false 
}: ServiceCardProps) => {
  return (
    <Card className="bg-card border-2 border-border shadow-card hover:shadow-retro transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 px-2 py-1 rounded-md">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-3 h-3 ${i < rating ? 'fill-retro-yellow text-retro-yellow' : 'text-muted-foreground'}`} 
            />
          ))}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-sans font-bold text-lg text-foreground mb-2 line-clamp-2">
          {title}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-sans">
            {category}
          </span>
          {price && (
            <span className="font-pixel text-sm text-primary">
              ৳{price}
            </span>
          )}
        </div>
        
        <Button 
          variant={isTopup ? "retro" : "default"} 
          className="w-full font-sans font-semibold"
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  );
};

export default ServiceCard;