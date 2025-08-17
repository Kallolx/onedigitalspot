import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Disney+ Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Stream Disney, Pixar, Marvel, Star Wars, and National Geographic content 
          on Disney+. Enjoy exclusive originals and classic favorites in 4K quality.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <b>Individual:</b> Personal access to the entire Disney+ library.
          </li>
          <li>
            <b>Family:</b> Share with up to 7 profiles and simultaneous streaming.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your subscription type: Individual or Family.</li>
        <li>Choose your billing preference (monthly or yearly).</li>
        <li>Provide your Disney+ account details for activation.</li>
        <li>Complete payment and start streaming immediately.</li>
        <li>Enjoy Disney magic across all your devices!</li>
      </ol>
    ),
  },
  {
    title: "Content Library",
    content: (
      <div className="mb-2">
        <p className="mb-2">Your Disney+ subscription includes:</p>
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>Disney Classics:</strong> Timeless animated and live-action films</li>
          <li><strong>Pixar Movies:</strong> Complete collection of Pixar animations</li>
          <li><strong>Marvel Universe:</strong> MCU movies, series, and exclusive content</li>
          <li><strong>Star Wars:</strong> Complete saga plus original series like Mandalorian</li>
          <li><strong>National Geographic:</strong> Documentaries and educational content</li>
          <li><strong>Disney+ Originals:</strong> Exclusive series and movies</li>
          <li><strong>4K & HDR:</strong> Premium video quality where available</li>
        </ul>
      </div>
    ),
  },
];

export default function DisneyPlusSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [disneyPlus, setDisneyPlus] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const disneyPlusProduct = subscriptions.find(p => p.title === "Disney Plus");
  const infoImage = disneyPlusProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env
          .VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(
          databaseId,
          collectionId
        );
        const products = response.documents;
        const disneyPlus = products.find(
          (g) => g.title && g.title.toLowerCase() === "disney plus"
        );
        setDisneyPlus(disneyPlus);

        if (disneyPlus && Array.isArray(disneyPlus.priceList)) {
          const items = [];
          disneyPlus.priceList.forEach((item) => {
            const [label, price, hot] = item.split("|");
            items.push({ label, price: Number(price), hot: hot === "true" });
          });
          setPriceList([{
            title: "Disney+ Subscription",
            categoryIcon: "/assets/icons/subscriptions/disney.svg",
            items: items,
          }]);
        }
        
        setSimilar(
          subscriptions.filter((g) => g.title !== "Disney Plus").slice(0, 4)
        );
      } catch (err) {
        setDisneyPlus(null);
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
      title="Disney+"
      image={disneyPlusProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
