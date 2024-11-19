import { Appbar } from "./_components/Appbar";
import { HeroSection } from "./_components/HeroSection";
import { VideoCarousel } from "./_components/VideoCarousel";
import { RecentMarkets } from "./_components/RecentMarkets";
import { Usp } from "./_components/Usp";
import { Return } from "./_components/Return";
import Footer from "./_components/Footer";

export default function Home() {
  return (
    <div className="bg-[#f5f5f5] ">
      <main className="">
        <HeroSection />
        <VideoCarousel />
        <RecentMarkets />
        <Usp />
        <Return />
      </main>
    </div>
  );
}
