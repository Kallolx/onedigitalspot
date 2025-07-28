import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GameCategories from "@/components/GameCategories";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <HeroSection />
      <GameCategories />
      <Footer />
    </div>
  );
};

export default Index;
