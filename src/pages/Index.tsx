import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GameCategories from "@/components/GameCategories";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />      
      <main className="flex-1 w-full">
        <section className="w-full">
          <div className="w-full max-w-7xl mx-auto px-0 md:px-8">
            <HeroSection />
            <GameCategories />
          </div>
        </section>        
      </main>

    </div>
  );
};

export default Index;