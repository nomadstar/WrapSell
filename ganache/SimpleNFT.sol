// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    address public branchBurner;

    struct CardData {
        string imgName;
        string cardSerial;
        string cardScanSerial;
        string description;
        string tcgName;
        string tcgEdition;
        string propertiesJson;
        uint8 condition;
        string imageUrl; // Link de la imagen
    }

    mapping(uint256 => CardData) public cardData;

    constructor(address _branchBurner) 
        ERC721("SimpleNFT", "SNFT") 
        Ownable(_branchBurner) 
    {
        branchBurner = _branchBurner;
    }

    modifier onlyBranchBurner() {
        require(msg.sender == branchBurner, "Not authorized branch");
        _;
    }

    function setBranchBurner(address _branchBurner) public onlyOwner {
        branchBurner = _branchBurner;
    }

    function createNFT(
        address to,
        string memory imgName,
        string memory cardSerial,
        string memory cardScanSerial,
        string memory description,
        string memory tcgName,
        string memory tcgEdition,
        string memory propertiesJson,
        uint8 condition,
        string memory imageUrl
    ) public onlyOwner returns (uint256) {
        require(to != address(0), "Destino nulo");
        uint256 newTokenId = _tokenIds;
        _mint(to, newTokenId);

        cardData[newTokenId] = CardData(
            imgName,
            cardSerial,
            cardScanSerial,
            description,
            tcgName,
            tcgEdition,
            propertiesJson,
            condition,
            imageUrl
        );

        _tokenIds += 1;
        return newTokenId;
    }

    function burn(uint256 tokenId) public onlyBranchBurner {
        _burn(tokenId);
        delete cardData[tokenId];
    }

    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    function getTokenIds() public view returns (uint256) {
        return _tokenIds;
    }

    function getImage(uint256 tokenId) public view returns (string memory) {
        return cardData[tokenId].imageUrl;
    }

    function getOwner() public view returns (address) {
        return owner();
    }
}