import { ethers } from "hardhat";

async function testContracts() {
  console.log("🚀 Testing WrapSell Contracts...");
  
  try {
    // Get signers
    const [deployer, user1, user2] = await ethers.getSigners();
    console.log("✅ Deployer:", deployer.address);
    console.log("✅ User1:", user1.address);
    
    // Test SimpleStorage
    console.log("\n📝 Testing SimpleStorage...");
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.waitForDeployment();
    
    const simpleStorageAddress = await simpleStorage.getAddress();
    console.log("✅ SimpleStorage deployed to:", simpleStorageAddress);
    
    // Test storing a value
    await simpleStorage.store(42);
    const storedValue = await simpleStorage.retrieve();
    console.log("✅ Stored and retrieved value:", storedValue.toString());
    
    // Test WrapPool
    console.log("\n🏊‍♂️ Testing WrapPool...");
    const WrapPool = await ethers.getContractFactory("WrapPool");
    const wrapPool = await WrapPool.deploy(
      "Pokemon Stablecoin",
      "POKE-USD",
      ethers.parseEther("1.0") // Initial price 1 USD
    );
    await wrapPool.waitForDeployment();
    
    const wrapPoolAddress = await wrapPool.getAddress();
    console.log("✅ WrapPool deployed to:", wrapPoolAddress);
    
    // Test basic pool functions
    const poolInfo = await wrapPool.getPoolInfo();
    console.log("✅ Pool Info:", {
      name: poolInfo.name,
      symbol: poolInfo.symbol,
      totalValue: ethers.formatEther(poolInfo.totalValue),
      stablecoinSupply: ethers.formatEther(poolInfo.stablecoinSupply)
    });
    
    // Test WrapSell main contract
    console.log("\n🎯 Testing WrapSell...");
    const WrapSell = await ethers.getContractFactory("WrapSell");
    const wrapSell = await WrapSell.deploy();
    await wrapSell.waitForDeployment();
    
    const wrapSellAddress = await wrapSell.getAddress();
    console.log("✅ WrapSell deployed to:", wrapSellAddress);
    
    // Add a pool to WrapSell
    await wrapSell.addPool(wrapPoolAddress);
    const poolCount = await wrapSell.getPoolCount();
    console.log("✅ Pool count after adding:", poolCount.toString());
    
    // Test adding cards with value
    console.log("\n🎴 Testing Card Operations...");
    
    // Add some test value to the pool (simulating card value)
    const cardValue = ethers.parseEther("100"); // $100 card
    await wrapPool.connect(user1).addValue(cardValue, { value: cardValue });
    
    const updatedPoolInfo = await wrapPool.getPoolInfo();
    console.log("✅ Pool value after adding card:", ethers.formatEther(updatedPoolInfo.totalValue));
    
    // Test minting stablecoins
    const mintAmount = ethers.parseEther("50"); // Mint $50 worth
    await wrapPool.connect(user1).mintStablecoin(mintAmount);
    
    const finalPoolInfo = await wrapPool.getPoolInfo();
    console.log("✅ Stablecoin supply after minting:", ethers.formatEther(finalPoolInfo.stablecoinSupply));
    
    // Check user balance
    const userBalance = await wrapPool.balanceOf(user1.address);
    console.log("✅ User stablecoin balance:", ethers.formatEther(userBalance));
    
    // Test collateral ratio
    const collateralRatio = await wrapPool.getCollateralRatio();
    console.log("✅ Collateral ratio:", collateralRatio.toString() + "%");
    
    console.log("\n🎉 All tests passed successfully!");
    
    return {
      simpleStorage: simpleStorageAddress,
      wrapPool: wrapPoolAddress,
      wrapSell: wrapSellAddress,
      success: true
    };
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    return { success: false, error };
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testContracts()
    .then((result) => {
      if (result.success) {
        console.log("\n✅ All contracts working correctly!");
        process.exit(0);
      } else {
        console.log("\n❌ Tests failed!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Script error:", error);
      process.exit(1);
    });
}

export default testContracts;
