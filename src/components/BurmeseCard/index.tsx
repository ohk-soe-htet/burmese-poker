import React from "react";

// Import SVGs as React components using the ?react query parameter
import KanoteRight from "../../assets/kanote/top_right.svg?react";
import KanoteBottomLeft from "../../assets/kanote/bottom_left.svg?react";

import ClubSymbol from "../../assets/symbol/club.svg?react";
import DiamondSymbol from "../../assets/symbol/diamond.svg?react";
import HeartSymbol from "../../assets/symbol/heart.svg?react";
import SpadeSymbol from "../../assets/symbol/spade.svg?react";

import { type CardRank, type CardSuit } from "../../types";

interface BurmeseCardProps {
	rank: CardRank;
	suit: CardSuit;
	rankText?: string;
	size?: "sm" | "md" | "lg";
	faceDown?: boolean;
}

const suitMap: Record<CardSuit, React.FC<React.SVGProps<SVGSVGElement>>> = {
	club: ClubSymbol,
	diamond: DiamondSymbol,
	heart: HeartSymbol,
	spade: SpadeSymbol,
};

export const BurmeseCard: React.FC<BurmeseCardProps> = ({
	rank,
	suit,
	rankText,
	size = "lg",
	faceDown = false,
}) => {
	const SuitIcon = suitMap[suit];
	const characterPath = `/character/${rank}.svg`;

	const isRedSuit = suit === "heart" || suit === "diamond";
	const textColorClass = isRedSuit ? "text-red-600" : "text-slate-900";

	const kanoteFilter = isRedSuit
		? "brightness(0) saturate(100%) invert(21%) sepia(85%) saturate(3821%) hue-rotate(352deg) brightness(97%) contrast(93%)"
		: "brightness(0) saturate(100%) invert(8%) sepia(18%) saturate(2363%) hue-rotate(188deg) brightness(95%) contrast(96%)";
	const sizeClass =
		size === "sm"
			? "w-40 h-56"
			: size === "md"
				? "w-56 h-80"
				: "w-72 h-[26rem]";

	const iconClass =
		size === "sm" ? "w-6 h-6" : size === "md" ? "w-8 h-8" : "w-10 h-10";
	const rankTextClass =
		size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl";
	const kanoteClass =
		size === "sm" ? "w-10 h-10" : size === "md" ? "w-16 h-16" : "w-28 h-28";

	if (faceDown) {
		return (
			<div
				className={`${sizeClass} relative bg-neutral-900 border-2 border-amber-500/50 rounded-2xl flex items-center justify-center p-4 shadow-2xl select-none`}>
				<div className="w-full h-full border border-amber-500/30 rounded-xl flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-neutral-950 to-black">
					<span className="text-amber-400/80 font-bold tracking-[0.2em] text-lg">
						KONBAUNG
					</span>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`${sizeClass} relative bg-white rounded-2xl shadow-xl border border-black/10 overflow-hidden select-none`}>
			{/* Top-Left Rank & Suit Index */}
			<div
				className={`absolute top-4 left-4 flex flex-col items-center gap-1 z-20 ${textColorClass}`}>
				{rankText && (
					<span
						className={`${rankTextClass} font-bold leading-none tracking-wide`}>
						{rankText}
					</span>
				)}
				<SuitIcon
					className={iconClass}
					style={{ filter: kanoteFilter }}
				/>
			</div>

			{/* Top-Right Kanote (Increased Size & Positioned Flushed Corner) */}
			<KanoteRight
				className={`absolute top-1 right-1 ${kanoteClass} pointer-events-none z-10`}
				style={{ filter: kanoteFilter }}
			/>

			{/* Center Character Illustration */}
			<div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none z-0">
				<img
					src={characterPath}
					alt={`Character ${rank}`}
					className="max-w-[82%] max-h-[82%] object-contain drop-shadow-sm"
				/>
			</div>

			{/* Bottom-Left Kanote (Increased Size & Positioned Flushed Corner) */}
			<KanoteBottomLeft
				className={`absolute bottom-1 left-1 ${kanoteClass} pointer-events-none z-10`}
				style={{ filter: kanoteFilter }}
			/>

			{/* Bottom-Right Rank & Suit Index (Inverted) */}
			<div
				className={`absolute bottom-4 right-4 flex flex-col items-center gap-1 transform rotate-180 z-20 ${textColorClass}`}>
				{rankText && (
					<span
						className={`${rankTextClass} font-bold leading-none tracking-wide`}>
						{rankText}
					</span>
				)}
				<SuitIcon
					className={iconClass}
					style={{ filter: kanoteFilter }}
				/>
			</div>
		</div>
	);
};
