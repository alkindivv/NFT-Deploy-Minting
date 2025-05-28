const NFTBot = require("../src/NFTBot");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

async function deployToAllChains() {
  console.log(chalk.blue("🚀 Starting deployment to all supported chains..."));

  // Konfigurasi contract
  const contractConfig = {
    name: "OmniHub NFT Collection",
    symbol: "OMNIHUB",
    mintPrice: "0.00000001", // 0.001 ETH
    maxSupply: 10000,
    baseURI: "https://api.omnihub.io/metadata/",
  };

  // Daftar semua chain yang didukung
  const supportedChains = [
    "base",
    "optimism",
    "soneium",
    "lisk",
    "unichain",
    "ink",
    "mode",
  ];

  const deploymentResults = [];
  const failedDeployments = [];

  console.log(
    chalk.cyan(`📋 Will deploy to ${supportedChains.length} chains:`)
  );
  supportedChains.forEach((chain, index) => {
    console.log(chalk.white(`${index + 1}. ${chain}`));
  });
  console.log("");

  for (let i = 0; i < supportedChains.length; i++) {
    const network = supportedChains[i];

    try {
      console.log(
        chalk.blue(
          `\n🔗 [${i + 1}/${supportedChains.length}] Deploying to ${network}...`
        )
      );

      // Initialize bot untuk network ini
      const bot = new NFTBot(network);
      await bot.initialize();

      // Deploy contract
      const result = await bot.deployContract(
        contractConfig.name,
        contractConfig.symbol,
        contractConfig.mintPrice,
        contractConfig.maxSupply,
        contractConfig.baseURI
      );

      console.log(chalk.green(`✅ ${network} deployment successful!`));
      console.log(chalk.white(`   Contract: ${result.contractAddress}`));
      console.log(chalk.white(`   TX Hash: ${result.transactionHash}`));

      deploymentResults.push({
        network: network,
        success: true,
        contractAddress: result.contractAddress,
        transactionHash: result.transactionHash,
        mintPrice: result.mintPrice,
      });

      // Delay antar deployment untuk menghindari rate limiting
      if (i < supportedChains.length - 1) {
        console.log(
          chalk.yellow("⏳ Waiting 3 seconds before next deployment...")
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(chalk.red(`❌ ${network} deployment failed:`));
      console.error(chalk.red(`   Error: ${error.message}`));

      failedDeployments.push({
        network: network,
        success: false,
        error: error.message,
      });
    }
  }

  // Summary
  console.log(chalk.blue("\n📊 DEPLOYMENT SUMMARY"));
  console.log(chalk.green(`✅ Successful: ${deploymentResults.length}`));
  console.log(chalk.red(`❌ Failed: ${failedDeployments.length}`));

  if (deploymentResults.length > 0) {
    console.log(chalk.green("\n🎉 Successful Deployments:"));
    deploymentResults.forEach((result, index) => {
      console.log(
        chalk.white(
          `${index + 1}. ${result.network}: ${result.contractAddress}`
        )
      );
    });
  }

  if (failedDeployments.length > 0) {
    console.log(chalk.red("\n💥 Failed Deployments:"));
    failedDeployments.forEach((result, index) => {
      console.log(
        chalk.white(`${index + 1}. ${result.network}: ${result.error}`)
      );
    });
  }

  // Save summary to file
  const summaryData = {
    timestamp: new Date().toISOString(),
    contractConfig: contractConfig,
    successful: deploymentResults,
    failed: failedDeployments,
    totalChains: supportedChains.length,
    successRate: `${(
      (deploymentResults.length / supportedChains.length) *
      100
    ).toFixed(1)}%`,
  };

  const summaryFile = path.join(
    __dirname,
    "..",
    "deployments",
    "all-chains-summary.json"
  );
  await fs.ensureDir(path.dirname(summaryFile));
  await fs.writeJson(summaryFile, summaryData, { spaces: 2 });

  console.log(chalk.blue(`\n💾 Summary saved to: ${summaryFile}`));
  console.log(chalk.green("🏁 Multi-chain deployment completed!"));

  return summaryData;
}

// Run deployment jika script dijalankan langsung
if (require.main === module) {
  deployToAllChains()
    .then(() => {
      console.log(chalk.green("✨ All done!"));
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red("💥 Deployment script failed:"), error);
      process.exit(1);
    });
}

module.exports = { deployToAllChains };
