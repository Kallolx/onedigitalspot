import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About Canva Pro Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Unlock the full potential of Canva with Canva Pro. Access premium templates, design tools, and collaboration features to create stunning visuals effortlessly.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Premium Templates:</b> Thousands of professionally designed templates.</li>
          <li><b>Unlimited Storage:</b> Store all your designs and assets.</li>
          <li><b>Team Collaboration:</b> Work seamlessly with your team in real-time.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Canva Pro subscription plan.</li>
        <li>Provide your Canva account details for activation.</li>
        <li>Complete payment securely.</li>
        <li>Start designing with premium tools and templates immediately.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <div className="mb-2">
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>Access to Millions:</strong> Photos, videos, and elements</li>
          <li><strong>Magic Resize:</strong> Quickly resize designs for different platforms</li>
          <li><strong>Background Remover:</strong> Easily remove image backgrounds</li>
          <li><strong>Brand Kit:</strong> Manage brand colors, logos, and fonts</li>
          <li><strong>Priority Support:</strong> Get fast help whenever you need it</li>
        </ul>
      </div>
    ),
  },
];

export default function CanvaProSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [canvaPro, setCanvaPro] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const canvaProProduct = productivity.find(p => p.title === "Canva Pro");
  const infoImage = canvaProProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_PRODUCTIVITY_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const canva = products.find(
          (g) => g.title && g.title.toLowerCase() === "canva pro"
        );
        setCanvaPro(canva);

        if (canva && Array.isArray(canva.priceList)) {
          const items = canva.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });

          setPriceList([
            {
              title: "Canva Pro Subscription",
              categoryIcon: "/assets/icons/design/canva.svg",
              items,
            },
          ]);
        }

        setSimilar(
          productivity.filter((g) => g.title.toLowerCase() !== "canva pro").slice(0, 4)
        );
      } catch (err) {
        setCanvaPro(null);
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
      title="Canva Pro"
      image={canvaProProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
