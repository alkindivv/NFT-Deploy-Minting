const { ethers } = require("hardhat");
const fs = require("fs-extra");
const path = require("path");

async function main() {
  console.log("🚀 Memulai deployment NFT Collection...");

  // Ambil konfigurasi dari environment variables
  const nftName = process.env.NFT_NAME || "My Awesome NFT Collection";
  const nftSymbol = process.env.NFT_SYMBOL || "MANC";
  const mintPrice = ethers.parseEther(process.env.MINT_PRICE || "0.00000001");
  const maxSupply = process.env.MAX_SUPPLY || "1000000";
  const baseURI = process.env.NFT_BASE_URI || "https://google.com";

  console.log("📋 Konfigurasi deployment:");
  console.log(`   Nama: ${nftName}`);
  console.log(`   Symbol: ${nftSymbol}`);
  console.log(`   Mint Price: ${ethers.formatEther(mintPrice)} ETH`);
  console.log(`   Max Supply: ${maxSupply}`);
  console.log(`   Base URI: ${baseURI}`);

  // Deploy contract
  const NFTCollection = await ethers.getContractFactory("NFTCollection");
  const nftCollection = await NFTCollection.deploy(
    nftName,
    nftSymbol,
    mintPrice,
    maxSupply,
    baseURI
  );

  await nftCollection.waitForDeployment();
  const contractAddress = await nftCollection.getAddress();

  console.log(`✅ NFT Collection deployed to: ${contractAddress}`);

  // Simpan informasi deployment
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    deployer: (await ethers.getSigners())[0].address,
    deploymentTime: new Date().toISOString(),
    contractConfig: {
      name: nftName,
      symbol: nftSymbol,
      mintPrice: ethers.formatEther(mintPrice),
      maxSupply: maxSupply,
      baseURI: baseURI,
    },
    transactionHash: nftCollection.deploymentTransaction().hash,
  };

  // Buat direktori deployments jika belum ada
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  await fs.ensureDir(deploymentsDir);

  // Simpan ke file
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  await fs.writeJson(deploymentFile, deploymentInfo, { spaces: 2 });

  console.log(`📄 Informasi deployment disimpan ke: ${deploymentFile}`);

  // Tunggu beberapa block confirmations sebelum verifikasi
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Menunggu block confirmations...");
    await nftCollection.deploymentTransaction().wait(5);

    // Verifikasi contract jika bukan local network
    try {
      console.log("🔍 Memverifikasi contract...");
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [
          nftName,
          nftSymbol,
          mintPrice,
          maxSupply,
          baseURI,
        ],
      });
      console.log("✅ Contract berhasil diverifikasi!");
    } catch (error) {
      console.log("❌ Verifikasi gagal:", error.message);
    }
  }

  console.log("\n🎉 Deployment selesai!");
  console.log(`📝 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${hre.network.name}`);
  console.log(`💰 Mint Price: ${ethers.formatEther(mintPrice)} ETH`);

  return {
    contractAddress,
    network: hre.network.name,
    mintPrice: ethers.formatEther(mintPrice),
  };
}

// Jalankan script jika dipanggil langsung
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment gagal:", error);
      process.exit(1);
    });
}

module.exports = main;
