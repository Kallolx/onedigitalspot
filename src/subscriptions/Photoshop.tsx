import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Photoshop Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Unlock the full power of Adobe Photoshop with subscription plans.
          Edit photos professionally with industry-leading tools.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Advanced Photo Editing:</b> Layers, masks, retouching.</li>
          <li><b>Creative Cloud:</b> Sync files and access assets.</li>
          <li><b>Latest Updates:</b> Get all feature updates automatically.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Photoshop plan.</li>
        <li>Login with your Adobe account.</li>
        <li>Complete payment securely.</li>
        <li>Download and use Photoshop on your device.</li>
      </ol>
    ),
  },
];

export default function PhotoshopSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [photoshop, setPhotoshop] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const infoImage = "/products/photoshop.png";

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const photoshopProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "photoshop"
        );
        setPhotoshop(photoshopProduct);

        if (photoshopProduct && Array.isArray(photoshopProduct.priceList)) {
          const items = photoshopProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Photoshop Subscription",
              categoryIcon: "/assets/icons/photoshop.svg",
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "photoshop").slice(0, 4)
        );
      } catch {
        setPhotoshop(null);
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
      title="Photoshop"
      image={photoshop?.image || ""}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
