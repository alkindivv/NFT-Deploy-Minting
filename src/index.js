const { ethers } = require("ethers");
const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

const NFTBot = require("./NFTBot");
const MetadataGenerator = require("./MetadataGenerator");

class NFTBotCLI {
  constructor() {
    this.bot = null;
    this.metadataGenerator = new MetadataGenerator();
  }

  async start() {
    console.log(chalk.blue.bold("\n🤖 NFT Deploy & Mint Bot"));
    console.log(chalk.gray("Bot untuk deploy dan mint NFT secara otomatis\n"));

    try {
      await this.showMainMenu();
    } catch (error) {
      console.error(chalk.red("❌ Error:", error.message));
      process.exit(1);
    }
  }

  async showMainMenu() {
    const choices = [
      { name: "🚀 Deploy NFT Contract", value: "deploy" },
      { name: "🎨 Mint NFT", value: "mint" },
      { name: "📦 Batch Mint NFT", value: "batchMint" },
      { name: "📊 Lihat Status Contract", value: "status" },
      { name: "⚙️  Konfigurasi", value: "config" },
      { name: "🚪 Keluar", value: "exit" },
    ];

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Pilih aksi yang ingin dilakukan:",
        choices,
      },
    ]);

    switch (action) {
      case "deploy":
        await this.deployContract();
        break;
      case "mint":
        await this.mintNFT();
        break;
      case "batchMint":
        await this.batchMintNFT();
        break;
      case "status":
        await this.showContractStatus();
        break;
      case "config":
        await this.showConfiguration();
        break;
      case "exit":
        console.log(chalk.green("👋 Sampai jumpa!"));
        process.exit(0);
        break;
    }

    // Kembali ke menu utama
    await this.showMainMenu();
  }

  async deployContract() {
    console.log(chalk.yellow("\n🚀 Deploy NFT Contract"));

    const networks = [
      // { name: "Base Sepolia (Testnet)", value: "baseSepolia" },
      { name: "Base Mainnet", value: "base" },
      // { name: "Ethereum Mainnet", value: "ethereum" },
      // { name: "Polygon", value: "polygon" },
      // { name: "Arbitrum", value: "arbitrum" },
      { name: "Optimism", value: "optimism" },
      { name: "Soneium", value: "soneium" },
      { name: "Lisk", value: "lisk" },
      { name: "Unichain", value: "unichain" },
      { name: "Ink", value: "ink" },
      { name: "Mode", value: "mode" },
    ];

    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "network",
        message: "Pilih network:",
        choices: networks,
      },
      {
        type: "input",
        name: "name",
        message: "Nama NFT Collection:",
        default: process.env.NFT_NAME || "My Awesome NFT Collection",
      },
      {
        type: "input",
        name: "symbol",
        message: "Symbol NFT:",
        default: process.env.NFT_SYMBOL || "MANC",
      },
      {
        type: "input",
        name: "mintPrice",
        message: "Harga mint (dalam ETH):",
        default: process.env.MINT_PRICE || "0.0000001",
        validate: (input) => {
          const num = parseFloat(input);
          return !isNaN(num) && num >= 0 ? true : "Masukkan angka yang valid";
        },
      },
      {
        type: "input",
        name: "maxSupply",
        message: "Max supply:",
        default: process.env.MAX_SUPPLY || "1000000",
        validate: (input) => {
          const num = parseInt(input);
          return !isNaN(num) && num > 0 ? true : "Masukkan angka yang valid";
        },
      },
      {
        type: "input",
        name: "baseURI",
        message: "Base URI untuk metadata:",
        default: process.env.NFT_BASE_URI || "https://google.com",
      },
    ]);

    try {
      this.bot = new NFTBot(answers.network);
      await this.bot.initialize();

      console.log(chalk.blue("\n⏳ Deploying contract..."));
      const result = await this.bot.deployContract(
        answers.name,
        answers.symbol,
        answers.mintPrice,
        answers.maxSupply,
        answers.baseURI
      );

      console.log(chalk.green("\n✅ Contract berhasil di-deploy!"));
      console.log(chalk.white(`📝 Address: ${result.contractAddress}`));
      console.log(chalk.white(`🌐 Network: ${result.network}`));
      console.log(chalk.white(`💰 Mint Price: ${result.mintPrice} ETH`));
    } catch (error) {
      console.error(chalk.red("❌ Deploy gagal:", error.message));
    }
  }

  async mintNFT() {
    console.log(chalk.yellow("\n🎨 Mint NFT"));

    try {
      const deployments = await this.getAvailableDeployments();
      if (deployments.length === 0) {
        console.log(
          chalk.red(
            "❌ Tidak ada contract yang ter-deploy. Deploy contract terlebih dahulu."
          )
        );
        return;
      }

      const { deployment } = await inquirer.prompt([
        {
          type: "list",
          name: "deployment",
          message: "Pilih contract:",
          choices: deployments.map((d) => ({
            name: `${d.config.name} (${d.network}) - ${d.address}`,
            value: d,
          })),
        },
      ]);

      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "recipient",
          message: "Address penerima NFT:",
          default: deployment.deployer,
          validate: (input) => {
            return ethers.isAddress(input) ? true : "Address tidak valid";
          },
        },
        {
          type: "input",
          name: "name",
          message: "Nama NFT:",
          default: "My Awesome NFT #1",
        },
        {
          type: "input",
          name: "description",
          message: "Deskripsi NFT:",
          default: "A unique NFT from my collection",
        },
        {
          type: "input",
          name: "imageUrl",
          message: "URL gambar NFT:",
          default: "https://example.com/image.png",
        },
      ]);

      this.bot = new NFTBot(deployment.network);
      await this.bot.initialize();
      await this.bot.loadContract(deployment.address);

      // Generate metadata
      const metadata = this.metadataGenerator.generateMetadata(
        answers.name,
        answers.description,
        answers.imageUrl
      );

      console.log(chalk.blue("\n⏳ Minting NFT..."));
      const result = await this.bot.mintNFT(answers.recipient, metadata);

      console.log(chalk.green("\n✅ NFT berhasil di-mint!"));
      console.log(chalk.white(`🎨 Token ID: ${result.tokenId}`));
      console.log(chalk.white(`📝 Transaction: ${result.transactionHash}`));
    } catch (error) {
      console.error(chalk.red("❌ Mint gagal:", error.message));
    }
  }

  async batchMintNFT() {
    console.log(chalk.yellow("\n📦 Batch Mint NFT"));

    try {
      const deployments = await this.getAvailableDeployments();
      if (deployments.length === 0) {
        console.log(
          chalk.red(
            "❌ Tidak ada contract yang ter-deploy. Deploy contract terlebih dahulu."
          )
        );
        return;
      }

      const { deployment } = await inquirer.prompt([
        {
          type: "list",
          name: "deployment",
          message: "Pilih contract:",
          choices: deployments.map((d) => ({
            name: `${d.config.name} (${d.network}) - ${d.address}`,
            value: d,
          })),
        },
      ]);

      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "count",
          message: "Jumlah NFT yang akan di-mint:",
          default: "5",
          validate: (input) => {
            const num = parseInt(input);
            return !isNaN(num) && num > 0 && num <= 50
              ? true
              : "Masukkan angka 1-50";
          },
        },
        {
          type: "input",
          name: "recipient",
          message: "Address penerima NFT:",
          default: deployment.deployer,
          validate: (input) => {
            return ethers.isAddress(input) ? true : "Address tidak valid";
          },
        },
        {
          type: "input",
          name: "baseName",
          message: "Base nama NFT:",
          default: "My Awesome NFT",
        },
        {
          type: "input",
          name: "baseDescription",
          message: "Base deskripsi NFT:",
          default: "A unique NFT from my collection",
        },
        {
          type: "input",
          name: "baseImageUrl",
          message: "Base URL gambar NFT:",
          default: "https://example.com/image",
        },
        {
          type: "input",
          name: "delay",
          message: "Delay antar mint (ms):",
          default: process.env.MINT_DELAY_MS || "5000",
          validate: (input) => {
            const num = parseInt(input);
            return !isNaN(num) && num >= 0 ? true : "Masukkan angka yang valid";
          },
        },
      ]);

      this.bot = new NFTBot(deployment.network);
      await this.bot.initialize();
      await this.bot.loadContract(deployment.address);

      const count = parseInt(answers.count);
      const delay = parseInt(answers.delay);

      console.log(chalk.blue(`\n⏳ Memulai batch mint ${count} NFT...`));

      const results = await this.bot.batchMintNFT(
        answers.recipient,
        count,
        answers.baseName,
        answers.baseDescription,
        answers.baseImageUrl,
        delay
      );

      console.log(chalk.green(`\n✅ Berhasil mint ${results.length} NFT!`));
      results.forEach((result, index) => {
        console.log(
          chalk.white(
            `   ${index + 1}. Token ID: ${result.tokenId} - TX: ${result.transactionHash}`
          )
        );
      });
    } catch (error) {
      console.error(chalk.red("❌ Batch mint gagal:", error.message));
    }
  }

  async showContractStatus() {
    console.log(chalk.yellow("\n📊 Status Contract"));

    try {
      const deployments = await this.getAvailableDeployments();
      if (deployments.length === 0) {
        console.log(chalk.red("❌ Tidak ada contract yang ter-deploy."));
        return;
      }

      for (const deployment of deployments) {
        this.bot = new NFTBot(deployment.network);
        await this.bot.initialize();
        await this.bot.loadContract(deployment.address);

        const status = await this.bot.getContractStatus();

        console.log(
          chalk.blue(`\n📋 ${deployment.config.name} (${deployment.network})`)
        );
        console.log(chalk.white(`   Address: ${deployment.address}`));
        console.log(
          chalk.white(
            `   Total Supply: ${status.totalSupply}/${status.maxSupply}`
          )
        );
        console.log(chalk.white(`   Mint Price: ${status.mintPrice} ETH`));
        console.log(
          chalk.white(
            `   Minting Enabled: ${status.mintingEnabled ? "✅" : "❌"}`
          )
        );
        console.log(chalk.white(`   Owner: ${status.owner}`));
      }
    } catch (error) {
      console.error(chalk.red("❌ Error mengambil status:", error.message));
    }
  }

  async showConfiguration() {
    console.log(chalk.yellow("\n⚙️  Konfigurasi"));
    console.log(chalk.white("Environment Variables:"));
    console.log(
      chalk.gray(
        `   PRIVATE_KEY: ${process.env.PRIVATE_KEY ? "✅ Set" : "❌ Not set"}`
      )
    );
    console.log(
      chalk.gray(
        `   DEFAULT_NETWORK: ${process.env.DEFAULT_NETWORK || "Not set"}`
      )
    );
    console.log(
      chalk.gray(`   NFT_NAME: ${process.env.NFT_NAME || "Not set"}`)
    );
    console.log(
      chalk.gray(`   NFT_SYMBOL: ${process.env.NFT_SYMBOL || "Not set"}`)
    );
    console.log(
      chalk.gray(`   MINT_PRICE: ${process.env.MINT_PRICE || "Not set"}`)
    );
    console.log(
      chalk.gray(`   MAX_SUPPLY: ${process.env.MAX_SUPPLY || "Not set"}`)
    );
    console.log(
      chalk.gray(`   MINT_DELAY_MS: ${process.env.MINT_DELAY_MS || "Not set"}`)
    );
  }

  async getAvailableDeployments() {
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    const deployments = [];

    try {
      const files = await fs.readdir(deploymentsDir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const deployment = await fs.readJson(path.join(deploymentsDir, file));
          deployments.push({
            network: deployment.network,
            address: deployment.contractAddress,
            config: deployment.contractConfig,
            deployer: deployment.deployer,
          });
        }
      }
    } catch (error) {
      // Directory tidak ada atau kosong
    }

    return deployments;
  }
}

// Jalankan bot jika dipanggil langsung
if (require.main === module) {
  const cli = new NFTBotCLI();
  cli.start();
}

module.exports = NFTBotCLI;
