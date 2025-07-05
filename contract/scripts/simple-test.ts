const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Simple Contract Test...");
  
  try {
    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("✅ Deployer:", deployer.address);
    
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
    
    console.log("\n🎉 Simple test completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
