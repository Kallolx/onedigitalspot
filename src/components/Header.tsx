import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="bg-background border-b-4 border-border shadow-card">
      <div className="container mx-auto px-4 py-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="font-pixel text-2xl text-primary">LootBox</div>
            <div className="hidden md:block text-sm text-muted-foreground font-sans">
              Your Gaming Hub in Bangladesh
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <User className="w-4 h-4" />
              LOG IN
            </Button>
            <Button variant="pixel" size="sm">
              SIGN UP
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <nav className="flex flex-wrap items-center gap-6">
            <a href="#" className="font-sans font-semibold text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#" className="font-sans font-semibold text-foreground hover:text-primary transition-colors">
              Shop
            </a>
            <a href="#" className="font-sans font-semibold text-foreground hover:text-primary transition-colors">
              Top Up
            </a>
            <a href="#" className="font-sans font-semibold text-foreground hover:text-primary transition-colors">
              Gift Card
            </a>
            <a href="#" className="font-sans font-semibold text-foreground hover:text-primary transition-colors">
              Subscriptions
            </a>
            <a href="#" className="font-sans font-semibold text-foreground hover:text-primary transition-colors">
              Blog
            </a>
            <a href="#" className="font-sans font-semibold text-foreground hover:text-primary transition-colors">
              FAQs
            </a>
            <a href="#" className="font-sans font-semibold text-foreground hover:text-primary transition-colors">
              Become an Affiliate
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search games..." 
                className="pl-10 w-64 bg-background border-2 border-border shadow-card"
              />
            </div>
            <Button variant="outline" size="icon">
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;