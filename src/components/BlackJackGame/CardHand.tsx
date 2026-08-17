import { motion } from "framer-motion";
import { BurmeseCard } from "../BurmeseCard";
import { type CardData } from "../../lib/blackjack";

type HandDirection = "dealer" | "player";

interface CardHandProps {
	hand: CardData[];
	direction: HandDirection;
	/** hide the second card (dealer hole card during player turn) */
	hideSecond?: boolean;
}

const DIRECTION_CONFIG: Record<
	HandDirection,
	{ y: number; origin: string; delayStep: number; duration: number }
> = {
	dealer: { y: -30, origin: "origin-top", delayStep: 0.18, duration: 0.35 },
	player: { y: 30, origin: "origin-bottom", delayStep: 0.12, duration: 0.32 },
};

export const CardHand: React.FC<CardHandProps> = ({
	hand,
	direction,
	hideSecond = false,
}) => {
	const config = DIRECTION_CONFIG[direction];

	return (
		<div
			className={`flex gap-4 justify-center min-h-48 ${
				direction === "dealer" ? "items-end" : "items-start"
			}`}>
			{hand.map((card, idx) => (
				<motion.div
					key={`${direction}-${idx}`}
					custom={idx}
					initial="hidden"
					animate="visible"
					variants={{
						hidden: { opacity: 0, y: config.y, scale: 0.85 },
						visible: (i: number) => ({
							opacity: 1,
							y: 0,
							scale: 0.95,
							transition: {
								delay: i * config.delayStep,
								duration: config.duration,
								ease: "easeOut",
							},
						}),
					}}
					className={`-mx-2 first:ml-0 last:mr-0 ${config.origin}`}>
					<BurmeseCard
						rank={card.rank}
						suit={card.suit}
						rankText={card.rankText}
						size="sm"
						faceDown={hideSecond && idx === 1}
					/>
				</motion.div>
			))}
		</div>
	);
};
