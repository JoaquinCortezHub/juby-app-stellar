"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ExternalLink, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  hash: string;
  type: 'deposit' | 'withdraw' | 'other';
  amount?: string;
  timestamp: string;
  successful: boolean;
}

export default function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);

      // Fetch wallet address first
      const response = await fetch('/api/wallet/address');
      const data = await response.json();

      if (!data.success || !data.stellarPublicKey) {
        throw new Error('Failed to get wallet address');
      }

      const walletAddress = data.stellarPublicKey;

      // Fetch transactions from Stellar Horizon API
      const horizonUrl = process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
      const txResponse = await fetch(
        `${horizonUrl}/accounts/${walletAddress}/transactions?limit=20&order=desc`
      );

      if (!txResponse.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const txData = await txResponse.json();

      // Transform transactions
      const formattedTxs: Transaction[] = txData._embedded.records.map((tx: any) => ({
        id: tx.id,
        hash: tx.hash,
        type: determineType(tx),
        timestamp: tx.created_at,
        successful: tx.successful,
      }));

      setTransactions(formattedTxs);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const determineType = (tx: any): 'deposit' | 'withdraw' | 'other' => {
    // Simple heuristic - could be improved with memo field analysis
    if (tx.memo) {
      const memo = tx.memo.toLowerCase();
      if (memo.includes('deposit')) return 'deposit';
      if (memo.includes('withdraw')) return 'withdraw';
    }
    return 'other';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'withdraw':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      default:
        return <ExternalLink className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Depósito';
      case 'withdraw':
        return 'Retiro';
      default:
        return 'Transacción';
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <button
          onClick={handleBack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          <ChevronLeft className="w-5 h-5 text-blue-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Historial de Transacciones</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-sm">Cargando transacciones...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm text-center">{error}</p>
            <button
              onClick={fetchTransactions}
              className="mt-3 w-full py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ExternalLink className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-gray-500 text-center">
              No hay transacciones todavía
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <a
                key={tx.id}
                href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                    {getTypeIcon(tx.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {getTypeLabel(tx.type)}
                      </p>
                      {tx.successful ? (
                        <span className="text-xs text-green-600 font-medium">
                          Exitosa
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">
                          Fallida
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate">
                        {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
                      </p>
                      <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatDate(tx.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="px-6 pb-6">
        <p className="text-center text-xs text-gray-400">
          Mostrando transacciones de Stellar Testnet
        </p>
      </footer>
    </div>
  );
}
