import { Appbar } from "./_components/Appbar";
import { HeroSection } from "./_components/HeroSection";
import { VideoCarousel } from "./_components/VideoCarousel";
import { RecentMarkets } from "./_components/RecentMarkets";
import { Usp } from "./_components/Usp";
import { Return } from "./_components/Return";
import { DebugEnv } from "./_components/DebugEnv";

export default function Home() {
  return (
    <div className="bg-[#f5f5f5] ">
      <main className="">
        <Appbar />
        <HeroSection />
        <VideoCarousel />
        <RecentMarkets />
        <Usp />
        <Return />
        <DebugEnv />
      </main>
    </div>
  );
}
