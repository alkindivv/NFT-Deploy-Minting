# 🤖 NFT Deploy & Mint Bot

Bot otomatis untuk deploy dan mint NFT di berbagai blockchain dengan fitur lengkap dan interface CLI yang user-friendly.

## ✨ Fitur Utama

- 🚀 **Deploy NFT Contract** - Deploy smart contract NFT dengan konfigurasi custom
- 🎨 **Mint NFT Individual** - Mint NFT satu per satu dengan metadata custom
- 📦 **Batch Mint** - Mint multiple NFT sekaligus dengan delay yang dapat dikonfigurasi
- 🌐 **Multi-Chain Support** - Mendukung 11+ blockchain networks
- 📊 **Status Monitoring** - Monitor status contract dan supply real-time
- 🎯 **Metadata Generator** - Generate metadata NFT otomatis dengan traits random
- 💰 **Gas Estimation** - Estimasi biaya gas sebelum transaksi
- 🔒 **Security Features** - Built-in security dan validasi transaksi
- 🧹 **Transaction Management** - Clear pending transactions dan nonce management
- 📈 **Progress Tracking** - Real-time progress bar untuk batch operations

## 🌐 Blockchain yang Didukung

| Chain        | Network ID | Status | RPC Endpoint                        |
| ------------ | ---------- | ------ | ----------------------------------- |
| Base         | 8453       | ✅     | https://mainnet.base.org            |
| Base Sepolia | 84532      | ✅     | https://sepolia.base.org            |
| Ethereum     | 1          | ✅     | Infura                              |
| Polygon      | 137        | ✅     | https://polygon-rpc.com             |
| Arbitrum     | 42161      | ✅     | https://arb1.arbitrum.io/rpc        |
| Optimism     | 10         | ✅     | https://mainnet.optimism.io         |
| Soneium      | 1946       | ✅     | https://rpc.soneium.org             |
| Lisk         | 1135       | ✅     | https://rpc.api.lisk.com            |
| Unichain     | 130        | ✅     | https://unichain-rpc.publicnode.com |
| Ink          | 57073      | ✅     | https://rpc-gel.inkonchain.com      |
| Mode         | 34443      | ✅     | https://mainnet.mode.network        |

## 🛠️ Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd nft-deploy-mint-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env` di root directory:

```env
# Private Key wallet (tanpa 0x prefix)
PRIVATE_KEY=your_private_key_here

# API Keys untuk verifikasi contract (opsional)
BASESCAN_API_KEY=your_basescan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key
OPTIMISM_API_KEY=your_optimism_api_key
INFURA_API_KEY=your_infura_api_key

# Konfigurasi NFT default (opsional)
NFT_NAME=My Awesome NFT Collection
NFT_SYMBOL=MANC
NFT_BASE_URI=https://your-metadata-server.com/metadata/
MINT_PRICE=0.001
MAX_SUPPLY=10000
DEFAULT_NETWORK=base
```

### 4. Compile Smart Contracts

```bash
npm run compile
```

## 🚀 Penggunaan

### Menjalankan Bot CLI

```bash
npm start
```

Bot akan menampilkan menu interaktif:

```
🤖 NFT Deploy & Mint Bot
┌─────────────────────────────────────┐
│  1. 🚀 Deploy NFT Contract          │
│  2. 🎨 Mint NFT                     │
│  3. 📦 Batch Mint NFT               │
│  4. 📊 Lihat Status Contract        │
│  5. ⚙️ Konfigurasi                  │
│  6. 🧹 Clear Pending Transactions   │
│  7. 🚪 Keluar                       │
└─────────────────────────────────────┘
```

### Deploy Contract

