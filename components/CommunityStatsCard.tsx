import Image from "next/image";

export default function CommunityStatsCard() {
  return (
    <div className="relative h-[162px] w-full max-w-[358px] overflow-hidden rounded-[19px] bg-white">
      {/* Title */}
      <h3 className="absolute left-[29px] top-[28px] font-manrope text-[14px] font-medium tracking-[-0.42px] text-[#31353b] opacity-60">
        Juby community stats
      </h3>

      {/* Decorative animation on the upper right */}
      <div className="absolute right-[-10px] top-[10px] h-[80px] w-[80px] opacity-30">
      <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          >
            <source src="/assets/community animation.mp4" type="video/mp4" />
          </video>
      </div>

      {/* Divider line - absolutely centered horizontally */}
      <div className="absolute left-1/2 top-[65px] h-[65px] w-px -translate-x-1/2 bg-[#e5e5e5]" />

      {/* Total en Juby - positioned to the left of center divider */}
      <div className="absolute right-[50%] top-[65px] mr-12 flex flex-col items-center gap-2">
        <h4 className="font-manrope text-[24px] font-extrabold tracking-[-0.72px] text-[#31353b]">
          $221k
        </h4>
        <p className="whitespace-nowrap font-manrope text-[14px] font-medium tracking-[-0.42px] text-[#31353b] opacity-60">
          Total en Juby
        </p>
      </div>

      {/* Rendimiento Anual - positioned to the right of center divider */}
      <div className="absolute left-[50%] top-[65px] ml-8 flex flex-col items-center gap-2">
        <h4 className="font-manrope text-[24px] font-extrabold tracking-[-0.72px] text-[#31353b]">
          12%
        </h4>
        <p className="whitespace-nowrap font-manrope text-[14px] font-medium tracking-[-0.42px] text-[#31353b] opacity-60">
          Rendimiento Anual
        </p>
      </div>
    </div>
  );
}
