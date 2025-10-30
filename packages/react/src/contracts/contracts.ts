// Contract addresses on Sepolia testnet
export const CONTRACTS = {
  MockToken: {
    address: '0x7D5BA7DeB9A5d2F36FE38782129F6401A66e1096' as const,
    name: 'Ayumi Test USDC',
    symbol: 'ayUSDC',
  },
  PortfolioManager: {
    address: '0xc5e5A9e484DD7B69E0235c94C4dE67388f20859c' as const,
  },
  Agent: {
    address: '0xEc2116A71c34e80086a8B301Da8871859E67b963' as const,
  },
} as const;

export const SEPOLIA_CHAIN_ID = 11155111;

// Contract ABIs (simplified for now - we'll add full ABIs later)
export const MOCK_TOKEN_ABI = [
  "function claimTokens(uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function canClaim(address user) external view returns (bool)",
  "function timeUntilNextClaim(address user) external view returns (uint256)",
] as const;

export const PORTFOLIO_MANAGER_ABI = [
  "function deposit(bytes32 inputHandle, bytes memory inputProof) external",
  "function getTotalBalance() external view returns (bytes32)",
  "function getBalanceA() external view returns (bytes32)",
  "function getBalanceB() external view returns (bytes32)",
] as const;