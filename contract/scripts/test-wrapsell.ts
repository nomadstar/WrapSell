const { ethers } = require("hardhat");

async function testWrapSell() {
  console.log("🚀 Testing WrapSell Contract...");
  
  try {
    // Get signers
    const [deployer, user1] = await ethers.getSigners();
    console.log("✅ Deployer:", deployer.address);
    
    // Test WrapSell
    console.log("\n🎯 Testing WrapSell...");
    const WrapSell = await ethers.getContractFactory("WrapSell");
    const wrapSell = await WrapSell.deploy();
    await wrapSell.waitForDeployment();
    
    const wrapSellAddress = await wrapSell.getAddress();
    console.log("✅ WrapSell deployed to:", wrapSellAddress);
    
    // Test basic functions
    const poolCount = await wrapSell.getPoolCount();
    console.log("✅ Pool count:", poolCount.toString());
    
    const name = await wrapSell.name();
    console.log("✅ Token name:", name);
    
    console.log("\n🎉 WrapSell test completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testWrapSell()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
