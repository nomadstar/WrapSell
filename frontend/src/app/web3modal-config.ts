import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

// Project ID from WalletConnect (replace with your own)
const projectId = "YOUR_WALLETCONNECT_PROJECT_ID";

// Define chains
const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};

const metadata = {
  name: "WrapSell",
  description: "A sleek dApp for interacting with Simple Storage smart contracts",
  url: "https://your-dapp-url.com",
  icons: ["/favicon.ico"],
};

export const configureWeb3Modal = () => {
  createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [mainnet],
    projectId,
    themeMode: "dark",
    themeVariables: {
      "--w3m-border-radius": "0.75rem",
      "--w3m-accent": "#4f46e5",
    },
  });
};