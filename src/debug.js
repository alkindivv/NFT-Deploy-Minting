const NFTBot = require("./NFTBot");
const chalk = require("chalk");
require("dotenv").config();

async function debugContract() {
  console.log(chalk.blue.bold("🔍 Debug Contract"));

  try {
    // Konfigurasi
    const network = "base"; // Sesuai dengan contract yang gagal
    const contractAddress = "0xfB6f1194A40c15689E6aC18096711645C302819b"; // Contract baru yang baru di-deploy

    // Initialize bot
    const bot = new NFTBot(network);
    await bot.initialize();
    await bot.loadContract(contractAddress);

    console.log(chalk.yellow("\n📊 Status Contract:"));

    // Cek status contract
    const status = await bot.getContractStatus();
    console.log(`   Name: ${status.name}`);
    console.log(`   Symbol: ${status.symbol}`);
    console.log(`   Total Supply: ${status.totalSupply}/${status.maxSupply}`);
    console.log(`   Mint Price: ${status.mintPrice} ETH`);
    console.log(`   Minting Enabled: ${status.mintingEnabled}`);
    console.log(`   Owner: ${status.owner}`);
    console.log(`   Contract Address: ${status.contractAddress}`);

    // Cek balance wallet
    const balance = await bot.provider.getBalance(bot.signer.address);
    console.log(`\n💰 Wallet Balance: ${bot.ethers.formatEther(balance)} ETH`);

    // Cek mint price dalam wei
    const mintPriceWei = await bot.contract.mintPrice();
    console.log(`💰 Mint Price (Wei): ${mintPriceWei.toString()}`);
    console.log(`💰 Mint Price (ETH): ${bot.ethers.formatEther(mintPriceWei)}`);

    // Cek apakah wallet punya cukup balance
    const mintPriceEth = parseFloat(bot.ethers.formatEther(mintPriceWei));
    const balanceEth = parseFloat(bot.ethers.formatEther(balance));
    console.log(`\n🔍 Balance Check:`);
    console.log(`   Required: ${mintPriceEth} ETH`);
    console.log(`   Available: ${balanceEth} ETH`);
    console.log(`   Sufficient: ${balanceEth >= mintPriceEth ? "✅" : "❌"}`);

    // Cek max mint per address
    const recipient = "0xFbf0bDcc656146d422d4977f064b72B2D9EA5bCD";
    const mintedByAddress = await bot.contract.mintedByAddress(recipient);
    const maxMintPerAddress = await bot.contract.maxMintPerAddress();
    console.log(`\n🎯 Mint Limit Check for ${recipient}:`);
    console.log(`   Already Minted: ${mintedByAddress.toString()}`);
    console.log(`   Max Allowed: ${maxMintPerAddress.toString()}`);
    console.log(
      `   Can Mint: ${mintedByAddress < maxMintPerAddress ? "✅" : "❌"}`
    );

    // Cek supply
    const currentTokenId = await bot.contract.getCurrentTokenId();
    const maxSupply = await bot.contract.maxSupply();
    console.log(`\n📦 Supply Check:`);
    console.log(`   Current Token ID: ${currentTokenId.toString()}`);
    console.log(`   Max Supply: ${maxSupply.toString()}`);
    console.log(
      `   Supply Available: ${currentTokenId <= maxSupply ? "✅" : "❌"}`
    );

    // Test estimasi gas
    console.log(chalk.yellow("\n⛽ Testing Gas Estimation:"));
    try {
      const metadata = JSON.stringify({
        name: "Test NFT",
        description: "Test description",
        image: "https://example.com/test.png",
      });

      const gasEstimate = await bot.contract.mint.estimateGas(
        recipient,
        metadata,
        { value: mintPriceWei }
      );
      console.log(`   Gas Estimate: ${gasEstimate.toString()}`);
    } catch (gasError) {
      console.log(`   Gas Estimation Failed: ${gasError.message}`);

      // Coba dengan call static untuk mendapatkan error yang lebih detail
      try {
        await bot.contract.mint.staticCall(recipient, metadata, {
          value: mintPriceWei,
        });
      } catch (staticError) {
        console.log(`   Static Call Error: ${staticError.message}`);
      }
    }
  } catch (error) {
    console.error(chalk.red("❌ Debug Error:", error.message));
  }
}

if (require.main === module) {
  debugContract();
}

module.exports = debugContract;
