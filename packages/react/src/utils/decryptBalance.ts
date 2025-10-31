// src/utils/decryptBalance.ts
import { ethers } from 'ethers';
import type { FhevmInstance } from '@zama-fhe/relayer-sdk/web';

export async function decryptBalance(
  fheInstance: FhevmInstance,
  encryptedBalance: string,
  portfolioManagerAddress: string
): Promise<string> {
  const keypair = fheInstance.generateKeypair();
  const handleContractPairs = [
    { handle: encryptedBalance, contractAddress: portfolioManagerAddress },
  ];

  const startTimeStamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = '7';
  const contractAddresses = [portfolioManagerAddress];

  const eip712 = fheInstance.createEIP712(
    keypair.publicKey,
    contractAddresses,
    startTimeStamp,
    durationDays
  );

  const { ethereum } = window as any;
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();

  const signature = await signer.signTypedData(
    eip712.domain,
    {
      UserDecryptRequestVerification:
        eip712.types.UserDecryptRequestVerification,
    },
    eip712.message
  );

  const result = await fheInstance.userDecrypt(
    handleContractPairs,
    keypair.privateKey,
    keypair.publicKey,
    signature.replace('0x', ''),
    contractAddresses,
    signer.address,
    startTimeStamp,
    durationDays
  );

  const decryptedValue = result[encryptedBalance];
  return decryptedValue.toString();
}
