"use client";

import { useRouter, useSearchParams } from "next/navigation";

const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("es-AR", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
	}).format(value);
};

export default function WithdrawSuccessPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const amount = parseFloat(searchParams.get("amount") || "0");

	const handleBackHome = () => {
		router.push("/dashboard");
	};

	return (
		<div className="min-h-screen bg-linear-to-b from-sky-50 to-blue-50 flex flex-col items-center justify-center px-6">
			<div className="max-w-sm w-full">
				{/* Success video */}
				<div className="flex justify-center mb-6">
					<div className="relative w-32 h-32">
						<video
							autoPlay
							loop
							muted
							playsInline
							className="w-32 h-32 object-contain mix-blend-multiply"
						>
							<source src="/assets/check.mp4" type="video/mp4" />
						</video>
					</div>
				</div>

				{/* Title */}
				<h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
					¡Retiro exitoso!
				</h2>

				{/* Description */}
				<p className="text-gray-500 text-center mb-6">
					Tu retiro ha sido procesado correctamente
				</p>

				{/* Amount card */}
				<div className="bg-linear-to-r from-sky-50 to-blue-50 rounded-2xl p-4 mb-6">
					<p className="text-sm text-gray-500 text-center mb-1">
						Monto retirado
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
				<button
					onClick={handleBackHome}
					className="w-full py-4 bg-linear-to-r from-sky-400 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
				>
					Volver al inicio
				</button>
			</div>
		</div>
	);
}
