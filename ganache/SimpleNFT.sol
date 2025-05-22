// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    address public branchBurner;

    constructor(address _burner) ERC721("SimpleNFT", "SNFT") {
        branchBurner = _burner;
    }

    function createNFT(
        address recipient,
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
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, imageUrl);
        return newItemId;
    }

    function getTokenIds() public view returns (uint256) {
        return _tokenIds;
    }

    function burn(uint256 tokenId) public {
        require(msg.sender == owner() || msg.sender == branchBurner, "No autorizado");
        _burn(tokenId);
    }
}
