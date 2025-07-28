import AiToolDetailsLayout from "@/components/AiToolDetailsLayout";
import { aiTools } from "@/lib/producs";


const priceList = [
  {
    title: "ChatGPT Pro Shared Account",
    categoryIcon: "/src/assets/icons/chatgpt.svg",
    items: [
      { label: "1 Month Access", price: 350, hot: true },
      { label: "3 Months Access", price: 900 },
      { label: "6 Months Access", price: 1700 },
      { label: "1 Year Access", price: 3200, hot: true },
    ],
  },
  {
    title: "ChatGPT Pro Personal Account",
    categoryIcon: "/src/assets/icons/chatgpt.svg",
    items: [
      { label: "1 Month Personal", price: 650 },
      { label: "3 Months Personal", price: 1800, hot: true },
      { label: "6 Months Personal", price: 3500 },
      { label: "1 Year Personal", price: 6800 },
    ],
  },
];

const infoSections = [
  {
    title: "About ChatGPT Pro",
    content: (
      <div className="text-base">
        <p className="mb-2">
          ChatGPT Pro gives you priority access, faster response times, and
          access to the latest features. You can purchase a shared account for
          instant access, or use your own OpenAI account for a personal
          subscription.
        </p>
        <ul className="list-disc pl-5">
          <li>
            Shared Account: We provide login credentials. Use on one device at a
            time.
          </li>
          <li>
            Personal Account: Use your own OpenAI account, or let us create a
            new one for you.
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
        <li>If Personal, select Existing or New account.</li>
        <li>For Existing, provide your OpenAI email and password.</li>
        <li>Proceed to payment and follow instructions sent to your email.</li>
      </ol>
    ),
  },
];

export default function ChatGPT() {
  const cg = aiTools.find((g) => g.title === "ChatGPT Pro");
  const similar = aiTools.filter((g) => g.title !== "ChatGPT Pro").slice(0, 4);
  return (
    <AiToolDetailsLayout
      title="ChatGPT Pro"
      image={cg?.image || ""}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
    />
  );
}
