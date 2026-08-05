import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BurmeseCard } from "../BurmeseCard";

import { type CardRank, type CardSuit } from "../../types";

export interface CardData {
	rank: CardRank;
	suit: CardSuit;
	rankText?: string;
}

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

// Rank to English display text mapping
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

// Deck Generator & Shuffler
const createShuffledDeck = (): CardData[] => {
	const deck: CardData[] = [];
	for (const suit of suits) {
		for (const rank of ranks) {
			deck.push({
				rank,
				suit,
				rankText: rankTextMap[rank],
			});
		}
	}
	// Fisher-Yates Shuffle
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	return deck;
};

// Blackjack Hand Score Evaluator
const calculateHandScore = (
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

type GameStatus = "betting" | "player_turn" | "dealer_turn" | "game_over";

export const BlackjackGame: React.FC = () => {
	const [deck, setDeck] = useState<CardData[]>([]);
	const [playerHand, setPlayerHand] = useState<CardData[]>([]);
	const [dealerHand, setDealerHand] = useState<CardData[]>([]);

	const [chips, setChips] = useState<number>(1000);
	const [currentBet, setCurrentBet] = useState<number>(0);
	const [lastBet, setLastBet] = useState<number>(0);
	const [gameStatus, setGameStatus] = useState<GameStatus>("betting");
	const [resultMessage, setResultMessage] = useState<string>("");

	// layout handled via CSS gaps; autofocus removed

	// (startNewRound removed — dealing and betting handled via `dealHand` and `playNextRound`)

	// Deal cards for the current bet (optional betArg to place a bet immediately)
	const dealHand = (betArg?: number) => {
		const betToUse = typeof betArg === "number" ? betArg : currentBet;
		if (betToUse <= 0) return;

		// If betArg provided, deduct chips and set current bet immediately
		if (typeof betArg === "number") {
			if (chips < betArg) return;
			setChips((prev) => prev - betArg);
			setCurrentBet(betArg);
			setLastBet(betArg);
		} else {
			// using existing currentBet: ensure chips available then deduct
			if (chips < currentBet) return;
			setChips((prev) => prev - currentBet);
			setLastBet(currentBet);
		}

		// clear previous hands/result
		setResultMessage("");
		setPlayerHand([]);
		setDealerHand([]);

		const newDeck = deck.length > 0 ? [...deck] : createShuffledDeck();
		// deal order: player1, dealer1, player2, dealer2 (standard)
		const pHand: CardData[] = [];
		const dHand: CardData[] = [];
		pHand.push(newDeck.pop()!); // player1
		dHand.push(newDeck.pop()!); // dealer upcard
		pHand.push(newDeck.pop()!); // player2
		dHand.push(newDeck.pop()!); // dealer hole card

		setDeck(newDeck);
		setPlayerHand(pHand);
		setDealerHand(dHand);
		setGameStatus("player_turn");

		// Check Immediate Player Blackjack
		const pScore = calculateHandScore(pHand).score;
		if (pScore === 21) {
			resolveGame(pHand, dHand, newDeck, true);
		}
	};

	// Safe draw helper (refill deck if empty)
	const drawCard = (currentDeck: CardData[]) => {
		let deckCopy = [...currentDeck];
		if (deckCopy.length === 0) deckCopy = createShuffledDeck();
		const card = deckCopy.pop()!;
		return { card, deck: deckCopy };
	};

	// Player Actions
	const handleHit = () => {
		if (gameStatus !== "player_turn") return;

		const { card: newCard, deck: activeDeck } = drawCard(deck);
		const newHand = [...playerHand, newCard];

		setDeck(activeDeck);
		setPlayerHand(newHand);

		const { isBust } = calculateHandScore(newHand);
		if (isBust) {
			setGameStatus("game_over");
			setResultMessage("Bust! Dealer Wins.");
			setCurrentBet(0);
		}
	};

	const handleStand = () => {
		if (gameStatus !== "player_turn") return;
		resolveGame(playerHand, dealerHand, deck, false);
	};

	const handleDoubleDown = () => {
		if (gameStatus !== "player_turn" || chips < currentBet) return;

		setChips((prev) => prev - currentBet);
		const updatedBet = currentBet * 2;
		setCurrentBet(updatedBet);

		const { card: newCard, deck: activeDeck } = drawCard(deck);
		const newHand = [...playerHand, newCard];

		setDeck(activeDeck);
		setPlayerHand(newHand);

		const { isBust } = calculateHandScore(newHand);
		if (isBust) {
			setGameStatus("game_over");
			setResultMessage("Bust on Double Down! Dealer Wins.");
			setCurrentBet(0);
		} else {
			resolveGame(newHand, dealerHand, activeDeck, false);
		}
	};

	// Dealer Automation & Resolution
	const resolveGame = (
		pHand: CardData[],
		dHand: CardData[],
		activeDeck: CardData[],
		isPlayerBlackjack: boolean,
	) => {
		setGameStatus("dealer_turn");
		let currentDealerHand = [...dHand];
		let currentDeck = [...activeDeck];

		if (!isPlayerBlackjack) {
			// Dealer hits until score reaches 17 or higher
			while (calculateHandScore(currentDealerHand).score < 17) {
				const draw = drawCard(currentDeck);
				currentDeck = draw.deck;
				currentDealerHand.push(draw.card);
			}
		}

		setDealerHand(currentDealerHand);
		setDeck(currentDeck);
		setGameStatus("game_over");

		const bet = currentBet; // capture current bet for payout calculations
		const pScore = calculateHandScore(pHand).score;
		const dScore = calculateHandScore(currentDealerHand).score;
		const dBust = dScore > 21;

		// Prepare result text and compute chip delta to apply after reveal
		let resultText = "";
		let chipDelta = 0; // amount to add to chips after delay

		if (isPlayerBlackjack) {
			if (dScore === 21 && currentDealerHand.length === 2) {
				resultText = "Push! Both hit Blackjack.";
				chipDelta = bet; // return stake
			} else {
				const payout = Math.floor(bet * 2.5);
				resultText = `BLACKJACK! You Won $${payout - bet}`;
				chipDelta = payout;
			}
		} else if (dBust) {
			resultText = "Dealer Busts! You Win!";
			chipDelta = bet * 2;
		} else if (pScore > dScore) {
			resultText = "You Win!";
			chipDelta = bet * 2;
		} else if (pScore < dScore) {
			resultText = "Dealer Wins.";
			chipDelta = 0;
		} else {
			resultText = "Push!";
			chipDelta = bet;
		}

		setCurrentBet(0);

		// compute reveal animation duration matching dealer card variants
		const perIndexDelay = 0.18; // seconds
		const cardAnimDuration = 0.35; // seconds
		const extraPad = 0.12; // seconds safety pad
		const lastIndex = Math.max(0, currentDealerHand.length - 1);
		const revealDelayMs = Math.ceil(
			(lastIndex * perIndexDelay + cardAnimDuration + extraPad) * 1000,
		);

		setTimeout(() => {
			if (chipDelta !== 0) setChips((prev) => prev + chipDelta);
			setResultMessage(resultText);
		}, revealDelayMs);
	};

	// Bet Adjustment Handlers
	const addBet = (amount: number) => {
		// accumulate desired bet amount, actual chips deducted when dealing
		setCurrentBet((prev) => {
			const next = prev + amount;
			if (next > chips) return prev;
			setLastBet(next);
			return next;
		});
	};

	const resetBet = () => {
		// clear current bet without changing chips (chips deducted only on deal)
		setCurrentBet(0);
		setLastBet(0);
	};

	const playNextRound = () => {
		if (lastBet <= 0) return;
		// clear previous hands/result and return to betting stage
		setResultMessage("");
		setPlayerHand([]);
		setDealerHand([]);
		setDeck((prev) => (prev.length > 0 ? prev : createShuffledDeck()));

		// prefill current bet for quick replay if funds available
		if (chips >= lastBet) {
			setCurrentBet(lastBet);
		} else {
			setCurrentBet(0);
		}

		setGameStatus("betting");
	};

	const playerScore = calculateHandScore(playerHand);
	const dealerScore = calculateHandScore(dealerHand);

	return (
		<div className="w-full flex flex-nowrap items-start justify-center gap-16 px-6">
			<div className="flex-shrink-0 w-[820px] max-w-4xl bg-emerald-950/60 border-2 border-amber-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-md flex flex-col items-center justify-between relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-20">
				{/* Dealer */}
				<div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-400/80 uppercase">
					Dealer Hand{" "}
					{gameStatus === "game_over" && `(${dealerScore.score})`}
				</div>

				<div className="flex gap-4 justify-center items-end min-h-[12rem]">
					{dealerHand.map((card, idx) => {
						const isHidden =
							idx === 1 && gameStatus === "player_turn";
						return (
							<motion.div
								key={`dealer-${idx}`}
								custom={idx}
								initial="hidden"
								animate="visible"
								variants={{
									hidden: { opacity: 0, y: -30, scale: 0.85 },
									visible: (i: number) => ({
										opacity: 1,
										y: 0,
										scale: 0.95,
										transition: {
											delay: i * 0.18,
											duration: 0.35,
											ease: "easeOut",
										},
									}),
								}}
								className="-mx-2 first:ml-0 last:mr-0 origin-top">
								<BurmeseCard
									rank={card.rank}
									suit={card.suit}
									rankText={card.rankText}
									size="sm"
									faceDown={isHidden}
								/>
							</motion.div>
						);
					})}
				</div>

				{/* Result modal */}
				<AnimatePresence>
					{resultMessage && (
						<>
							<motion.div
								key="backdrop"
								initial={{ opacity: 0 }}
								animate={{ opacity: 0.5 }}
								exit={{ opacity: 0 }}
								className="fixed inset-0 bg-black/60 z-40"
							/>
							<motion.div
								key="modal"
								initial={{ opacity: 0, scale: 0.9, y: 20 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.9 }}
								transition={{ duration: 0.28 }}
								className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-amber-500 text-neutral-950 font-black tracking-widest text-lg rounded-2xl shadow-2xl border-2 border-amber-200 uppercase p-6 px-8 w-[min(90%,520px)] text-center">
								<div className="mb-4">{resultMessage}</div>
								<div className="flex gap-4 justify-center mt-2">
									{lastBet > 0 && (
										<button
											onClick={() => {
												setResultMessage("");
												playNextRound();
											}}
											className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md">
											Play Next
										</button>
									)}
								</div>
							</motion.div>
						</>
					)}
				</AnimatePresence>

				{/* Player */}
				<div className="w-full flex flex-col items-center gap-2 my-2">
					<div className="flex gap-4 justify-center items-start min-h-[12rem]">
						{playerHand.map((card, idx) => (
							<motion.div
								key={`player-${idx}`}
								custom={idx}
								initial="hidden"
								animate="visible"
								variants={{
									hidden: { opacity: 0, y: 30, scale: 0.85 },
									visible: (i: number) => ({
										opacity: 1,
										y: 0,
										scale: 0.95,
										transition: {
											delay: i * 0.12,
											duration: 0.32,
											ease: "easeOut",
										},
									}),
								}}
								className="-mx-2 first:ml-0 last:mr-0 origin-bottom">
								<BurmeseCard
									rank={card.rank}
									suit={card.suit}
									rankText={card.rankText}
									size="sm"
								/>
							</motion.div>
						))}
					</div>
					{playerHand.length > 0 && (
						<div className="text-xs font-semibold tracking-widest text-amber-400/80 uppercase">
							Your Score:{" "}
							<span className="text-amber-200 text-sm font-bold">
								{playerScore.score}
							</span>
						</div>
					)}
				</div>
			</div>

			<aside className="flex-shrink-0 w-64 flex flex-col items-start gap-6 z-10">
				<div className="text-amber-400 font-bold tracking-wide text-xs uppercase">
					Bankroll
				</div>
				<div className="text-emerald-400 font-mono font-extrabold text-2xl">
					${chips}
				</div>
				<div className="mt-2 text-amber-300 font-mono font-extrabold text-lg h-6">
					Bet: ${currentBet}
				</div>

				<div className="w-full flex flex-col items-start gap-4 pt-2">
					{gameStatus === "betting" || gameStatus === "game_over" ? (
						<div className="flex flex-col items-start gap-3">
							<div className="flex gap-4 items-center mb-4">
								{[10, 50, 100, 500].map((chipVal) => (
									<button
										key={chipVal}
										onClick={() => addBet(chipVal)}
										disabled={chips < chipVal}
										className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 hover:from-amber-300 hover:to-amber-600 border-2 border-amber-200 text-neutral-950 font-black text-xs shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center">
										+${chipVal}
									</button>
								))}

								<button
									onClick={resetBet}
									disabled={currentBet === 0}
									className={`px-3 py-1 rounded-full text-xs font-bold border ${currentBet === 0 ? "bg-red-900/20 text-red-900 border-red-900/10 pointer-events-none opacity-40" : "bg-red-900/60 hover:bg-red-800 text-red-200 border-red-500/40"}`}>
									Clear
								</button>
							</div>

							<button
								onClick={() => dealHand()}
								disabled={currentBet === 0}
								className="mt-2 w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold tracking-wider rounded-xl shadow-xl border border-emerald-400/40 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed uppercase text-sm">
								Deal Hand
							</button>
						</div>
					) : (
						<div className="flex flex-col gap-3 w-full">
							<div className="flex gap-2 w-full">
								<button
									onClick={handleHit}
									disabled={gameStatus !== "player_turn"}
									className="flex-1 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-200 font-bold rounded-xl shadow-lg active:scale-95">
									HIT
								</button>
								<button
									onClick={handleStand}
									disabled={gameStatus !== "player_turn"}
									className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-extrabold rounded-xl shadow-lg active:scale-95">
									STAND
								</button>
							</div>
							{playerHand.length === 2 && chips >= currentBet && (
								<button
									onClick={handleDoubleDown}
									disabled={gameStatus !== "player_turn"}
									className="w-full px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg active:scale-95">
									DOUBLE DOWN
								</button>
							)}
						</div>
					)}
				</div>
			</aside>
		</div>
	);
};
