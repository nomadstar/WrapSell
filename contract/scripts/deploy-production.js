const { ethers } = require("hardhat");

async function deployContracts() {
  console.log("🚀 Deploying WrapSell Contracts to Base Sepolia...");
  
  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("✅ Deploying with account:", deployer.address);
    
    // Get balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
      console.log("⚠️  Warning: Low balance. You may need more ETH for deployment.");
    }
    
    // Deploy SimpleStorage
    console.log("\n📝 Deploying SimpleStorage...");
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.waitForDeployment();
    
    const simpleStorageAddress = await simpleStorage.getAddress();
    console.log("✅ SimpleStorage deployed to:", simpleStorageAddress);
    
    // Deploy WrapPool (Pokemon)
    console.log("\n🏊‍♂️ Deploying WrapPool (Pokemon)...");
    const WrapPool = await ethers.getContractFactory("WrapPool");
    const pokemonPool = await WrapPool.deploy(
      "Pokemon Stablecoin",
      "POKE-USD",
      ethers.parseEther("1.0") // Initial price 1 USD
    );
    await pokemonPool.waitForDeployment();
    
    const pokemonPoolAddress = await pokemonPool.getAddress();
    console.log("✅ Pokemon Pool deployed to:", pokemonPoolAddress);
    
    // Deploy WrapSell
    console.log("\n🎯 Deploying WrapSell...");
    const WrapSell = await ethers.getContractFactory("WrapSell");
    const wrapSell = await WrapSell.deploy();
    await wrapSell.waitForDeployment();
    
    const wrapSellAddress = await wrapSell.getAddress();
    console.log("✅ WrapSell deployed to:", wrapSellAddress);
    
    // Add the pool to WrapSell
    console.log("\n🔗 Adding pool to WrapSell...");
    const tx = await wrapSell.addPool(pokemonPoolAddress);
    await tx.wait();
    console.log("✅ Pokemon pool added to WrapSell");
    
    // Verify deployment by calling some functions
    console.log("\n🧪 Verifying deployment...");
    
    // Test SimpleStorage
    await simpleStorage.store(42);
    const storedValue = await simpleStorage.retrieve();
    console.log("✅ SimpleStorage test - stored value:", storedValue.toString());
    
    // Test WrapSell
    const poolCount = await wrapSell.getPoolCount();
    console.log("✅ WrapSell test - pool count:", poolCount.toString());
    
    // Test WrapPool
    const poolInfo = await pokemonPool.getPoolInfo();
    console.log("✅ Pokemon Pool test - name:", poolInfo.name);
    
    // Output final addresses
    console.log("\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=====================================");
    console.log("📝 SimpleStorage:", simpleStorageAddress);
    console.log("🏊‍♂️ Pokemon Pool:", pokemonPoolAddress);
    console.log("🎯 WrapSell:", wrapSellAddress);
    console.log("=====================================");
    
    // Generate .env content for frontend
    console.log("\n📋 Add these to your frontend .env file:");
    console.log("NEXT_PUBLIC_SIMPLE_STORAGE_ADDRESS=" + simpleStorageAddress);
    console.log("NEXT_PUBLIC_WRAP_SELL_ADDRESS=" + wrapSellAddress);
    console.log("NEXT_PUBLIC_POKEMON_POOL_ADDRESS=" + pokemonPoolAddress);
    console.log("NEXT_PUBLIC_CHAIN_ID=84532");
    
    // Save deployment info
    const deploymentInfo = {
      network: "base-sepolia",
      chainId: 84532,
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: {
        SimpleStorage: simpleStorageAddress,
        WrapSell: wrapSellAddress,
        PokemonPool: pokemonPoolAddress
      },
      transactions: {
        SimpleStorage: simpleStorage.deploymentTransaction()?.hash,
        WrapSell: wrapSell.deploymentTransaction()?.hash,
        PokemonPool: pokemonPool.deploymentTransaction()?.hash
      }
    };
    
    // Write to file
    const fs = require('fs');
    fs.writeFileSync(
      'deployment-base-sepolia.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("📄 Deployment info saved to deployment-base-sepolia.json");
    
    return {
      simpleStorage: simpleStorageAddress,
      wrapSell: wrapSellAddress,
      pokemonPool: pokemonPoolAddress,
      success: true
    };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    return { success: false, error };
  }
}

// Run deployment if this script is executed directly
if (require.main === module) {
  deployContracts()
    .then((result) => {
      if (result.success) {
        console.log("\n✅ All contracts deployed successfully to Base Sepolia!");
        process.exit(0);
      } else {
        console.log("\n❌ Deployment failed!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Script error:", error);
      process.exit(1);
    });
}

module.exports = deployContracts;
