/*
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WrapSell.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WrapPool
 * @dev Stablecoin backed by NFTs from multiple WrapSell contracts associated to a single owner.
 */
contract WrapPool is ERC20, Ownable {
    // List of associated WrapSell contracts
    WrapSell[] public wrapSellContracts;
    // Owner of all associated WrapSell contracts
    address public nftOwner;

    // Mapping to track which NFTs are deposited (contract => tokenId => deposited)
    mapping(address => mapping(uint256 => bool)) public depositedNFTs;

    event WrapSellAdded(address indexed contractAddress);
    event NFTDeposited(address indexed wrapSell, uint256 indexed tokenId, address indexed from);
    event NFTWithdrawn(address indexed wrapSell, uint256 indexed tokenId, address indexed to);

    constructor(address _nftOwner) ERC20("NFT Stablecoin", "NFTUSD") Ownable(_nftOwner) {
        nftOwner = _nftOwner;
    }

    modifier onlyNFTOwner() {
        require(msg.sender == nftOwner, "Not NFT owner");
        _;
    }

    function addWrapSellContract(address wrapSellAddress) external onlyOwner {
        require(wrapSellAddress != address(0), "Invalid address");
        WrapSell ws = WrapSell(wrapSellAddress);
        require(ws.getOwner() == nftOwner, "WrapSell not owned by pool owner");
        wrapSellContracts.push(ws);
        emit WrapSellAdded(wrapSellAddress);
    }

    function getWrapSellContracts() external view returns (address[] memory) {
        address[] memory addresses = new address[](wrapSellContracts.length);
        for (uint i = 0; i < wrapSellContracts.length; i++) {
            addresses[i] = address(wrapSellContracts[i]);
        }
        return addresses;
    }

    /**
     * @dev Deposit an NFT from an associated WrapSell contract and mint stablecoins.
     * @param wrapSellIndex Index of the WrapSell contract in the list.
     * @param tokenId NFT tokenId to deposit.
     * @param amount Amount of stablecoin to mint (could be based on NFT value).
     */
    function depositNFT(uint256 wrapSellIndex, uint256 tokenId, uint256 amount) external onlyNFTOwner {
        require(wrapSellIndex < wrapSellContracts.length, "Invalid index");
        WrapSell ws = wrapSellContracts[wrapSellIndex];
        require(ws.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        // Transfer NFT to this contract
        ws.safeTransferFrom(msg.sender, address(this), tokenId);
        depositedNFTs[address(ws)][tokenId] = true;
        _mint(msg.sender, amount);
        emit NFTDeposited(address(ws), tokenId, msg.sender);
    }

    /**
     * @dev Withdraw an NFT by burning stablecoins.
     * @param wrapSellIndex Index of the WrapSell contract in the list.
     * @param tokenId NFT tokenId to withdraw.
     * @param amount Amount of stablecoin to burn (should match deposit).
     */
    function withdrawNFT(uint256 wrapSellIndex, uint256 tokenId, uint256 amount) external onlyNFTOwner {
        require(wrapSellIndex < wrapSellContracts.length, "Invalid index");
        WrapSell ws = wrapSellContracts[wrapSellIndex];
        require(depositedNFTs[address(ws)][tokenId], "NFT not deposited");
        _burn(msg.sender, amount);
        ws.safeTransferFrom(address(this), msg.sender, tokenId);
        depositedNFTs[address(ws)][tokenId] = false;
        emit NFTWithdrawn(address(ws), tokenId, msg.sender);
    }

    // Optional: function to get all deposited NFTs for a WrapSell contract
    function isNFTDeposited(address wrapSell, uint256 tokenId) external view returns (bool) {
        return depositedNFTs[wrapSell][tokenId];
    }
    // Mapping to track which address owns which NFTs (wrapSell contract => tokenId => owner)
    mapping(address => mapping(uint256 => address)) public nftCurrentOwner;

    // Mapping to track all holders of NFTs (for enumeration)
    mapping(address => address[]) public nftHolders; // wrapSell contract => array of holders
    mapping(address => mapping(address => bool)) private isHolder; // wrapSell contract => holder => exists

    event NFTOwnershipUpdated(address indexed wrapSell, uint256 indexed tokenId, address indexed newOwner);

    // Internal function to update NFT ownership tracking
    function _updateNFTOwnership(address wrapSell, uint256 tokenId, address newOwner) internal {
        address prevOwner = nftCurrentOwner[wrapSell][tokenId];
        nftCurrentOwner[wrapSell][tokenId] = newOwner;
        if (newOwner != address(0) && !isHolder[wrapSell][newOwner]) {
            nftHolders[wrapSell].push(newOwner);
            isHolder[wrapSell][newOwner] = true;
        }
        emit NFTOwnershipUpdated(wrapSell, tokenId, newOwner);
    }

    // Override depositNFT to update ownership
    function depositNFT(uint256 wrapSellIndex, uint256 tokenId, uint256 amount) external onlyNFTOwner {
        require(wrapSellIndex < wrapSellContracts.length, "Invalid index");
        WrapSell ws = wrapSellContracts[wrapSellIndex];
        require(ws.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        ws.safeTransferFrom(msg.sender, address(this), tokenId);
        depositedNFTs[address(ws)][tokenId] = true;
        _mint(msg.sender, amount);
        _updateNFTOwnership(address(ws), tokenId, msg.sender);
        emit NFTDeposited(address(ws), tokenId, msg.sender);
    }

    // Override withdrawNFT to update ownership
    function withdrawNFT(uint256 wrapSellIndex, uint256 tokenId, uint256 amount) external onlyNFTOwner {
        require(wrapSellIndex < wrapSellContracts.length, "Invalid index");
        WrapSell ws = wrapSellContracts[wrapSellIndex];
        require(depositedNFTs[address(ws)][tokenId], "NFT not deposited");
        _burn(msg.sender, amount);
        ws.safeTransferFrom(address(this), msg.sender, tokenId);
        depositedNFTs[address(ws)][tokenId] = false;
        _updateNFTOwnership(address(ws), tokenId, msg.sender);
        emit NFTWithdrawn(address(ws), tokenId, msg.sender);
    }

    // View function to get the current owner of a specific NFT
    function getNFTOwner(address wrapSell, uint256 tokenId) external view returns (address) {
        return nftCurrentOwner[wrapSell][tokenId];
    }

    // View function to get all holders for a WrapSell contract
    function getNFTHolders(address wrapSell) external view returns (address[] memory) {
        return nftHolders[wrapSell];
    }

    
}