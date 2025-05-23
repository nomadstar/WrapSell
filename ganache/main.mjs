// npm install web3 solc qrcode readline-sync opencv4nodejs fs-extra

import Web3 from 'web3';
import solc from 'solc';
import QRCode from 'qrcode';
// import readline from 'readline-sync'; // Removed because it's unused
import fs from 'fs-extra';
// const cv = require('opencv4nodejs'); // Ya no se usa
import path from 'path';

// Conexión a Ganache local
const web3 = new Web3('http://127.0.0.1:8545');

const contractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
}
`;

(async () => {
    // 1. Lee la imagen y súbela a algún lugar accesible (simularemos con un enlace local)
    const imagePath = 'captured_image.jpg';
    if (!fs.existsSync(imagePath)) {
        throw new Error('La imagen no existe en la ruta especificada.');
    }

    // 2. Compila el contrato
    const input = {
        language: 'Solidity',
        sources: {
            'SimpleNFT.sol': {
                content: contractSource
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const contractFile = output.contracts['SimpleNFT.sol']['SimpleNFT'];
    const abi = contractFile.abi;
    const bytecode = contractFile.evm.bytecode.object;

    // 3. Despliega el contrato
    const SimpleNFT = new web3.eth.Contract(abi);
    const contractInstance = await SimpleNFT.deploy({
        data: '0x' + bytecode,
        arguments: [web3.eth.defaultAccount || (await web3.eth.getAccounts())[0]]
    }).send({
        from: (await web3.eth.getAccounts())[0],
        gas: 5000000
    });

    // 4. Crea el NFT usando la imagen
    const imgName = 'captured_image.jpg';
    const cardSerial = 'SERIAL123';
    const cardScanSerial = 'SCAN123';
    const description = 'NFT generado desde imagen capturada';
    const tcgName = 'DemoTCG';
    const tcgEdition = 'Primera';
    const propertiesJson = '{"rarity":"common"}';
    const imageUrl = 'file://' + path.resolve(imagePath); // Simulación de URL local
    await contractInstance.methods.createNFT(
    (await web3.eth.getAccounts())[0],
    imgName,
    cardSerial,
    cardScanSerial,
    description,
    tcgName,
    tcgEdition,
    propertiesJson,
    condition,
    imageUrl
).send({ from: (await web3.eth.getAccounts())[0], gas: 500000 });

// Get the tokenId of the newly created NFT
const tokenId = (await contractInstance.methods.getTokenIds().call()) - 1;

console.log('NFT creado. TokenId:', tokenId);
console.log('URL de la imagen:', imageUrl);

// Generate QR code for the NFT (for example, encode the tokenId and imageUrl)
const qrContent = JSON.stringify({ tokenId, imageUrl });
const qrPath = `nft_${tokenId}_qr.png`;

await QRCode.toFile(qrPath, qrContent, {
    color: {
        dark: '#000',
        light: '#FFF'
    }
});

console.log(`QR generado y guardado en: ${qrPath}`);

setTimeout(async () => {
    try {
        await contractInstance.methods.burn(tokenId).send({ from: (await web3.eth.getAccounts())[0], gas: 200000 });
        console.log(`NFT con TokenId ${tokenId} destruido después de 2 minutos.`);
    } catch (err) {
        console.error('Error al destruir el NFT:', err);
    }
}, 2 * 60 * 1000);
}, 2 * 60 * 1000);
