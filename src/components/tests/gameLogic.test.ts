import {
  createDeck,
  dealCards,
  checkWinningHand,
  determineTargetRank,
  getAIMove,
} from "../GameBoard";
import { Card, Rank } from "../GameCard";

const makeCard = (rank: Rank, suit: string): Card => ({
  id: `${rank}-${suit}`,
  rank,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  suit: suit as any,
});

describe("createDeck", () => {
  test("creates a deck of 52 unique cards", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);

    const ids = new Set(deck.map((c) => c.id));
    expect(ids.size).toBe(52);
  });

  test("contains all suits and ranks", () => {
    const deck = createDeck();
    const suits = ["spades", "hearts", "diamonds", "clubs"];
    const ranks = Array.from({ length: 13 }, (_, i) => i + 1);

    suits.forEach((s) => {
      ranks.forEach((r) => {
        expect(deck.some((c) => c.rank === r && c.suit === s)).toBe(true);
      });
    });
  });
});

describe("dealCards", () => {
  test("deals the correct number of cards", () => {
    const deck = Array.from({ length: 10 }, (_, i) =>
      makeCard(((i % 13) + 1) as Rank, "spades")
    );

    const { cards, remainingDeck } = dealCards(deck, 4);

    expect(cards).toHaveLength(4);
    expect(remainingDeck).toHaveLength(6);
  });

  test("does not mutate the original deck", () => {
    const deck = [makeCard(1, "spades"), makeCard(2, "hearts")];
    dealCards(deck, 1);
    expect(deck).toHaveLength(2);
  });
});

describe("checkWinningHand", () => {
  test("returns true when hand contains four of the same rank", () => {
    const hand = [
      makeCard(5, "spades"),
      makeCard(5, "hearts"),
      makeCard(5, "diamonds"),
      makeCard(5, "clubs"),
    ];
    expect(checkWinningHand(hand)).toBe(true);
  });

  test("returns false when hand does not contain four of a kind", () => {
    const hand = [
      makeCard(1, "spades"),
      makeCard(2, "hearts"),
      makeCard(3, "diamonds"),
      makeCard(4, "clubs"),
    ];
    expect(checkWinningHand(hand)).toBe(false);
  });
});

describe("determineTargetRank", () => {
  test("returns the rank that appears twice", () => {
    const hand = [
      makeCard(7, "spades"),
      makeCard(7, "hearts"),
      makeCard(3, "diamonds"),
      makeCard(5, "clubs"),
    ];

    expect(determineTargetRank(hand)).toBe(7);
  });

  test("returns a random rank if no duplicates", () => {
    const hand = [
      makeCard(1, "spades"),
      makeCard(2, "hearts"),
      makeCard(3, "diamonds"),
      makeCard(4, "clubs"),
    ];

    const result = determineTargetRank(hand);
    expect([1, 2, 3, 4]).toContain(result);
  });
});

describe("getAIMove", () => {
  test("returns a move when target rank is on the table", () => {
    const aiHand = [
      makeCard(5, "spades"),
      makeCard(9, "hearts"),
      makeCard(9, "diamonds"),
      makeCard(10, "clubs"),
    ];

    const table = [
      makeCard(3, "clubs"),
      makeCard(7, "spades"),
      makeCard(5, "hearts"), // matches rank 5
      makeCard(8, "clubs"),
    ];

    const move = getAIMove(aiHand, table, 5);

    expect(move).not.toBeNull();
    expect(move!.tableIndex).toBe(2);
    expect(move!.handIndex).not.toBe(0); // AI shouldn't swap its target rank
  });

  test("returns null when no table card matches target rank", () => {
    const aiHand = [
      makeCard(5, "spades"),
      makeCard(6, "hearts"),
      makeCard(7, "diamonds"),
      makeCard(8, "clubs"),
    ];

    const table = [
      makeCard(1, "spades"),
      makeCard(2, "hearts"),
      makeCard(3, "diamonds"),
      makeCard(4, "clubs"),
    ];

    const move = getAIMove(aiHand, table, 10);
    expect(move).toBeNull();
  });

  test("returns null if AI has only target-rank cards", () => {
    const aiHand = [
      makeCard(5, "spades"),
      makeCard(5, "hearts"),
      makeCard(5, "diamonds"),
      makeCard(5, "clubs"),
    ];

    const table = [
      makeCard(5, "spades"),
      makeCard(5, "hearts"),
      makeCard(5, "diamonds"),
      makeCard(8, "clubs"),
    ];

    const move = getAIMove(aiHand, table, 5);
    expect(move).toBeNull();
  });
});
