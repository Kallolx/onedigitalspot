import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About CodePen Pro Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          CodePen Pro is a platform for front-end developers to build, test, and showcase their HTML, CSS, and JavaScript projects with enhanced features.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Private Pens:</b> Work on code privately before publishing.</li>
          <li><b>Asset Hosting:</b> Store your files for use in projects.</li>
          <li><b>Live View:</b> See your changes in real-time on multiple devices.</li>
          <li><b>Collaboration:</b> Share code with team members for real-time editing.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Choose a CodePen Pro plan.</li>
        <li>Create or log in to your CodePen account.</li>
        <li>Complete payment securely.</li>
        <li>Start building and collaborating on your projects immediately.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><b>Unlimited Private Pens</b></li>
        <li><b>Asset Hosting</b></li>
        <li><b>Collaboration Mode</b></li>
        <li><b>Project Templates</b></li>
        <li><b>Live View on Multiple Devices</b></li>
      </ul>
    ),
  },
];


export default function CodePenSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [codePen, setCodePen] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const codePenProduct = productivity.find(p => p.title === "CodePen Pro");
  const infoImage = codePenProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const f = products.find(
          (g) => g.title && g.title.toLowerCase() === "codepen pro"
        );
        setCodePen(f);

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
        setCodePen(null);
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
      title="CodePen Pro"
      image={codePenProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
