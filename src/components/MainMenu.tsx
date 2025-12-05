import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Info, BookOpen, Play, X } from "lucide-react";
import kemsLogo from "@/assets/kems-logo.png";

interface MainMenuProps {
  onPlay: () => void;
  onAbout: () => void;
  onInstructions: () => void;
  onQuit: () => void;
}

export const MainMenu = ({
  onPlay,
  onAbout,
  onInstructions,
  onQuit,
}: MainMenuProps) => {
  const buttonVariants = {
    initial: { x: -50, opacity: 0 },
    animate: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: 0.2 + i * 0.1, duration: 0.4 },
    }),
    hover: {},
  };

  const menuItems = [
    { label: "About", icon: Info, onClick: onAbout },
    { label: "Instructions", icon: BookOpen, onClick: onInstructions },
    { label: "Play", icon: Play, onClick: onPlay },
    { label: "Quit", icon: X, onClick: onQuit },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        backgroundImage: "url('/images/poker-table-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/70" />

      <motion.div
        className="relative z-10 text-center mb-12"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <img
          src={kemsLogo}
          alt="KEMS Logo"
          className="w-40 h-40 md:w-56 md:h-56 mx-auto object-contain"
        />
        <p className="text-xl md:text-2xl text-foreground/80 mt-2">
          Card Matching Game
        </p>
      </motion.div>

      <div className="relative z-10 flex flex-col gap-4 w-full max-w-xs">
        {menuItems.map((item, i) => (
          <motion.div
            key={item.label}
            custom={i}
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <Button
              onClick={item.onClick}
              className="w-full h-14 text-lg gap-3 bg-card/90 hover:bg-[#f54927] hover:text-white border border-border/50 backdrop-blur-sm transition-colors"
              variant="outline"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
