"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function SavingsBalanceCard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const handleNavigation = (path: string) => {
    setNavigatingTo(path);
    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <div className="relative h-[163px] w-full max-w-[358px] overflow-hidden rounded-[19px] bg-white">
      {/* Settings icon */}
      <button className="absolute right-[30px] top-[28px] h-[19px] w-5">
        <Image
          src="/assets/icons/settings-gear.svg"
          alt="Settings"
          width={20}
          height={19}
          className="object-contain"
        />
      </button>

      {/* Balance info */}
      <div className="absolute left-[29px] top-[33px] flex flex-col gap-[15px]">
        <p className="font-manrope text-[14px] font-medium tracking-[-0.42px] text-[#31353b] opacity-60">
          Savings Balance
        </p>
        <h2 className="font-manrope text-[30px] font-extrabold tracking-[-0.9px] text-[#31353b] -mt-[10px]">
          $120,560
        </h2>
      </div>

      {/* Growth badge */}
      <div className="absolute left-[26px] top-[108px] flex h-[28px] w-[143px] items-center justify-center gap-1 rounded-[14px] bg-[#E7F7E8]">
        <Image
          src="/assets/icons/arrow-up-green.svg"
          alt="Growth"
          width={16}
          height={11}
          className="object-contain"
        />
        <span className="font-manrope text-[12px] font-bold tracking-[-0.36px] text-[#6e6e6e]">
          +5% Last month
        </span>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-[20px] right-[30px] flex items-center gap-[16px]">
        {/* Withdraw button */}
        <div className="flex flex-col items-center gap-1">
          <button
            className="flex h-[40.515px] w-[40.515px] items-center justify-center rounded-full bg-[#f5f5f5] transition-colors hover:bg-[#e0e0e0] cursor-pointer disabled:opacity-50 relative"
            onClick={() => handleNavigation('/withdraw')}
            disabled={isPending}
          >
            {isPending && navigatingTo === '/withdraw' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent" />
            ) : (
              <Image
                src="/assets/icons/send-icon.svg"
                alt="Withdraw"
                width={40.515}
                height={40.515}
                className="object-contain"
              />
            )}
          </button>
          <span className="font-manrope text-[12px] font-medium tracking-[-0.36px] text-[#31353b] opacity-60">
            Withdraw
          </span>
        </div>

        {/* Bridge button */}
        <div className="flex flex-col items-center gap-1">
          <button
            className="flex h-[40.515px] w-[40.515px] items-center justify-center rounded-full bg-[#f5f5f5] transition-colors hover:bg-[#e0e0e0] cursor-pointer disabled:opacity-50 relative"
            onClick={() => handleNavigation('/bridge')}
            disabled={isPending}
          >
            {isPending && navigatingTo === '/bridge' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent" />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 16V8M7 8L3 12M7 8L11 12M17 8V16M17 16L21 12M17 16L13 12"
                  stroke="#424de7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <span className="font-manrope text-[12px] font-medium tracking-[-0.36px] text-[#31353b] opacity-60">
            Bridge
          </span>
        </div>

        {/* Deposit button */}
        <div className="flex flex-col items-center gap-1">
          <button
            className="flex h-[40.515px] w-[40.515px] items-center justify-center rounded-full bg-[#424de7] transition-colors hover:bg-[#3640c7] cursor-pointer disabled:opacity-50 relative"
            onClick={() => handleNavigation('/invest')}
            disabled={isPending}
          >
            {isPending && navigatingTo === '/invest' ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Image
                src="/assets/icons/deposit-icon.svg"
                alt="Deposit"
                width={40.515}
                height={40.515}
                className="object-contain"
              />
            )}
          </button>
          <span className="font-manrope text-[12px] font-medium tracking-[-0.36px] text-[#31353b] opacity-60">
            Deposit
          </span>
        </div>
      </div>
    </div>
  );
}
