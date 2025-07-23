import { Button } from "@/components/ui/button";
import { ArrowRight, Gamepad2, CreditCard, Gift } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-gradient-retro py-16 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-pixel text-4xl md:text-6xl text-white mb-6 drop-shadow-lg">
            Level Up Your Gaming
          </h1>
          <p className="font-sans text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Bangladesh's premier destination for game top-ups, digital gift cards, 
            and gaming subscriptions. Get instant delivery and the best prices!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="retro" size="lg" className="text-lg">
              <Gamepad2 className="w-5 h-5" />
              Browse Games
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-foreground text-lg">
              <Gift className="w-5 h-5" />
              Gift Cards
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="font-pixel text-3xl text-white mb-2">1000+</div>
              <div className="font-sans text-white/90">Happy Gamers</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="font-pixel text-3xl text-white mb-2">50+</div>
              <div className="font-sans text-white/90">Supported Games</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="font-pixel text-3xl text-white mb-2">24/7</div>
              <div className="font-sans text-white/90">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;