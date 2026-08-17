import { motion } from "framer-motion";

interface ResultModalProps {
	message: string;
	showPlayNext: boolean;
	onPlayNext: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
	message,
	showPlayNext,
	onPlayNext,
}) => (
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
			<div className="mb-4">{message}</div>
			{showPlayNext && (
				<div className="flex gap-4 justify-center mt-2">
					<button
						onClick={onPlayNext}
						className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md">
						Play Next
					</button>
				</div>
			)}
		</motion.div>
	</>
);
