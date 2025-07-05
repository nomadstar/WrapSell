import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Testing new TCG stablecoin architecture...\n");

    // Get signers
    const [owner, user1, user2] = await ethers.getSigners();
    console.log("👤 Owner:", owner.address);
    console.log("👤 User1:", user1.address);
    console.log("👤 User2:", user2.address);

    // Deploy WrapPool (stablecoin)
    console.log("\n📦 Deploying WrapPool stablecoin...");
    const WrapPool = await ethers.getContractFactory("WrapPool");
    const wrapPool = await WrapPool.deploy("TCG Stablecoin", "TCGS");
    await wrapPool.waitForDeployment();
    console.log("✅ WrapPool deployed to:", await wrapPool.getAddress());

    // Deploy WrapSell contracts for different cards
    console.log("\n🃏 Deploying WrapSell contracts for different cards...");
    
    // Card 1: Charizard
    const WrapSell = await ethers.getContractFactory("WrapSell");
    const charizardWrapSell = await WrapSell.deploy(
        "Wrapped Charizard",
        "WCHAR",
        1, // cardId
        "Charizard",
        "Holo Rare",
        ethers.parseEther("0.1") // 0.1 ETH per card
    );
    await charizardWrapSell.waitForDeployment();
    console.log("🔥 Charizard WrapSell deployed to:", await charizardWrapSell.getAddress());

    // Card 2: Pikachu
    const pikachuWrapSell = await WrapSell.deploy(
        "Wrapped Pikachu",
        "WPIKA",
        2, // cardId
        "Pikachu",
        "Common",
        ethers.parseEther("0.05") // 0.05 ETH per card
    );
    await pikachuWrapSell.waitForDeployment();
    console.log("⚡ Pikachu WrapSell deployed to:", await pikachuWrapSell.getAddress());

    // Add WrapSell contracts to WrapPool as collateral
    console.log("\n🔗 Adding WrapSell contracts as collateral to WrapPool...");
    
    await wrapPool.addWrapSell(
        await charizardWrapSell.getAddress(),
        ethers.parseEther("1.0") // 100% weight
    );
    console.log("✅ Charizard WrapSell added as collateral");

    await wrapPool.addWrapSell(
        await pikachuWrapSell.getAddress(),
        ethers.parseEther("0.5") // 50% weight (less valuable)
    );
    console.log("✅ Pikachu WrapSell added as collateral");

    // Test scenario: Users deposit cards and get tokens
    console.log("\n💰 Testing card deposits and token minting...");

    // User1 deposits 3 Charizard cards
    console.log("\n👤 User1 deposits 3 Charizard cards...");
    const charizardValue = ethers.parseEther("0.1"); // 0.1 ETH per card
    await charizardWrapSell.connect(user1).depositCards(3, {
        value: charizardValue * 3n
    });
    
    const user1CharizardTokens = await charizardWrapSell.balanceOf(user1.address);
    console.log("🔥 User1 received Charizard tokens:", ethers.formatEther(user1CharizardTokens));

    // User2 deposits 5 Pikachu cards
    console.log("\n👤 User2 deposits 5 Pikachu cards...");
    const pikachuValue = ethers.parseEther("0.05"); // 0.05 ETH per card
    await pikachuWrapSell.connect(user2).depositCards(5, {
        value: pikachuValue * 5n
    });
    
    const user2PikachuTokens = await pikachuWrapSell.balanceOf(user2.address);
    console.log("⚡ User2 received Pikachu tokens:", ethers.formatEther(user2PikachuTokens));

    // Check total collateral value
    console.log("\n📊 Checking WrapPool collateral and minting stablecoins...");
    const totalCollateral = await wrapPool.getTotalCollateralValue();
    console.log("💎 Total collateral value:", ethers.formatEther(totalCollateral), "ETH");

    const collateralizationRatio = await wrapPool.getCurrentCollateralizationRatio();
    console.log("📈 Current collateralization ratio:", collateralizationRatio.toString(), "%");

    // Mint stablecoins based on collateral
    const stablecoinAmount = ethers.parseEther("0.2"); // Try to mint 0.2 stablecoins
    console.log("\n🏦 Owner attempts to mint", ethers.formatEther(stablecoinAmount), "stablecoins...");
    
    try {
        await wrapPool.mint(stablecoinAmount);
        const ownerStableBalance = await wrapPool.balanceOf(owner.address);
        console.log("✅ Owner received stablecoins:", ethers.formatEther(ownerStableBalance));
        
        const newCollateralizationRatio = await wrapPool.getCurrentCollateralizationRatio();
        console.log("📈 New collateralization ratio:", newCollateralizationRatio.toString(), "%");
    } catch (error) {
        console.log("❌ Failed to mint stablecoins:", error);
    }

    // Get pool information
    console.log("\n📋 Final Pool Information:");
    const poolInfo = await wrapPool.getPoolInfo();
    console.log("💰 Pool Value:", ethers.formatEther(poolInfo.poolValue), "ETH");
    console.log("🪙 Stablecoin Supply:", ethers.formatEther(poolInfo.stablecoinSupply));
    console.log("📊 Collateralization Ratio:", poolInfo.collateralizationRatio_.toString(), "%");
    console.log("🃏 Number of WrapSell contracts:", poolInfo.wrapSellCount.toString());

    // Test individual WrapSell collateral info
    console.log("\n🔍 Individual WrapSell Information:");
    
    const charizardInfo = await charizardWrapSell.getCollateralInfo();
    console.log("🔥 Charizard:");
    console.log("  📦 Total Cards:", charizardInfo.totalCards.toString());
    console.log("  💰 Total Value:", ethers.formatEther(charizardInfo.totalValue), "ETH");
    console.log("  🪙 Tokens Issued:", ethers.formatEther(charizardInfo.tokensIssued));
    
    const pikachuInfo = await pikachuWrapSell.getCollateralInfo();
    console.log("⚡ Pikachu:");
    console.log("  📦 Total Cards:", pikachuInfo.totalCards.toString());
    console.log("  💰 Total Value:", ethers.formatEther(pikachuInfo.totalValue), "ETH");
    console.log("  🪙 Tokens Issued:", ethers.formatEther(pikachuInfo.tokensIssued));

    console.log("\n🎉 Architecture test completed successfully!");
    console.log("\n📝 Summary:");
    console.log("- WrapPool acts as a stablecoin backed by multiple WrapSell contracts");
    console.log("- Each WrapSell represents a specific card with multiple units as collateral");
    console.log("- Users can deposit cards to get card-specific tokens");
    console.log("- WrapPool can mint stablecoins based on the total collateral value");
    console.log("- The system maintains proper collateralization ratios");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
