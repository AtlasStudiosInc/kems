import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

interface GameCardProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  faceDown?: boolean;
  size?: "sm" | "md";
}

const getCardImagePath = (card: Card): string => {
  return `/images/cards/${card.suit}-${card.rank}.png`;
};

const getCardBackImagePath = (): string => {
  return `/images/cards/back-blue.png`;
};

export const GameCard = ({
  card,
  onClick,
  selected,
  disabled,
  faceDown,
  size = "md",
}: GameCardProps) => {
  if (faceDown) {
    return (
      <motion.div
        className={cn(
          "relative rounded-lg overflow-hidden",
          size === "sm" ? "aspect-[2/3]" : "aspect-[2/3]"
        )}
        transition={{ type: "spring", stiffness: 10, damping: 22, mass: 1.5 }}
        //transition={{ type: "spring", stiffness: 40, damping: 25 }}
      >
        <img
          src={getCardBackImagePath()}
          alt="Card back"
          className="w-full h-full object-cover"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "relative cursor-pointer rounded-lg overflow-hidden",
        size === "sm" ? "aspect-[2/3]" : "aspect-[2/3]",
        selected
          ? "ring-4 ring-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)] scale-105"
          : "",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={disabled ? undefined : onClick}
      whileHover={!disabled ? { scale: 1.05, y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 10, damping: 22, mass: 1.5 }}
      //transition={{ type: "spring", stiffness: 40, damping: 25 }}
    >
      <img
        src={getCardImagePath(card)}
        alt={`${card.rank} of ${card.suit}`}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
};
