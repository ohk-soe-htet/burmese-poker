import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BurmeseCard } from "../BurmeseCard";
import { type CardRank, type CardSuit } from "../../types";
import { BlackjackGame } from "../BlackJackGame";

const ranks: { rank: CardRank; text?: string }[] = [
	{ rank: "Ace" }, // No text displayed for Ace
	{ rank: "2", text: "2" },
	{ rank: "3", text: "3" },
	{ rank: "4", text: "4" },
	{ rank: "5", text: "5" },
	{ rank: "6", text: "6" },
	{ rank: "7", text: "7" },
	{ rank: "8", text: "8" },
	{ rank: "9", text: "9" },
	{ rank: "10", text: "10" },
	{ rank: "Jack", text: "Jack" },
	{ rank: "Queen", text: "Queen" },
	{ rank: "King", text: "King" },
];

const suits: CardSuit[] = ["spade", "heart", "club", "diamond"];

type ViewMode = "showcase" | "blackjack";

export const AppLayout: React.FC = () => {
	const [viewMode, setViewMode] = useState<ViewMode>("showcase");
	const [selectedSuit, setSelectedSuit] = useState<CardSuit>("heart");
	const [activeIndex, setActiveIndex] = useState<number>(3); // 5 card
	const [isFlipped, setIsFlipped] = useState<boolean>(false);

	const currentRank = ranks[activeIndex];

	const handleNext = () => {
		setActiveIndex((prev) => (prev + 1) % ranks.length);
		setIsFlipped(false);
	};

	const handlePrev = () => {
		setActiveIndex((prev) => (prev - 1 + ranks.length) % ranks.length);
		setIsFlipped(false);
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950 via-neutral-950 to-black text-amber-50 flex flex-col items-center justify-between p-6 select-none relative overflow-hidden">
			{/* Decorative Gold Radial Mesh Background Accent */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

			{/* Top Header & Navigation Bar */}
			<header className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 z-20 pb-4 border-b border-amber-500/20">
				<div className="text-center md:text-left">
					<h1 className="text-2xl md:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-amber-200">
						KONBAUNG DECK
					</h1>
					<p className="text-xs text-amber-400/60 tracking-widest uppercase mt-0.5">
						Royal Burmese Playing Cards
					</p>
				</div>

				{/* View Mode Switcher */}
				<div className="flex bg-neutral-900/80 p-1.5 rounded-xl border border-amber-500/30 backdrop-blur-md shadow-2xl">
					<button
						onClick={() => setViewMode("showcase")}
						className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
							viewMode === "showcase"
								? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg border border-amber-400/30"
								: "text-amber-200/60 hover:text-amber-100 hover:bg-neutral-800/50"
						}`}>
						Cards Showcase
					</button>
					<button
						onClick={() => setViewMode("blackjack")}
						className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
							viewMode === "blackjack"
								? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg border border-amber-400/30"
								: "text-amber-200/60 hover:text-amber-100 hover:bg-neutral-800/50"
						}`}>
						<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
						Play Blackjack
					</button>
				</div>
			</header>

			{/* Main Content Arena */}
			<main className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl z-10 my-6">
				{viewMode === "showcase" ? (
					<div className="flex flex-col items-center w-full">
						{/* Suit Selector Bar */}
						<div className="flex gap-2 mb-8 bg-neutral-900/90 p-2 rounded-2xl border border-amber-500/30 backdrop-blur-md shadow-xl">
							{suits.map((suit) => (
								<button
									key={suit}
									onClick={() => {
										setSelectedSuit(suit);
										setIsFlipped(false);
									}}
									className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
										selectedSuit === suit
											? "bg-amber-500 text-neutral-950 font-bold shadow-md"
											: "text-neutral-400 hover:text-amber-200 hover:bg-neutral-800/60"
									}`}>
									{suit}
								</button>
							))}
						</div>

						{/* 3D Interactive Card Stage */}
						<div className="relative w-72 h-[26rem] perspective-1000 my-2">
							<AnimatePresence mode="wait">
								<motion.div
									key={`${selectedSuit}-${currentRank.rank}`}
									className="w-full h-full relative cursor-pointer transform-style-3d"
									initial={{
										rotateY: -90,
										opacity: 0,
										scale: 0.9,
									}}
									animate={{
										rotateY: isFlipped ? 180 : 0,
										opacity: 1,
										scale: 1,
									}}
									exit={{
										rotateY: 90,
										opacity: 0,
										scale: 0.9,
									}}
									transition={{
										duration: 0.35,
										ease: "easeInOut",
									}}
									onClick={() => setIsFlipped(!isFlipped)}>
									{/* Front */}
									<div className="absolute inset-0 backface-hidden shadow-[0_0_50px_rgba(217,119,6,0.15)] rounded-2xl">
										<BurmeseCard
											rank={currentRank.rank}
											suit={selectedSuit}
											rankText={currentRank.text}
										/>
									</div>

									{/* Back */}
									<div className="absolute inset-0 backface-hidden transform rotate-y-180 bg-neutral-900 border-2 border-amber-500/50 rounded-2xl flex items-center justify-center p-4 shadow-2xl">
										<div className="w-full h-full border border-amber-500/30 rounded-xl flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-neutral-950 to-black">
											<span className="text-amber-400/80 font-bold tracking-[0.2em] text-lg border-b border-amber-500/40 pb-1">
												KONBAUNG
											</span>
										</div>
									</div>
								</motion.div>
							</AnimatePresence>
						</div>

						{/* Card Counter & Pagination */}
						<div className="flex items-center gap-6 mt-8">
							<button
								onClick={handlePrev}
								className="px-6 py-2.5 bg-neutral-900/80 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-500/60 text-amber-200 rounded-xl transition-all font-semibold shadow-md active:scale-95">
								Previous
							</button>
							<span className="text-amber-400/80 font-mono text-sm tracking-wider">
								{activeIndex + 1} / {ranks.length}
							</span>
							<button
								onClick={handleNext}
								className="px-6 py-2.5 bg-neutral-900/80 hover:bg-neutral-800 border border-amber-500/30 hover:border-amber-500/60 text-amber-200 rounded-xl transition-all font-semibold shadow-md active:scale-95">
								Next
							</button>
						</div>
					</div>
				) : (
					<BlackjackGame />
				)}
			</main>

			{/* Footer */}
			<footer className="text-xs text-amber-500/40 tracking-wider z-10 pt-4">
				Interactive Card Design Showcase
			</footer>
		</div>
	);
};
