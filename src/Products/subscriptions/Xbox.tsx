import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Xbox Game Pass",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Xbox Game Pass gives you unlimited access to a rotating catalog of
          high-quality games for console, PC, and cloud. Play new releases from
          Xbox Game Studios on day one, plus hundreds of other titles.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Console:</b> Play hundreds of games on Xbox consoles.</li>
          <li><b>PC:</b> Unlimited access to PC Game Pass library.</li>
          <li><b>Ultimate:</b> Includes Console + PC + Xbox Cloud Gaming, plus Xbox Live Gold.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your plan: Console, PC, or Ultimate.</li>
        <li>Provide your Microsoft/Xbox account email.</li>
        <li>Complete your payment securely.</li>
        <li>Get access to the Game Pass library instantly.</li>
        <li>Download or stream games on supported devices.</li>
      </ol>
    ),
  },
  {
    title: "Benefits Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><strong>Day-One Releases:</strong> Play new Xbox titles on release day.</li>
        <li><strong>EA Play Membership:</strong> Access EA’s biggest titles and trials.</li>
        <li><strong>Cloud Gaming:</strong> Play on mobile and browser without download (Ultimate).</li>
        <li><strong>Multiplayer:</strong> Xbox Live Gold benefits included (Ultimate).</li>
        <li><strong>Huge Library:</strong> 100+ console and PC games.</li>
      </ul>
    ),
  },
];

export default function XboxGamePass() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [xbox, setXbox] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const xboxProduct = subscriptions.find(p => p.title === "Xbox Game Pass");
  const infoImage = xboxProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const xboxPass = products.find(
          (g) => g.title && g.title.toLowerCase() === "xbox game pass"
        );
        setXbox(xboxPass);

        if (xboxPass && Array.isArray(xboxPass.priceList)) {
          const items = xboxPass.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Xbox Game Pass",
              categoryIcon: "/assets/icons/subscriptions/xbox.svg",
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "xbox game pass").slice(0, 4)
        );
      } catch (err) {
        setXbox(null);
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
      title="Xbox Game Pass"
      image={xboxProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
