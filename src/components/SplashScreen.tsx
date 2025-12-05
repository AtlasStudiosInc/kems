import { motion } from "framer-motion";
import kemsLogo from "@/assets/kems-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-background z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        setTimeout(onComplete, 3000);
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <img
          src={kemsLogo}
          alt="KEMS Logo"
          className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-4 object-contain"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xl text-muted-foreground"
        >
          Card Matching Game
        </motion.p>
        <motion.div
          className="mt-8 w-16 h-1 bg-[#f54927] mx-auto rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 2.2, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  );
};
