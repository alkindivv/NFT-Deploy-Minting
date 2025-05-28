const { ethers } = require("ethers");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
require("dotenv").config();

async function simpleMint() {
  console.log(chalk.blue.bold("🎯 Simple Mint Test"));

  try {
    // Setup provider dan signer
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(chalk.green(`✅ Connected! Address: ${signer.address}`));

    // Load contract ABI
    const contractPath = path.join(
      __dirname,
      "..",
      "artifacts",
      "contracts",
      "NFTCollection.sol",
      "NFTCollection.json"
    );
    const contractArtifact = await fs.readJson(contractPath);

    // Contract address yang berhasil sebelumnya
    const contractAddress = "0x9cE9C392E8144ecEA7a26B8661641602ced4Cd85";

    // Create contract instance
    const contract = new ethers.Contract(
      contractAddress,
      contractArtifact.abi,
      signer
    );

    console.log(chalk.blue("\n🔍 Basic contract info:"));
    const name = await contract.name();
    const mintPrice = await contract.mintPrice();
    const currentTokenId = await contract.getCurrentTokenId();

    console.log(`   Name: ${name}`);
    console.log(`   Mint Price: ${ethers.formatEther(mintPrice)} ETH`);
    console.log(`   Next Token ID: ${currentTokenId}`);

    // Check balance
    const balance = await provider.getBalance(signer.address);
    console.log(`   Wallet Balance: ${ethers.formatEther(balance)} ETH`);

    // Simple metadata
    const metadata = JSON.stringify({
      name: "Test NFT Direct",
      description: "Direct mint test",
      image: "https://example.com/test.png",
    });

    const recipient = signer.address;

    console.log(chalk.blue("\n🎨 Attempting direct mint..."));

    // Langsung mint tanpa validasi berlebihan
    const tx = await contract.mint(recipient, metadata, {
      value: mintPrice,
      gasLimit: 1000000, // Gas limit tetap
    });

    console.log(chalk.blue("⏳ Waiting for confirmation..."));
    const receipt = await tx.wait();

    console.log(chalk.green("\n✅ Mint berhasil!"));
    console.log(`   Token ID: ${currentTokenId}`);
    console.log(`   Transaction Hash: ${receipt.hash}`);
    console.log(`   Gas Used: ${receipt.gasUsed}`);
  } catch (error) {
    console.error(chalk.red("❌ Simple mint failed:", error.message));
    console.error(chalk.red("Error details:", error));
  }
}

if (require.main === module) {
  simpleMint();
}

module.exports = simpleMint;
