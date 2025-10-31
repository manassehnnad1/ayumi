/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Eye } from 'lucide-react';


interface BalanceDashboardProps {
  encryptedBalance: string;
  onRevealBalance: () => Promise<string>; // Returns the revealed amount
}

export default function BalanceDashboard({ encryptedBalance, onRevealBalance }: BalanceDashboardProps) {
  const [showRevealPopup, setShowRevealPopup] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealedBalance, setRevealedBalance] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [agentStarted, setAgentStarted] = useState(false);
  
  // Mock PNL data - will be real once agent rebalances
  const [pnlA] = useState(0);
  const [pnlB] = useState(0);

  const handleRevealClick = () => {
    setShowRevealPopup(true);
  };

  const handleConfirmReveal = async () => {
    setIsRevealing(true);
    setShowRevealPopup(false);
    try {
      const balance = await onRevealBalance(); // Get the revealed amount
      setRevealedBalance(balance); // Set it in state
      console.log('Balance set to:', balance);
    } catch (error) {
      console.error('Failed to reveal:', error);
      alert('Failed to decrypt balance');
    } finally {
      setIsRevealing(false);
    }
  };

  const handleStrategySelect = (strategy: string) => {
    setSelectedStrategy(strategy);
    setAgentStarted(true);
    // TODO: Notify backend to start agent
  };

  return (
    <div className="max-w-2xl mx-auto p-8 mt-12">
      {/* Balance Section */}
      <div className="mb-12">
        <div className="flex items-center justify-center gap-4 mb-8">
          <h2 className="text-5xl font-bold text-gray-900">
            {revealedBalance ? `${revealedBalance} ayUSDC` : '****'}
          </h2>
          <button
            onClick={handleRevealClick}
            disabled={isRevealing || revealedBalance !== null}
            className="p-3 bg-green-500 hover:bg-green-600 rounded-full text-white transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="Reveal balance"
          >
            <Eye size={24} />
          </button>
        </div>

        {/* Encrypted hash */}
        <p className="text-center text-sm text-gray-500 break-all">
          Encrypted: {encryptedBalance.slice(0, 30)}...
        </p>
      </div>

      {/* PNL Boxes */}
      <div className="flex justify-center gap-6 mb-12">
        <div className="bg-purple-500 text-white px-8 py-6 rounded-lg min-w-[120px] text-center">
          <p className="text-sm mb-1">Position A</p>
          <p className="text-2xl font-bold">{pnlA >= 0 ? '+' : ''}{pnlA}%</p>
        </div>
        <div className="bg-purple-600 text-white px-8 py-6 rounded-lg min-w-[120px] text-center">
          <p className="text-sm mb-1">Position B</p>
          <p className="text-2xl font-bold">{pnlB >= 0 ? '+' : ''}{pnlB}%</p>
        </div>
      </div>

      {/* Strategy Selector */}
      {!agentStarted && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Choose Strategy
          </h3>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => handleStrategySelect('conservative')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-6 rounded-lg text-xl font-medium transition-colors"
            >
              Conservative
            </button>
            <button
              onClick={() => handleStrategySelect('aggressive')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-6 rounded-lg text-xl font-medium transition-colors"
            >
              Aggressive
            </button>
          </div>
        </div>
      )}

      {/* Agent Status */}
      {agentStarted && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-lg">
            <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="font-medium">Agent is rebalancing your portfolio...</p>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Strategy: {selectedStrategy === 'conservative' ? 'Conservative' : 'Aggressive'}
          </p>
        </div>
      )}

      {/* Reveal Balance Popup */}
      {showRevealPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <h3 className="text-2xl font-bold mb-4">Reveal Balance?</h3>
            <p className="text-gray-600 mb-6">
              This will decrypt your balance on your device. The decrypted amount will only be visible to you.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleConfirmReveal}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Yes, Reveal
              </button>
              <button
                onClick={() => setShowRevealPopup(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}