import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { aiTools } from "@/lib/products";
import AiToolDetailsLayout from "@/components/custom/AiToolDetailsLayout";

const categoryIcons = {
  Shared: "/assets/icons/ai-tools/claude.svg",
  Personal: "/assets/icons/ai-tools/claude.svg",
};

const infoSections = [
  {
    title: "About Claude Pro",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Claude Pro gives you access to Anthropic’s advanced Claude models with higher usage limits,
          priority access, and faster responses. Choose between shared access for quick use, or a personal
          subscription tied to your own account.
        </p>
        <ul className="list-disc pl-5">
          <li>
            Shared Account: We provide login credentials. Use on one device at a time.
          </li>
          <li>
            Personal Account: Use your own Anthropic account, or let us create a new one for you.
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
        <li>For Existing accounts, provide your Anthropic account email.</li>
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
          <li><strong>Account Email:</strong> Your Anthropic account email (for existing accounts)</li>
          <li><strong>Account Recovery:</strong> Backup email for account recovery (optional)</li>
          <li>For shared accounts, we'll provide login credentials after purchase</li>
          <li>For new personal accounts, we'll create one using your provided email</li>
        </ul>
      </div>
    ),
  },
];

export default function Claude() {
  const [selected, setSelected] = useState<{ categoryIdx: number; itemIdx: number } | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cg, setCg] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const claudeProduct = aiTools.find(p => p.title === "Claude Premium");
  const infoImage = claudeProduct?.image;

  useEffect(() => {
    async function fetchAiTools() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_AI_TOOLS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        // Find Claude Premium (case-insensitive)
        const claude = products.find((g) => g.title && g.title.toLowerCase() === "claude premium");
        setCg(claude);
        // Group priceList if available
        if (claude && Array.isArray(claude.priceList)) {
          const shared = [];
          const personal = [];
          claude.priceList.forEach((item) => {
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
              title: "Claude Pro Shared Account",
              categoryIcon: categoryIcons.Shared,
              items: shared,
            },
            {
              title: "Claude Pro Personal Account",
              categoryIcon: categoryIcons.Personal,
              items: personal,
            },
          ]);
        }
        // Similar products excluding Claude Pro
        setSimilar(aiTools.filter((g) => g.title !== "Claude Pro").slice(0, 4));
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
      title="Claude Premium"
      image={claudeProduct?.image}
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
