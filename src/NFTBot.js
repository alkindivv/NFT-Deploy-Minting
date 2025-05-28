const { ethers } = require("ethers");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const cliProgress = require("cli-progress");
require("dotenv").config();

class NFTBot {
  constructor(network = "baseSepolia") {
    this.network = network;
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = null;
  }

  async initialize() {
    console.log(chalk.blue(`🔗 Menghubungkan ke ${this.network}...`));

    // Setup provider berdasarkan network
    const networkConfig = this.getNetworkConfig(this.network);
    this.provider = new ethers.JsonRpcProvider(networkConfig.url);

    // Setup signer
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY tidak ditemukan di environment variables");
    }

    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

    // Cek balance
    const balance = await this.provider.getBalance(this.signer.address);
    console.log(chalk.green(`✅ Terhubung! Address: ${this.signer.address}`));
    console.log(chalk.white(`💰 Balance: ${ethers.formatEther(balance)} ETH`));

    if (balance === 0n) {
      console.log(
        chalk.yellow(
          "⚠️  Warning: Balance 0 ETH. Pastikan wallet memiliki ETH untuk gas fees."
        )
      );
    }
  }

  getNetworkConfig(network) {
    const configs = {
      base: {
        url: "https://mainnet.base.org",
        chainId: 8453,
        name: "Base Mainnet",
      },
      baseSepolia: {
        url: "https://sepolia.base.org",
        chainId: 84532,
        name: "Base Sepolia Testnet",
      },
      ethereum: {
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
        chainId: 1,
        name: "Ethereum Mainnet",
      },
      polygon: {
        url: "https://polygon-rpc.com",
        chainId: 137,
        name: "Polygon Mainnet",
      },
      arbitrum: {
        url: "https://arb1.arbitrum.io/rpc",
        chainId: 42161,
        name: "Arbitrum One",
      },
      optimism: {
        url: "https://mainnet.optimism.io",
        chainId: 10,
        name: "Optimism Mainnet",
      },
      soneium: {
        url: "https://rpc.soneium.org",
        chainId: 1946,
        name: "Soneium Mainnet",
      },
      lisk: {
        url: "https://rpc.api.lisk.com",
        chainId: 1135,
        name: "Lisk Mainnet",
      },
      unichain: {
        url: "https://unichain-rpc.publicnode.com",
        chainId: 130,
        name: "Unichain Mainnet",
      },
      ink: {
        url: "https://rpc-gel.inkonchain.com",
        chainId: 57073,
        name: "Ink Mainnet",
      },
      mode: {
        url: "https://mainnet.mode.network",
        chainId: 34443,
        name: "Mode Mainnet",
      },
    };

    if (!configs[network]) {
      throw new Error(`Network ${network} tidak didukung`);
    }

    return configs[network];
  }

  async deployContract(name, symbol, mintPrice, maxSupply, baseURI) {
    console.log(chalk.blue("📋 Mempersiapkan deployment..."));

    // Load contract artifact
    const contractPath = path.join(
      __dirname,
      "..",
      "artifacts",
      "contracts",
      "NFTCollection.sol",
      "NFTCollection.json"
    );

    if (!(await fs.pathExists(contractPath))) {
      throw new Error(
        "Contract artifact tidak ditemukan. Jalankan 'npm run compile' terlebih dahulu."
      );
    }

    const contractArtifact = await fs.readJson(contractPath);
    const contractFactory = new ethers.ContractFactory(
      contractArtifact.abi,
      contractArtifact.bytecode,
      this.signer
    );

    // Get current nonce to avoid replacement issues
    const currentNonce = await this.provider.getTransactionCount(
      this.signer.address,
      "pending"
    );
    console.log(chalk.yellow(`🔢 Using nonce: ${currentNonce}`));

    // Get current gas price and increase it significantly to avoid replacement underpriced error
    const feeData = await this.provider.getFeeData();
    let gasPrice;

    if (feeData.gasPrice) {
      // Increase gas price by 50% to avoid replacement issues
      gasPrice = (feeData.gasPrice * 150n) / 100n;
    } else {
      // Fallback gas price for networks without EIP-1559
      gasPrice = ethers.parseUnits("2", "gwei");
    }

    console.log(
      chalk.yellow(
        `⛽ Using gas price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`
      )
    );

    // Deploy contract
    const mintPriceWei = ethers.parseEther(mintPrice.toString());

    const deployOptions = {
      gasLimit: 3500000, // Increase gas limit
      gasPrice: gasPrice,
      nonce: currentNonce,
    };

    console.log(chalk.blue("🚀 Deploying contract..."));

    const contract = await contractFactory.deploy(
      name,
      symbol,
      mintPriceWei,
      maxSupply,
      baseURI,
      deployOptions
    );

    console.log(chalk.blue("⏳ Menunggu deployment..."));
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();

    // Simpan informasi deployment
    const deploymentInfo = {
      contractAddress: contractAddress,
      network: this.network,
      deployer: this.signer.address,
      deploymentTime: new Date().toISOString(),
      contractConfig: {
        name: name,
        symbol: symbol,
        mintPrice: mintPrice.toString(),
        maxSupply: maxSupply.toString(),
        baseURI: baseURI,
      },
      transactionHash: deploymentTx.hash,
      gasUsed: (await deploymentTx.wait()).gasUsed.toString(),
      gasPrice: ethers.formatUnits(gasPrice, "gwei"),
      nonce: currentNonce,
    };

    // Buat direktori deployments jika belum ada
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    await fs.ensureDir(deploymentsDir);

    // Simpan ke file
    const deploymentFile = path.join(deploymentsDir, `${this.network}.json`);
    await fs.writeJson(deploymentFile, deploymentInfo, { spaces: 2 });

    this.contract = contract;
    this.contractAddress = contractAddress;

    return {
      contractAddress: contractAddress,
      network: this.network,
      mintPrice: mintPrice.toString(),
      transactionHash: deploymentTx.hash,
    };
  }

  async loadContract(contractAddress) {
    console.log(chalk.blue(`📄 Loading contract ${contractAddress}...`));

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

    this.contract = new ethers.Contract(
      contractAddress,
      contractArtifact.abi,
      this.signer
    );

    this.contractAddress = contractAddress;

    // Verifikasi contract
    try {
      const name = await this.contract.name();
      console.log(chalk.green(`✅ Contract loaded: ${name}`));
    } catch (error) {
      throw new Error(
        `Contract tidak valid atau tidak ditemukan: ${error.message}`
      );
    }
  }

  async mintNFT(recipient, metadata) {
    if (!this.contract) {
      throw new Error(
        "Contract belum di-load. Panggil loadContract() terlebih dahulu."
      );
    }

    console.log(chalk.blue("🎨 Mempersiapkan mint..."));

    try {
      // Cek mint price
      const mintPrice = await this.contract.mintPrice();
      const currentTokenId = await this.contract.getCurrentTokenId();

      console.log(
        chalk.white(`💰 Mint Price: ${ethers.formatEther(mintPrice)} ETH`)
      );
      console.log(
        chalk.white(`🎯 Token ID yang akan di-mint: ${currentTokenId}`)
      );

      // Validasi sebelum mint
      console.log(chalk.blue("🔍 Melakukan validasi..."));

      // Cek balance
      const balance = await this.provider.getBalance(this.signer.address);
      if (balance < mintPrice) {
        throw new Error(
          `Balance tidak cukup. Diperlukan: ${ethers.formatEther(
            mintPrice
          )} ETH, Tersedia: ${ethers.formatEther(balance)} ETH`
        );
      }

      // Cek minting enabled
      const mintingEnabled = await this.contract.mintingEnabled();
      if (!mintingEnabled) {
        throw new Error("Minting sedang dinonaktifkan oleh owner");
      }

      // Cek max supply
      const maxSupply = await this.contract.maxSupply();
      if (currentTokenId > maxSupply) {
        throw new Error("Max supply sudah tercapai");
      }

      console.log(chalk.green("✅ Semua validasi berhasil"));

      // Estimasi gas
      const gasEstimate = await this.contract.mint.estimateGas(
        recipient,
        metadata,
        {
          value: mintPrice,
        }
      );
      console.log(chalk.white(`⛽ Gas estimate: ${gasEstimate.toString()}`));

      // Get current nonce to avoid replacement issues
      const currentNonce = await this.provider.getTransactionCount(
        this.signer.address,
        "pending"
      );
      console.log(chalk.yellow(`🔢 Using nonce: ${currentNonce}`));

      // Get current gas price and increase it significantly to avoid replacement underpriced error
      const feeData = await this.provider.getFeeData();
      let gasPrice;

      if (feeData.gasPrice) {
        // Increase gas price by 50% to avoid replacement issues
        gasPrice = (feeData.gasPrice * 150n) / 100n;
      } else {
        // Fallback gas price for networks without EIP-1559
        gasPrice = ethers.parseUnits("2", "gwei");
      }

      console.log(
        chalk.yellow(
          `⛽ Using gas price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`
        )
      );

      // Mint NFT dengan gas limit yang lebih tinggi dan gas price yang disesuaikan
      const txOptions = {
        value: mintPrice,
        gasLimit: Math.floor(Number(gasEstimate) * 1.3), // 30% buffer
        gasPrice: gasPrice,
        nonce: currentNonce,
      };

      const tx = await this.contract.mint(recipient, metadata, txOptions);

      console.log(chalk.blue("⏳ Menunggu konfirmasi transaksi..."));
      const receipt = await tx.wait();

      // Ambil token ID dari event
      const mintEvent = receipt.logs.find((log) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === "NFTMinted";
        } catch {
          return false;
        }
      });

      let tokenId = currentTokenId;
      if (mintEvent) {
        const parsed = this.contract.interface.parseLog(mintEvent);
        tokenId = parsed.args.tokenId;
      }

      return {
        tokenId: tokenId.toString(),
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        recipient: recipient,
      };
    } catch (error) {
      console.error(chalk.red("❌ Error detail:", error));
      throw error;
    }
  }

  async batchMintNFT(
    recipient,
    count,
    baseName,
    baseDescription,
    baseImageUrl,
    delay = 5000
  ) {
    if (!this.contract) {
      throw new Error(
        "Contract belum di-load. Panggil loadContract() terlebih dahulu."
      );
    }

    const results = [];
    const progressBar = new cliProgress.SingleBar({
      format:
        "Minting Progress |{bar}| {percentage}% | {value}/{total} NFTs | ETA: {eta}s",
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    });

    progressBar.start(count, 0);

    for (let i = 0; i < count; i++) {
      try {
        // Generate metadata untuk setiap NFT
        const metadata = JSON.stringify({
          name: `${baseName} #${i + 1}`,
          description: `${baseDescription} - Edition ${i + 1}`,
          image: `${baseImageUrl}${i + 1}.png`,
          attributes: [
            {
              trait_type: "Edition",
              value: i + 1,
            },
            {
              trait_type: "Rarity",
              value: this.generateRarity(),
            },
            {
              trait_type: "Mint Date",
              value: new Date().toISOString().split("T")[0],
            },
          ],
        });

        const result = await this.mintNFT(recipient, metadata);
        results.push(result);

        progressBar.update(i + 1);

        // Delay sebelum mint berikutnya (kecuali yang terakhir)
        if (i < count - 1 && delay > 0) {
          await this.sleep(delay);
        }
      } catch (error) {
        progressBar.stop();
        console.error(
          chalk.red(`❌ Error minting NFT #${i + 1}:`, error.message)
        );
        throw error;
      }
    }

    progressBar.stop();
    return results;
  }

  generateRarity() {
    const rand = Math.random();
    if (rand < 0.01) return "Legendary";
    if (rand < 0.05) return "Epic";
    if (rand < 0.15) return "Rare";
    if (rand < 0.35) return "Uncommon";
    return "Common";
  }

  async getContractStatus() {
    if (!this.contract) {
      throw new Error(
        "Contract belum di-load. Panggil loadContract() terlebih dahulu."
      );
    }

    const [
      name,
      symbol,
      totalSupply,
      maxSupply,
      mintPrice,
      mintingEnabled,
      owner,
    ] = await Promise.all([
      this.contract.name(),
      this.contract.symbol(),
      this.contract.totalSupply(),
      this.contract.maxSupply(),
      this.contract.mintPrice(),
      this.contract.mintingEnabled(),
      this.contract.owner(),
    ]);

    return {
      name,
      symbol,
      totalSupply: totalSupply.toString(),
      maxSupply: maxSupply.toString(),
      mintPrice: ethers.formatEther(mintPrice),
      mintingEnabled,
      owner,
      contractAddress: this.contractAddress,
    };
  }

  async estimateGasCost(recipient, metadata) {
    if (!this.contract) {
      throw new Error(
        "Contract belum di-load. Panggil loadContract() terlebih dahulu."
      );
    }

    const mintPrice = await this.contract.mintPrice();
    const gasEstimate = await this.contract.mint.estimateGas(
      recipient,
      metadata,
      {
        value: mintPrice,
      }
    );

    const gasPrice = await this.provider.getFeeData();
    const gasCost = gasEstimate * gasPrice.gasPrice;

    return {
      gasEstimate: gasEstimate.toString(),
      gasPrice: ethers.formatUnits(gasPrice.gasPrice, "gwei"),
      gasCost: ethers.formatEther(gasCost),
      totalCost: ethers.formatEther(gasCost + mintPrice),
    };
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = NFTBot;
