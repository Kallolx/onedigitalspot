import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { aiTools, subscriptions, giftCards, mobileGames, pcGames, productivity } from "../../lib/products";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import ServiceCard from "@/components/custom/ServiceCard";
import Footer from "@/components/landing/Footer";

const priceRanges = [
  { label: "All", min: 0, max: Infinity },
  { label: "৳0 - ৳100", min: 0, max: 100 },
  { label: "৳100 - ৳500", min: 100, max: 500 },
  { label: "৳500+", min: 500, max: Infinity },
];

const categoryOptions = [
  { label: "All", value: "all" },
  { label: "AI Tools", value: "AI Tools" },
  { label: "Productivity", value: "Productivity" },
  { label: "Subscriptions", value: "Subscriptions" },
  { label: "Gift Cards", value: "Gift Cards" },
  { label: "Mobile Games", value: "Mobile Games" },
  { label: "PC Games", value: "PC Games" },
];

const AllProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initCategoryLabel = searchParams.get("category") || "All";
  const initPriceLabel = searchParams.get("price") || "All";

  const [selectedPrice, setSelectedPrice] = useState(() => priceRanges.find(p => p.label === initPriceLabel) || priceRanges[0]);
  const [selectedCategory, setSelectedCategory] = useState(() => categoryOptions.find(c => c.label === initCategoryLabel) || categoryOptions[0]);

  // Helper to filter by price
  const filterByPrice = (arr) => {
    if (selectedPrice.label === "All") return arr;
    return arr.filter((g) => {
      const priceNum = Number(String(g.price).replace(/[^\d.]/g, ""));
      return priceNum >= selectedPrice.min && priceNum < selectedPrice.max;
    });
  };

  // Show all products for each category
  const allSections = [
    {
      title: "AI Tools",
      items: filterByPrice(aiTools),
    },
    {
      title: "Subscriptions",
      items: filterByPrice(subscriptions),
    },
    {
      title: "Productivity",
      items: filterByPrice(productivity),
    },
    {
      title: "Gift Cards",
      items: filterByPrice(giftCards),
    },
    {
      title: "Mobile Games",
      items: filterByPrice(mobileGames),
    },
    {
      title: "PC Games",
      items: filterByPrice(pcGames),
    },
  ];

  const sections = selectedCategory.value === "all"
    ? allSections
    : allSections.filter((section) => section.title === selectedCategory.value);

  // Keep URL in sync with selected filters so state persists when navigating
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedCategory?.label) params.category = selectedCategory.label;
    if (selectedPrice?.label) params.price = selectedPrice.label;
    setSearchParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedPrice]);

    useEffect(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="font-pixel text-3xl md:text-4xl font-medium tracking-tighter text-foreground">All Products</h1>
          <div className="flex flex-row gap-2 md:gap-4 w-full md:w-auto">
            <div className="flex flex-col flex-1 min-w-0">
              <label className="font-pixel text-base mb-1 text-foreground">Category</label>
              <Select value={selectedCategory.label} onValueChange={label => setSelectedCategory(categoryOptions.find(c => c.label === label) || categoryOptions[0])}>
                <SelectTrigger className="w-full md:w-40 bg-white/80 border border-border rounded-lg shadow-card text-xs md:text-sm">
                  <SelectValue>{selectedCategory.label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.label} value={option.label}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <label className="font-pixel text-base mb-1 text-foreground">Price</label>
              <Select value={selectedPrice.label} onValueChange={label => setSelectedPrice(priceRanges.find(r => r.label === label) || priceRanges[0])}>
                <SelectTrigger className="w-full md:w-40 bg-white/80 border border-border rounded-lg shadow-card text-xs md:text-sm">
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
        {sections.map((section) => (
          <div key={section.title} className="mb-10">
            <div className="flex items-center mb-4 mt-8 gap-3 w-full">
              <h2 className="font-pixel text-2xl font-medium tracking-tighter md:text-3xl text-foreground whitespace-nowrap">
                {section.title} <span className="text-secondary font-pixel text-base md:text-lg">({section.items.length})</span>
              </h2>
              <div className="flex-1 border-t border-border ml-2" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {section.items.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground font-pixel text-xl">No {section.title.toLowerCase()} found.</div>
              ) : (
                section.items.map((item, idx) => <ServiceCard key={idx} {...item} />)
              )}
            </div>
          </div>
        ))}
        <Footer />
      </main>
    </div>
  );
};

export default AllProducts;
