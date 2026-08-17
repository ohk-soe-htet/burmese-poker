import { type GameStatus } from "../../lib/blackjack";

interface SidebarProps {
	chips: number;
	currentBet: number;
	gameStatus: GameStatus;
	canDoubleDown: boolean;
	onAddBet: (amount: number) => void;
	onClearBet: () => void;
	onDeal: () => void;
	onHit: () => void;
	onStand: () => void;
	onDoubleDown: () => void;
}

const CHIP_VALUES = [10, 50, 100, 500];

const chipButtonClass =
	"w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 hover:from-amber-300 hover:to-amber-600 border-2 border-amber-200 text-neutral-950 font-black text-xs shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center";

export const Sidebar: React.FC<SidebarProps> = ({
	chips,
	currentBet,
	gameStatus,
	canDoubleDown,
	onAddBet,
	onClearBet,
	onDeal,
	onHit,
	onStand,
	onDoubleDown,
}) => {
	const isBettingStage =
		gameStatus === "betting" || gameStatus === "game_over";

	return (
		<aside className="shrink-0 w-64 flex flex-col items-start gap-6 z-10">
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
				{isBettingStage ? (
					<div className="flex flex-col items-start gap-3">
						<div className="flex gap-4 items-center mb-4">
							{CHIP_VALUES.map((chipVal) => (
								<button
									key={chipVal}
									onClick={() => onAddBet(chipVal)}
									disabled={chips < chipVal}
									className={chipButtonClass}>
									+${chipVal}
								</button>
							))}

							<button
								onClick={onClearBet}
								disabled={currentBet === 0}
								className={`px-3 py-1 rounded-full text-xs font-bold border ${
									currentBet === 0
										? "bg-red-900/20 text-red-900 border-red-900/10 pointer-events-none opacity-40"
										: "bg-red-900/60 hover:bg-red-800 text-red-200 border-red-500/40"
								}`}>
								Clear
							</button>
						</div>

						<button
							onClick={onDeal}
							disabled={currentBet === 0}
							className="mt-2 w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold tracking-wider rounded-xl shadow-xl border border-emerald-400/40 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed uppercase text-sm">
							Deal Hand
						</button>
					</div>
				) : (
					<div className="flex flex-col gap-3 w-full">
						<div className="flex gap-2 w-full">
							<button
								onClick={onHit}
								disabled={gameStatus !== "player_turn"}
								className="flex-1 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-200 font-bold rounded-xl shadow-lg active:scale-95">
								HIT
							</button>
							<button
								onClick={onStand}
								disabled={gameStatus !== "player_turn"}
								className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-extrabold rounded-xl shadow-lg active:scale-95">
								STAND
							</button>
						</div>
						{canDoubleDown && (
							<button
								onClick={onDoubleDown}
								disabled={gameStatus !== "player_turn"}
								className="w-full px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg active:scale-95">
								DOUBLE DOWN
							</button>
						)}
					</div>
				)}
			</div>
		</aside>
	);
};
