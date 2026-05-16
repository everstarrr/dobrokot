import { AboutUsSection } from "./ui/AboutUsSection";
import { ArticlesSection } from "./ui/ArticlesSection";
import { HeroSection } from "./ui/HeroSection";
import { HeroSectionDesktop } from "./ui/HeroSectionDesktop";
import { HowItWorksSection } from "./ui/HowItWorksSection";
import { PartnersSection } from "./ui/PartnersSection";

function MainPage() {
  return (
    <main className="flex flex-col sm:gap-10 gap-20">
      <HeroSection />
      <HeroSectionDesktop />

      <AboutUsSection />
      <HowItWorksSection />
      <PartnersSection />
      <ArticlesSection />
    </main>
  );
}

export default MainPage;
