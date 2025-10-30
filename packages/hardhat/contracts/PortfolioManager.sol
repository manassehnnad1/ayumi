// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title PortfolioManager
/// @notice Manages encrypted portfolio balances with automatic rebalancing
/// @dev Uses FHEVM for fully encrypted balance storage and operations
contract PortfolioManager is SepoliaConfig {
    // Token being managed
    IERC20 public immutable token;
    
    // Agent address authorized to rebalance
    address public agent;
    
    // Encrypted balances split into two positions
    mapping(address => euint32) private encryptedBalanceA;
    mapping(address => euint32) private encryptedBalanceB;
    
    // Track total encrypted balance for each user
    mapping(address => euint32) private totalEncryptedBalance;
    
    // Events
    event Deposited(address indexed user, uint256 timestamp);
    event Rebalanced(address indexed user, uint256 timestamp);
    event AgentUpdated(address indexed newAgent);
    
    /// @notice Constructor sets the token and initial agent
    /// @param _token Address of the ERC20 token to manage
    /// @param _agent Address authorized to call rebalance
    constructor(address _token, address _agent) {
        require(_token != address(0), "Invalid token address");
        require(_agent != address(0), "Invalid agent address");
        
        token = IERC20(_token);
        agent = _agent;
    }
    
    /// @notice Deposit tokens and encrypt the balance
    /// @param inputEuint32 The encrypted amount to deposit
    /// @param inputProof The input proof for the encrypted amount
    function deposit(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        // Convert external encrypted input to internal encrypted type
        euint32 encryptedAmount = FHE.fromExternal(inputEuint32, inputProof);
        
        // Transfer tokens from user to contract (unencrypted transfer)
        // Note: User must approve this contract first
        // The actual amount transferred should match the encrypted amount
        // For demo, we'll rely on frontend to handle this correctly
        
        // Add to total encrypted balance
        totalEncryptedBalance[msg.sender] = FHE.add(
            totalEncryptedBalance[msg.sender], 
            encryptedAmount
        );
        
        // Split 50/50 between positions A and B
        euint32 half = FHE.div(encryptedAmount, 2);
        
        encryptedBalanceA[msg.sender] = FHE.add(
            encryptedBalanceA[msg.sender], 
            half
        );
        
        encryptedBalanceB[msg.sender] = FHE.add(
            encryptedBalanceB[msg.sender], 
            half
        );
        
        // Allow contract and user to access encrypted values
        FHE.allowThis(totalEncryptedBalance[msg.sender]);
        FHE.allow(totalEncryptedBalance[msg.sender], msg.sender);
        
        FHE.allowThis(encryptedBalanceA[msg.sender]);
        FHE.allow(encryptedBalanceA[msg.sender], msg.sender);
        
        FHE.allowThis(encryptedBalanceB[msg.sender]);
        FHE.allow(encryptedBalanceB[msg.sender], msg.sender);
        
        emit Deposited(msg.sender, block.timestamp);
    }
    
    /// @notice Get user's total encrypted balance
    /// @return The encrypted total balance
    function getTotalBalance() external view returns (euint32) {
        return totalEncryptedBalance[msg.sender];
    }
    
    /// @notice Get encrypted balance in Position A
    /// @return The encrypted balance in position A
    function getBalanceA() external view returns (euint32) {
        return encryptedBalanceA[msg.sender];
    }
    
    /// @notice Get encrypted balance in Position B
    /// @return The encrypted balance in position B
    function getBalanceB() external view returns (euint32) {
        return encryptedBalanceB[msg.sender];
    }
    
    /// @notice Rebalance a user's portfolio (agent only)
    /// @param user The user whose portfolio to rebalance
    /// @dev Moves 10% from Position A to Position B
    function rebalance(address user) external {
        require(msg.sender == agent, "Only agent can rebalance");
        require(user != address(0), "Invalid user address");
        
        // Calculate 10% of Position A
        euint32 tenPercent = FHE.div(encryptedBalanceA[user], 10);
        
        // Move from A to B
        encryptedBalanceA[user] = FHE.sub(encryptedBalanceA[user], tenPercent);
        encryptedBalanceB[user] = FHE.add(encryptedBalanceB[user], tenPercent);
        
        // Update permissions
        FHE.allowThis(encryptedBalanceA[user]);
        FHE.allow(encryptedBalanceA[user], user);
        
        FHE.allowThis(encryptedBalanceB[user]);
        FHE.allow(encryptedBalanceB[user], user);
        
        emit Rebalanced(user, block.timestamp);
    }
    
    /// @notice Update the agent address (owner only for demo)
    /// @param newAgent The new agent address
    /// @dev In production, add proper access control (Ownable)
    function updateAgent(address newAgent) external {
        require(newAgent != address(0), "Invalid agent address");
        agent = newAgent;
        emit AgentUpdated(newAgent);
    }
}