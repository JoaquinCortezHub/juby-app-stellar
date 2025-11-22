import Link from "next/link";
import Image from "next/image";

export default function Login() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-zinc-50">
      {/* Mobile container - 390px width */}
      <div className="relative h-[844px] w-[390px] overflow-hidden bg-[#424de7]">
        {/* Dotted pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 2.5px, transparent 2.5px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Background overlay SVG */}
        <div className="absolute left-0 top-0 h-[844px] w-[390px] opacity-15 mix-blend-overlay">
          <Image
            src="/assets/login-background.svg"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Logo and Brand at top */}
        <div className="absolute left-1/2 top-[150px] flex -translate-x-1/2 items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
            <Image
              src="/assets/juby-logo.svg"
              alt="Juby"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <p className="font-manrope text-[24px] font-extrabold tracking-[-0.48px] text-white">
            Juby
          </p>
        </div>

        {/* Center animation */}
        <div className="absolute left-1/2 top-[350] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          >
            <source src="/assets/analitica-login-animation.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Bottom content - text and button */}
        <div className="absolute bottom-[140px] left-1/2 flex w-[305px] -translate-x-1/2 flex-col items-center gap-3">
          {/* Welcome text */}
          <p className="font-manrope text-[16px] font-semibold tracking-[-0.32px] text-white opacity-80">
            Welcome to Juby
          </p>

          {/* Main heading */}
          <div className="flex w-full flex-col text-center">
            <h1 className="font-manrope text-[30px] font-extrabold leading-[33px] tracking-[-1.2px] text-white">
              Construyendo tu
            </h1>
            <h1 className="font-manrope text-[30px] font-extrabold leading-[33px] tracking-[-1.2px] text-white">
              identidad financiera
            </h1>
          </div>

          {/* Subtitle */}
          <p className="w-full text-center font-manrope text-[13px] font-semibold leading-[18px] tracking-[-0.26px] text-white opacity-70">
            Verifica tu humanidad una sola vez para crear tu historial de ahorro transparente.
          </p>

          {/* Button */}
          <Link href="/dashboard" className="relative mt-2 inline-block">
            <div className="relative h-[48px] w-[232px] overflow-hidden rounded-[22.5px]">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-linear-to-r from-[#2a75ff] to-[#8ac7ff]" />

              {/* Button content - centered */}
              <div className="absolute inset-0 flex items-center justify-center gap-2">
                {/* Worldcoin logo */}
                <div className="h-[23px] w-[23px]">
                  <Image
                    src="/assets/worldcoin-logo.png"
                    alt="Worldcoin"
                    width={23}
                    height={23}
                    className="object-cover"
                  />
                </div>

                {/* Button text */}
                <span className="whitespace-nowrap font-manrope text-[14px] font-extrabold tracking-[-0.28px] text-white">
                  Verificar con World ID
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
