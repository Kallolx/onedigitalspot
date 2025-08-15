
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import GameCategories from "@/components/landing/GameCategories";
import { BeamsBackground } from "@/components/ui/beams-background";
import WhyOneDigital from "@/components/landing/WhyOneDigital";
import Footer from "@/components/landing/Footer";


const Index = () => {
  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <section className="w-full">
          <div className="w-full max-w-7xl mx-auto px-0 md:px-8">
            <HeroSection />
            <GameCategories />
            <WhyOneDigital />
            <Footer />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;