import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { aiTools } from "@/lib/products";
import AiToolDetailsLayout from "@/components/AiToolDetailsLayout";

const categoryIcons = {
  Personal: "/assets/icons/cursor.svg",
};

const infoSections = [
  {
    title: "About Cursor IDE",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Cursor is an AI-powered code editor built on Visual Studio Code that revolutionizes coding with intelligent assistance and enhanced productivity features.
        </p>
        <ul className="list-disc pl-5">
          <li>
            AI-powered code completion and generation.
          </li>
          <li>
            Built on VS Code with enhanced features.
          </li>
          <li>
            Intelligent code suggestions and refactoring.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Cursor IDE subscription plan.</li>
        <li>Provide your email address for account activation.</li>
        <li>Complete payment and follow the instructions sent to your email.</li>
        <li>Download and activate Cursor IDE with your new account credentials.</li>
      </ol>
    ),
  },
  {
    title: "Account Information",
    content: (
      <div className="mb-2">
        <p className="mb-2">
          Please provide the following for activation:
        </p>
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>Email Address:</strong> For account creation and activation</li>
          <li>Account credentials will be sent to your registered email</li>
          <li>Download link and setup instructions included</li>
        </ul>
      </div>
    ),
  },
];

export default function CursorIDE() {
  const [selected, setSelected] = useState<{ categoryIdx: number; itemIdx: number } | null>(null);
  const [playerId, setPlayerId] = useState(""); // Email address
  const [zoneId, setZoneId] = useState(""); // Not applicable here
  const [quantity, setQuantity] = useState(1);
  const [cursor, setCursor] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const cursorProduct = aiTools.find(p => p.title === "Cursor IDE");
  const infoImage = cursorProduct?.image;

  useEffect(() => {
    async function fetchAiTools() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_AI_TOOLS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        const cursorProduct = products.find((g) => g.title && g.title.toLowerCase() === "cursor ide");
        setCursor(cursorProduct);

        if (cursorProduct && Array.isArray(cursorProduct.priceList)) {
          const personal = [];
          cursorProduct.priceList.forEach((item) => {
            const [label, price, hot] = item.split("|");
            const obj = { label, price: Number(price), hot: hot === "true" };
            personal.push(obj);
          });
          setPriceList([
            {
              title: "Cursor IDE Personal",
              categoryIcon: categoryIcons.Personal,
              items: personal,
            },
          ]);
        }

        setSimilar(aiTools.filter((g) => g.title !== "Cursor IDE").slice(0, 4));
      } catch (err) {
        setCursor(null);
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
      title="Cursor IDE"
      image={cursorProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selected={selected}
      setSelected={setSelected as any}
      playerId={playerId} // Email address
      setPlayerId={setPlayerId}
      zoneId={zoneId} // Not used
      setZoneId={setZoneId}
      quantity={quantity}
      setQuantity={setQuantity}
      infoImage={infoImage}
    />
  );
}
