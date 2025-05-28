const { ethers } = require("ethers");
const chalk = require("chalk");
require("dotenv").config();

async function clearPendingTransactions(network = "base") {
  console.log(chalk.blue(`🧹 Clearing pending transactions on ${network}...`));

  try {
    // Network configurations
    const networkConfigs = {
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
      optimism: {
        url: "https://mainnet.optimism.io",
        chainId: 10,
        name: "Optimism Mainnet",
      },
    };

    const config = networkConfigs[network];
    if (!config) {
      throw new Error(`Network ${network} tidak didukung`);
    }

    // Setup provider dan signer
    const provider = new ethers.JsonRpcProvider(config.url);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(chalk.white(`📍 Network: ${config.name}`));
    console.log(chalk.white(`👤 Address: ${signer.address}`));

    // Get current nonce
    const currentNonce = await provider.getTransactionCount(
      signer.address,
      "latest"
    );
    const pendingNonce = await provider.getTransactionCount(
      signer.address,
      "pending"
    );

    console.log(chalk.white(`🔢 Current nonce: ${currentNonce}`));
    console.log(chalk.white(`⏳ Pending nonce: ${pendingNonce}`));

    if (currentNonce === pendingNonce) {
      console.log(chalk.green("✅ No pending transactions found!"));
      return;
    }

    console.log(
      chalk.yellow(
        `⚠️ Found ${pendingNonce - currentNonce} pending transaction(s)`
      )
    );

    // Get current gas price
    const feeData = await provider.getFeeData();
    let gasPrice;

    if (feeData.gasPrice) {
      // Use much higher gas price to replace pending transactions
      gasPrice = (feeData.gasPrice * 200n) / 100n; // 100% higher
    } else {
      gasPrice = ethers.parseUnits("5", "gwei"); // High fallback
    }

    console.log(
      chalk.yellow(
        `⛽ Using high gas price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`
      )
    );

    // Send replacement transaction with higher gas price
    console.log(chalk.blue("🚀 Sending replacement transaction..."));

    const replacementTx = {
      to: signer.address, // Send to self
      value: 0, // No value transfer
      gasLimit: 21000, // Standard transfer gas limit
      gasPrice: gasPrice,
      nonce: currentNonce, // Use the stuck nonce
    };

    const tx = await signer.sendTransaction(replacementTx);
    console.log(chalk.blue(`📝 Replacement TX hash: ${tx.hash}`));

    console.log(chalk.blue("⏳ Waiting for confirmation..."));
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log(chalk.green("✅ Replacement transaction confirmed!"));
      console.log(chalk.green("🎉 Pending transactions cleared!"));

      // Verify nonce is now clear
      const newCurrentNonce = await provider.getTransactionCount(
        signer.address,
        "latest"
      );
      const newPendingNonce = await provider.getTransactionCount(
        signer.address,
        "pending"
      );

      console.log(chalk.white(`🔢 New current nonce: ${newCurrentNonce}`));
      console.log(chalk.white(`⏳ New pending nonce: ${newPendingNonce}`));
    } else {
      console.log(chalk.red("❌ Replacement transaction failed"));
    }
  } catch (error) {
    console.error(
      chalk.red("❌ Error clearing pending transactions:"),
      error.message
    );

    if (error.message.includes("replacement fee too low")) {
      console.log(
        chalk.yellow(
          "💡 Try increasing gas price further or wait for pending tx to confirm"
        )
      );
    }
  }
}

// Helper function untuk cek status transaksi
async function checkTransactionStatus(network = "base") {
  console.log(chalk.blue(`🔍 Checking transaction status on ${network}...`));

  const networkConfigs = {
    base: "https://mainnet.base.org",
    baseSepolia: "https://sepolia.base.org",
    optimism: "https://mainnet.optimism.io",
  };

  const provider = new ethers.JsonRpcProvider(networkConfigs[network]);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const currentNonce = await provider.getTransactionCount(
    signer.address,
    "latest"
  );
  const pendingNonce = await provider.getTransactionCount(
    signer.address,
    "pending"
  );
  const balance = await provider.getBalance(signer.address);

  console.log(chalk.white(`👤 Address: ${signer.address}`));
  console.log(chalk.white(`💰 Balance: ${ethers.formatEther(balance)} ETH`));
  console.log(chalk.white(`🔢 Current nonce: ${currentNonce}`));
  console.log(chalk.white(`⏳ Pending nonce: ${pendingNonce}`));
  console.log(
    chalk.white(`📊 Pending transactions: ${pendingNonce - currentNonce}`)
  );

  if (currentNonce === pendingNonce) {
    console.log(chalk.green("✅ No pending transactions"));
  } else {
    console.log(
      chalk.yellow(
        `⚠️ ${pendingNonce - currentNonce} pending transaction(s) found`
      )
    );
  }
}

// Run script jika dijalankan langsung
if (require.main === module) {
  const args = process.argv.slice(2);
  const action = args[0] || "clear";
  const network = args[1] || "base";

  if (action === "check") {
    checkTransactionStatus(network)
      .then(() => {
        console.log(chalk.green("✨ Status check completed!"));
        process.exit(0);
      })
      .catch((error) => {
        console.error(chalk.red("💥 Status check failed:"), error);
        process.exit(1);
      });
  } else {
    clearPendingTransactions(network)
      .then(() => {
        console.log(chalk.green("✨ Clearing completed!"));
        process.exit(0);
      })
      .catch((error) => {
        console.error(chalk.red("💥 Clearing failed:"), error);
        process.exit(1);
      });
  }
}

module.exports = { clearPendingTransactions, checkTransactionStatus };
