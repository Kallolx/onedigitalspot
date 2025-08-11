import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { aiTools } from "@/lib/products";
import AiToolDetailsLayout from "@/components/AiToolDetailsLayout";

const categoryIcons = {
  Personal: "/assets/icons/windsurf.svg",
};

const infoSections = [
  {
    title: "About Windsurf IDE",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Windsurf IDE is a cutting-edge AI-powered integrated development environment designed to boost your coding productivity with smart assistance and a sleek interface.
        </p>
        <ul className="list-disc pl-5">
          <li>AI-assisted code completion and error detection.</li>
          <li>Customizable themes and plugins.</li>
          <li>Supports multiple programming languages.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Windsurf IDE subscription plan.</li>
        <li>Provide your email address for account activation.</li>
        <li>Complete payment and follow the instructions sent to your email.</li>
        <li>Download and activate Windsurf IDE with your credentials.</li>
      </ol>
    ),
  },
  {
    title: "Account Information",
    content: (
      <div className="mb-2">
        <p className="mb-2">
          Please provide the following information for activation:
        </p>
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>Email Address:</strong> For account creation and activation</li>
          <li>Account credentials and setup instructions will be sent via email</li>
        </ul>
      </div>
    ),
  },
];

export default function WindsurfIDE() {
  const [selected, setSelected] = useState<{ categoryIdx: number; itemIdx: number } | null>(null);
  const [playerId, setPlayerId] = useState(""); // Email address
  const [zoneId, setZoneId] = useState(""); // Not applicable here
  const [quantity, setQuantity] = useState(1);
  const [windsurf, setWindsurf] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const infoImage = "/products/windsurf-ide.png";

  useEffect(() => {
    async function fetchAiTools() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_AI_TOOLS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        const windsurfProduct = products.find((g) => g.title && g.title.toLowerCase() === "windsurf ide");
        setWindsurf(windsurfProduct);

        if (windsurfProduct && Array.isArray(windsurfProduct.priceList)) {
          const personal = [];
          windsurfProduct.priceList.forEach((item) => {
            const [label, price, hot] = item.split("|");
            const obj = { label, price: Number(price), hot: hot === "true" };
            personal.push(obj);
          });
          setPriceList([
            {
              title: "Windsurf IDE Personal",
              categoryIcon: categoryIcons.Personal,
              items: personal,
            },
          ]);
        }

        setSimilar(aiTools.filter((g) => g.title !== "Windsurf IDE").slice(0, 4));
      } catch (err) {
        setWindsurf(null);
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
      title="Windsurf IDE"
      image={windsurf?.image || ""}
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