1. Pilih "🚀 Deploy NFT Contract"
2. Pilih network (Base untuk mainnet, Base Sepolia untuk testing)
3. Isi konfigurasi:
   - **Nama Collection**: Nama NFT collection
   - **Symbol**: Symbol token (3-5 karakter)
   - **Mint Price**: Harga mint dalam ETH (contoh: 0.001)
   - **Max Supply**: Total maksimum NFT (contoh: 10000)
   - **Base URI**: URL metadata (contoh: https://api.example.com/metadata/)

### Mint NFT Individual

1. Pilih "🎨 Mint NFT"
2. Pilih contract yang sudah di-deploy
3. Isi informasi NFT:
   - **Recipient Address**: Address penerima NFT
   - **Nama NFT**: Nama individual NFT
   - **Deskripsi**: Deskripsi NFT
   - **Image URL**: URL gambar NFT

### Batch Mint

1. Pilih "📦 Batch Mint NFT"
2. Pilih contract yang sudah di-deploy
3. Konfigurasi batch:
   - **Jumlah NFT**: Berapa banyak NFT yang akan di-mint
   - **Recipient Address**: Address penerima
   - **Base Name**: Nama dasar (akan ditambah nomor)
   - **Base Description**: Deskripsi dasar
   - **Base Image URL**: URL dasar gambar
   - **Delay**: Jeda antar mint dalam milliseconds (default: 5000)

## 📝 Scripts Available

```bash
# Jalankan bot CLI
npm start

# Development mode dengan auto-reload
npm run dev

# Compile smart contracts
npm run compile

# Deploy contract langsung
npm run deploy

# Mint NFT langsung
npm run mint

# Clear pending transactions
npm run clear-pending

# Check transaction status
npm run check-status

# Run tests
npm test
```

## 🏗️ Struktur Project

```
nft-deploy-mint-bot/
├── contracts/
│   └── NFTCollection.sol          # Smart contract NFT ERC721
├── scripts/
│   ├── deploy.js                  # Script deploy contract
│   └── clear-pending-tx.js        # Script clear pending transactions
├── src/
│   ├── index.js                   # CLI utama dengan menu interaktif
│   ├── NFTBot.js                  # Core bot logic dan blockchain interaction
│   ├── MetadataGenerator.js       # Generator metadata NFT dengan traits
│   └── mint.js                    # Script mint langsung
├── deployments/                   # Info contract yang sudah di-deploy
├── artifacts/                     # Compiled contracts
├── hardhat.config.js              # Konfigurasi Hardhat multi-chain
├── package.json                   # Dependencies dan scripts
└── README.md                      # Dokumentasi ini
```

## 🎨 Smart Contract Features

Contract NFT (`NFTCollection.sol`) memiliki fitur lengkap:

### Core Features

- **ERC721 Standard** - Compatible dengan semua marketplace (OpenSea, Blur, dll)
- **Metadata URI Storage** - Setiap NFT memiliki metadata URI unik
- **Supply Management** - Max supply yang dapat dikonfigurasi
- **Mint Price Control** - Harga mint yang dapat diubah owner

### Minting Features

- **Public Mint** - Siapa saja bisa mint dengan membayar
- **Owner Mint** - Owner bisa mint gratis
- **Batch Mint** - Mint multiple NFT dalam satu transaksi
- **Mint Toggle** - Owner bisa enable/disable minting

### Security Features

- **Access Control** - Owner-only functions dengan OpenZeppelin
- **Reentrancy Guard** - Proteksi dari reentrancy attacks
- **Max Mint Per Address** - Limit mint per wallet
- **Withdraw Function** - Owner bisa withdraw funds

### Events

- **NFTMinted** - Event ketika NFT berhasil di-mint
- **BatchMinted** - Event untuk batch minting
- **MintingToggled** - Event ketika minting di-toggle

## 🔧 Konfigurasi Lanjutan

### Menambah Network Baru

1. **Edit `hardhat.config.js`**:

```javascript
networks: {
  newNetwork: {
    url: "https://rpc-url.com",
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 12345,
  }
}
```

2. **Edit `src/NFTBot.js` - method `getNetworkConfig()`**:

```javascript
newNetwork: {
  url: "https://rpc-url.com",
  chainId: 12345,
  name: "New Network"
}
```

### Custom Metadata Generation

```javascript
const MetadataGenerator = require("./src/MetadataGenerator");
const generator = new MetadataGenerator();

// Generate metadata standar
const metadata = generator.generateMetadata(
  "My NFT #1",
  "Amazing NFT description",
  "https://image-url.com/1.png"
);

// Generate metadata untuk game
const gameMetadata = generator.generateGameMetadata(
  "Game Character #1",
  "Powerful warrior character",
  "https://image-url.com/warrior.png",
  { level: 10, attack: 85, defense: 70 }
);

// Generate metadata untuk art
const artMetadata = generator.generateArtMetadata(
  "Digital Art #1",
  "Beautiful digital artwork",
  "https://image-url.com/art.png",
  { artist: "Artist Name", medium: "Digital", year: 2024 }
);
```

### Gas Optimization

Bot menggunakan strategi gas optimization:

- **Dynamic Gas Price**: Otomatis adjust gas price +50% untuk avoid replacement
- **Gas Estimation**: Estimasi gas dengan buffer 30%
- **Nonce Management**: Tracking nonce untuk avoid stuck transactions
- **Retry Mechanism**: Auto retry dengan gas price lebih tinggi

## 🛡️ Keamanan & Best Practices

### Private Key Security

- ❌ **JANGAN** commit private key ke repository
- ✅ **GUNAKAN** file `.env` untuk data sensitif
- ✅ **TAMBAHKAN** `.env` ke `.gitignore`
- ✅ **GUNAKAN** hardware wallet untuk mainnet

### Testing Strategy

- ✅ **SELALU** test di testnet terlebih dahulu
- ✅ **VERIFIKASI** contract di block explorer
- ✅ **CEK** metadata URL sebelum deploy
- ✅ **TEST** mint function sebelum batch mint

### Transaction Safety

- ✅ **SET** reasonable gas limits
- ✅ **MONITOR** transaction status
- ✅ **HANDLE** failed transactions gracefully
- ✅ **BACKUP** deployment info

## 🐛 Troubleshooting

### Common Errors

#### "PRIVATE_KEY tidak ditemukan"

```bash
# Solusi:
1. Pastikan file .env ada di root directory
2. Pastikan PRIVATE_KEY ada di .env
3. Private key harus tanpa prefix 0x
```

#### "Contract artifact tidak ditemukan"

```bash
# Solusi:
npm run compile
```

#### "Insufficient funds for gas"

```bash
# Solusi:
1. Cek balance wallet
2. Untuk testnet: dapatkan faucet ETH
3. Untuk mainnet: top up ETH
```

#### "Transaction replacement underpriced"

```bash
# Solusi:
npm run clear-pending
```

#### "Minting is disabled"

```bash
# Solusi:
1. Cek apakah Anda owner contract
2. Call enableMinting() jika Anda owner
3. Atau tunggu owner enable minting
```

### Debug Mode

Untuk debugging lebih detail:

```bash
# Set debug environment
DEBUG=* npm start

# Atau check transaction status
npm run check-status base
```

### Clear Pending Transactions

Jika ada transaksi stuck:

```bash
# Clear pending transactions
npm run clear-pending

# Check status dulu
npm run check-status

# Clear di network tertentu
node scripts/clear-pending-tx.js clear base
```

## 📊 Monitoring & Analytics

### Contract Status

Bot menyediakan monitoring real-time:

- **Total Supply**: Berapa NFT yang sudah di-mint
- **Remaining Supply**: Sisa NFT yang bisa di-mint
- **Mint Price**: Harga mint saat ini
- **Minting Status**: Enabled/disabled
- **Owner Address**: Address owner contract
- **Contract Balance**: ETH balance di contract

### Transaction Tracking

Setiap operasi menghasilkan log:

```json
{
  "tokenId": "1",
  "transactionHash": "0x...",
  "gasUsed": "234567",
  "recipient": "0x...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Deployment Records

Info deployment disimpan di `deployments/`:

```json
{
  "contractAddress": "0x...",
  "network": "base",
  "deployer": "0x...",
  "deploymentTime": "2024-01-01T00:00:00.000Z",
  "contractConfig": {
    "name": "My NFT Collection",
    "symbol": "MNC",
    "mintPrice": "0.001",
    "maxSupply": "10000"
  }
}
```

## 🚀 Advanced Usage

### Batch Operations

Untuk mint dalam jumlah besar:

```bash
# Mint 1000 NFT dengan delay 2 detik
node src/mint.js --count 1000 --delay 2000

# Mint ke multiple addresses
node src/mint.js --recipients addresses.txt
```

### Multi-Chain Deployment

Deploy ke multiple chains sekaligus:

```bash
# Deploy ke semua supported chains
node scripts/deploy-all-chains.js

# Deploy ke chains tertentu
node scripts/deploy-all-chains.js base,polygon,arbitrum
```

### Metadata Management

Generate metadata dalam batch:

```javascript
const generator = new MetadataGenerator();

// Generate 1000 metadata files
for (let i = 1; i <= 1000; i++) {
  const metadata = generator.generateMetadata(
    `NFT #${i}`,
    `Description for NFT #${i}`,
    `https://images.example.com/${i}.png`
  );

  // Save to file or upload to IPFS
  fs.writeFileSync(`metadata/${i}.json`, JSON.stringify(metadata, null, 2));
}
```

## 📚 Resources & Documentation

### Blockchain Documentation

- [Base Documentation](https://docs.base.org/)
- [Ethereum Documentation](https://ethereum.org/developers/)
- [Polygon Documentation](https://docs.polygon.technology/)
- [Arbitrum Documentation](https://docs.arbitrum.io/)
- [Optimism Documentation](https://docs.optimism.io/)

### Development Tools

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Ethers.js Documentation](https://docs.ethers.org/)

### NFT Standards & Marketplaces

- [ERC721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [OpenSea Developer Docs](https://docs.opensea.io/)
- [NFT Metadata Standards](https://docs.opensea.io/docs/metadata-standards)

## 🤝 Contributing

Kontribusi sangat diterima! Untuk berkontribusi:

1. **Fork** repository ini
2. **Buat** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** perubahan (`git commit -m 'Add amazing feature'`)
4. **Push** ke branch (`git push origin feature/amazing-feature`)
5. **Buat** Pull Request

### Development Guidelines

- Gunakan ESLint untuk code formatting
- Tambahkan tests untuk fitur baru
- Update dokumentasi jika diperlukan
- Test di testnet sebelum submit PR

## 📄 License

Project ini menggunakan MIT License. Lihat file `LICENSE` untuk detail lengkap.

## 🆘 Support & Community

### Getting Help

1. **Baca** dokumentasi ini terlebih dahulu
2. **Cek** bagian Troubleshooting
3. **Search** existing issues di GitHub
4. **Buat** issue baru jika masalah belum ada

### Contact

- **GitHub Issues**: Untuk bug reports dan feature requests
- **Email**: [your-email@example.com]
- **Discord**: [Discord invite link]

## 🎯 Roadmap

### Version 2.0 (Coming Soon)

- [ ] Web UI interface
- [ ] IPFS integration untuk metadata
- [ ] Whitelist management
- [ ] Royalty management
- [ ] Marketplace integration

### Version 2.1

- [ ] Layer 2 optimizations
- [ ] Cross-chain bridging
- [ ] Advanced analytics dashboard
- [ ] Mobile app

## ⚠️ Disclaimer

**PENTING**: Bot ini dibuat untuk tujuan edukasi dan development.

- ✅ **SELALU** test di testnet sebelum mainnet
- ✅ **BACKUP** private keys dan deployment info
- ✅ **VERIFY** semua transaksi sebelum confirm
- ❌ **JANGAN** gunakan untuk aktivitas ilegal
- ❌ **JANGAN** invest lebih dari yang bisa Anda tanggung

**Gunakan dengan risiko Anda sendiri. Developer tidak bertanggung jawab atas kerugian yang mungkin terjadi.**

---

**Made with ❤️ for the NFT community**
