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

interface AiToolDetailsLayoutProps {
  title: string;
  image: string;
  priceList: PriceCategory[];
  infoSections: InfoSection[];
  similarProducts: any[];
  children?: React.ReactNode;
}

const AiToolDetailsLayout: React.FC<AiToolDetailsLayoutProps> = ({
  title,
  image,
  priceList,
  infoSections,
  similarProducts,
  children,
}) => {
  const [purchaseType, setPurchaseType] = useState<"shared" | "personal">(
    "shared"
  );
  const [personalType, setPersonalType] = useState<"existing" | "new">(
    "new"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selected, setSelected] = useState<{
    categoryIdx: number;
    itemIdx: number;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);

    // Always scroll to top when this layout mounts
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
            {/* Purchase Type Switcher */}
            <Card className="mb-6 p-4">
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button
                  type="button"
                  variant={purchaseType === "shared" ? "default" : "outline"}
                  onClick={() => setPurchaseType("shared")}
                  className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[110px]"
                >
                  Shared Account
                </Button>
                <Button
                  type="button"
                  variant={purchaseType === "personal" ? "default" : "outline"}
                  onClick={() => setPurchaseType("personal")}
                  className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[110px]"
                >
                  Personal Account
                </Button>
              </div>
              {/* Price List for Shared Account */}
              {purchaseType === "shared" && (
                <div className="flex flex-col gap-6">
                  {priceList
                    .filter((category) =>
                      category.title.toLowerCase().includes("shared")
                    )
                    .map((category, catIdx) => (
                      <div key={catIdx}>
                        <h3 className="font-pixel text-base text-primary mb-2 pl-1 opacity-80 flex items-center gap-2">
                          {category.title}
                        </h3>
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
                                  <span className="bg-orange-400 text-white text-xs px-2 py-0.5 rounded-full font-pixel font-semibold ml-1">
                                    <img
                                      src="/src/assets/icons/fire.svg"
                                      alt="Popular"
                                      className="inline-block mr-1 w-4 h-4"
                                    />
                                    Popular
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
              )}
              {/* Personal Account Options */}
              {purchaseType === "personal" && (
                <>
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex gap-4 mb-2">
                      <Button
                        type="button"
                        variant={personalType === "new" ? "default" : "outline"}
                        onClick={() => {
                          setPersonalType("new");
                          setSelected(null);
                        }}
                        className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[120px]"
                      >
                        Recieve New Account
                      </Button>
                      <Button
                        type="button"
                        variant={
                          personalType === "existing" ? "default" : "outline"
                        }
                        onClick={() => {
                          setPersonalType("existing");
                          setSelected(null);
                        }}
                        className="px-3 py-1 text-xs sm:text-sm rounded-md min-w-[120px]"
                      >
                        Use Existing Account
                      </Button>
                    </div>
                    {/* Price List for Personal Account */}
                    <div className="flex flex-col gap-6">
                      {priceList
                        .filter((category) =>
                          category.title.toLowerCase().includes("personal")
                        )
                        .map((category, catIdx) => (
                          <div key={catIdx}>
                            <h3 className="font-pixel text-base text-primary mb-2 pl-1 opacity-80 flex items-center gap-2">
                              {category.title}
                            </h3>
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
                                    setSelected({
                                      categoryIdx: catIdx,
                                      itemIdx,
                                    })
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
                                      <span className="bg-orange-400 text-white text-xs px-2 py-0.5 rounded-full font-pixel font-semibold ml-1">
                                        <img
                                          src="/src/assets/icons/fire.svg"
                                          alt="Popular"
                                          className="inline-block mr-1 w-4 h-4"
                                        />
                                        Popular
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
                    {personalType === "existing" && (
                      <div className="flex flex-col gap-3">
                        <label className="font-pixel text-base text-primary">
                          Provide your details
                        </label>
                        <input
                          className="w-full border-2 border-border rounded-lg px-4 py-3 text-base bg-white/90 focus:border-primary focus:outline-none transition"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <input
                          className="w-full border-2 border-border rounded-lg px-4 py-3 text-base bg-white/90 focus:border-primary focus:outline-none transition"
                          placeholder="Enter your password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
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
                        purchaseType === "shared"
                          ? category.title.toLowerCase().includes("shared")
                          : category.title.toLowerCase().includes("personal")
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
                  disabled={
                    (purchaseType === "shared" && selected === null) ||
                    (purchaseType === "personal" &&
                      personalType === "existing" &&
                      (!email || !password))
                  }
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

export default AiToolDetailsLayout;
