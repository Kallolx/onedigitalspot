import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import ServiceCard from "@/components/ServiceCard";

interface PriceItem {
  label: string;
  price: number | string;
  hot?: boolean;
}

interface PriceCategory {
  title: string;
  items: PriceItem[];
  categoryIcon?: string;
}

interface InfoSection {
  title: string;
  content: React.ReactNode;
}

interface SubscriptionsDetailsLayoutProps {
  title: string;
  image: string;
  priceList: PriceCategory[];
  infoSections: InfoSection[];
  similarProducts: any[];
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  children?: React.ReactNode;
}

const SubscriptionsDetailsLayout: React.FC<SubscriptionsDetailsLayoutProps> = ({
  title,
  image,
  priceList,
  infoSections,
  similarProducts,
  quantity,
  setQuantity,
  children,
}) => {
  const [activeTab, setActiveTab] = useState<"renewable" | "non-renewable">("renewable");
  const [selected, setSelected] = useState<{
    categoryIdx: number;
    itemIdx: number;
  } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-center mb-6 font-pixel text-primary">
          Purchase {title}
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Section */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-8">
              <div className="aspect-square rounded-xl overflow-hidden mb-4">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="font-pixel text-xl tracking-tighter text-primary font-semibold text-center">
                {title}
              </h2>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1">
            {/* Tab Switcher */}
            <Card className="mb-6 p-4">
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button
                  type="button"
                  variant={activeTab === "renewable" ? "default" : "outline"}
                  onClick={() => setActiveTab("renewable")}
                  className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[110px]"
                >
                  Renewable
                </Button>
                <Button
                  type="button"
                  variant={activeTab === "non-renewable" ? "default" : "outline"}
                  onClick={() => setActiveTab("non-renewable")}
                  className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[110px]"
                >
                  Non-Renewable
                </Button>
              </div>
              {/* Tab Description Title (smaller, simpler) */}
              <div className="mb-4">
                {activeTab === "renewable" ? (
                  <span className="text-sm font-medium text-yellow-700 bg-yellow-50 rounded px-2 py-1 inline-block">
                    Official product · 100% authentic
                  </span>
                ) : (
                  <span className="text-sm font-medium text-yellow-700 bg-yellow-50 rounded px-2 py-1 inline-block">
                    Shared account · No auto-renew support
                  </span>
                )}
              </div>
              {/* Price List for Selected Tab */}
              <div className="flex flex-col gap-6">
                {priceList
                  .filter((category) =>
                    category.title.trim().toLowerCase() ===
                    (activeTab === "renewable" ? "renewable" : "non-renewable")
                  )
                  .map((category, catIdx) => (
                    <div key={catIdx}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.items.map((item, itemIdx) => (
                          <Button
                            key={itemIdx}
                            type="button"
                            variant={
                              selected &&
                              selected.categoryIdx === catIdx &&
                              selected.itemIdx === itemIdx
                                ? "default"
                                : "outline"
                            }
                            className={`relative flex justify-between items-center font-sans text-base md:text-lg px-4 py-3 h-auto`}
                            onClick={() =>
                              setSelected({ categoryIdx: catIdx, itemIdx })
                            }
                          >
                            <span className="flex items-center gap-2">
                              {category.categoryIcon && (
                                <img
                                  src={category.categoryIcon}
                                  alt="icon"
                                  className="w-5 h-5 text-primary"
                                />
                              )}
                              {item.label}
                              {item.hot && (
                                <span className="ml-1">
                                  <img
                                    src="/assets/icons/fire.svg"
                                    alt="Popular"
                                    className="inline-block mr-1 w-4 h-4"
                                  />
                                </span>
                              )}
                            </span>
                            <span
                              className={`font-bold transition-colors duration-150 ${
                                selected &&
                                selected.categoryIdx === catIdx &&
                                selected.itemIdx === itemIdx
                                  ? "text-white"
                                  : "text-primary"
                              } group-hover:text-white`}
                            >
                              {item.price}৳
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
            {/* Quantity, Order Summary, and Proceed Button */}
            <Card className="mb-8 p-4">
              <div className="flex items-center gap-4 mb-4">
                <label className="font-pixel text-base text-primary">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="w-10 h-10 border-2 border-border rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <input
                    className="w-20 border-2 border-border rounded-lg px-3 py-2 text-base bg-white text-center focus:border-primary focus:outline-none transition-colors"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                  />
                  <button
                    type="button"
                    className="w-10 h-10 border-2 border-border rounded-lg flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Order Summary and Proceed Button */}
              <>
                <div className="rounded-xl border border-primary/30 px-4 py-3 mb-3 flex items-center justify-between gap-4 shadow-sm">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-pixel text-xl text-primary font-semibold mt-1">
                      Total
                    </span>
                  </div>
                  <span className="font-pixel text-2xl text-primary font-bold whitespace-nowrap">
                    {(() => {
                      const filteredList = priceList.filter(category =>
                        category.title.trim().toLowerCase() ===
                        (activeTab === "renewable" ? "renewable" : "non-renewable")
                      );
                      if (!selected) return 0;
                      const item =
                        filteredList[selected.categoryIdx]?.items[selected.itemIdx];
                      return item && typeof item.price === "number"
                        ? item.price * quantity
                        : item?.price || 0;
                    })()}
                    <span className="text-lg font-normal ml-1">৳</span>
                  </span>
                </div>
                <Button
                  className="w-full font-pixel text-lg mt-2"
                  type="button"
                  disabled={selected === null}
                  onClick={() => {
                    // Placeholder for proceed action
                    alert("Proceeding to payment...");
                  }}
                >
                  Proceed to Payment
                </Button>
              </>
            </Card>
            {/* Info Section */}
            {infoSections.map((section, i) => (
              <Card key={i} className="mb-8 p-4">
                <h2 className="font-semibold text-lg mb-2 font-pixel text-primary">
                  {section.title}
                </h2>
                <div>{section.content}</div>
              </Card>
            ))}
            {children}
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-12">
          <h2 className="font-bold text-xl mb-4 font-pixel text-primary">
            Similar Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {similarProducts.map((prod, i) => (
              <ServiceCard key={i} {...prod} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubscriptionsDetailsLayout;
