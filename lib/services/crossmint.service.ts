/**
 * Crossmint Service
 *
 * Manages Stellar smart wallet creation via Crossmint API.
 * Creates non-custodial smart accounts with email-based signing.
 *
 * FEATURES:
 * - Email-based smart wallets on Stellar
 * - Non-custodial: user controls wallet via email signing
 * - Integrates with World App email for seamless UX
 *
 * @see https://docs.crossmint.com/api-reference/wallets/create-wallet
 */

// ========================================
// TYPES
// ========================================

export interface CrossmintWalletResponse {
  chainType: "stellar";
  type: "smart";
  address: string;
  owner: string;
  createdAt: string;
  alias?: string;
  config: {
    adminSigner: {
      type: "email";
      locator: string;
    };
    delegatedSigners?: Array<{
      signer: string;
      expiresAt?: string;
      permissions?: Array<{
        type: string;
        address?: string;
      }>;
    }>;
    plugins?: unknown[];
  };
}

export interface CreateStellarWalletParams {
  email: string;
  userId: string;
  alias?: string;
}

// ========================================
// CROSSMINT SERVICE
// ========================================

export class CrossmintService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, environment: "staging" | "production" = "staging") {
    this.apiKey = apiKey || process.env.CROSSMINT_API_KEY || "";

    if (!this.apiKey) {
      throw new Error("CROSSMINT_API_KEY environment variable is required");
    }

    this.baseUrl =
      environment === "production"
        ? "https://www.crossmint.com/api"
        : "https://staging.crossmint.com/api";
  }

  /**
   * Create a Stellar smart wallet with email-based signing
   *
   * This creates a non-custodial smart account on Stellar where:
   * - The user's email is the admin signer
   * - User confirms transactions via email link
   * - Crossmint securely manages the smart contract
   *
   * @param params - User email, userId, and optional alias
   * @returns Stellar smart wallet details including address
   */
  async createStellarSmartWallet(
    params: CreateStellarWalletParams
  ): Promise<CrossmintWalletResponse> {
    const { email, userId, alias } = params;

    const requestBody = {
      chainType: "stellar",
      type: "smart",
      owner: `email:${email}`,
      alias: alias || `juby-${userId}`,
      config: {
        adminSigner: {
          type: "email",
          email: email,
        },
        delegatedSigners: [],
        plugins: [],
      },
    };

    console.log(`🔐 Creating Crossmint Stellar smart wallet for ${email}...`);

    const response = await fetch(`${this.baseUrl}/2025-06-09/wallets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": this.apiKey,
        // Note: idempotency-key not needed as owner field already guarantees idempotency
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Crossmint API error: ${response.status}`, errorText);
      throw new Error(
        `Failed to create Stellar smart wallet: ${response.status} ${errorText}`
      );
    }

    const wallet = (await response.json()) as CrossmintWalletResponse;

    console.log(`✅ Created Stellar smart wallet: ${wallet.address}`);
    console.log(`   Owner: ${wallet.owner}`);
    console.log(`   Signer: Email-based (${email})`);

    return wallet;
  }

  /**
   * Get wallet by owner locator
   *
   * @param email - User's email address
   * @returns Wallet details if exists
   */
  async getWalletByEmail(email: string): Promise<CrossmintWalletResponse | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/2025-06-09/wallets?owner=email:${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "X-API-KEY": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch wallet: ${response.status}`);
      }

      const wallets = (await response.json()) as CrossmintWalletResponse[];

      // Return the first Stellar wallet found
      const stellarWallet = wallets.find((w) => w.chainType === "stellar");
      return stellarWallet || null;
    } catch (error) {
      console.error("Error fetching wallet:", error);
      return null;
    }
  }

  /**
   * Get or create Stellar smart wallet for user
   *
   * Checks if wallet exists, creates if not.
   * Idempotent operation.
   *
   * @param params - User email, userId, and optional alias
   * @returns Stellar smart wallet details
   */
  async getOrCreateStellarWallet(
    params: CreateStellarWalletParams
  ): Promise<CrossmintWalletResponse> {
    const existing = await this.getWalletByEmail(params.email);

    if (existing) {
      console.log(`📋 Found existing Stellar wallet: ${existing.address}`);
      return existing;
    }

    return await this.createStellarSmartWallet(params);
  }
}

// ========================================
// SINGLETON INSTANCE
// ========================================

let crossmintServiceInstance: CrossmintService | null = null;

/**
 * Get or create the singleton CrossmintService instance
 *
 * @param apiKey - Optional API key (uses env var if not provided)
 * @param environment - staging or production
 * @returns CrossmintService instance
 */
export function getCrossmintService(
  apiKey?: string,
  environment: "staging" | "production" = "staging"
): CrossmintService {
  if (!crossmintServiceInstance) {
    crossmintServiceInstance = new CrossmintService(apiKey, environment);
  }
  return crossmintServiceInstance;
}

/**
 * Initialize the Crossmint service with environment variables
 */
export function initializeCrossmintService(): CrossmintService {
  return getCrossmintService();
}
