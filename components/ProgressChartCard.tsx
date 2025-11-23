export default function ProgressChartCard() {
  return (
    <div className="relative h-[253px] w-full max-w-[358px] overflow-hidden rounded-[19px] bg-white">
      {/* Title */}
      <h3 className="absolute left-[29px] top-[30px] font-manrope text-[14px] font-medium tracking-[-0.42px] text-[#31353b] opacity-60">
        Tu progreso en Juby
      </h3>

      {/* Chart area with placeholder */}
      <div className="absolute left-[29px] top-[64px] h-[136.5px] w-[298px]">
        {/* Grid lines */}
        <div className="relative h-full w-full">
          {/* Horizontal grid lines */}
          <div className="absolute top-0 h-px w-full bg-[#e5e5e5]" />
          <div className="absolute top-[34px] h-px w-full bg-[#e5e5e5]" />
          <div className="absolute top-[68px] h-px w-full bg-[#e5e5e5]" />
          <div className="absolute bottom-0 h-px w-full bg-[#e5e5e5]" />

          {/* Chart curve - simplified blue gradient area */}
          <svg
            className="absolute inset-0"
            viewBox="0 0 298 136"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a9eff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4a9eff" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Chart line */}
            <path
              d="M 0 100 Q 50 90 75 80 T 150 60 Q 200 45 250 30 L 298 20"
              stroke="#4a9eff"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            {/* Filled area under curve */}
            <path
              d="M 0 100 Q 50 90 75 80 T 150 60 Q 200 45 250 30 L 298 20 L 298 136 L 0 136 Z"
              fill="url(#chartGradient)"
            />
          </svg>

          {/* Data point marker */}
          <div className="absolute left-[169px] top-[62px] h-2.5 w-2.5 rounded-full bg-white shadow-md ring-2 ring-[#4a9eff]" />

          {/* Vertical line from marker */}
          <div className="absolute left-[173.5px] top-[72px] h-[61.5px] w-px bg-[#e5e5e5]" />

          {/* Value tooltip */}
          <div className="absolute left-[149px] top-[89px] flex h-[23px] w-[50px] items-center justify-center rounded-md bg-white shadow-md">
            <span className="font-manrope text-[14px] font-semibold tracking-[-0.42px] text-[#31353b]">
              $4K
            </span>
          </div>
        </div>
      </div>

      {/* Time period labels */}
      <div className="absolute bottom-[23px] left-[35px] flex w-[289px] items-center justify-between">
        <span className="font-manrope text-[14px] font-medium tracking-[-0.42px] text-[#31353b] opacity-60">
          1M
        </span>
        <span className="font-manrope text-[14px] font-medium tracking-[-0.42px] text-[#31353b] opacity-60">
          3M
        </span>
        <span className="font-manrope text-[14px] font-medium tracking-[-0.42px] text-[#31353b] opacity-60">
          6M
        </span>
        <span className="font-manrope text-[14px] font-medium tracking-[-0.42px] text-[#31353b] opacity-60">
          1Y
        </span>
      </div>
    </div>
  );
}
