# 🌐 Multi-Chain NFT Bot Guide

Panduan lengkap untuk deploy dan minting NFT di semua blockchain yang didukung.

## 🚀 Quick Start

### 1. Deploy ke Semua Chain

```bash
npm run deploy-all
```

### 2. Mint 250 NFT di Semua Chain

```bash
npm run mint-all
```

### 3. Mint di Chain Tertentu

```bash
# Mint di Base dan Polygon saja
npm run mint-specific base,polygon

# Mint 100 NFT di Arbitrum
npm run mint-specific arbitrum 100
```

## 📋 Supported Chains

| Chain        | Network ID | RPC Endpoint                        |
| ------------ | ---------- | ----------------------------------- |
| Base         | 8453       | https://mainnet.base.org            |
| Base Sepolia | 84532      | https://sepolia.base.org            |
| Ethereum     | 1          | Infura                              |
| Polygon      | 137        | https://polygon-rpc.com             |
| Arbitrum     | 42161      | https://arb1.arbitrum.io/rpc        |
| Optimism     | 10         | https://mainnet.optimism.io         |
| Soneium      | 1946       | https://rpc.soneium.org             |
| Lisk         | 1135       | https://rpc.api.lisk.com            |
| Unichain     | 130        | https://unichain-rpc.publicnode.com |
| Ink          | 57073      | https://rpc-gel.inkonchain.com      |
| Mode         | 34443      | https://mainnet.mode.network        |

## 🔧 Configuration

### Environment Variables

```bash
# Required
PRIVATE_KEY=your_private_key_here

# Optional
RECIPIENT_ADDRESS=0x... # Default: deployer address
INFURA_API_KEY=your_infura_key # For Ethereum
```

### Contract Configuration

```javascript
// scripts/deploy-all-chains.js
const contractConfig = {
  name: "OmniHub NFT Collection",
  symbol: "OMNIHUB",
  mintPrice: "0.001", // 0.001 ETH
  maxSupply: 10000,
  baseURI: "https://api.omnihub.io/metadata/",
};
```

### Minting Configuration

```javascript
// scripts/mint-all-chains.js
const mintConfig = {
  count: 250, // NFTs per chain
  baseName: "OmniHub NFT",
  baseDescription: "Multi-chain NFT collection",
  baseImageUrl: "https://api.omnihub.io/images/",
  delay: 2000, // 2 seconds between mints
};
```

## 📊 Script Details

### Deploy All Chains Script

- **File**: `scripts/deploy-all-chains.js`
- **Function**: Deploy NFT contract ke semua chain
- **Output**: `deployments/all-chains-summary.json`
- **Features**:
  - Auto-retry pada error
  - Progress tracking
  - Gas optimization
  - Deployment summary

### Mint All Chains Script

- **File**: `scripts/mint-all-chains.js`
- **Function**: Mint 250 NFT di setiap chain
- **Output**: `deployments/minting-summary.json`
- **Features**:
  - Batch minting dengan chunking
  - Supply limit checking
  - Progress tracking per chain
  - Error handling

## 🎯 Usage Examples

### 1. Full Multi-Chain Deployment

```bash
# Step 1: Deploy contracts
npm run deploy-all

# Step 2: Mint NFTs
npm run mint-all
```

### 2. Selective Chain Operations

```bash
# Deploy hanya ke testnet
npm run mint-specific baseSepolia 50

# Mint banyak di chain murah
npm run mint-specific polygon,arbitrum,base 500
```

### 3. Custom Minting

```bash
# Edit recipient address
export RECIPIENT_ADDRESS=0x1234...
npm run mint-all

# Mint dengan jumlah custom
node scripts/mint-all-chains.js base,polygon 100
```

## 📈 Expected Results

### Deployment

- **Total Chains**: 11
- **Expected Success**: 8-10 chains
- **Common Failures**: Ethereum (gas), new chains (RPC issues)
- **Total Cost**: ~0.05-0.1 ETH (tergantung gas)

### Minting (250 per chain)

- **Total NFTs**: 2,750 (250 × 11 chains)
- **Duration**: 2-4 hours (tergantung delay)
- **Total Cost**: ~2.75 ETH (0.001 × 2,750)
- **Success Rate**: 80-90%

## 🛡️ Safety Features

### Gas Management

- Auto gas price adjustment (+20%)
- Gas limit buffers (20-30%)
- Retry mechanism untuk failed transactions

### Rate Limiting

- 2-5 second delays between operations
- Chain-specific delay configuration
- RPC endpoint protection

### Error Handling

- Graceful failure handling
- Detailed error logging
- Partial success tracking
- Resume capability

## 📁 Output Files

### Deployment Summary

```json
// deployments/all-chains-summary.json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "contractConfig": {...},
  "successful": [
    {
      "network": "base",
      "contractAddress": "0x...",
      "transactionHash": "0x...",
      "mintPrice": "0.001"
    }
  ],
  "failed": [...],
  "successRate": "90.9%"
}
```

### Minting Summary

```json
// deployments/minting-summary.json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "mintConfig": {...},
  "successful": [
    {
      "network": "base",
      "mintedCount": 250,
      "duration": 850,
      "results": [...]
    }
  ],
  "totalMinted": 2250,
  "successRate": "81.8%"
}
```

## 🔍 Monitoring & Debugging

### Real-time Progress

```bash
# Monitor deployment
tail -f deployments/all-chains-summary.json

# Monitor minting
tail -f deployments/minting-summary.json
```

### Check Contract Status

```bash
# Via bot CLI
npm run bot
# Select: "4. Lihat Status Contract"
```

### Manual Verification

```bash
# Check specific chain
node -e "
const NFTBot = require('./src/NFTBot');
(async () => {
  const bot = new NFTBot('base');
  await bot.initialize();
  await bot.loadContract('0x...');
  console.log(await bot.getContractStatus());
})();
"
```

## ⚠️ Important Notes

1. **Private Key Security**: Jangan commit private key ke git
2. **Gas Costs**: Siapkan ETH di semua chain sebelum mulai
3. **RPC Limits**: Beberapa RPC public memiliki rate limit
4. **Network Issues**: Beberapa chain baru mungkin tidak stabil
5. **Supply Limits**: Contract memiliki max supply 10,000 per chain

## 🆘 Troubleshooting

### Common Issues

**"Insufficient funds"**

```bash
# Check balance di semua chain
npm run bot
# Select: "1. Deploy Contract" untuk cek balance
```

**"RPC Error"**

```bash
# Edit network config di src/NFTBot.js
# Ganti RPC endpoint yang bermasalah
```

**"Max supply reached"**

```bash
# Deploy contract baru atau increase maxSupply
# Edit contractConfig.maxSupply di deploy script
```

**"Transaction underpriced"**

```bash
# Script sudah auto-adjust gas price +20%
# Jika masih error, edit multiplier di NFTBot.js
```

## 🎉 Success Tips

1. **Start Small**: Test dengan 1-2 chain dulu
2. **Monitor Gas**: Cek gas price sebelum deploy
3. **Backup Data**: Save deployment addresses
4. **Batch Wisely**: Gunakan delay yang cukup
5. **Check Balances**: Pastikan ETH cukup di semua chain

---

**Happy Multi-Chain Minting! 🚀**
