import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { aiTools } from "@/lib/products";
import AiToolDetailsLayout from "@/components/AiToolDetailsLayout";

const categoryIcons = {
  Shared: "/assets/icons/gemini.svg",
  Personal: "/assets/icons/gemini.svg",
};

const infoSections = [
  {
    title: "About Gemini Premium",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Gemini Premium (by Google DeepMind) offers you advanced AI capabilities including extended context,
          faster responses, and priority access to the latest Gemini model features.
        </p>
        <ul className="list-disc pl-5">
          <li>
            Shared Account: We provide login credentials for a Gemini Premium-enabled account.
            Only one device can use it at a time.
          </li>
          <li>
            Personal Account: Link Gemini Premium to your own Google account or let us create a fresh one for you.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Choose your purchase type: Shared or Personal.</li>
        <li>If Personal, select whether you want to use an existing Google account or a new one.</li>
        <li>For Existing accounts, provide your Google account email.</li>
        <li>Optionally, provide a recovery email for password reset and account security.</li>
        <li>Proceed to payment and follow setup instructions sent via email.</li>
      </ol>
    ),
  },
  {
    title: "Account Information",
    content: (
      <div className="mb-2">
        <p className="mb-2">Required details depend on the account type you choose:</p>
        <ul className="list-disc pl-5 text-base mb-4">
          <li>
            <strong>Account Email:</strong> Your Google account email (for existing accounts)
          </li>
          <li>
            <strong>Account Recovery:</strong> Backup email for recovery (optional)
          </li>
          <li>
            For Shared accounts, credentials will be provided after purchase.
          </li>
          <li>
            For New personal accounts, we’ll create and deliver a Gemini Premium-enabled Google account.
          </li>
        </ul>
      </div>
    ),
  },
];

export default function Gemini() {
  const [selected, setSelected] = useState<{ categoryIdx: number; itemIdx: number } | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cg, setCg] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const geminiProduct = aiTools.find(p => p.title === "Gemini Premium");
  const infoImage = geminiProduct?.image;

  useEffect(() => {
    async function fetchAiTools() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_AI_TOOLS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        // Find Gemini Premium (case-insensitive)
        const gemini = products.find((g) => g.title && g.title.toLowerCase() === "gemini premium");
        setCg(gemini);
        if (gemini && Array.isArray(gemini.priceList)) {
          const shared = [];
          const personal = [];
          gemini.priceList.forEach((item) => {
            const [label, price, hot, type] = item.split("|");
            const obj = { label, price: Number(price), hot: hot === "true" };
            if (type === "shared") {
              shared.push(obj);
            } else if (type === "personal") {
              personal.push(obj);
            }
          });
          setPriceList([
            {
              title: "Gemini Premium Shared Account",
              categoryIcon: categoryIcons.Shared,
              items: shared,
            },
            {
              title: "Gemini Premium Personal Account",
              categoryIcon: categoryIcons.Personal,
              items: personal,
            },
          ]);
        }
        setSimilar(aiTools.filter((g) => g.title !== "Gemini Premium").slice(0, 4));
      } catch (err) {
        setCg(null);
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

    fetchAiTools();
    checkAuth();
  }, []);

  return (
    <AiToolDetailsLayout
      isSignedIn={isSignedIn}
      title="Gemini Premium"
      image={geminiProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selected={selected}
      setSelected={setSelected as any}
      playerId={playerId}
      setPlayerId={setPlayerId}
      zoneId={zoneId}
      setZoneId={setZoneId}
      quantity={quantity}
      setQuantity={setQuantity}
      infoImage={infoImage}
    />
  );
}
