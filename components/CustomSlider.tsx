import { useState } from "react";
import { ChevronLeft, Menu } from "lucide-react";

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
		<div className="relative w-full pt-10 pb-2">
			{/* Tooltip */}
			<div
				className="absolute -top-1 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md text-sm font-semibold text-gray-700 whitespace-nowrap"
				style={{ left: `${percentage}%` }}
			>
				{formatCompact(value)}
			</div>

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

export default CustomSlider;