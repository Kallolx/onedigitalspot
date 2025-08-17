import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About Figma Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Figma is a collaborative interface design tool that enables teams to create, prototype, and share designs in real-time.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Collaborative Design:</b> Work on projects with your team simultaneously.</li>
          <li><b>Prototyping:</b> Create interactive prototypes without coding.</li>
          <li><b>Plugins & Widgets:</b> Extend functionality with plugins.</li>
          <li><b>Version Control:</b> Track changes and revert anytime.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Figma subscription plan.</li>
        <li>Log in with your Figma account.</li>
        <li>Complete payment securely.</li>
        <li>Start designing collaboratively instantly.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <div className="mb-2">
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>Unlimited Projects:</strong> Create as many files as you need.</li>
          <li><strong>Real-time Collaboration:</strong> Work together with your team instantly.</li>
          <li><strong>Plugins & Widgets:</strong> Customize your workflow.</li>
          <li><strong>Cloud Storage:</strong> Access your designs anywhere.</li>
        </ul>
      </div>
    ),
  },
];

export default function FigmaSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [figma, setFigma] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const figmaProduct = productivity.find(p => p.title === "Figma Pro");
  const infoImage = figmaProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const f = products.find(
          (g) => g.title && g.title.toLowerCase() === "figma pro"
        );
        setFigma(f);

        if (f && Array.isArray(f.priceList)) {
          const items = f.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });

          setPriceList([
            {
              title: "Figma Subscription",
              categoryIcon: "/assets/icons/tools/figma.svg",
              items,
            },
          ]);
        }

        setSimilar(
          productivity.filter((g) => g.title.toLowerCase() !== "figma").slice(0, 4)
        );
      } catch {
        setFigma(null);
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
      title="Figma Pro"
      image={figmaProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
