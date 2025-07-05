// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WrapPool
 * @dev Stablecoin pool backed by TCG cards collateral
 */
contract WrapPool is ERC20, Ownable {
    struct PoolInfo {
        string name;
        string symbol;
        uint256 totalValue;
        uint256 stablecoinSupply;
    }
    
    uint256 public totalValue;
    uint256 public initialPrice;
    
    event ValueAdded(address indexed user, uint256 amount);
    event StablecoinMinted(address indexed user, uint256 amount);
    event StablecoinBurned(address indexed user, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialPrice
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        initialPrice = _initialPrice;
        totalValue = 0;
    }

    /**
     * @dev Get pool information
     */
    function getPoolInfo() external view returns (PoolInfo memory) {
        return PoolInfo({
            name: name(),
            symbol: symbol(),
            totalValue: totalValue,
            stablecoinSupply: totalSupply()
        });
    }

    /**
     * @dev Add value to the pool (representing TCG cards)
     */
    function addValue(uint256 value) external payable {
        require(value > 0, "Value must be greater than 0");
        require(msg.value >= value, "Insufficient ETH sent");
        
        totalValue += value;
        emit ValueAdded(msg.sender, value);
    }

    /**
     * @dev Mint stablecoins based on collateral
     */
    function mintStablecoin(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(totalValue >= amount, "Insufficient collateral");
        
        _mint(msg.sender, amount);
        emit StablecoinMinted(msg.sender, amount);
    }

    /**
     * @dev Burn stablecoins
     */
    function burnStablecoin(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        emit StablecoinBurned(msg.sender, amount);
    }

    /**
     * @dev Get collateral ratio (totalValue / stablecoinSupply * 100)
     */
    function getCollateralRatio() external view returns (uint256) {
        if (totalSupply() == 0) {
            return 0;
        }
        return (totalValue * 100) / totalSupply();
    }

    /**
     * @dev Get the current price (for compatibility)
     */
    function getCurrentPrice() external view returns (uint256) {
        return initialPrice;
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdrawBalance() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Get contract ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
