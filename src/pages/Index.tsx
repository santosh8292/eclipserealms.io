import HeroSection from "@/components/ui/hero-section";
import FeaturesSection from "@/components/ui/features-section";
import RealmsSection from "@/components/ui/realms-section";
import CharactersSection from "@/components/ui/characters-section";
import Footer from "@/components/ui/footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <RealmsSection />
      <CharactersSection />
      <Footer />
    </div>
  );
};

export default Index;
