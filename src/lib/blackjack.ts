import { type CardRank, type CardSuit } from "../types";

export interface CardData {
	rank: CardRank;
	suit: CardSuit;
	rankText?: string;
}

export type GameStatus =
	| "betting"
	| "player_turn"
	| "dealer_turn"
	| "game_over";

const ranks: CardRank[] = [
	"Ace",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"Jack",
	"Queen",
	"King",
];
const suits: CardSuit[] = ["spade", "heart", "club", "diamond"];

// Rank to English display text mapping (Ace intentionally omitted)
const rankTextMap: Partial<Record<CardRank, string>> = {
	"2": "2",
	"3": "3",
	"4": "4",
	"5": "5",
	"6": "6",
	"7": "7",
	"8": "8",
	"9": "9",
	"10": "10",
	Jack: "Jack",
	Queen: "Queen",
	King: "King",
};

// Deck Generator & Shuffler (Fisher-Yates)
export const createShuffledDeck = (): CardData[] => {
	const deck: CardData[] = [];
	for (const suit of suits) {
		for (const rank of ranks) {
			deck.push({ rank, suit, rankText: rankTextMap[rank] });
		}
	}
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	return deck;
};

// Blackjack Hand Score Evaluator (Ace = 11 or 1, face cards = 10)
export const calculateHandScore = (
	hand: CardData[],
): { score: number; isBust: boolean } => {
	let score = 0;
	let aceCount = 0;

	for (const card of hand) {
		if (card.rank === "Ace") {
			aceCount += 1;
			score += 11;
		} else if (["Jack", "Queen", "King"].includes(card.rank)) {
			score += 10;
		} else {
			score += parseInt(card.rank, 10);
		}
	}

	while (score > 21 && aceCount > 0) {
		score -= 10;
		aceCount -= 1;
	}

	return { score, isBust: score > 21 };
};

// Safe draw helper (refill deck if empty)
export const drawCard = (
	deck: CardData[],
): { card: CardData; deck: CardData[] } => {
	const copy = deck.length > 0 ? [...deck] : createShuffledDeck();
	const card = copy.pop()!;
	return { card, deck: copy };
};

// Dealer hits until score reaches 17 or higher
export const playDealerHand = (
	hand: CardData[],
	deck: CardData[],
): { hand: CardData[]; deck: CardData[] } => {
	const dealerHand = [...hand];
	let currentDeck = [...deck];

	while (calculateHandScore(dealerHand).score < 17) {
		const draw = drawCard(currentDeck);
		currentDeck = draw.deck;
		dealerHand.push(draw.card);
	}

	return { hand: dealerHand, deck: currentDeck };
};

export interface GameResolution {
	message: string;
	chipDelta: number;
}

// Compute final result text + chip delta from settled hands
export const resolveOutcome = (params: {
	pScore: number;
	dScore: number;
	dealerHandLength: number;
	bet: number;
	isPlayerBlackjack: boolean;
}): GameResolution => {
	const { pScore, dScore, dealerHandLength, bet, isPlayerBlackjack } = params;

	if (isPlayerBlackjack) {
		if (dScore === 21 && dealerHandLength === 2) {
			return { message: "Push! Both hit Blackjack.", chipDelta: bet };
		}
		const payout = Math.floor(bet * 2.5);
		return {
			message: `BLACKJACK! You Won $${payout - bet}`,
			chipDelta: payout,
		};
	}

	if (dScore > 21) {
		return { message: "Dealer Busts! You Win!", chipDelta: bet * 2 };
	}
	if (pScore > dScore) {
		return { message: "You Win!", chipDelta: bet * 2 };
	}
	if (pScore < dScore) {
		return { message: "Dealer Wins.", chipDelta: 0 };
	}
	return { message: "Push!", chipDelta: bet };
};
