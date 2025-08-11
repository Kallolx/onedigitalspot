import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Zoom Pro Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Host unlimited meetings with Zoom Pro subscription.
          Features include extended meeting duration, cloud recording, and reporting.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Unlimited Meetings:</b> Host meetings without time limits.</li>
          <li><b>Cloud Recording:</b> Record meetings to the cloud.</li>
          <li><b>Advanced Reporting:</b> Detailed meeting analytics.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Zoom Pro plan.</li>
        <li>Log in with your Zoom account.</li>
        <li>Complete payment securely.</li>
        <li>Host meetings with premium features.</li>
      </ol>
    ),
  },
];

export default function ZoomProSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [zoomPro, setZoomPro] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const zoomProProduct = subscriptions.find(p => p.title === "Zoom Pro");
  const infoImage = zoomProProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const zoomProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "zoom pro"
        );
        setZoomPro(zoomProduct);

        if (zoomProduct && Array.isArray(zoomProduct.priceList)) {
          const items = zoomProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Zoom Pro Subscription",
              categoryIcon: "/assets/icons/zoom.svg",
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "zoom pro").slice(0, 4)
        );
      } catch {
        setZoomPro(null);
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
      title="Zoom Pro"
      image={zoomProProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
