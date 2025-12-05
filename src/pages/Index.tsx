import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { GameBoard } from "@/components/GameBoard";
import { SplashScreen } from "@/components/SplashScreen";
import { MainMenu } from "@/components/MainMenu";
import { useToast } from "@/hooks/use-toast";

type Screen = "splash" | "menu" | "game";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const { toast } = useToast();

  const handleSplashComplete = () => {
    setCurrentScreen("menu");
  };

  const handlePlay = () => {
    setCurrentScreen("game");
  };

  const handleAbout = () => {
    toast({
      title: "About KEMS",
      description:
        "A fun card matching game. Match 4 cards of the same rank to win!",
    });
  };

  const handleInstructions = () => {
    toast({
      title: "How to Play",
      description:
        "Click cards from the center to swap with your hand. Get 4 matching cards to win!",
    });
  };

  const handleQuit = () => {
    toast({
      title: "Thanks for playing!",
      description: "See you next time!",
    });
  };

  const handleBackToMenu = () => {
    setCurrentScreen("menu");
  };

  return (
    <AnimatePresence mode="wait">
      {currentScreen === "splash" && (
        <SplashScreen key="splash" onComplete={handleSplashComplete} />
      )}
      {currentScreen === "menu" && (
        <MainMenu
          key="menu"
          onPlay={handlePlay}
          onAbout={handleAbout}
          onInstructions={handleInstructions}
          onQuit={handleQuit}
        />
      )}
      {currentScreen === "game" && (
        <GameBoard key="game" onBackToMenu={handleBackToMenu} />
      )}
    </AnimatePresence>
  );
};

export default Index;
