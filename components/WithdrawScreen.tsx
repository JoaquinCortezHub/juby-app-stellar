"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

// Utility function to format currency
const formatCompact = (value: number): string => {
	if (value >= 1000) {
		const formatted = (value / 1000).toFixed(1).replace(".", ",");
		return `${formatted}K`;
	}
	return value.toString();
};

const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
	}).format(value);
};

// Custom Slider Component
const CustomSlider = ({
	value,
	onChange,
	min = 0,
	max = 15000,
}: {
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
}) => {
	const percentage = ((value - min) / (max - min)) * 100;

	return (
		<div className="relative w-full py-2">
			{/* Track container */}
			<div className="relative h-2 w-full">
				{/* Background track */}
				<div className="absolute inset-0 bg-gray-200 rounded-full" />

				{/* Filled track */}
				<div
					className="absolute h-full bg-linear-to-r from-red-300 to-red-500 rounded-full"
					style={{ width: `${percentage}%` }}
				/>

				{/* Native range input */}
				<input
					type="range"
					min={min}
					max={max}
					value={value}
					onChange={(e) => onChange(Number(e.target.value))}
					className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
				/>

				{/* Custom thumb */}
				<div
					className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-red-400 pointer-events-none"
					style={{ left: `${percentage}%` }}
				/>
			</div>

			{/* Min/Max labels */}
			<div className="flex justify-between mt-3 text-sm text-gray-400">
				<span>{min}</span>
				<span>{formatCompact(max)}</span>
			</div>
		</div>
	);
};

// Editable Amount Component
const EditableAmount = ({
	value,
	onChange,
	max,
}: {
	value: number;
	onChange: (value: number) => void;
	max: number;
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [inputValue, setInputValue] = useState(value.toString());

	const handleFocus = () => {
		setIsEditing(true);
		setInputValue(value.toString());
	};

	const handleBlur = () => {
		setIsEditing(false);
		let newValue = parseInt(inputValue.replace(/[^0-9]/g, "")) || 0;
		newValue = Math.min(Math.max(newValue, 0), max);
		onChange(newValue);
		setInputValue(newValue.toString());
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value.replace(/[^0-9]/g, "");
		setInputValue(raw);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.currentTarget.blur();
		}
	};

	return (
		<div className="flex items-center justify-center gap-1">
			<span className="text-4xl font-bold text-gray-800">$</span>
			{isEditing ? (
				<input
					type="text"
					inputMode="numeric"
					value={inputValue}
					onChange={handleChange}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown}
					autoFocus
					className="text-4xl font-bold text-gray-800 bg-transparent border-b-2 border-red-500 outline-none w-32 text-center"
				/>
			) : (
				<button
					onClick={handleFocus}
					className="text-4xl font-bold text-gray-800 hover:text-red-600 transition-colors cursor-text border-b-2 border-transparent hover:border-red-300"
				>
					{value.toLocaleString("es-AR")}
				</button>
			)}
		</div>
	);
};

// Main Component
export default function WithdrawScreen() {
	const [withdrawAmount, setWithdrawAmount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

	const handleNavigation = (path: string) => {
		setNavigatingTo(path);
		startTransition(() => {
			router.push(path);
		});
	};

	// Mock balance - in real app, fetch from API
	const currentBalance = 120650;
	const maxWithdraw = currentBalance;

	const handleAmountChange = (newAmount: number) => {
		setWithdrawAmount(Math.min(Math.max(newAmount, 0), maxWithdraw));
	};

	const handleWithdraw = async () => {
		if (withdrawAmount <= 0) {
			setError("Please enter an amount to withdraw");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// TODO: Replace with actual shares calculation
			// For now, assume 1:1 ratio between amount and shares
			const sharesToWithdraw = withdrawAmount * 10000000; // Convert to stroops

			const response = await fetch('/api/demo/withdraw', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					shares: sharesToWithdraw,
				}),
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.error || 'Withdrawal failed');
			}

			console.log('✅ Withdrawal successful:', data);
			setSuccess(true);

			// Redirect to dashboard after 2 seconds
			setTimeout(() => {
				router.push('/dashboard');
			}, 2000);
		} catch (err) {
			console.error('❌ Withdrawal error:', err);
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		handleNavigation('/dashboard');
	};

	return (
		<div className="min-h-screen bg-linear-to-b from-red-50 to-orange-50 flex flex-col">
			{/* Header */}
			<header className="flex justify-between items-center p-4">
				<button
					onClick={handleBack}
					disabled={isPending}
					className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow disabled:opacity-50"
				>
					{isPending && navigatingTo === '/dashboard' ? (
						<div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent" />
					) : (
						<ChevronLeft className="w-5 h-5 text-red-500" />
					)}
				</button>
				<button
					onClick={() => handleNavigation('/transactions')}
					disabled={isPending}
					className="w-10 h-10 flex items-center justify-center hover:bg-white/50 rounded-full transition-colors disabled:opacity-50"
				>
					{isPending && navigatingTo === '/transactions' ? (
						<div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-700 border-t-transparent" />
					) : (
						<Menu className="w-6 h-6 text-gray-700" />
					)}
				</button>
			</header>

			{/* Success Message */}
			{success && (
				<div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
					<p className="text-green-600 text-sm text-center font-semibold">
						✅ Retiro exitoso! Redirigiendo...
					</p>
				</div>
			)}

			{/* Main Content */}
			<main className="flex-1 flex flex-col items-center px-6 pt-8">
				{/* Coin Icon */}
				<div className="w-16 h-16 bg-linear-to-br from-red-300 to-red-500 rounded-full shadow-lg mb-6 flex items-center justify-center">
					<div className="w-12 h-12 bg-linear-to-br from-red-400 to-red-500 rounded-full border-4 border-red-300" />
				</div>

				{/* Title */}
				<h1 className="text-xl font-bold text-gray-800 mb-1">
					¿Cuánto quieres retirar?
				</h1>
				<p className="text-gray-400 text-sm mb-6">
					Selecciona cantidad de dinero
				</p>

				{/* Editable Amount Display */}
				<div className="mb-6">
					<EditableAmount
						value={withdrawAmount}
						onChange={handleAmountChange}
						max={maxWithdraw}
					/>
					<p className="text-center text-xs text-gray-400 mt-2">
						Toca para editar
					</p>
				</div>

				{/* Slider */}
				<div className="w-full max-w-sm mb-8">
					<CustomSlider
						value={withdrawAmount}
						onChange={handleAmountChange}
						min={0}
						max={maxWithdraw}
					/>
				</div>

				{/* Balance Card */}
				<div className="bg-white rounded-full py-3 px-5 shadow-md flex items-center gap-3 mb-8">
					<img
						src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
						alt="Avatar"
						className="w-10 h-10 rounded-full object-cover"
					/>
					<div>
						<p className="text-xs text-gray-400">Balance disponible</p>
						<p className="text-lg font-bold text-gray-800">
							{formatCurrency(currentBalance)}
						</p>
					</div>
				</div>
			</main>

			{/* Footer Actions */}
			<footer className="px-6 pb-8">
				{/* Error Message */}
				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-600 text-sm text-center">{error}</p>
					</div>
				)}

				{/* CTA Button */}
				<button
					className="w-full py-4 bg-linear-to-r from-red-400 to-red-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={handleWithdraw}
					disabled={isLoading || success}
				>
					{isLoading ? 'Procesando...' : success ? '¡Completado!' : 'Retirar'}
				</button>

				{/* Info Text */}
				<p className="text-center text-xs text-gray-400 mt-4">
					Los fondos serán transferidos a tu wallet
				</p>
			</footer>
		</div>
	);
}
