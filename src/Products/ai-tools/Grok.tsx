import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { aiTools } from "@/lib/products";
import AiToolDetailsLayout from "@/components/AiToolDetailsLayout";

const categoryIcons = {
  Shared: "/assets/icons/ai-tools/grok.svg",
  Personal: "/assets/icons/ai-tools/grok.svg",
};

const infoSections = [
  {
    title: "About Grok Premium",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Grok Premium gives you access to XAI’s powerful Grok models with enhanced capabilities,
          faster responses, and higher limits. You can choose a shared subscription for quick access,
          or a personal subscription linked to your own account.
        </p>
        <ul className="list-disc pl-5">
          <li>
            Shared Account: We provide login credentials. Only one device can use it at a time.
          </li>
          <li>
            Personal Account: Use your own X account or let us create a new one for you with Grok access.
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
        <li>If Personal account, select Existing or New account type.</li>
        <li>For Existing accounts, provide your X account email/username.</li>
        <li>For password recovery, enter your email in Account Recovery field.</li>
        <li>Proceed to payment and follow instructions sent to your email.</li>
      </ol>
    ),
  },
  {
    title: "Account Information",
    content: (
      <div className="mb-2">
        <p className="mb-2">
          Fill in the required account information based on your purchase type:
        </p>
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>Account Email/Username:</strong> Your X account credentials (for existing accounts)</li>
          <li><strong>Account Recovery:</strong> Backup email for account recovery (optional)</li>
          <li>For shared accounts, we'll provide login credentials after purchase</li>
          <li>For new personal accounts, we'll create one with Grok Premium enabled</li>
        </ul>
      </div>
    ),
  },
];

export default function Grok() {
  const [selected, setSelected] = useState<{ categoryIdx: number; itemIdx: number } | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cg, setCg] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const grokProduct = aiTools.find(p => p.title === "Super Grok Premium");
  const infoImage = grokProduct?.image;

  useEffect(() => {
    async function fetchAiTools() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_AI_TOOLS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        // Find Grok Premium (case-insensitive)
        const grok = products.find((g) => g.title && g.title.toLowerCase() === "grok premium");
        setCg(grok);
        // Group priceList if available
        if (grok && Array.isArray(grok.priceList)) {
          const shared = [];
          const personal = [];
          grok.priceList.forEach((item) => {
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
              title: "Grok Premium Shared Account",
              categoryIcon: categoryIcons.Shared,
              items: shared,
            },
            {
              title: "Grok Premium Personal Account",
              categoryIcon: categoryIcons.Personal,
              items: personal,
            },
          ]);
        }
        // Similar products excluding Grok Premium
        setSimilar(aiTools.filter((g) => g.title !== "Grok Premium").slice(0, 4));
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
      title="Grok Premium"
      image={grokProduct?.image}
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
