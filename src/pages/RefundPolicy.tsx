import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import Footer from "@/components/landing/Footer";
import { ThumbsDownIcon } from "hugeicons-react";

const RefundPolicy: React.FC = () => {
  const policies = [
    {
      title: "ডিজিটাল প্রোডাক্টস",
      items: [
        "সকল ডিজিটাল প্রোডাক্ট পেমেন্টের পরে তাৎক্ষণিকভাবে ডেলিভারি করা হয়।",
        "ডিজিটাল পণ্যের কারণে, শুধুমাত্র বিশেষ ক্ষেত্রে যেমন ডুপ্লিকেট ক্রয় বা সঠিক প্রোডাক্ট না পাওয়া গেলে রিফান্ড বিবেচিত হবে।",
        "সমস্যা হলে ৪৮ ঘণ্টার মধ্যে আমাদের সাথে যোগাযোগ করুন।",
      ],
      ordered: false,
    },
    {
      title: "সাবস্ক্রিপশন",
      items: [
        "সাবস্ক্রিপশন বাতিল কেস-বাই-কেস হ্যান্ডেল করা হয়।",
        "যদি সাবস্ক্রিপশন পুনর্নবীকরণে অপ্রত্যাশিতভাবে চার্জ হয়, আমাদের সাথে যোগাযোগ করুন।",
        "যাচাইয়ের পরে বৈধ হলে রিফান্ড প্রদানের ব্যবস্থা করা হবে।",
      ],
      ordered: false,
    },
    {
      title: "রিফান্ড রিকোয়েস্ট করার পদ্ধতি",
      items: [
        "কন্ট্যাক্ট ফর্ম বা ইমেইলের মাধ্যমে সাপোর্টের সাথে যোগাযোগ করুন।",
        "অর্ডার আইডি এবং সমস্যার সংক্ষিপ্ত বিবরণ দিন।",
        "আমাদের দল ৪৮ ঘণ্টার মধ্যে রিভিউ করে উত্তর দেবে।",
      ],
      ordered: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-anekbangla">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold font-sans text-gray-900 mb-6 text-center">
          Refund Policy
        </h1>
        <p className="text-center text-xl text-gray-600 mb-12">
          আমরা চাই আপনি আমাদের প্রোডাক্ট নিয়ে সন্তুষ্ট থাকুন। নিচে রিফান্ড ও
          বাতিলকরণের বিস্তারিত দেওয়া হলো।
        </p>

        <Accordion type="single" collapsible className="space-y-4">
          {policies.map((policy, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="rounded-lg px-6 py-4 text-lg font-semibold text-gray-800 hover:bg-gray-100">
                {policy.title}
              </AccordionTrigger>
              <AccordionContent className="p-6 rounded-b-lg text-lg text-gray-600">
                {policy.ordered ? (
                  <ol className="list-decimal list-inside space-y-2">
                    {policy.items.map((it, i) => (
                      <li key={i} className="text-base leading-relaxed">
                        {it}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ul className="list-disc list-inside space-y-2">
                    {policy.items.map((it, i) => (
                      <li key={i} className="text-base leading-relaxed">
                        {it}
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <section className="mt-12 text-center">
          <Card className="font-sans text-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl tracking-tighter font-bold  mb-2">
              <ThumbsDownIcon className="inline-block mr-2" />
              Not Helpful enough?
            </h2>
            {
              /* Handler to open Tawk.to chat widget if available */
            }
            <p>
              Contact our{' '}
              <span
                role="button"
                tabIndex={0}
                onClick={() => {
                  const api = (window as any).Tawk_API;
                  if (!api) return;
                  if (typeof api.maximize === 'function') api.maximize();
                  else if (typeof api.toggle === 'function') api.toggle();
                  else if (typeof api.showWidget === 'function') api.showWidget();
                  else if (typeof api.popup === 'function') api.popup();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    const api = (window as any).Tawk_API;
                    if (!api) return;
                    if (typeof api.maximize === 'function') api.maximize();
                    else if (typeof api.toggle === 'function') api.toggle();
                    else if (typeof api.showWidget === 'function') api.showWidget();
                    else if (typeof api.popup === 'function') api.popup();
                  }
                }}
                className="text-secondary underline cursor-pointer"
              >
                customer support
              </span>{' '}
              team for instant assistance.
            </p>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
