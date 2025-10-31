import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useFHE } from '../context/FHEContext';
import BalanceDashboard from '@/components/BalanceDashboard';

type Steps = 'claim' | 'deposit' | 'dashboard';

// Contract configuration
const MOCK_TOKEN_ADDRESS = '0x7D5BA7DeB9A5d2F36FE38782129F6401A66e1096';
const PORTFOLIO_MANAGER_ADDRESS = '0xc5e5A9e484DD7B69E0235c94C4dE67388f20859c';

const MOCK_TOKEN_ABI = [
  "function claimTokens(uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
];

const PORTFOLIO_MANAGER_ABI = [
  "function deposit(bytes32 inputHandle, bytes inputProof) external",
  "function getTotalBalance() external view returns (bytes32)",
];

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const { fheInstance, isInitialized } = useFHE();

  const [currentStep, setCurrentStep] = useState<Steps>('claim');
  const [amount, setAmount] = useState('1000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [encryptedBalanceHandle, setEncryptedBalanceHandle] = useState<string>('');


  const handleLogout = async() => {
    await logout();
    navigate('/');
  };

  const handleClaimTokens = async () => {
    setIsProcessing(true);
    try {
      const wallet = wallets[0];
      if (!wallet) {
        alert('No wallet connected');
        return;
      }

      await wallet.switchChain(11155111);
      const ethereumProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();

      const mockToken = new ethers.Contract(
        MOCK_TOKEN_ADDRESS,
        MOCK_TOKEN_ABI,
        signer
      );

      const amountInWei = ethers.parseUnits(amount, 18);

      console.log(`Claiming ${amount} tokens...`);
      
      const tx = await mockToken.claimTokens(amountInWei);
      console.log('Transaction sent:', tx.hash);

      await tx.wait();
      console.log('Transaction confirmed!');
      
      alert(`✅ Successfully claimed ${amount} ayUSDC tokens!\n\nTransaction: ${tx.hash.slice(0, 10)}...`);
      
      setAmount('100');
      setCurrentStep('deposit');
    } catch (error: any) {
      console.error('Error claiming tokens:', error);
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        alert('❌ Transaction cancelled');
      } else if (error.message?.includes('Claim cooldown')) {
        alert('⏰ Please wait 1 hour between claims');
      } else if (error.message?.includes('insufficient funds')) {
        alert('❌ Insufficient Sepolia ETH for gas. Get some from a faucet!');
      } else {
        alert(`❌ Failed to claim tokens:\n${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeposit = async () => {
    setIsProcessing(true);
    try {
      if (!isInitialized || !fheInstance) {
        alert('⏳ Encryption system initializing... Please wait a moment and try again.');
        return;
      }

      const wallet = wallets[0];
      if (!wallet) {
        alert('No wallet connected');
        return;
      }

      await wallet.switchChain(11155111);
      const ethereumProvider = await wallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      console.log(`Depositing ${amount} tokens...`);

      const mockToken = new ethers.Contract(
        MOCK_TOKEN_ADDRESS,
        MOCK_TOKEN_ABI,
        signer
      );

      const amountInWei = ethers.parseUnits(amount, 18);
      
      console.log('Step 1: Approving tokens...');
      const approveTx = await mockToken.approve(PORTFOLIO_MANAGER_ADDRESS, amountInWei);
      await approveTx.wait();
      console.log('Approval confirmed!');

      console.log('Step 2: Encrypting amount...');
      const encryptedInput = fheInstance.createEncryptedInput(
        PORTFOLIO_MANAGER_ADDRESS,
        userAddress
      );
      
      encryptedInput.add32(Number(amount));
      const encrypted = await encryptedInput.encrypt();
      
      console.log('Encrypted data:', {
        handle: encrypted.handles[0],
        proof: encrypted.inputProof.slice(0, 20) + '...'
      });

      console.log('Step 3: Sending deposit transaction...');
      const portfolioManager = new ethers.Contract(
        PORTFOLIO_MANAGER_ADDRESS,
        PORTFOLIO_MANAGER_ABI,
        signer
      );

      const depositTx = await portfolioManager.deposit(
        encrypted.handles[0],
        encrypted.inputProof
      );
      
      console.log('Deposit transaction sent:', depositTx.hash);
      await depositTx.wait();
      console.log('Deposit confirmed!');

      alert(
        `✅ Deposit successful!\n\n` +
        `Amount: ${amount} tokens\n` +
        `Encrypted: ${encrypted.handles[0].slice(0, 20)}...\n\n` +
        `Your balance is now encrypted on-chain!`
      );

      // Store encrypted handle and move to dashboard
      setEncryptedBalanceHandle(encrypted.handles[0]);
      setCurrentStep('dashboard');
    } catch (error: any) {
      console.error('Error depositing tokens:', error);
      
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        alert('❌ Transaction cancelled');
      } else {
        alert(`❌ Failed to deposit:\n${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

const handleRevealBalance = async (): Promise<string> => {
  if (!fheInstance) {
    throw new Error('Cannot decrypt - missing fheInstance');
  }

  try {
    const wallet = wallets[0];
    if (!wallet) {
      throw new Error('No wallet connected');
    }

    await wallet.switchChain(11155111);
    const ethereumProvider = await wallet.getEthereumProvider();
    const provider = new ethers.BrowserProvider(ethereumProvider);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    console.log('User address:', userAddress);

    // Contract address
    const PORTFOLIO_MANAGER_ADDRESS = '0xc5e5A9e484DD7B69E0235c94C4dE67388f20859c' as `0x${string}`;

    // Get encrypted balance from contract
    const portfolioManager = new ethers.Contract(
      PORTFOLIO_MANAGER_ADDRESS,
      PORTFOLIO_MANAGER_ABI,
      signer
    );

   console.log("Retrieving encrypted balance handle...");
const ciphertextHandle = await portfolioManager.getTotalBalance();

// ✅ Step 2: Prepare relayer decryption parameters
const keypair = fheInstance.generateKeypair();

const handleContractPairs = [
  {
    handle: ciphertextHandle,
    contractAddress: PORTFOLIO_MANAGER_ADDRESS,
  },
];

const startTimeStamp = Math.floor(Date.now() / 1000).toString();
const durationDays = "10";
const contractAddresses = [PORTFOLIO_MANAGER_ADDRESS];

// ✅ Step 3: Create EIP-712 payload and signature
const eip712 = fheInstance.createEIP712(
  keypair.publicKey,
  contractAddresses,
  startTimeStamp,
  durationDays
);

const signature = await signer.signTypedData(
  eip712.domain,
  {
    UserDecryptRequestVerification:
      eip712.types.UserDecryptRequestVerification,
  },
  eip712.message
);

// ✅ Step 4: Perform user decryption through the relayer
console.log("Requesting user decryption from relayer...");
const result = await fheInstance.userDecrypt(
  handleContractPairs,
  keypair.privateKey,
  keypair.publicKey,
  signature.replace("0x", ""),
  contractAddresses,
  userAddress,
  startTimeStamp,
  durationDays
);

const decryptedValue = result[ciphertextHandle];
console.log("✅ Decrypted balance:", decryptedValue);

return decryptedValue.toString();
} catch (error: any) {
console.error("Decryption error:", error);
throw new Error(`Failed to decrypt: ${error.message}`);
}
};

const handleSubmit = () => {
  if (currentStep === 'claim') {
    handleClaimTokens();
  } else if (currentStep === 'deposit') {
    handleDeposit();
    }
  };

  if (ready && !authenticated) {
    navigate('/');
    return null;
  }

  const walletAddress = user?.wallet?.address;

  const stepConfig: Record<Steps, { title: string; buttonText: string; helperText: string }> = {
    claim: {
      title: 'Claim test tokens',
      buttonText: 'Claim',
      helperText: 'Get free ayUSDC tokens to try out Ayumi. No real money needed!',
    },
    deposit: {
      title: 'Deposit',
      buttonText: 'Deposit',
      helperText: 'Deposit tokens to start portfolio management with encrypted balances.',
    },
    dashboard: {
      title: 'Dashboard',
      buttonText: '',
      helperText: '',
    },
  };

  const config = stepConfig[currentStep];

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Logout */}
      <header className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img src="/ayum.svg" alt="" className="h-5 w-5"/>
          <h1 className="text-xl font-semibold text-gray-900">ayumi.</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {walletAddress && (
            <span className="text-sm text-gray-600">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      {currentStep === 'dashboard' ? (
        <BalanceDashboard
          encryptedBalance={encryptedBalanceHandle}
          onRevealBalance={handleRevealBalance}
        />
      ) : (
        <div className="max-w-2xl mx-auto p-8 mt-12">
          <div className="space-y-6">
            <h2 className="text-4xl font-semibold text-gray-900">
              {config.title}
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full text-xl py-3 px-0 bg-transparent border-0 border-b-2 border-gray-900 focus:outline-none focus:border-black placeholder:text-gray-400"
                  disabled={isProcessing}
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || !amount || Number(amount) <= 0}
                  className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-200 text-black font-medium text-xl px-8 py-3 rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
                >
                  {isProcessing ? 'Processing...' : config.buttonText}
                </button>

                {currentStep === 'claim' && (
                  <button
                    onClick={() => setCurrentStep('deposit')}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-lg font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                )}

                {currentStep === 'deposit' && (
                  <button
                    onClick={() => setCurrentStep('claim')}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg text-lg font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                )}
              </div>

              <p className="text-lg text-gray-500">
                {config.helperText}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}