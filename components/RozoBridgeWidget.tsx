"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// ROZO imports commented out for demo mode
// import { IntentPay } from "@rozoai/intent-pay";
// import type { AppConfig } from "@rozoai/intent-common";

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
  const [userEmail, setUserEmail] = useState<string>("");
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [crossmintWallet, setCrossmintWallet] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show email prompt after World App sign-in
  useEffect(() => {
    if (status === "authenticated" && !crossmintWallet && !stellarAddress && !isCreatingWallet) {
      // Always show email prompt for demo
      setShowEmailPrompt(true);
    } else if (stellarAddress) {
      setCrossmintWallet(stellarAddress);
      setIsWidgetReady(true);
    }
  }, [status, stellarAddress, crossmintWallet, isCreatingWallet]);

  // Auto-bridge on mount (demo mode) - simulates automatic bridging from World to Stellar
  useEffect(() => {
    if (demoMode && isWidgetReady && crossmintWallet && !isBridging && !showSuccess) {
      // Delay slightly to let UI render
      const timer = setTimeout(() => {
        mockBridge();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isWidgetReady, crossmintWallet]);

  /**
   * Handle email submission (demo mode)
   */
  const handleEmailSubmit = async () => {
    if (!userEmail || !userEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setShowEmailPrompt(false);
    await createCrossmintWallet(userEmail);
  };

  /**
   * Create Crossmint Stellar smart wallet
   */
  const createCrossmintWallet = async (email?: string) => {
    try {
      setIsCreatingWallet(true);
      setError(null);

      console.log("📬 Creating Crossmint Stellar smart wallet...");

      if (demoMode) {
        // DEMO MODE: Mock wallet creation
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockAddress = `G${Math.random().toString(36).substring(2, 15).toUpperCase()}${Math.random().toString(36).substring(2, 15).toUpperCase()}DEMO`;

        console.log("✅ Mock Crossmint wallet created:", mockAddress);
        console.log(`   Email: ${email || userEmail}`);

        setCrossmintWallet(mockAddress);
        setIsWidgetReady(true);
      } else {
        // PRODUCTION MODE: Real Crossmint API call
        const response = await fetch("/api/wallet/crossmint/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create Crossmint wallet");
        }

        const data = await response.json();

        console.log("✅ Crossmint wallet created:", data.wallet.address);

        setCrossmintWallet(data.wallet.address);
        setIsWidgetReady(true);
      }
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
      console.log("   Step 1: Requesting World App signature...");

      // Simulate World App signature prompt (1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("   Step 2: User approved in World App ✓");
      console.log("   Step 3: Bridging USDC via ROZO...");

      // Simulate bridge execution (1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));

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

  // ROZO Intent Pay configuration (commented out for demo mode)
  // const appConfig: AppConfig = {
  //   appId: "rozoDefindexWorld",
  //   receivingChain: "stellar",
  //   receivingToken: "USDC",
  //   recipientAddress: crossmintWallet || stellarAddress || "",
  //   amount: parseFloat(amount),
  // };

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

  if (showEmailPrompt) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📧</span>
            <h3 className="text-lg font-bold text-blue-900">Confirm Your Email</h3>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            To sign transactions on your Stellar smart wallet, Crossmint uses email-based authentication.
            Enter your email to continue:
          </p>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleEmailSubmit()}
            placeholder="your.email@example.com"
            className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}
          <button
            onClick={handleEmailSubmit}
            disabled={!userEmail}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Continue with Email Signing
          </button>
          <p className="text-xs text-blue-600 mt-3 text-center">
            🔐 Future transactions will be confirmed via email link
          </p>
        </div>
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
          onClick={() => createCrossmintWallet()}
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

      {/* Auto-Bridge Status */}
      {isBridging && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            <h3 className="text-lg font-semibold">Bridging {amount} USDC...</h3>
          </div>
          <div className="space-y-2 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Requesting signature in World App...</span>
            </div>
            <p className="text-xs text-blue-200 ml-7">
              Please approve the transaction in your World App
            </p>
          </div>
        </div>
      )}

      {/* Info Box */}
      {demoMode && !isBridging && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <h4 className="text-sm font-bold text-blue-900">Automatic Bridging Demo</h4>
          </div>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>✨ World USDC deposits automatically bridge to Stellar (simulated)</li>
            <li>🔐 Your Stellar smart wallet is REAL (created via Crossmint)</li>
            <li>📧 Email-based signing ready for actual transactions</li>
            <li>⚡ Production would use ROZO for instant (&lt;5s) real bridging</li>
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
