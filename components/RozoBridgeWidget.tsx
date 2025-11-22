"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { IntentPay } from "@rozoai/intent-pay";
import type { AppConfig } from "@rozoai/intent-common";

/**
 * ROZO Bridge Widget
 *
 * Enables seamless bridging of World USDC to Stellar USDC using ROZO Intent Pay.
 *
 * Flow:
 * 1. User authenticates with World App (via session)
 * 2. Backend creates Crossmint Stellar smart wallet with user's email
 * 3. User selects amount to bridge
 * 4. ROZO Intent Pay widget handles:
 *    - World USDC transfer
 *    - Cross-chain bridging
 *    - Stellar USDC delivery to Crossmint wallet
 * 5. User receives USDC in their non-custodial Stellar smart account
 */

interface RozoBridgeWidgetProps {
  stellarAddress?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
  demoMode?: boolean; // Set to true for hackathon demo (mock bridge)
}

export default function RozoBridgeWidget({
  stellarAddress,
  onSuccess,
  onError,
  demoMode = true, // DEFAULT: true for hackathon (switch to false for production)
}: RozoBridgeWidgetProps) {
  const { data: session, status } = useSession();
  const [amount, setAmount] = useState<string>("0.01");
  const [crossmintWallet, setCrossmintWallet] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create or get Crossmint wallet on mount
  useEffect(() => {
    if (status === "authenticated" && !crossmintWallet && !stellarAddress) {
      createCrossmintWallet();
    } else if (stellarAddress) {
      setCrossmintWallet(stellarAddress);
      setIsWidgetReady(true);
    }
  }, [status, stellarAddress]);

  /**
   * Create Crossmint Stellar smart wallet
   */
  const createCrossmintWallet = async () => {
    try {
      setIsCreatingWallet(true);
      setError(null);

      console.log("📬 Creating Crossmint Stellar smart wallet...");

      const response = await fetch("/api/wallet/crossmint/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create Crossmint wallet");
      }

      const data = await response.json();

      console.log("✅ Crossmint wallet created:", data.wallet.address);

      setCrossmintWallet(data.wallet.address);
      setIsWidgetReady(true);
    } catch (err) {
      console.error("Error creating Crossmint wallet:", err);
      setError(err instanceof Error ? err.message : "Failed to create wallet");
      onError?.(err instanceof Error ? err : new Error("Failed to create wallet"));
    } finally {
      setIsCreatingWallet(false);
    }
  };

  /**
   * Handle bridge success
   */
  const handlePaymentSuccess = (txHash: string) => {
    console.log("✅ Bridge successful:", txHash);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
    onSuccess?.(txHash);
  };

  /**
   * Handle bridge error
   */
  const handlePaymentError = (err: Error) => {
    console.error("❌ Bridge failed:", err);
    setError(err.message);
    onError?.(err);
  };

  /**
   * Mock bridge for demo/hackathon
   */
  const mockBridge = async () => {
    setIsBridging(true);
    setError(null);
    try {
      console.log("🎯 Starting mock bridge...");
      console.log(`   Amount: ${amount} USDC`);
      console.log(`   Destination: ${crossmintWallet}`);

      // Simulate 2 second bridge delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock transaction hash
      const mockTxHash = `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      console.log("✅ Mock bridge complete:", mockTxHash);
      handlePaymentSuccess(mockTxHash);
    } catch (err) {
      handlePaymentError(err instanceof Error ? err : new Error("Bridge failed"));
    } finally {
      setIsBridging(false);
    }
  };

  // ROZO Intent Pay configuration
  const appConfig: AppConfig = {
    appId: "rozoDefindexWorld",
    receivingChain: "stellar",
    receivingToken: "USDC",
    recipientAddress: crossmintWallet || stellarAddress || "",
    amount: parseFloat(amount),
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-zinc-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-sm text-yellow-900">
          Please sign in with World App to bridge USDC to Stellar
        </p>
      </div>
    );
  }

  if (isCreatingWallet) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-zinc-600">Creating your Stellar smart wallet...</p>
          <p className="text-xs text-zinc-500 mt-2">
            This is a one-time setup for your non-custodial account
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-red-900 mb-2">Error</h3>
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={createCrossmintWallet}
          className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isWidgetReady || !crossmintWallet) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-zinc-600">Preparing bridge widget...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Info */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-900 mb-2">
          Your Stellar Smart Account
        </h3>
        <p className="text-xs text-zinc-600 font-mono break-all">
          {crossmintWallet}
        </p>
        <p className="text-xs text-zinc-500 mt-2">
          Non-custodial • Email-based signing
        </p>
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 mb-2">
          Amount (USDC)
        </label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          placeholder="0.01"
        />
        <p className="text-xs text-zinc-500 mt-2">
          Bridge World USDC to your Stellar smart account
        </p>
      </div>

      {/* Bridge Widget */}
      <div className="border-t border-zinc-200 pt-6">
        {demoMode ? (
          /* DEMO MODE: Mock Bridge Button */
          <button
            onClick={mockBridge}
            disabled={isBridging || !crossmintWallet}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isBridging ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Bridging {amount} USDC...
              </span>
            ) : (
              `Bridge ${amount} USDC to Stellar`
            )}
          </button>
        ) : (
          /* PRODUCTION MODE: Real ROZO Widget */
          <IntentPay
            config={appConfig}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}
      </div>

      {/* Info Box */}
      {demoMode ? (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <h4 className="text-sm font-bold text-blue-900">Hackathon Demo Mode</h4>
          </div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>✨ Click "Bridge" to simulate World USDC → Stellar USDC transfer</li>
            <li>🔐 Your Stellar smart wallet is REAL (created via Crossmint)</li>
            <li>📧 Email-based signing ready for actual transactions</li>
            <li>⚡ Production would use ROZO for instant (&lt;5s) real bridging</li>
          </ul>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How it works</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Pay with World USDC from your World App wallet</li>
            <li>• ROZO bridges funds instantly (&lt;5 seconds)</li>
            <li>• Receive USDC in your Stellar smart account</li>
            <li>• Sign transactions via email confirmation</li>
          </ul>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-in fade-in zoom-in duration-300">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">
              Bridge Successful!
            </h3>
            <p className="text-zinc-600 mb-4">
              {amount} USDC {demoMode ? "simulated" : "bridged"} to your Stellar smart account
            </p>
            <div className="bg-zinc-50 rounded-lg p-4 mb-4">
              <p className="text-xs text-zinc-500 mb-1">Stellar Address:</p>
              <p className="text-xs font-mono text-zinc-900 break-all">
                {crossmintWallet}
              </p>
            </div>
            {demoMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-700">
                  💡 In production, this would be real USDC on Stellar mainnet
                </p>
              </div>
            )}
            <button
              onClick={() => setShowSuccess(false)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
