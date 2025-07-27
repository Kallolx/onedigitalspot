import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GameCategories from "@/components/GameCategories";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <Header />
      <HeroSection />
      <GameCategories />
    </div>
  );
};

export default Index;
