// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title WrapPool
 * @dev Stablecoin backed by collateral assets (USDC, USDT, etc.)
 */
contract WrapPool is ERC20, Ownable {
    // Mapping of allowed collateral tokens
    mapping(address => bool) public allowedCollateral;
    mapping(address => uint256) public collateralBalances;
    
    // Price feeds or fixed rate (1:1 for stablecoins)
    mapping(address => uint256) public collateralRates; // Rate in wei (1e18 = 1:1)
    
    uint256 public constant RATE_PRECISION = 1e18;
    
    event CollateralAdded(address indexed token);
    event CollateralRemoved(address indexed token);
    event CollateralDeposited(address indexed user, address indexed token, uint256 amount, uint256 minted);
    event CollateralWithdrawn(address indexed user, address indexed token, uint256 amount, uint256 burned);

    constructor() ERC20("Wrap Stablecoin", "WUSD") Ownable(msg.sender) {
        // Initialize with common stablecoins at 1:1 rate
        // These addresses would need to be updated for the specific network
    }

    /**
     * @dev Add a collateral token with its exchange rate
     * @param token Address of the collateral token
     * @param rate Exchange rate (1e18 = 1:1 ratio)
     */
    function addCollateral(address token, uint256 rate) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(rate > 0, "Invalid rate");
        allowedCollateral[token] = true;
        collateralRates[token] = rate;
        emit CollateralAdded(token);
    }

    /**
     * @dev Remove a collateral token
     * @param token Address of the collateral token to remove
     */
    function removeCollateral(address token) external onlyOwner {
        allowedCollateral[token] = false;
        emit CollateralRemoved(token);
    }

    /**
     * @dev Deposit collateral and mint stablecoins
     * @param token Address of the collateral token
     * @param amount Amount of collateral to deposit
     */
    function deposit(address token, uint256 amount) external {
        require(allowedCollateral[token], "Collateral not allowed");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20 collateralToken = IERC20(token);
        require(collateralToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Calculate amount to mint based on collateral rate
        uint256 mintAmount = (amount * collateralRates[token]) / RATE_PRECISION;
        
        collateralBalances[token] += amount;
        _mint(msg.sender, mintAmount);
        
        emit CollateralDeposited(msg.sender, token, amount, mintAmount);
    }

    /**
     * @dev Burn stablecoins and withdraw collateral
     * @param token Address of the collateral token to withdraw
     * @param burnAmount Amount of stablecoins to burn
     */
    function withdraw(address token, uint256 burnAmount) external {
        require(allowedCollateral[token], "Collateral not allowed");
        require(burnAmount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= burnAmount, "Insufficient balance");
        
        // Calculate collateral amount to return
        uint256 collateralAmount = (burnAmount * RATE_PRECISION) / collateralRates[token];
        require(collateralBalances[token] >= collateralAmount, "Insufficient collateral");
        
        _burn(msg.sender, burnAmount);
        collateralBalances[token] -= collateralAmount;
        
        IERC20 collateralToken = IERC20(token);
        require(collateralToken.transfer(msg.sender, collateralAmount), "Transfer failed");
        
        emit CollateralWithdrawn(msg.sender, token, collateralAmount, burnAmount);
    }

    /**
     * @dev Get the total value of all collateral in the pool
     */
    function getTotalCollateralValue() external view returns (uint256 totalValue) {
        // This would need to iterate through all collateral tokens
        // Implementation depends on how you want to track all collateral types
    }

    /**
     * @dev Get collateral balance for a specific token
     */
    function getCollateralBalance(address token) external view returns (uint256) {
        return collateralBalances[token];
    }

    /**
     * @dev Check if a token is allowed as collateral
     */
    function isCollateralAllowed(address token) external view returns (bool) {
        return allowedCollateral[token];
    }

    /**
     * @dev Get the exchange rate for a collateral token
     */
    function getCollateralRate(address token) external view returns (uint256) {
        return collateralRates[token];
    }
}
