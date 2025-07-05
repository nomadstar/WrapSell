require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");

// Configuración por defecto para testing si no hay private key
const defaultPrivateKey = "0x0000000000000000000000000000000000000000000000000000000000000001";

module.exports = {
  solidity: "0.8.26",
  networks: {
    hardhat: {
      // Red local de Hardhat para testing
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    base: {
      url: "https://mainnet.base.org", // RPC de Base mainnet
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [defaultPrivateKey],
    },
    "base-sepolia": {
      url: "https://sepolia.base.org", // RPC de Base testnet
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [defaultPrivateKey],
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
      "base-sepolia": process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};
