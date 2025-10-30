// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockToken
 * @dev Simple ERC20 token for testing Ayumi portfolio manager
 * Users can claim free tokens for demo purposes
 */
contract MockToken is ERC20 {
    // Maximum tokens a user can claim at once
    uint256 public constant MAX_CLAIM_AMOUNT = 10000 * 10**18;
    
    // Cooldown period between claims (1 hour)
    uint256 public constant CLAIM_COOLDOWN = 1 hours;
    
    // Track last claim time for each address
    mapping(address => uint256) public lastClaimTime;
    
    event TokensClaimed(address indexed user, uint256 amount);
    
    constructor() ERC20("Ayumi Test USDC", "ayUSDC") {
        // Mint initial supply to contract for distribution
        _mint(address(this), 50000 * 10**18); // 50,000 tokens
    }
    
    /**
     * @dev Allows users to claim free test tokens
     * @param amount Amount of tokens to claim (in wei, so multiply by 10**18)
     */
    function claimTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= MAX_CLAIM_AMOUNT, "Amount exceeds maximum claim limit");
        require(
            block.timestamp >= lastClaimTime[msg.sender] + CLAIM_COOLDOWN,
            "Claim cooldown period not elapsed"
        );
        
        // Update last claim time
        lastClaimTime[msg.sender] = block.timestamp;
        
        // Transfer tokens from contract to user
        _transfer(address(this), msg.sender, amount);
        
        emit TokensClaimed(msg.sender, amount);
    }
    
    /**
     * @dev Check if user can claim tokens
     * @param user Address to check
     * @return bool True if user can claim
     */
    function canClaim(address user) external view returns (bool) {
        return block.timestamp >= lastClaimTime[user] + CLAIM_COOLDOWN;
    }
    
    /**
     * @dev Get time remaining until user can claim again
     * @param user Address to check
     * @return uint256 Seconds until next claim (0 if can claim now)
     */
    function timeUntilNextClaim(address user) external view returns (uint256) {
        uint256 nextClaimTime = lastClaimTime[user] + CLAIM_COOLDOWN;
        if (block.timestamp >= nextClaimTime) {
            return 0;
        }
        return nextClaimTime - block.timestamp;
    }
}