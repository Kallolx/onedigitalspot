import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import Footer from "@/components/landing/Footer";

const sections = [
  {
    title: "Overview",
    items: [
      "আমরা স্বয়ংক্রিয় ডেলিভারি এবং ম্যানুয়াল ফুলফিলমেন্ট উভয়ের মাধ্যমে ডিজিটাল পণ্যের ডেলিভারি প্রদান করি।",
      "অধিকাংশ ক্রয়ই তাৎক্ষণিকভাবে সম্পন্ন হয়; কিছু ক্ষেত্রে বাইরের পরিষেবাদাতার নিশ্চিতকরণ লাগতে পারে এবং সময় বেশি লাগতে পারে।",
    ],
    ordered: false,
  },
  {
    title: "Instant Delivery",
    items: [
      "পেমেন্টের পরে আপনাকে তাৎক্ষণিকভাবে অর্ডার কনফার্মেশন পাঠানো হবে যাতে পণ্যের বিবরণ, কোড বা পরবর্তী ধাপ থাকে।",
      "স্বয়ংক্রিয় আইটেম (গিফট কার্ড, সাবস্ক্রিপশন কোড, লাইসেন্স কী) ওয়েবসাইট বা ইমেইলের মাধ্যমে অবিলম্বে সরবরাহ করা হয়।",
      "যদি ডেলিভারি বিলম্বিত হয়, আমাদের সিস্টেম পুনরায় ডেলিভারি চেষ্টা করবে এবং ইমেইলে আপনাকে জানাব।",
    ],
    ordered: false,
  },
  {
    title: "Manual Fulfillment",
    items: [
      "কিছু পণ্য (যেমন গেম টপ-আপ, ব্যালান্স অ্যাডিশন) আমাদের অপারেশন টিম দ্বারা ম্যানুয়ালি প্রক্রিয়াজাত করা হয়।",
      "ম্যানুয়াল অর্ডার সাধারণত ১–২৪ ঘণ্টার মধ্যে সম্পন্ন হয়, যা বাইরের প্রোভাইডারের উপর নির্ভর করে।",
      "ফুলফিলমেন্ট সম্পন্ন হলে আমরা অর্ডার স্ট্যাটাস আপডেট করে আপনাকে জানাব।",
    ],
    ordered: false,
  },
  {
    title: "Delivery Timeframes & SLA",
    items: [
      "তাত্ক্ষণিক আইটেম: কয়েক সেকেন্ড থেকে ৫ মিনিটের মধ্যে।",
      "ম্যানুয়াল আইটেম: বেশিরভাগ ক্ষেত্রে ১–২৪ ঘণ্টার মধ্যে।",
      "উচ্চ লোড বা প্রোভাইডার বিলম্বে: সর্বোচ্চ ৪৮ ঘন্টা সময় লাগতে পারে; প্রভাবিত গ্রাহকদের আমরা আগাম জানাব।",
    ],
    ordered: false,
  },
  {
    title: "If Delivery Fails",
    items: [
      "প্রথমে আপনার ইমেইল (স্প্যাম ফোল্ডারসহ) পরীক্ষা করুন — কনফার্মেশন বা কোড সেখানে থাকতে পারে।",
      "প্রত্যাশিত সময়ের পরে পণ্য না পেলে অর্ডার আইডি সহ সাপোর্টে যোগাযোগ করুন।",
      "ব্যর্থ ম্যানুয়াল ফুলফিলমেন্টের ক্ষেত্রে আমরা তদন্ত করে পুনরায় ডেলিভারি বা রিফান্ড বিবেচনা করব।",
    ],
    ordered: true,
  },
  {
    title: "Tracking & Order Status",
    items: [
      "প্রতিটি ক্রয়ের বর্তমান স্ট্যাটাস ও বিবরণ জানার জন্য 'My Orders' দেখুন।",
      "সফল ডেলিভারি বা অতিরিক্ত তথ্যের জন্য আপনি ইমেইল আপডেট পাবেন।",
    ],
    ordered: false,
  },
  {
    title: "Security & Privacy",
    items: [
      "আমরা আপনার পেমেন্ট ক্রেডেনশিয়াল তৃতীয় পক্ষের সাথে কখনো শেয়ার করি না।",
      "অর্ডার রসিদ ও কোড আপনার রেজিস্টার্ড ইমেইলে পাঠানো হয়; এগুলো নিরাপদে রাখুন।",
      "গোপনীয়তা সম্পর্কিত বিস্তারিত জানতে আমাদের প্রাইভেসি পলিসি দেখুন।",
    ],
    ordered: false,
  },
  {
    title: "Contact & Escalation",
    items: [
      "সমস্যা হলে অর্ডার আইডি ও সংক্ষিপ্ত বিবরণ সহ সাপোর্টে যোগাযোগ করুন।",
      "জরুরি সমস্যার জন্য দ্রুত সাড়া পেতে লাইভ চ্যাট ব্যবহার করুন।",
    ],
    ordered: false,
  },
];

const ProductDelivery: React.FC = () => {
  // small helper to open Tawk.to if available
  const openChat = () => {
    const api = (window as any).Tawk_API;
    if (!api) return false;
    if (typeof api.maximize === 'function') api.maximize();
    else if (typeof api.toggle === 'function') api.toggle();
    else if (typeof api.showWidget === 'function') api.showWidget();
    else if (typeof api.popup === 'function') api.popup();
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-anekbangla">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold font-sans text-gray-900 mb-6 text-center">Product Delivery</h1>
        <p className="text-center text-lg text-gray-600 mb-12">আমরা সব ধরনের ডিজিটাল পণ্য দ্রুত, নিরাপদ এবং নির্ভরযোগ্যভাবে ডেলিভারি করার লক্ষ্য রাখি। ডেলিভারির প্রক্রিয়া, সময়সীমা এবং যদি কোনো সমস্যা হয় তখন কী করতে হবে, তা নীচে পড়ুন।</p>

        <Accordion type="single" collapsible className="space-y-4">
          {sections.map((s, i) => (
            <AccordionItem key={i} value={`sec-${i}`}>
              <AccordionTrigger className="rounded-lg px-6 py-4 text-lg font-semibold font-sans text-gray-800 hover:bg-gray-100">{s.title}</AccordionTrigger>
              <AccordionContent className="p-6 rounded-b-lg text-gray-700">
                {s.ordered ? (
                  <ol className="list-decimal list-inside space-y-2">
                    {s.items.map((it, idx) => (
                      <li key={idx} className="text-base leading-relaxed">{it}</li>
                    ))}
                  </ol>
                ) : (
                  <ul className="list-disc list-inside space-y-2">
                    {s.items.map((it, idx) => (
                      <li key={idx} className="text-base leading-relaxed">{it}</li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <section className="mt-12 text-center">
          <Card className="font-sans text-white p-6 rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600">
            <h2 className="text-2xl tracking-tighter font-bold mb-2">Need faster help?</h2>
            <p className="mb-4">Contact our <span role="button" tabIndex={0} onClick={openChat} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openChat(); }} className="text-secondary hover:underline cursor-pointer">customer support</span> team for instant assistance.</p>
            <div className="text-sm text-white/90">
              <strong>Tip:</strong> Have your order ID ready for fastest resolution.
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDelivery;
