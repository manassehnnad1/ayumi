import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { createInstance, initSDK } from '@zama-fhe/relayer-sdk/web';

interface FHEContextType {
  fheInstance: any | null;
  isInitialized: boolean;
  error: string | null;
}

const FHEContext = createContext<FHEContextType | undefined>(undefined);

export function FHEProvider({ children }: { children: ReactNode }) {
  const [fheInstance, setFheInstance] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initFHE = async () => {
      try {
        console.log('🔄 Starting FHE initialization...');
        
        await initSDK();
        console.log('✅ SDK initialized');
        
        const instance = await createInstance({
          aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
          kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
          inputVerifierContractAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
          verifyingContractAddressDecryption: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
          verifyingContractAddressInputVerification: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
          chainId: 11155111,
          gatewayChainId: 55815,
          network:  'https://eth-sepolia.public.blastapi.io',
          relayerUrl: 'https://relayer.testnet.zama.cloud',
        });
        
        console.log('✅ FHE instance created');
        setFheInstance(instance);
        setIsInitialized(true);
        console.log('🎉 FHE instance initialized successfully');
      } catch (err) {
        console.error('❌ Failed to initialize FHE:', err);
        setError('Failed to initialize encryption system');
      }
    };

    initFHE();
  }, []);

  return (
    <FHEContext.Provider value={{ fheInstance, isInitialized, error }}>
      {children}
    </FHEContext.Provider>
  );
}

export function useFHE() {
  const context = useContext(FHEContext);
  if (context === undefined) {
    throw new Error('useFHE must be used within a FHEProvider');
  }
  return context;
}