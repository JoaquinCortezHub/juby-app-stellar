"use client";

import { useState, useTransition } from "react";
import { CheckCircle, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessDialogProps {
	isOpen: boolean;
	onClose: () => void;
	amount: number;
	onViewDetails?: () => void;
}

const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("es-AR", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
	}).format(value);
};

export default function SuccessDialog({
	isOpen,
	onClose,
	amount,
	onViewDetails,
}: SuccessDialogProps) {
    const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [isNavigating, setIsNavigating] = useState(false);

	const handleNavigate = () => {
		setIsNavigating(true);
		startTransition(() => {
			router.push('/dashboard/');
		});
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Dialog */}
			<div className="relative bg-white rounded-3xl p-8 mx-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-300">
				{/* Close button
				<button
					onClick={onClose}
					className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
				>
					<X className="w-5 h-5 text-gray-400" />
				</button> */}

				{/* Success icon */}
				<div className="flex justify-center mb-6">
					<div className="relative">
						<div className="w-20 h-20 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
							<CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
						</div>
						{/* Decorative rings */}
						<div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-green-200 animate-ping opacity-30" />
					</div>
				</div>

				{/* Title */}
				<h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
					¡Inversión exitosa!
				</h2>

				{/* Description */}
				<p className="text-gray-500 text-center mb-6">
					Tu inversión ha sido procesada correctamente
				</p>

				{/* Amount card */}
				<div className="bg-linear-to-r from-sky-50 to-blue-50 rounded-2xl p-4 mb-6">
					<p className="text-sm text-gray-500 text-center mb-1">
						Monto invertido
					</p>
					<p className="text-3xl font-bold text-gray-800 text-center">
						{formatCurrency(amount)}
					</p>
				</div>

				{/* Details row */}
				<div className="flex justify-between items-center text-sm text-gray-500 mb-6 px-2">
					<div>
						<p className="text-gray-400">Fecha</p>
						<p className="font-medium text-gray-700">
							{new Date().toLocaleDateString("es-AR", {
								day: "numeric",
								month: "short",
								year: "numeric",
							})}
						</p>
					</div>
					<div className="text-right">
						<p className="text-gray-400">Estado</p>
						<p className="font-medium text-green-600">Completado</p>
					</div>
				</div>

				{/* Actions */}
				<div className="space-y-3">
					<button
						onClick={onViewDetails}
						className="w-full py-4 bg-linear-to-r from-sky-400 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
					>
						Ver detalles
						<ArrowRight className="w-4 h-4" />
					</button>

					<button
						onClick={handleNavigate}
						disabled={isPending || isNavigating}
						className="w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
					>
						{isPending || isNavigating ? (
							<>
								<div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-700 border-t-transparent" />
								<span>Cargando...</span>
							</>
						) : (
							'Volver al inicio'
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
