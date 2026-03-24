import HeroSection from "@/components/hero-section";
import HowItWorks from "@/components/how-it-works";
import { InteractiveGridBackground } from "@/components/interactive-grid-background";
import { StatsCards } from "@/components/stats-cards";
import { PrimaryItemGridSection } from "@/components/flx/blocks/bento-grids/primary-item-grid/primary-item-grid-example";
import { Hero01 } from "@/components/hero-01";


export default function Home() {
  const features = [
    {
      title: "Create Account",
      description:
        "Sign up in minutes. Enter your details and verify your email to get started.",
      colors: {
        bg: "bg-orange-50 dark:bg-orange-500/10",
        text: "text-orange-500 dark:text-orange-400",
        border: "border-orange-100 dark:border-orange-500/20",
      },
    },
    {
      title: "Verify Identity",
      description:
        "Complete your profile verification to ensure secure transactions and compliance.",
      colors: {
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-100 dark:border-blue-500/20",
      },
    },
    {
      title: "Select Plan",
      description:
        "Choose from a variety of investment plans tailored to your financial goals.",
      colors: {
        bg: "bg-purple-50 dark:bg-purple-500/10",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-100 dark:border-purple-500/20",
      },
    },
    {
      title: "Analyze & Invest",
      description:
        "Review returns and make your first investment with confidence.",
      colors: {
        bg: "bg-orange-50 dark:bg-orange-500/10",
        text: "text-orange-500 dark:text-orange-400",
        border: "border-orange-100 dark:border-orange-500/20",
      },
    },
    {
      title: "Track Growth",
      description:
        "Monitor your portfolio in real-time and watch your wealth grow over time.",
      colors: {
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-100 dark:border-blue-500/20",
      },
    },
  ];

  const stepPositions = [
    { className: "md:absolute md:top-0 md:left-[15%]", rotate: "rotate-6" },
    {
      className: "md:absolute md:top-[120px] md:right-[15%]",
      rotate: "-rotate-6",
    },
    {
      className: "md:absolute md:top-[450px] md:left-[15%]",
      rotate: "rotate-6",
    },
    {
      className: "md:absolute md:top-[570px] md:right-[10%]",
      rotate: "-rotate-6",
    },
    {
      className: "md:absolute md:top-[850px] md:left-[15%]",
      rotate: "rotate-6",
    },
  ];
  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-sans">
      <HeroSection />
      {/* <InteractiveGridBackground> */}
        {/* <HowItWorks features={features} stepPositions={stepPositions} /> */}

        {/* <StatsCards
          width="w-70"
          height="h-84"
          images={["https://images.unsplash.com/photo-1715635845608-957c4a49500f?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "https://images.unsplash.com/photo-1612696874005-d015469bc660?q=80&w=996&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"]}
        /> */}

      {/* </InteractiveGridBackground> */}
      <PrimaryItemGridSection />
      
      <Hero01/>
    </div>
  );
}
