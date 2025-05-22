// npm install web3 solc qrcode fs-extra

const Web3 = require('web3').default;
const solc = require('solc');
const QRCode = require('qrcode');
const fs = require('fs-extra');
const path = require('path');

const web3 = new Web3('http://127.0.0.1:8545');

async function compileContract() {
    const source = await fs.readFile('SimpleNFT.sol', 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'SimpleNFT.sol': {
                content: source
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

    if (output.errors) {
        output.errors.forEach(err => {
            console.error(err.formattedMessage);
        });

        const hasErrors = output.errors.some(e => e.severity === 'error');
        if (hasErrors) {
            throw new Error('Errores al compilar el contrato Solidity');
        }
    }

    const contract = output.contracts['SimpleNFT.sol']['SimpleNFT'];
    return {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object
    };
}

async function run() {
    const imagePath = 'captured_image.jpg';
    if (!fs.existsSync(imagePath)) {
        throw new Error('La imagen no existe en la ruta especificada.');
    }

    const { abi, bytecode } = await compileContract();
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0];

    const SimpleNFT = new web3.eth.Contract(abi);
    const contractInstance = await SimpleNFT.deploy({
        data: '0x' + bytecode,
        arguments: [deployer] // Este será el branchBurner
    }).send({
        from: deployer,
        gas: 5000000
    });

    console.log('Contrato desplegado en:', contractInstance.options.address);

    const imageUrl = 'file://' + path.resolve(imagePath);

    const tx = await contractInstance.methods.createNFT(
        deployer,
        'captured_image.jpg', // imgName
        'SERIAL123',          // cardSerial
        'SCAN123',            // cardScanSerial
        'NFT generado desde imagen capturada',
        'DemoTCG',
        'Primera',
        '{"rarity":"common"}',
        10,                   // condition
        imageUrl
    ).send({ from: deployer, gas: 500000 });

    const tokenId = await contractInstance.methods.getTokenIds().call();
    console.log(`✅ NFT creado con TokenId: ${tokenId}`);
    console.log(`📷 Imagen: ${imageUrl}`);

    const nftData = {
        contract: contractInstance.options.address,
        tokenId,
        imageUrl
    };

    const qrPath = `nft_${tokenId}_qr.png`;
    await QRCode.toFile(qrPath, JSON.stringify(nftData), {
        color: {
            dark: '#000',
            light: '#FFF'
        }
    });

    console.log(`🔳 QR generado y guardado en: ${qrPath}`);

    // Espera 2 minutos y luego quema el NFT
    setTimeout(async () => {
        try {
            await contractInstance.methods.burn(tokenId).send({
                from: deployer,
                gas: 200000
            });
            console.log(`🔥 NFT con TokenId ${tokenId} destruido después de 2 minutos.`);
        } catch (err) {
            console.error('❌ Error al destruir el NFT:', err.message);
        }
    }, 2 * 60 * 1000);
}

run().catch(err => {
    console.error('❌ Error al ejecutar el script:', err.message);
});
