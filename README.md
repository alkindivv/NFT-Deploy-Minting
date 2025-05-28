# 🤖 NFT Deploy & Mint Bot

Bot otomatis untuk deploy dan mint NFT di berbagai blockchain, dimulai dengan Base chain dan dapat diperluas ke chain lainnya.

## ✨ Fitur

- 🚀 **Deploy NFT Contract** - Deploy smart contract NFT dengan konfigurasi custom
- 🎨 **Mint NFT** - Mint NFT individual dengan metadata custom
- 📦 **Batch Mint** - Mint multiple NFT sekaligus dengan delay yang dapat dikonfigurasi
- 🌐 **Multi-Chain Support** - Mendukung Base, Ethereum, Polygon, Arbitrum, dan Optimism
- 📊 **Status Monitoring** - Monitor status contract dan supply
- 🎯 **Metadata Generator** - Generate metadata NFT otomatis dengan traits random
- 💰 **Gas Estimation** - Estimasi biaya gas sebelum transaksi
- 🔒 **Security** - Built-in security features dan validasi

## 🌐 Blockchain yang Didukung

- **Base Mainnet** - Chain utama Base
- **Base Sepolia** - Testnet Base (recommended untuk testing)
- **Ethereum Mainnet** - Ethereum layer 1
- **Polygon** - Polygon PoS chain
- **Arbitrum One** - Arbitrum layer 2
- **Optimism** - Optimism layer 2
- **Soneium** - Sony's blockchain network
- **Lisk** - Lisk blockchain network
- **Unichain** - Uniswap's layer 2 solution
- **Ink** - Kraken's blockchain network
- **Mode** - Mode network

## 🛠️ Instalasi

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd nft-deploy-mint-bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp env.example .env
   ```

   Edit file `.env` dan isi dengan konfigurasi Anda:

   ```env
   # Private Key wallet (tanpa 0x prefix)
   PRIVATE_KEY=your_private_key_here

   # API Keys untuk verifikasi contract
   BASESCAN_API_KEY=your_basescan_api_key
   ETHERSCAN_API_KEY=your_etherscan_api_key
   POLYGONSCAN_API_KEY=your_polygonscan_api_key
   ARBISCAN_API_KEY=your_arbiscan_api_key
   OPTIMISM_API_KEY=your_optimism_api_key
   INFURA_API_KEY=your_infura_api_key

   # Konfigurasi NFT default
   NFT_NAME=My Awesome NFT Collection
   NFT_SYMBOL=MANC
   NFT_BASE_URI=https://your-metadata-server.com/metadata/

   # Konfigurasi Minting
   MINT_PRICE=0.001
   MAX_SUPPLY=10000
   MINT_DELAY_MS=5000
   BATCH_SIZE=5

   # Network default
   DEFAULT_NETWORK=baseSepolia
   ```

4. **Compile smart contracts**
   ```bash
   npm run compile
   ```

## 🚀 Penggunaan

### Menjalankan Bot

```bash
npm start
```

Bot akan menampilkan menu interaktif dengan pilihan:

1. **🚀 Deploy NFT Contract** - Deploy contract baru
2. **🎨 Mint NFT** - Mint NFT individual
3. **📦 Batch Mint NFT** - Mint multiple NFT
4. **📊 Lihat Status Contract** - Cek status contract
5. **⚙️ Konfigurasi** - Lihat konfigurasi environment
6. **🚪 Keluar** - Keluar dari bot

### Deploy Contract

1. Pilih "Deploy NFT Contract" dari menu
2. Pilih network (Base Sepolia untuk testing)
3. Isi konfigurasi contract:
   - Nama collection
   - Symbol
   - Harga mint (dalam ETH)
   - Max supply
   - Base URI untuk metadata

### Mint NFT

1. Pilih "Mint NFT" dari menu
2. Pilih contract yang sudah di-deploy
3. Isi informasi NFT:
   - Address penerima
   - Nama NFT
   - Deskripsi
   - URL gambar

### Batch Mint

1. Pilih "Batch Mint NFT" dari menu
2. Pilih contract yang sudah di-deploy
3. Konfigurasi batch mint:
   - Jumlah NFT yang akan di-mint
   - Address penerima
   - Base nama dan deskripsi
   - Delay antar mint (dalam milliseconds)

## 📝 Scripts

```bash
# Jalankan bot
npm start

