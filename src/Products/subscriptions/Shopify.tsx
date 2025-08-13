import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Shopify Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Start or grow your online store with Shopify subscription plans.
          Get access to professional store themes, payment gateways, and marketing tools.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Online Store:</b> Customize your store with easy themes.</li>
          <li><b>Secure Payments:</b> Multiple payment gateway options.</li>
          <li><b>Marketing Tools:</b> SEO, email marketing, and analytics.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Choose your Shopify subscription plan.</li>
        <li>Log in with your Shopify account.</li>
        <li>Complete payment securely.</li>
        <li>Launch and manage your online store.</li>
      </ol>
    ),
  },
];

export default function ShopifySubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [shopify, setShopify] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const shopifyProduct = subscriptions.find(p => p.title === "Shopify");
  const infoImage = shopifyProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const shopifyProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "shopify"
        );
        setShopify(shopifyProduct);

        if (shopifyProduct && Array.isArray(shopifyProduct.priceList)) {
          const items = shopifyProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Shopify Subscription",
              categoryIcon: "/assets/icons/subscriptions/shopify.svg",
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "shopify").slice(0, 4)
        );
      } catch {
        setShopify(null);
        setPriceList([]);
        setSimilar([]);
      }
    }

    async function checkAuth() {
      try {
        await account.get();
        setIsSignedIn(true);
      } catch {
        setIsSignedIn(false);
      }
    }

    fetchSubscriptions();
    checkAuth();
  }, []);

  return (
    <GameDetailsLayout
      isSignedIn={isSignedIn}
      title="Shopify"
      image={shopifyProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
