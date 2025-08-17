import React from "react";
import { SpinningLogos } from "@/components/custom/spinning-logo";

const WhyOneDigital: React.FC = () => {


const features = [
  {
    icon: <img src="/assets/icons/fast.svg" alt="Lightning Fast" className="w-10 h-10" />,
    title: "দ্রুত ডেলিভারি",
    description: "কয়েক সেকেন্ডের মধ্যে অর্ডার পৌঁছে যায়, সময় বাঁচান সহজভাবে।",
  },
  {
    icon: <img src="/assets/icons/shield.svg" alt="100% Secure" className="w-10 h-10" />,
    title: "পূর্ণ নিরাপত্তা",
    description: "এনক্রিপশন নিশ্চিত করে আপনার তথ্য সম্পূর্ণ সুরক্ষিত।",
  },
  {
    icon: <img src="/assets/icons/clock.svg" alt="24/7 Support" className="w-10 h-10" />,
    title: "২৪/৭ সহায়তা",
    description: "যেকোনো সময় সমস্যার জন্য আমাদের সাথে সহজে যোগাযোগ করুন।",
  },
  {
    icon: <img src="/assets/icons/design/telegram.svg" alt="Best Prices" className="w-10 h-10" />,
    title: "সেরা দাম",
    description: "অপ্রতিরোধ্য ডিল এবং মানসম্পন্ন সেবা আপনার জন্য।",
  }
];


  return (
    <div className="w-full py-12 md:py-24 px-4">
      {/* Mobile Layout */}
      <div className="block md:hidden space-y-8">
        {/* Mobile Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2  px-4 py-2 rounded-full border">
            <img src="/assets/icons/design/telegram.svg" alt="Sparkles" className="w-4 h-4 text-blue-500" />
            <span className="text-md font-medium font-anekbangla text-foreground">কেন <span className="font-sans">OneDigitalSpot</span> বেছে নেবেন?</span>
          </div>
          <h2 className="text-xl font-bold font-anekbangla text-foreground">
            বাংলাদেশের <span className="text-secondary">#১ ডিজিটাল প্ল্যাটফর্ম</span>
          </h2>
        </div>

        {/* Mobile Spinner */}
        <div className="h-[40vh] flex items-center justify-center">
          <SpinningLogos />
        </div>

        {/* Mobile Features Grid */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature} flex items-center justify-center text-white mb-3`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold font-anekbangla text-sm text-foreground mb-1">{feature.title}</h3>
              <p className="text-xs font-anekbangla text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-8">
        {/* Desktop Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 rounded-full border border-blue-200/20">
            <img src="/assets/icons/design/telegram.svg" alt="Sparkles" className="w-4 h-4 text-blue-500" />
            <span className="text-md font-medium font-anekbangla text-foreground">কেন <span className="font-sans">OneDigitalSpot</span> বেছে নেবেন?</span>
          </div>
          <h2 className="text-3xl font-bold font-anekbangla text-foreground">
            বাংলাদেশের <span className="text-secondary">#১ ডিজিটাল প্ল্যাটফর্ম</span>
          </h2>
        </div>

        {/* Desktop Cards Layout */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-6">
          {/* Left Panel */}
          <div className="w-full lg:w-1/4 flex flex-col gap-6 mb-6 lg:mb-0">
              {/* Lightning Fast Card */}
              <div className="rounded-2xl p-8 border flex-1 flex flex-col justify-between bg-white/80 dark:bg-gray-900/80">
                <div className="mb-4">
                  <img src="/assets/icons/fast.svg" alt="Lightning Fast" className="w-20 h-20" />
                </div>
                <h3 className="font-semibold font-anekbangla text-2xl text-foreground mb-2">{features[0].title}</h3>
                <p className="text-base font-anekbangla md:text-lg text-muted-foreground">{features[0].description}</p>
              </div>

              {/* 100% Secure Card */}
              <div className="rounded-2xl p-8 border flex-1 flex flex-col justify-between bg-white/80 dark:bg-gray-900/80">
                <div className="mb-4">
                  <img src="/assets/icons/shield.svg" alt="100% Secure" className="w-20 h-20" />
                </div>
                <h3 className="font-semibold text-2xl font-anekbangla text-foreground mb-2">{features[1].title}</h3>
                <p className="text-base md:text-lg font-anekbangla text-muted-foreground">{features[1].description}</p>
              </div>
          </div>

          {/* Center Spinner */}
          <div className="w-full lg:w-2/4 flex items-center justify-center mt-16 mb-16" style={{maxHeight: 400}}>
            <SpinningLogos />
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-1/4 flex flex-col gap-6">
              {/* 24/7 Support Card */}
              <div className="rounded-2xl p-8 border flex-1 flex flex-col justify-between bg-white/80 dark:bg-gray-900/80">
                <div className="mb-4">
                  <img src="/assets/icons/clock.svg" alt="24/7 Support" className="w-20 h-20" />
                </div>
                <h3 className="font-semibold text-2xl font-anekbangla text-foreground mb-2">{features[2].title}</h3>
                <p className="text-base md:text-lg font-anekbangla text-muted-foreground">{features[2].description}</p>
              </div>

              {/* Best Prices Card */}
              <div className="rounded-2xl p-8 border flex-1 flex flex-col justify-between bg-white/80 dark:bg-gray-900/80">
                <div className="mb-4">
                  <img src="/assets/icons/design/telegram.svg" alt="Best Prices" className="w-20 h-20" />
                </div>
                <h3 className="font-semibold text-2xl font-anekbangla text-foreground mb-2">{features[3].title}</h3>
                <p className="text-base md:text-lg font-anekbangla text-muted-foreground">{features[3].description}</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyOneDigital;