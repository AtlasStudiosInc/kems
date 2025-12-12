/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from "react";
import { GameCard, Card, Suit, Rank } from "./GameCard";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import swapSoundUrl from "../assets/Audio/swap.mp3";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({ id: `${rank}-${suit}`, rank, suit });
    });
  });
  return deck.sort(() => Math.random() - 0.5);
};

export const dealCards = (
  deck: Card[],
  count: number
): { cards: Card[]; remainingDeck: Card[] } => {
  const cards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  return { cards, remainingDeck };
};

export const checkWinningHand = (hand: Card[]): boolean => {
  const rankCounts = hand.reduce(
    (acc, card) => {
      acc[card.rank] = (acc[card.rank] || 0) + 1;
      return acc;
    },
    {} as Record<Rank, number>
  );

  return Object.values(rankCounts).some((count) => count === 4);
};

export const determineTargetRank = (hand: Card[]): Rank => {
  // Count ranks in hand
  const rankCounts = hand.reduce(
    (acc, card) => {
      acc[card.rank] = (acc[card.rank] || 0) + 1;
      return acc;
    },
    {} as Record<Rank, number>
  );

  // Find if there's a duplicate rank
  const duplicateRank = Object.entries(rankCounts).find(
    ([_, count]) => count >= 2
  );
  if (duplicateRank) {
    return parseInt(duplicateRank[0]) as Rank;
  }

  // Otherwise pick a random rank from the hand
  const randomIndex = Math.floor(Math.random() * hand.length);
  return hand[randomIndex].rank;
};

export const getAIMove = (
  aiHand: Card[],
  tableCards: Card[],
  targetRank: Rank
): { tableIndex: number; handIndex: number } | null => {
  // Look for a table card that matches the target rank
  const targetTableIndex = tableCards.findIndex(
    (card) => card.rank === targetRank
  );

  if (targetTableIndex !== -1) {
    // Find a card in hand that is NOT the target rank to swap
    const nonTargetHandIndex = aiHand.findIndex(
      (card) => card.rank !== targetRank
    );

    if (nonTargetHandIndex !== -1) {
      return { tableIndex: targetTableIndex, handIndex: nonTargetHandIndex };
    }
  }

  // No matching card found on table, return null (AI passes this round)
  return null;
};

interface GameBoardProps {
  onBackToMenu?: () => void;
}

export const GameBoard = ({ onBackToMenu }: GameBoardProps) => {
  const [deck, setDeck] = useState<Card[]>(createDeck());
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHand, setAIHand] = useState<Card[]>([]);
  const [tableCards, setTableCards] = useState<Card[]>([]);
  const [recycledCards, setRecycledCards] = useState<Card[]>([]);
  const [selectedTableCard, setSelectedTableCard] = useState<number | null>(
    null
  );
  const [selectedHandCard, setSelectedHandCard] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<
    "playing" | "playerWin" | "aiWin" | "aiWinPending"
  >("playing");
  const [turnCount, setTurnCount] = useState(0);
  const [aiTargetRank, setAiTargetRank] = useState<Rank | null>(null);
  const [gameInitialized, setGameInitialized] = useState(false);

  useEffect(() => {
    initNewGame();
  }, []);

  const initNewGame = () => {
    const newDeck = createDeck();
    const { cards: pHand, remainingDeck: deck1 } = dealCards(newDeck, 4);
    const { cards: aHand, remainingDeck: deck2 } = dealCards(deck1, 4);
    const { cards: tCards, remainingDeck: finalDeck } = dealCards(deck2, 4);

    setPlayerHand(pHand);
    setAIHand(aHand);
    setTableCards(tCards);
    setDeck(finalDeck);
    setRecycledCards([]);
    setSelectedTableCard(null);
    setSelectedHandCard(null);
    setGameStatus("playing");
    setGameInitialized(true);
    setTurnCount(0);
    const targetRank = determineTargetRank(aHand);
    setAiTargetRank(targetRank);
    console.log(
      "AI target rank:",
      targetRank,
      "AI hand:",
      aHand.map((c) => `${c.rank}-${c.suit}`)
    );

    // The computer plays first
    setTimeout(() => {
      performAITurnWithState(aHand, tCards, targetRank);
    }, 500);
  };

  useEffect(() => {
    // Only check wins after game is initialized and hands are dealt
    if (!gameInitialized || playerHand.length < 4 || aiHand.length < 4) return;

    if (checkWinningHand(playerHand)) {
      setGameStatus("playerWin");
      Haptics.impact({ style: ImpactStyle.Heavy });
    } else if (checkWinningHand(aiHand)) {
      // Show AI cards first, then reveal win after 2 seconds
      setGameStatus("aiWinPending");
      Haptics.impact({ style: ImpactStyle.Heavy });
      setTimeout(() => {
        setGameStatus("aiWin");
      }, 2000);
    }
  }, [playerHand, aiHand, gameInitialized]);

  // Player selects their hand card first
  const handlePlayerHandCardClick = (index: number) => {
    if (gameStatus !== "playing") return;
    Haptics.impact({ style: ImpactStyle.Light });

    if (selectedHandCard === index) {
      // Deselect if clicking the same card
      setSelectedHandCard(null);
    } else {
      setSelectedHandCard(index);
    }
  };

  // Play swap sound
  const playSwapSound = () => {
    const audio = new Audio(swapSoundUrl);

    audio.volume = 0.5;
    audio.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });
  };

  // Then player selects a table card to swap with
  const handleTableCardClick = (index: number) => {
    if (gameStatus !== "playing" || selectedHandCard === null) return;

    Haptics.impact({ style: ImpactStyle.Medium });
    playSwapSound();

    // Mark the swap happening for animation
    setSelectedTableCard(index);

    // Delay the actual swap to allow animation
    setTimeout(() => {
      const newPlayerHand = [...playerHand];
      const newTableCards = [...tableCards];
      const temp = newPlayerHand[selectedHandCard];
      newPlayerHand[selectedHandCard] = newTableCards[index];
      newTableCards[index] = temp;

      setPlayerHand(newPlayerHand);
      setTableCards(newTableCards);
      setSelectedTableCard(null);
      setSelectedHandCard(null);
    }, 400);
  };

  const performAITurnWithState = (
    currentAIHand: Card[],
    currentTableCards: Card[],
    targetRank: Rank
  ) => {
    console.log(
      "AI turn - Target:",
      targetRank,
      "Table cards:",
      currentTableCards.map((c) => `${c.rank}-${c.suit}`)
    );
    const move = getAIMove(currentAIHand, currentTableCards, targetRank);
    console.log("AI move:", move);

    if (move) {
      Haptics.impact({ style: ImpactStyle.Medium });
      playSwapSound();

      // Delay the swap for visible animation
      setTimeout(() => {
        const newAIHand = [...currentAIHand];
        const newTableCards = [...currentTableCards];
        const temp = newAIHand[move.handIndex];
        newAIHand[move.handIndex] = newTableCards[move.tableIndex];
        newTableCards[move.tableIndex] = temp;

        setAIHand(newAIHand);
        setTableCards(newTableCards);
      }, 400);
    }

    setTurnCount((prev) => prev + 1);
  };

  const nextRound = () => {
    if (gameStatus !== "playing" || !aiTargetRank) return;

    // Move current table cards to recycle
    const oldTableCards = [...tableCards];
    setRecycledCards((prev) => [...prev, ...oldTableCards]);

    // Deal 4 new cards to table
    const { cards: newTableCards, remainingDeck: newDeck } = dealCards(deck, 4);

    let finalTableCards: Card[];
    if (newTableCards.length < 4) {
      // Reshuffle recycle bin if deck is empty
      const reshuffledDeck = [...recycledCards, ...newDeck].sort(
        () => Math.random() - 0.5
      );
      const { cards: tCards, remainingDeck: finalDeck } = dealCards(
        reshuffledDeck,
        4
      );
      finalTableCards = tCards;
      setTableCards(tCards);
      setDeck(finalDeck);
      setRecycledCards([]);
    } else {
      finalTableCards = newTableCards;
      setTableCards(newTableCards);
      setDeck(newDeck);
    }

    setSelectedTableCard(null);
    setSelectedHandCard(null);
    Haptics.impact({ style: ImpactStyle.Light });

    // The computer plays first in new round
    setTimeout(() => {
      performAITurnWithState(aiHand, finalTableCards, aiTargetRank);
    }, 500);
  };

  // Game Layout
  return (
    <div
      className="min-h-screen p-4 flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/images/poker-table-background.jpg')` }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-4 pt-2"
      >
        <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">
          Card Collection
        </h1>
        <div className="flex justify-center gap-4 text-white text-sm">
          <div className="bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/20">
            Turns:{" "}
            <span className="font-bold text-yellow-400">{turnCount}</span>
          </div>
          <div className="bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/20">
            Deck:{" "}
            <span className="font-bold text-yellow-400">{deck.length}</span>
          </div>
        </div>
      </motion.div>

      {/* Computer Hand */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-3"
      >
        <div className="text-center text-sm text-white/80 mb-2 drop-shadow">
          Computer
        </div>
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          {aiHand.map((card) => (
            <GameCard
              key={card.id}
              card={card}
              faceDown={gameStatus !== "aiWinPending" && gameStatus !== "aiWin"}
              size="sm"
            />
          ))}
        </div>
      </motion.div>

      {/* Table Cards */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 mb-3"
      >
        <div className="text-center text-sm text-white/80 mb-2 drop-shadow">
          {selectedHandCard !== null ? "Select a table card to swap" : "Table"}
        </div>
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          {tableCards.map((card, index) => (
            <GameCard
              key={card.id}
              card={card}
              onClick={() => handleTableCardClick(index)}
              selected={selectedTableCard === index}
              disabled={selectedHandCard === null}
            />
          ))}
        </div>
      </motion.div>

      {/* Player Hand */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-3"
      >
        <div className="text-center text-sm text-white/80 mb-2 drop-shadow">
          {selectedHandCard === null
            ? "Select a card from your hand"
            : "Your Hand"}
        </div>
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          {playerHand.map((card, index) => (
            <GameCard
              key={card.id}
              card={card}
              onClick={() => handlePlayerHandCardClick(index)}
              selected={selectedHandCard === index}
            />
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 max-w-md mx-auto w-full pb-4"
      >
        <Button
          onClick={nextRound}
          disabled={gameStatus !== "playing"}
          className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl shadow-lg"
        >
          Next Round
        </Button>
        <Button
          onClick={initNewGame}
          variant="secondary"
          className="flex-1 font-bold rounded-xl bg-white/90 hover:bg-white text-gray-800"
        >
          New Game
        </Button>
        {onBackToMenu && (
          <Button
            onClick={onBackToMenu}
            variant="outline"
            className="font-bold rounded-xl border-white/30 text-white hover:bg-white/20"
          >
            Menu
          </Button>
        )}
      </motion.div>

      {/* Win Modal */}
      <AnimatePresence>
        {(gameStatus === "playerWin" || gameStatus === "aiWin") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={initNewGame}
          >
            <motion.div
              initial={{ scale: 0, rotateZ: -10 }}
              animate={{ scale: 1, rotateZ: 0 }}
              exit={{ scale: 0, rotateZ: 10 }}
              className="bg-gradient-to-br from-green-900 to-green-800 p-8 rounded-3xl shadow-2xl border-4 border-yellow-500/50 text-center max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-7xl mb-4"
              >
                {gameStatus === "playerWin" ? "🎉" : "🤖"}
              </motion.div>
              <h2 className="text-3xl font-bold mb-2 text-white">
                {gameStatus === "playerWin" ? "You Won!" : "Computer Wins!"}
              </h2>
              <p className="text-white/70 mb-6">
                {gameStatus === "playerWin"
                  ? `Completed in ${turnCount} turns`
                  : "Better luck next time!"}
              </p>
              <Button
                onClick={initNewGame}
                size="lg"
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-gray-900 font-bold rounded-xl"
              >
                Play Again
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