# Development mode dengan auto-reload
npm run dev

# Compile smart contracts
npm run compile

# Deploy contract langsung (tanpa CLI)
npm run deploy

# Mint NFT langsung (tanpa CLI)
npm run mint
```

## 🏗️ Struktur Project

```
nft-deploy-mint-bot/
├── contracts/
│   └── NFTCollection.sol      # Smart contract NFT
├── scripts/
│   └── deploy.js              # Script deploy contract
├── src/
│   ├── index.js               # CLI utama
│   ├── NFTBot.js              # Core bot logic
│   └── MetadataGenerator.js   # Generator metadata NFT
├── deployments/               # Info contract yang sudah di-deploy
├── artifacts/                 # Compiled contracts
├── hardhat.config.js          # Konfigurasi Hardhat
├── package.json
└── README.md
```

## 🎨 Smart Contract Features

Contract NFT (`NFTCollection.sol`) memiliki fitur:

- **ERC721 Standard** - Compatible dengan semua marketplace
- **Mintable** - Owner dan public mint dengan payment
- **Batch Mint** - Mint multiple NFT dalam satu transaksi
- **URI Storage** - Setiap NFT memiliki metadata URI unik
- **Access Control** - Owner controls untuk konfigurasi
- **Reentrancy Guard** - Proteksi dari reentrancy attacks
- **Supply Limit** - Max supply yang dapat dikonfigurasi
- **Mint Price** - Harga mint yang dapat diubah owner
- **Withdraw** - Owner dapat withdraw funds

## 🔧 Konfigurasi Lanjutan

### Menambah Network Baru

Edit `hardhat.config.js` dan `src/NFTBot.js` untuk menambah network:

```javascript
// hardhat.config.js
networks: {
  newNetwork: {
    url: "https://rpc-url.com",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 12345,
  }
}

// src/NFTBot.js - getNetworkConfig()
newNetwork: {
  url: "https://rpc-url.com",
  chainId: 12345,
  name: "New Network"
}
```

### Custom Metadata

Anda dapat menggunakan `MetadataGenerator` untuk membuat metadata custom:

```javascript
const MetadataGenerator = require("./src/MetadataGenerator");
const generator = new MetadataGenerator();

// Generate metadata biasa
const metadata = generator.generateMetadata(
  "My NFT #1",
  "Description",
  "https://image-url.com/1.png"
);

// Generate metadata untuk game
const gameMetadata = generator.generateGameMetadata(
  "Game Character #1",
  "Powerful warrior",
  "https://image-url.com/warrior.png",
  { level: 10, attack: 85 }
);
```

## 🛡️ Keamanan

- **Private Key** - Jangan pernah commit private key ke repository
- **Environment Variables** - Gunakan `.env` untuk data sensitif
- **Testnet First** - Selalu test di testnet sebelum mainnet
- **Gas Limits** - Set gas limit yang reasonable
- **Contract Verification** - Verifikasi contract di block explorer

## 🐛 Troubleshooting

### Error: "PRIVATE_KEY tidak ditemukan"

- Pastikan file `.env` ada dan berisi `PRIVATE_KEY`
- Private key harus tanpa prefix `0x`

### Error: "Contract artifact tidak ditemukan"

- Jalankan `npm run compile` terlebih dahulu

### Error: "Insufficient funds"

- Pastikan wallet memiliki ETH untuk gas fees
- Untuk testnet, dapatkan faucet ETH

### Error: "Network tidak didukung"

- Cek nama network di konfigurasi
- Pastikan RPC URL benar

### Transaksi Gagal

- Cek gas limit dan gas price
- Pastikan wallet memiliki balance cukup
- Cek apakah minting masih enabled di contract

## 📚 Resources

- [Base Documentation](https://docs.base.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethers.js Documentation](https://docs.ethers.org/)

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 License

Project ini menggunakan MIT License. Lihat file `LICENSE` untuk detail.

## 🆘 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Cek bagian Troubleshooting di atas
2. Buat issue di GitHub repository
3. Join Discord community (jika ada)

---

**⚠️ Disclaimer**: Bot ini untuk tujuan edukasi dan development. Selalu lakukan testing di testnet sebelum menggunakan di mainnet. Gunakan dengan risiko Anda sendiri.
