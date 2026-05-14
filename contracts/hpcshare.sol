// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title HPCShare
 * @notice Reference contract for Brickken-issued security tokens.
 * 
 * IMPORTANT: This contract is for documentation purposes only.
 * Actual security tokens are issued and managed via Brickken's platform,
 * which deploys its own ERC-20 compliant security token contracts
 * with embedded KYC/AML and transfer restrictions.
 * 
 * Brickken uses ERC-20 (via ERC-7943 standard) with:
 * - Permissioned transfers (only whitelisted addresses)
 * - Compliance with Spanish securities law (CNMV)
 * - Built-in investor accreditation checks
 * 
 * This file serves as a reference for the expected interface.
 */

interface IHPCShare {
    // Standard ERC-20 functions
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    
    // Brickken-specific security token functions
    function isCompliant(address account) external view returns (bool);
    function addToWhitelist(address account) external;
    function removeFromWhitelist(address account) external;
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    
    // Distribution / dividend functions
    function distributeDividends(uint256 amount) external;
    function getDividendInfo() external view returns (uint256 lastDistribution, uint256 pendingDistributions);
    
    // Events
    event WhitelistAdded(address indexed account);
    event WhitelistRemoved(address indexed account);
    event DividendsDistributed(uint256 amount, uint256 timestamp);
}

/**
 * @notice The SPV (Special Purpose Vehicle) that owns the GPU hardware
 * and receives revenue from Nosana compute leases.
 * 
 * This is an off-chain legal entity (e.g., Spanish S.L.) that:
 * - Owns the GPU cluster
 * - Registers as a provider on Nosana
 * - Collects NOS rewards
 * - Converts NOS to USDC
 * - Triggers distributions via Brickken
 */
contract HPCSPV {
    address public brickkenToken; // The HPCShare token address (deployed by Brickken)
    address public treasury;
    uint256 public managementFeeBps = 200; // 2% annual management fee
    
    event RevenueCollected(uint256 amountNOS, uint256 amountUSDC);
    event DistributionTriggered(uint256 amountUSDC, uint256 timestamp);
    event ManagementFeePaid(uint256 amount, address recipient);
    
    constructor(address _brickkenToken, address _treasury) {
        brickkenToken = _brickkenToken;
        treasury = _treasury;
    }
    
    /**
     * @notice Called by treasury after converting NOS to USDC
     * @param amountUSDC Amount of USDC to distribute
     */
    function triggerDistribution(uint256 amountUSDC) external {
        require(msg.sender == treasury, "Only treasury");
        
        // Calculate management fee (2% annualized, prorated)
        // In production, this would be calculated based on time elapsed
        uint256 fee = (amountUSDC * managementFeeBps) / 10000;
        uint256 distributionAmount = amountUSDC - fee;
        
        // Pay management fee to treasury
        (bool feeSuccess, ) = treasury.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
        
        // Call Brickken's distribution contract
        IHPCShare(brickkenToken).distributeDividends(distributionAmount);
        
        emit DistributionTriggered(distributionAmount, block.timestamp);
        emit ManagementFeePaid(fee, treasury);
    }
    
    /**
     * @notice Update management fee (requires governance)
     * @param newFeeBps New fee in basis points (max 500 = 5%)
     */
    function updateManagementFee(uint256 newFeeBps) external {
        require(msg.sender == treasury, "Only treasury");
        require(newFeeBps <= 500, "Fee too high (max 5%)");
        managementFeeBps = newFeeBps;
    }
    
    receive() external payable {
        // Accept USDC or other stablecoins
    }
}