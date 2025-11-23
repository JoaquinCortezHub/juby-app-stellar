import { Metadata } from "next";
import RozoBridgeWidget from "@/components/RozoBridgeWidget";

export const metadata: Metadata = {
  title: "Bridge to Stellar | Juby",
  description: "Bridge World USDC to your Stellar smart account",
};

/**
 * Bridge Page
 *
 * Allows users to bridge World USDC to their Crossmint Stellar smart account
 * using ROZO Intent Pay for seamless cross-chain transfers.
 *
 * Features:
 * - Non-custodial: Users control funds via email signing
 * - Fast: <5 second bridging with ROZO
 * - World App integrated: Seamless experience
 */
export default function BridgePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">
            Bridge to Stellar
          </h1>
          <p className="text-lg text-zinc-600">
            Transfer World USDC to your non-custodial Stellar smart account
          </p>
        </div>

        {/* Bridge Widget */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-lg p-8">
          <RozoBridgeWidget
            onSuccess={(txHash) => {
              console.log("Bridge successful:", txHash);
              // You can add additional success handling here
              // e.g., show a success toast, refresh balances, etc.
            }}
            onError={(error) => {
              console.error("Bridge error:", error);
              // You can add additional error handling here
              // e.g., show an error toast
            }}
          />
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-zinc-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">
              Non-Custodial
            </h3>
            <p className="text-xs text-zinc-600">
              You control your funds. Sign transactions via email confirmation.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-zinc-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">
              Lightning Fast
            </h3>
            <p className="text-xs text-zinc-600">
              ROZO bridges your USDC in less than 5 seconds.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-zinc-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">
              Seamless
            </h3>
            <p className="text-xs text-zinc-600">
              One-click bridging. No wallet round-trips or manual approvals.
            </p>
          </div>
        </div>

        {/* Tech Stack Info */}
        <div className="mt-12 bg-zinc-50 border border-zinc-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">
            Powered By
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-medium text-zinc-900">World App</span>
              <p className="text-zinc-600 mt-1">Source wallet & authentication</p>
            </div>
            <div>
              <span className="font-medium text-zinc-900">ROZO Intent Pay</span>
              <p className="text-zinc-600 mt-1">Cross-chain bridging infrastructure</p>
            </div>
            <div>
              <span className="font-medium text-zinc-900">Crossmint</span>
              <p className="text-zinc-600 mt-1">Stellar smart account creation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
