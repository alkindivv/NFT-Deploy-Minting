const NFTBot = require("./NFTBot");
const MetadataGenerator = require("./MetadataGenerator");
const chalk = require("chalk");
require("dotenv").config();

async function main() {
  console.log(chalk.blue.bold("🎨 NFT Minting Script"));

  try {
    // Konfigurasi
    const network = process.env.DEFAULT_NETWORK || "baseSepolia";
    const contractAddress = process.argv[2]; // Address contract dari command line

    if (!contractAddress) {
      console.error(chalk.red("❌ Error: Contract address diperlukan"));
      console.log(chalk.yellow("Usage: npm run mint <contract_address>"));
      process.exit(1);
    }

    // Initialize bot
    const bot = new NFTBot(network);
    await bot.initialize();
    await bot.loadContract(contractAddress);

    // Generate metadata
    const metadataGenerator = new MetadataGenerator();
    const metadata = metadataGenerator.generateMetadata(
      "Test NFT #1",
      "NFT yang di-mint menggunakan script",
      "https://example.com/image.png"
    );

    // Mint NFT
    console.log(chalk.blue("🎨 Minting NFT..."));
    const result = await bot.mintNFT(
      process.env.RECIPIENT_ADDRESS || bot.signer.address,
      metadata
    );

    console.log(chalk.green("✅ NFT berhasil di-mint!"));
    console.log(chalk.white(`🎨 Token ID: ${result.tokenId}`));
    console.log(chalk.white(`📝 Transaction: ${result.transactionHash}`));
    console.log(chalk.white(`💰 Gas Used: ${result.gasUsed}`));
  } catch (error) {
    console.error(chalk.red("❌ Error:", error.message));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main;
