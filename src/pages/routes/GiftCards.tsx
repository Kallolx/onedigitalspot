import Header from "@/components/landing/Header";
import { useEffect, useState } from "react";
import { giftCards, pcGames } from "../../lib/products";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ServiceCard from "@/components/custom/ServiceCard";

const categories = Array.from(new Set(giftCards.map(g => String(g.category))));

const priceRanges = [
  { label: "All", min: 0, max: Infinity },
  { label: "৳0 - ৳100", min: 0, max: 100 },
  { label: "৳100 - ৳500", min: 100, max: 500 },
  { label: "৳500+", min: 500, max: Infinity },
];

const GiftCards = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState(priceRanges[0]);

  let filtered = giftCards;

  if (selectedCategory) filtered = filtered.filter(g => g.category === selectedCategory);
  if (selectedPrice.label !== "All") filtered = filtered.filter(g => {
    const priceNum = Number(String(g.price).replace(/[^\d.]/g, ""));
    return priceNum >= selectedPrice.min && priceNum < selectedPrice.max;
  });

    useEffect(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, []);
    
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="font-pixel text-3xl md:text-4xl font-medium tracking-tighter text-foreground">Gift Cards</h1>
          <div className="flex flex-row gap-2 md:gap-4 w-full md:w-auto">
            <div className="flex flex-col">
              <label className="font-pixel text-base mb-1 text-foreground">Category</label>
              <Select value={selectedCategory ?? "all"} onValueChange={val => setSelectedCategory(val === "all" ? null : val)}>
                <SelectTrigger className="w-40 bg-white/80 border border-border rounded-lg shadow-card text-xs md:text-sm">
                  <SelectValue>{selectedCategory ?? "All"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <label className="font-pixel text-base mb-1 text-foreground">Price</label>
              <Select value={selectedPrice.label} onValueChange={label => setSelectedPrice(priceRanges.find(r => r.label === label) || priceRanges[0])}>
                <SelectTrigger className="w-40 bg-white/80 border border-border rounded-lg shadow-card text-xs md:text-sm">
                  <SelectValue>{selectedPrice.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map(range => (
                    <SelectItem key={range.label} value={range.label}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground font-pixel text-xl">No gift cards found.</div>
          ) : (
            filtered.map((card, idx) => <ServiceCard key={idx} {...card} />)
          )}
        </div>
      </main>
    </div>
  );
};

export default GiftCards;
