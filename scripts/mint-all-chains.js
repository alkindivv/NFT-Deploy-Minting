const NFTBot = require("../src/NFTBot");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");

async function mintOnAllChains() {
  console.log(chalk.blue("🎨 Starting 250x minting on all deployed chains..."));

  // Konfigurasi minting
  const mintConfig = {
    recipient:
      process.env.RECIPIENT_ADDRESS ||
      "0xf83Bd5A68A91EAB280b05C73F79ed83CCfd0311c", // Default ke address yang ada
    count: 250,
    baseName: "SuperNFT",
    baseDescription: "test",
    baseImageUrl: "https://google.com/",
    delay: 3000, // 2 detik delay antar mint
  };

  // Load deployment summary untuk mendapatkan contract addresses
  const summaryFile = path.join(
    __dirname,
    "..",
    "deployments",
    "all-chains-summary.json"
  );

  if (!(await fs.pathExists(summaryFile))) {
    console.error(
      chalk.red(
        "❌ Deployment summary not found. Please run deploy-all-chains.js first."
      )
    );
    process.exit(1);
  }

  const deploymentSummary = await fs.readJson(summaryFile);
  const successfulDeployments = deploymentSummary.successful;

  if (successfulDeployments.length === 0) {
    console.error(
      chalk.red(
        "❌ No successful deployments found. Please deploy contracts first."
      )
    );
    process.exit(1);
  }

  console.log(
    chalk.cyan(
      `📋 Will mint ${mintConfig.count} NFTs on ${successfulDeployments.length} chains:`
    )
  );
  successfulDeployments.forEach((deployment, index) => {
    console.log(
      chalk.white(
        `${index + 1}. ${deployment.network}: ${deployment.contractAddress}`
      )
    );
  });
  console.log("");

  const mintingResults = [];
  const failedMinting = [];

  for (let i = 0; i < successfulDeployments.length; i++) {
    const deployment = successfulDeployments[i];
    const { network, contractAddress } = deployment;

    try {
      console.log(
        chalk.blue(
          `\n🎨 [${i + 1}/${
            successfulDeployments.length
          }] Minting on ${network}...`
        )
      );
      console.log(chalk.white(`   Contract: ${contractAddress}`));
      console.log(chalk.white(`   Target: ${mintConfig.count} NFTs`));

      // Initialize bot untuk network ini
      const bot = new NFTBot(network);
      await bot.initialize();

      // Load contract
      await bot.loadContract(contractAddress);

      // Check contract status sebelum minting
      const status = await bot.getContractStatus();
      console.log(
        chalk.white(
          `   Current Supply: ${status.totalSupply}/${status.maxSupply}`
        )
      );
      console.log(chalk.white(`   Mint Price: ${status.mintPrice} ETH`));

      // Cek apakah masih bisa mint sebanyak yang diinginkan
      const remainingSupply =
        parseInt(status.maxSupply) - parseInt(status.totalSupply);
      const actualMintCount = Math.min(mintConfig.count, remainingSupply);

      if (actualMintCount <= 0) {
        console.log(
          chalk.yellow(`⚠️ ${network}: Max supply reached, skipping...`)
        );
        failedMinting.push({
          network: network,
          contractAddress: contractAddress,
          success: false,
          error: "Max supply reached",
        });
        continue;
      }

      if (actualMintCount < mintConfig.count) {
        console.log(
          chalk.yellow(
            `⚠️ ${network}: Only ${actualMintCount} NFTs can be minted (supply limit)`
          )
        );
      }

      const startTime = Date.now();

      // Batch mint dengan chunking otomatis
      const results = await bot.batchMintNFT(
        mintConfig.recipient,
        actualMintCount,
        `${mintConfig.baseName} [${network.toUpperCase()}]`,
        `${mintConfig.baseDescription} - Minted on ${network}`,
        `${mintConfig.baseImageUrl}${network}/`,
        mintConfig.delay
      );

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      console.log(chalk.green(`✅ ${network} minting completed!`));
      console.log(chalk.white(`   Minted: ${results.length} NFTs`));
      console.log(chalk.white(`   Duration: ${duration} seconds`));
      console.log(
        chalk.white(
          `   Average: ${(duration / results.length).toFixed(2)}s per NFT`
        )
      );

      mintingResults.push({
        network: network,
        contractAddress: contractAddress,
        success: true,
        mintedCount: results.length,
        targetCount: mintConfig.count,
        duration: duration,
        results: results,
      });

      // Delay antar chain untuk menghindari rate limiting
      if (i < successfulDeployments.length - 1) {
        console.log(chalk.yellow("⏳ Waiting 5 seconds before next chain..."));
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(chalk.red(`❌ ${network} minting failed:`));
      console.error(chalk.red(`   Error: ${error.message}`));

      failedMinting.push({
        network: network,
        contractAddress: contractAddress,
        success: false,
        error: error.message,
      });
    }
  }

  // Summary
  console.log(chalk.blue("\n📊 MINTING SUMMARY"));
  console.log(chalk.green(`✅ Successful chains: ${mintingResults.length}`));
  console.log(chalk.red(`❌ Failed chains: ${failedMinting.length}`));

  let totalMinted = 0;
  if (mintingResults.length > 0) {
    console.log(chalk.green("\n🎉 Successful Minting:"));
    mintingResults.forEach((result, index) => {
      console.log(
        chalk.white(
          `${index + 1}. ${result.network}: ${result.mintedCount}/${
            result.targetCount
          } NFTs (${result.duration}s)`
        )
      );
      totalMinted += result.mintedCount;
    });
    console.log(chalk.cyan(`\n🎯 Total NFTs minted: ${totalMinted}`));
  }

  if (failedMinting.length > 0) {
    console.log(chalk.red("\n💥 Failed Minting:"));
    failedMinting.forEach((result, index) => {
      console.log(
        chalk.white(`${index + 1}. ${result.network}: ${result.error}`)
      );
    });
  }

  // Save minting summary
  const mintingSummary = {
    timestamp: new Date().toISOString(),
    mintConfig: mintConfig,
    successful: mintingResults,
    failed: failedMinting,
    totalChains: successfulDeployments.length,
    totalMinted: totalMinted,
    successRate: `${(
      (mintingResults.length / successfulDeployments.length) *
      100
    ).toFixed(1)}%`,
  };

  const mintingSummaryFile = path.join(
    __dirname,
    "..",
    "deployments",
    "minting-summary.json"
  );
  await fs.writeJson(mintingSummaryFile, mintingSummary, { spaces: 2 });

  console.log(
    chalk.blue(`\n💾 Minting summary saved to: ${mintingSummaryFile}`)
  );
  console.log(chalk.green("🏁 Multi-chain minting completed!"));

  return mintingSummary;
}

// Helper function untuk mint pada chain tertentu saja
async function mintOnSpecificChains(chainNames, mintCount = 250) {
  console.log(
    chalk.blue(
      `🎨 Starting ${mintCount}x minting on specific chains: ${chainNames.join(
        ", "
      )}`
    )
  );

  const mintConfig = {
    recipient:
      process.env.RECIPIENT_ADDRESS ||
      "0x306DcB1f61185E0703B416995887266F3ba5B770",
    count: mintCount,
    baseName: "OmniHub NFT",
    baseDescription: "Multi-chain NFT collection",
    baseImageUrl: "https://api.omnihub.io/images/",
    delay: 2000,
  };

  // Load deployment summary
  const summaryFile = path.join(
    __dirname,
    "..",
    "deployments",
    "all-chains-summary.json"
  );

  if (!(await fs.pathExists(summaryFile))) {
    console.error(chalk.red("❌ Deployment summary not found."));
    return;
  }

  const deploymentSummary = await fs.readJson(summaryFile);
  const targetDeployments = deploymentSummary.successful.filter((d) =>
    chainNames.includes(d.network)
  );

  if (targetDeployments.length === 0) {
    console.error(
      chalk.red("❌ No matching deployments found for specified chains.")
    );
    return;
  }

  console.log(
    chalk.cyan(`📋 Found ${targetDeployments.length} matching deployments`)
  );

  for (const deployment of targetDeployments) {
    try {
      console.log(chalk.blue(`\n🎨 Minting on ${deployment.network}...`));

      const bot = new NFTBot(deployment.network);
      await bot.initialize();
      await bot.loadContract(deployment.contractAddress);

      const results = await bot.batchMintNFT(
        mintConfig.recipient,
        mintConfig.count,
        `${mintConfig.baseName} [${deployment.network.toUpperCase()}]`,
        `${mintConfig.baseDescription} - Minted on ${deployment.network}`,
        `${mintConfig.baseImageUrl}${deployment.network}/`,
        mintConfig.delay
      );

      console.log(
        chalk.green(`✅ ${deployment.network}: ${results.length} NFTs minted`)
      );
    } catch (error) {
      console.error(chalk.red(`❌ ${deployment.network}: ${error.message}`));
    }
  }
}

// Run minting jika script dijalankan langsung
if (require.main === module) {
  // Cek apakah ada argument untuk chain tertentu
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Mint pada chain tertentu
    const chainNames = args[0].split(",");
    const mintCount = args[1] ? parseInt(args[1]) : 250;

    mintOnSpecificChains(chainNames, mintCount)
      .then(() => {
        console.log(chalk.green("✨ Specific chain minting done!"));
        process.exit(0);
      })
      .catch((error) => {
        console.error(chalk.red("💥 Specific minting failed:"), error);
        process.exit(1);
      });
  } else {
    // Mint pada semua chain
    mintOnAllChains()
      .then(() => {
        console.log(chalk.green("✨ All chain minting done!"));
        process.exit(0);
      })
      .catch((error) => {
        console.error(chalk.red("💥 Minting script failed:"), error);
        process.exit(1);
      });
  }
}

module.exports = { mintOnAllChains, mintOnSpecificChains };
