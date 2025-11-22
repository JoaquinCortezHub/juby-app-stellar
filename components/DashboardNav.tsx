"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DashboardNav() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigation = (path: string) => {
    setIsNavigating(true);
    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <div className="flex h-[60px] w-full items-center justify-between px-4">
      {/* Juby Logo */}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#424de7]">
        <Image
          src="/assets/juby-logo.svg"
          alt="Juby"
          width={24}
          height={24}
          className="object-contain"
        />
      </div>

      {/* Menu button */}
      <button
        onClick={() => handleNavigation('/transactions')}
        disabled={isPending || isNavigating}
        className="flex h-10 w-10 items-center justify-center transition-colors hover:bg-gray-100 rounded-xl disabled:opacity-50 relative"
      >
        {isPending || isNavigating ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#424de7] border-t-transparent" />
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6H20"
              stroke="#424de7"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M4 12H20"
              stroke="#424de7"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M4 18H20"
              stroke="#424de7"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
