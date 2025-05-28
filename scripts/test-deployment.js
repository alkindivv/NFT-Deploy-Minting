const NFTBot = require("../src/NFTBot");
const chalk = require("chalk");

async function testDeployment() {
  console.log(
    chalk.blue("🧪 Testing deployment and minting on Base Sepolia testnet...")
  );

  try {
    // Test deployment
    console.log(chalk.blue("\n1. Testing Contract Deployment..."));
    const bot = new NFTBot("baseSepolia");
    await bot.initialize();

    const deployResult = await bot.deployContract(
      "Test OmniHub NFT",
      "TESTOMNI",
      "0.001",
      100,
      "https://test.omnihub.io/metadata/"
    );

    console.log(chalk.green("✅ Deployment successful!"));
    console.log(chalk.white(`   Contract: ${deployResult.contractAddress}`));

    // Test single mint
    console.log(chalk.blue("\n2. Testing Single Mint..."));
    const metadata = JSON.stringify({
      name: "Test NFT #1",
      description: "Test NFT for deployment verification",
      image: "https://test.omnihub.io/images/1.png",
      attributes: [
        { trait_type: "Type", value: "Test" },
        { trait_type: "Rarity", value: "Common" },
      ],
    });

    const mintResult = await bot.mintNFT(bot.signer.address, metadata);
    console.log(chalk.green("✅ Single mint successful!"));
    console.log(chalk.white(`   Token ID: ${mintResult.tokenId}`));
    console.log(chalk.white(`   TX Hash: ${mintResult.transactionHash}`));

    // Test batch mint (small)
    console.log(chalk.blue("\n3. Testing Batch Mint (5 NFTs)..."));
    const batchResults = await bot.batchMintNFT(
      bot.signer.address,
      5,
      "Test Batch NFT",
      "Test batch minting functionality",
      "https://test.omnihub.io/images/batch/",
      1000 // 1 second delay
    );

    console.log(chalk.green("✅ Batch mint successful!"));
    console.log(chalk.white(`   Minted: ${batchResults.length} NFTs`));

    // Test contract status
    console.log(chalk.blue("\n4. Testing Contract Status..."));
    const status = await bot.getContractStatus();
    console.log(chalk.green("✅ Contract status check successful!"));
    console.log(chalk.white(`   Name: ${status.name}`));
    console.log(chalk.white(`   Symbol: ${status.symbol}`));
    console.log(
      chalk.white(`   Total Supply: ${status.totalSupply}/${status.maxSupply}`)
    );
    console.log(chalk.white(`   Mint Price: ${status.mintPrice} ETH`));

    console.log(
      chalk.green("\n🎉 All tests passed! Ready for multi-chain deployment.")
    );

    return {
      success: true,
      contractAddress: deployResult.contractAddress,
      totalMinted: parseInt(status.totalSupply),
    };
  } catch (error) {
    console.error(chalk.red("\n❌ Test failed:"), error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run test jika script dijalankan langsung
if (require.main === module) {
  testDeployment()
    .then((result) => {
      if (result.success) {
        console.log(chalk.green("\n✨ Test completed successfully!"));
        console.log(chalk.cyan("You can now run: npm run deploy-all"));
        process.exit(0);
      } else {
        console.log(
          chalk.red("\n💥 Test failed. Please fix issues before proceeding.")
        );
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error(chalk.red("💥 Test script error:"), error);
      process.exit(1);
    });
}

module.exports = { testDeployment };
