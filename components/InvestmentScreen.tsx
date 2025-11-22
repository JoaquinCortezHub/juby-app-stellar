"use client";

import { useState } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import SuccessDialog from "./DepositSuccessDialog";
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
					className="absolute h-full bg-linear-to-r from-sky-300 to-blue-500 rounded-full"
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
					className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-blue-400 pointer-events-none"
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

// Checkbox Component
const Checkbox = ({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: (checked: boolean) => void;
	label: string;
}) => {
	return (
		<label className="flex items-center gap-3 cursor-pointer">
			<div
				className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
					checked ? "bg-blue-500 border-blue-500" : "border-gray-300 bg-white"
				}`}
				onClick={() => onChange(!checked)}
			>
				{checked && (
					<svg
						className="w-3 h-3 text-white"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={3}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				)}
			</div>
			<span className="text-gray-500 text-sm">{label}</span>
		</label>
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
					className="text-4xl font-bold text-gray-800 bg-transparent border-b-2 border-blue-500 outline-none w-32 text-center"
				/>
			) : (
				<button
					onClick={handleFocus}
					className="text-4xl font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-text border-b-2 border-transparent hover:border-blue-300"
				>
					{value.toLocaleString("es-AR")}
				</button>
			)}
		</div>
	);
};

// Main Component
export default function InvestmentScreen() {
	const [investAmount, setInvestAmount] = useState(7400);
	const [onlyReceive, setOnlyReceive] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);

	const router = useRouter();

	const savings = 120650;

	const handleAmountChange = (newAmount: number) => {
		setInvestAmount(Math.min(Math.max(newAmount, 0), 15000));
	};

	const handleInvest = () => {
		setShowSuccess(true);
	};

	const handleBackHome = () => {
		router.push('/dashboard');
	}

	return (
		<div className="min-h-screen bg-linear-to-b from-sky-50 to-blue-50 flex flex-col">
			{/* Header */}
			<header className="flex justify-between items-center p-4">
				<button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
					<ChevronLeft className="w-5 h-5 text-blue-500" />
				</button>
				<button className="w-10 h-10 flex items-center justify-center">
					<Menu className="w-6 h-6 text-gray-700" />
				</button>
			</header>

			{/* Main Content */}
			<main className="flex-1 flex flex-col items-center px-6 pt-8">
				{/* Coin Icon */}
				<div className="w-16 h-16 bg-linear-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg mb-6 flex items-center justify-center">
					<div className="w-12 h-12 bg-linear-to-br from-yellow-400 to-yellow-500 rounded-full border-4 border-yellow-300" />
				</div>

				{/* Title */}
				<h1 className="text-xl font-bold text-gray-800 mb-1">
					¿Cuánto quieres invertir hoy?
				</h1>
				<p className="text-gray-400 text-sm mb-6">
					Selecciona cantidad de dinero
				</p>

				{/* Editable Amount Display */}
				<div className="mb-6">
					<EditableAmount
						value={investAmount}
						onChange={handleAmountChange}
						max={15000}
					/>
					<p className="text-center text-xs text-gray-400 mt-2">
						Toca para editar
					</p>
				</div>

				{/* Slider */}
				<div className="w-full max-w-sm mb-8">
					<CustomSlider
						value={investAmount}
						onChange={handleAmountChange}
						min={0}
						max={15000}
					/>
				</div>

				{/* Savings Card */}
				<div className="bg-white rounded-full py-3 px-5 shadow-md flex items-center gap-3 mb-8">
					<img
						src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
						alt="Avatar"
						className="w-10 h-10 rounded-full object-cover"
					/>
					<div>
						<p className="text-xs text-gray-400">Mis ahorros</p>
						<p className="text-lg font-bold text-gray-800">
							{formatCurrency(savings)}
						</p>
					</div>
				</div>
			</main>

			{/* Footer Actions */}
			<footer className="px-6 pb-8">
				{/* CTA Button */}
				<button 
					className="w-full py-4 bg-linear-to-r from-sky-400 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow mb-4"
					onClick={handleInvest}
				>
					Recibir e Inviertir
				</button>

				{/* Checkbox */}
				<div className="flex justify-center">
					<Checkbox
						checked={onlyReceive}
						onChange={setOnlyReceive}
						label="Solo quiero recibir, sin invertir"
					/>
				</div>
			</footer>
			<SuccessDialog
				isOpen={showSuccess}
				onClose={() => handleBackHome}
				amount={investAmount}
				onViewDetails={() => {
					setShowSuccess(false);
				}}
			/>
		</div>
	);
}
