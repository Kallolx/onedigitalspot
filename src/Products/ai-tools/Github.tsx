import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { aiTools } from "@/lib/products";

import GameDetailsLayout from "@/components/custom/GameDetailsLayout";

const categoryIcons = {
  Individual: "/assets/icons/ai-tools/github.svg",
  Team: "/assets/icons/ai-tools/github.svg",
};

const infoSections = [
  {
    title: "About GitHub Pro",
    content: (
      <div className="text-base">
        <p className="mb-2">
          GitHub Pro gives developers enhanced collaboration tools, advanced code review features, and priority support to accelerate your projects.
        </p>
        <ul className="list-disc pl-5">
          <li>
            Individual Pro subscription designed for professional developers.
          </li>
          <li>
            Team plans available for groups requiring shared billing and management.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your GitHub Pro subscription type: Individual or Team.</li>
        <li>Provide your GitHub username or organization name accordingly.</li>
        <li>Complete payment and follow the instructions sent to your email.</li>
        <li>Activate your Pro subscription via your GitHub account.</li>
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
          <li><strong>GitHub Username or Organization:</strong> For subscription activation</li>
          <li>Activation confirmation and instructions will be sent to your registered email</li>
          <li>No password sharing needed</li>
        </ul>
      </div>
    ),
  },
];

export default function GitHubPro() {
  type SelectedItem = { categoryIdx: number; itemIdx: number; quantity: number };
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [playerId, setPlayerId] = useState(""); // GitHub username or org name
  const [zoneId, setZoneId] = useState(""); // Not applicable here
  const [pro, setPro] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const proProduct = aiTools.find(p => p.title === "GitHub Pro");
  const infoImage = proProduct?.image;

  useEffect(() => {
    async function fetchAiTools() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_AI_TOOLS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        const proProduct = products.find((g) => g.title && g.title.toLowerCase() === "github pro");
        setPro(proProduct);

        if (proProduct && Array.isArray(proProduct.priceList)) {
          const personal = [];
          const team = [];
          proProduct.priceList.forEach((item) => {
            const [label, price, hot, type] = item.split("|");
            const obj = { label, price: Number(price), hot: hot === "true" };
            if (type === "personal") {
              personal.push(obj);
            } else if (type === "team") {
              team.push(obj);
            }
          });
          setPriceList([
            {
              title: "GitHub Pro Personal",
              categoryIcon: categoryIcons.Individual,
              items: personal,
            },
            {
              title: "GitHub Pro Team",
              categoryIcon: categoryIcons.Team,
              items: team,
            },
          ]);
        }

        setSimilar(aiTools.filter((g) => g.title !== "GitHub Pro").slice(0, 4));
      } catch (err) {
        setPro(null);
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
    <GameDetailsLayout
      isSignedIn={isSignedIn}
      title="GitHub Pro"
      image={proProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
  selectedItems={selectedItems}
  setSelectedItems={setSelectedItems}
    />
  );
}
