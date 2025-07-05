const { ethers } = require("hardhat");

interface PoolConfig {
  name: string;
  symbol: string;
  tcgType: string;
  edition: string;
  initialPrice: string; // en ETH
  description: string;
}

async function deployMultiplePools() {
  console.log("🚀 Deploying Multiple WrapPool Contracts...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("✅ Deployer:", deployer.address);
    console.log("✅ Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

    // Configuración para diferentes pools
    const poolConfigs: PoolConfig[] = [
      {
        name: "Pokemon Base Set Stablecoin",
        symbol: "POKE-BASE",
        tcgType: "Pokemon",
        edition: "Base Set",
        initialPrice: "1.0", // 1 USD
        description: "Stablecoin backed by Pokemon Base Set cards"
      },
      {
        name: "Pokemon Fossil Stablecoin", 
        symbol: "POKE-FOSSIL",
        tcgType: "Pokemon",
        edition: "Fossil",
        initialPrice: "1.0",
        description: "Stablecoin backed by Pokemon Fossil cards"
      },
      {
        name: "Yu-Gi-Oh LOB Stablecoin",
        symbol: "YGO-LOB", 
        tcgType: "Yu-Gi-Oh",
        edition: "Legend of Blue Eyes",
        initialPrice: "1.0",
        description: "Stablecoin backed by Yu-Gi-Oh Legend of Blue Eyes cards"
      },
      {
        name: "Magic Alpha Stablecoin",
        symbol: "MTG-ALPHA",
        tcgType: "Magic",
        edition: "Alpha",
        initialPrice: "1.0", 
        description: "Stablecoin backed by Magic Alpha cards"
      },
      {
        name: "Magic Beta Stablecoin",
        symbol: "MTG-BETA",
        tcgType: "Magic", 
        edition: "Beta",
        initialPrice: "1.0",
        description: "Stablecoin backed by Magic Beta cards"
      }
    ];

    // Deploy WrapSell main contract first
    console.log("\n🎯 Deploying WrapSell main contract...");
    const WrapSell = await ethers.getContractFactory("WrapSell");
    const wrapSell = await WrapSell.deploy();
    await wrapSell.waitForDeployment();
    
    const wrapSellAddress = await wrapSell.getAddress();
    console.log("✅ WrapSell deployed to:", wrapSellAddress);

    // Deploy each pool
    const deployedPools: any[] = [];
    const WrapPool = await ethers.getContractFactory("WrapPool");

    for (const config of poolConfigs) {
      console.log(`\n🏊‍♂️ Deploying ${config.name}...`);
      
      const wrapPool = await WrapPool.deploy(
        config.name,
        config.symbol,
        ethers.parseEther(config.initialPrice)
      );
      await wrapPool.waitForDeployment();
      
      const poolAddress = await wrapPool.getAddress();
      console.log(`✅ ${config.symbol} deployed to:`, poolAddress);

      // Register pool in WrapSell main contract
      try {
        const tx = await wrapSell.addPool(poolAddress);
        await tx.wait();
        console.log(`✅ Pool ${config.symbol} registered in WrapSell`);
      } catch (error: any) {
        console.log(`⚠️ Could not register pool ${config.symbol}:`, error.message);
      }

      deployedPools.push({
        ...config,
        address: poolAddress,
        contract: wrapPool
      });
    }

    // Test basic functionality of each pool
    console.log("\n🧪 Testing deployed pools...");
    for (const pool of deployedPools) {
      try {
        const poolInfo = await pool.contract.getPoolInfo();
        console.log(`✅ ${pool.symbol} Info:`, {
          name: poolInfo.name,
          symbol: poolInfo.symbol,
          totalValue: ethers.formatEther(poolInfo.totalValue),
          stablecoinSupply: ethers.formatEther(poolInfo.stablecoinSupply)
        });
      } catch (error: any) {
        console.log(`❌ Error testing ${pool.symbol}:`, error.message);
      }
    }

    // Generate deployment summary
    console.log("\n📋 DEPLOYMENT SUMMARY");
    console.log("=====================================");
    console.log(`WrapSell Main Contract: ${wrapSellAddress}`);
    console.log("\nPool Contracts:");
    deployedPools.forEach(pool => {
      console.log(`${pool.symbol}: ${pool.address} (${pool.tcgType} - ${pool.edition})`);
    });

    // Generate environment variables for frontend
    console.log("\n🔧 Environment Variables for Frontend:");
    console.log("=====================================");
    console.log(`NEXT_PUBLIC_WRAPSELL_ADDRESS=${wrapSellAddress}`);
    deployedPools.forEach((pool, index) => {
      console.log(`NEXT_PUBLIC_POOL_${pool.symbol.replace('-', '_')}_ADDRESS=${pool.address}`);
    });

    // Generate contract addresses JSON for frontend
    const contractAddresses = {
      wrapSell: wrapSellAddress,
      pools: deployedPools.reduce((acc, pool) => {
        acc[pool.symbol] = {
          address: pool.address,
          tcgType: pool.tcgType,
          edition: pool.edition,
          name: pool.name,
          symbol: pool.symbol,
          description: pool.description
        };
        return acc;
      }, {} as any)
    };

    console.log("\n📄 Contract addresses JSON:");
    console.log(JSON.stringify(contractAddresses, null, 2));

    return {
      wrapSell: wrapSellAddress,
      pools: deployedPools
    };

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  deployMultiplePools()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deployMultiplePools };
