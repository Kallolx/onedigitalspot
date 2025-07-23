import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, CreditCard, Gift, Zap, Star, Clock } from "lucide-react";

import mobileLegends from "@/assets/mobile-legends.jpg";
import pubgMobile from "@/assets/pubg-mobile.jpg";
import freeFire from "@/assets/free-fire.jpg";
import steamCard from "@/assets/steam-card.jpg";

const Index = () => {
  const popularGames = [
    { 
      title: "Mobile Legends: Bang Bang", 
      image: mobileLegends, 
      price: "150", 
      category: "MOBA Game", 
      rating: 5 
    },
    { 
      title: "PUBG Mobile UC", 
      image: pubgMobile, 
      price: "200", 
      category: "Battle Royale", 
      rating: 5 
    },
    { 
      title: "Free Fire Diamonds", 
      image: freeFire, 
      price: "100", 
      category: "Battle Royale", 
      rating: 4 
    },
    { 
      title: "Steam Wallet Code", 
      image: steamCard, 
      price: "500", 
      category: "Gift Card", 
      rating: 5 
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Services Tabs */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="font-pixel text-3xl text-foreground mb-4">Our Services</h2>
            <p className="font-sans text-lg text-muted-foreground">
              Everything you need for the ultimate gaming experience
            </p>
          </div>

          <Tabs defaultValue="topup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted shadow-card border-2 border-border">
              <TabsTrigger value="topup" className="font-sans font-semibold data-[state=active]:shadow-button">
                <Gamepad2 className="w-4 h-4 mr-2" />
                Top-Up
              </TabsTrigger>
              <TabsTrigger value="games" className="font-sans font-semibold data-[state=active]:shadow-button">
                <Zap className="w-4 h-4 mr-2" />
                Games
              </TabsTrigger>
              <TabsTrigger value="giftcards" className="font-sans font-semibold data-[state=active]:shadow-button">
                <Gift className="w-4 h-4 mr-2" />
                Gift Cards
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="font-sans font-semibold data-[state=active]:shadow-button">
                <CreditCard className="w-4 h-4 mr-2" />
                Subscriptions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="topup" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularGames.slice(0, 3).map((game, index) => (
                  <ServiceCard 
                    key={index}
                    {...game} 
                    isTopup={true}
                    buttonText="Top Up Now"
                  />
                ))}
                <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/50">
                  <div className="text-center">
                    <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-sans text-muted-foreground mb-4">50+ More Games</p>
                    <Button variant="outline">View All</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="games" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularGames.map((game, index) => (
                  <ServiceCard 
                    key={index}
                    {...game} 
                    buttonText="Buy Game"
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="giftcards" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ServiceCard 
                  title="Steam Wallet Code"
                  image={steamCard}
                  price="500"
                  category="Digital Card"
                  buttonText="Buy Card"
                />
                <ServiceCard 
                  title="Google Play Gift Card"
                  image={steamCard}
                  price="300"
                  category="Digital Card"
                  buttonText="Buy Card"
                />
                <ServiceCard 
                  title="iTunes Gift Card"
                  image={steamCard}
                  price="400"
                  category="Digital Card"
                  buttonText="Buy Card"
                />
                <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/50">
                  <div className="text-center">
                    <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-sans text-muted-foreground mb-4">More Cards</p>
                    <Button variant="outline">View All</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscriptions" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-card border-2 border-border shadow-card rounded-lg p-6">
                  <h3 className="font-sans font-bold text-lg mb-2">Netflix Premium</h3>
                  <p className="text-muted-foreground mb-4">1 Month Subscription</p>
                  <div className="font-pixel text-xl text-primary mb-4">৳800</div>
                  <Button className="w-full">Subscribe</Button>
                </div>
                <div className="bg-card border-2 border-border shadow-card rounded-lg p-6">
                  <h3 className="font-sans font-bold text-lg mb-2">Spotify Premium</h3>
                  <p className="text-muted-foreground mb-4">1 Month Subscription</p>
                  <div className="font-pixel text-xl text-primary mb-4">৳600</div>
                  <Button className="w-full">Subscribe</Button>
                </div>
                <div className="bg-card border-2 border-border shadow-card rounded-lg p-6">
                  <h3 className="font-sans font-bold text-lg mb-2">YouTube Premium</h3>
                  <p className="text-muted-foreground mb-4">1 Month Subscription</p>
                  <div className="font-pixel text-xl text-primary mb-4">৳450</div>
                  <Button className="w-full">Subscribe</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Features */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="font-pixel text-3xl text-foreground mb-4">Why Choose LootBox?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-card border-2 border-border shadow-card rounded-lg">
              <Zap className="w-12 h-12 text-retro-mint mx-auto mb-4" />
              <h3 className="font-sans font-bold text-lg mb-2">Instant Delivery</h3>
              <p className="text-muted-foreground">Get your top-ups and codes delivered instantly to your account</p>
            </div>
            <div className="text-center p-6 bg-card border-2 border-border shadow-card rounded-lg">
              <Star className="w-12 h-12 text-retro-yellow mx-auto mb-4" />
              <h3 className="font-sans font-bold text-lg mb-2">Best Prices</h3>
              <p className="text-muted-foreground">Competitive pricing with regular discounts and offers</p>
            </div>
            <div className="text-center p-6 bg-card border-2 border-border shadow-card rounded-lg">
              <Clock className="w-12 h-12 text-retro-purple mx-auto mb-4" />
              <h3 className="font-sans font-bold text-lg mb-2">24/7 Support</h3>
              <p className="text-muted-foreground">Round-the-clock customer support for all your needs</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="font-pixel text-xl text-retro-mint mb-4">LootBox</div>
              <p className="font-sans text-sm opacity-80">
                Bangladesh's premier gaming services platform
              </p>
            </div>
            <div>
              <h4 className="font-sans font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Game Top-Ups</li>
                <li>Gift Cards</li>
                <li>Subscriptions</li>
                <li>Digital Games</li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQs</li>
                <li>Live Chat</li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>About Us</li>
                <li>Careers</li>
                <li>Become Affiliate</li>
                <li>Terms & Privacy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm opacity-60">
            <p>&copy; 2024 LootBox. All rights reserved. Made with ❤️ in Bangladesh</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
