import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CardHand } from "./CardHand";
import { ResultModal } from "./ResultModal";
import { Sidebar } from "./Sidebar";
import {
	calculateHandScore,
	createShuffledDeck,
	drawCard,
	playDealerHand,
	resolveOutcome,
	type CardData,
	type GameStatus,
} from "../../lib/blackjack";

// Timing constants matching the dealer reveal animation in CardHand
const REVEAL_TIMING = {
	perIndexDelay: 0.18, // seconds per card stagger
	cardAnimDuration: 0.35, // seconds
	extraPad: 0.12, // seconds safety pad
};

const STARTING_CHIPS = 1000;

// Delay before showing result + bankroll update (after dealer reveals all cards)
const revealDelayMs = (handLength: number) =>
	Math.ceil(
		(Math.max(0, handLength - 1) * REVEAL_TIMING.perIndexDelay +
			REVEAL_TIMING.cardAnimDuration +
			REVEAL_TIMING.extraPad) *
			1000,
	);

export const BlackjackGame: React.FC = () => {
	const [deck, setDeck] = useState<CardData[]>([]);
	const [playerHand, setPlayerHand] = useState<CardData[]>([]);
	const [dealerHand, setDealerHand] = useState<CardData[]>([]);
	const [chips, setChips] = useState<number>(STARTING_CHIPS);
	const [currentBet, setCurrentBet] = useState<number>(0);
	const [lastBet, setLastBet] = useState<number>(0);
	const [gameStatus, setGameStatus] = useState<GameStatus>("betting");
	const [resultMessage, setResultMessage] = useState<string>("");

	const playerScore = calculateHandScore(playerHand);
	const dealerScore = calculateHandScore(dealerHand);

	// Deal cards for the current bet, deducting chips
	const dealHand = () => {
		if (currentBet <= 0 || chips < currentBet) return;

		setChips((prev) => prev - currentBet);
		setLastBet(currentBet);
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

		// Check immediate player blackjack
		if (calculateHandScore(pHand).score === 21) {
			resolveGame(pHand, dHand, newDeck, true);
		}
	};

	// Player Actions
	const handleHit = () => {
		if (gameStatus !== "player_turn") return;

		const { card, deck: activeDeck } = drawCard(deck);
		const newHand = [...playerHand, card];

		setDeck(activeDeck);
		setPlayerHand(newHand);

		if (calculateHandScore(newHand).isBust) {
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

		const { card, deck: activeDeck } = drawCard(deck);
		const newHand = [...playerHand, card];

		setDeck(activeDeck);
		setPlayerHand(newHand);

		if (calculateHandScore(newHand).isBust) {
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

		// Dealer plays out (unless player has blackjack), then settle
		const { hand: dealerFinal, deck: finalDeck } = isPlayerBlackjack
			? { hand: [...dHand], deck: [...activeDeck] }
			: playDealerHand(dHand, activeDeck);

		setDealerHand(dealerFinal);
		setDeck(finalDeck);
		setGameStatus("game_over");

		const { message, chipDelta } = resolveOutcome({
			pScore: calculateHandScore(pHand).score,
			dScore: calculateHandScore(dealerFinal).score,
			dealerHandLength: dealerFinal.length,
			bet: currentBet,
			isPlayerBlackjack,
		});

		setCurrentBet(0);

		// Reveal result + bankroll after dealer animation finishes
		setTimeout(() => {
			if (chipDelta !== 0) setChips((prev) => prev + chipDelta);
			setResultMessage(message);
		}, revealDelayMs(dealerFinal.length));
	};

	// Bet Adjustment Handlers (chips only deducted on deal)
	const addBet = (amount: number) => {
		setCurrentBet((prev) => {
			const next = prev + amount;
			if (next > chips) return prev;
			setLastBet(next);
			return next;
		});
	};

	const resetBet = () => {
		setCurrentBet(0);
		setLastBet(0);
	};

	const playNextRound = () => {
		if (lastBet <= 0) return;

		setResultMessage("");
		setPlayerHand([]);
		setDealerHand([]);
		setDeck((prev) => (prev.length > 0 ? prev : createShuffledDeck()));

		// prefill current bet for quick replay if funds available
		setCurrentBet(chips >= lastBet ? lastBet : 0);
		setGameStatus("betting");
	};

	const canDoubleDown = playerHand.length === 2 && chips >= currentBet;

	return (
		<div className="w-full flex flex-nowrap items-start justify-center gap-16 px-6">
			<div className="shrink-0 w-[820px] max-w-4xl bg-emerald-950/60 border-2 border-amber-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-md flex flex-col items-center justify-between relative shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-20">
				<div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-amber-400/80 uppercase">
					Dealer Hand{" "}
					{gameStatus === "game_over" && `(${dealerScore.score})`}
				</div>

				<CardHand
					hand={dealerHand}
					direction="dealer"
					hideSecond={gameStatus === "player_turn"}
				/>

				<AnimatePresence>
					{resultMessage && (
						<ResultModal
							message={resultMessage}
							showPlayNext={lastBet > 0}
							onPlayNext={() => {
								setResultMessage("");
								playNextRound();
							}}
						/>
					)}
				</AnimatePresence>

				<div className="w-full flex flex-col items-center gap-2 my-2">
					<CardHand hand={playerHand} direction="player" />
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

			<Sidebar
				chips={chips}
				currentBet={currentBet}
				gameStatus={gameStatus}
				canDoubleDown={canDoubleDown}
				onAddBet={addBet}
				onClearBet={resetBet}
				onDeal={dealHand}
				onHit={handleHit}
				onStand={handleStand}
				onDoubleDown={handleDoubleDown}
			/>
		</div>
	);
};
