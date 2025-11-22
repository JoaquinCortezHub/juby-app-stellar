import Image from "next/image";

export default function ProfileCard() {
  return (
    <div className="relative h-[109px] w-full max-w-[358px] overflow-hidden rounded-[19px] bg-linear-to-r from-[#2563eb] to-[#60a5fa]">
      {/* Background decoration */}
      <div className="absolute right-0 top-0 h-full w-[162px]">
        <Image
          src="/assets/Mask group profile card.svg"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      {/* Three dots menu */}
      <button className="absolute right-5 top-[22px] h-1 w-[18px]">
        <Image
          src="/assets/icons/three-dots-menu.svg"
          alt="Menu"
          width={18}
          height={4}
          className="object-contain"
        />
      </button>

      {/* Profile section */}
      <div className="absolute left-[18px] top-[22px] flex items-start gap-4">
        {/* Profile picture with verified badge */}
        <div className="relative h-[65px] w-[64px]">
          <Image
            src="/assets/profile picture dashboard.png"
            alt="Profile"
            width={64}
            height={65}
            className="rounded-full object-cover"
          />
          {/* Verified badge */}
          <div className="absolute -right-1 -top-1 h-[29px] w-[29px]">
            <Image
              src="/assets/icons/verified-badge.svg"
              alt="Verified"
              width={29}
              height={29}
              className="object-contain"
            />
          </div>
        </div>

        {/* User info */}
        <div className="flex flex-col gap-[5px] pt-[15px]">
          <h3 className="font-manrope text-[17px] font-bold tracking-[-0.51px] text-white">
            Stefano Cortez
          </h3>
          <p className="font-manrope text-[14px] font-semibold tracking-[-0.42px] text-white opacity-80">
            Juby Passport Active
          </p>
        </div>
      </div>
    </div>
  );
}
