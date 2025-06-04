# 🎯 Graphite - Decentralized Lending Platform

**Graphite** is a next-generation DeFi lending platform that democratizes access to financial services through blockchain technology. Built for hackathon competition, it features a unique tier-based system that rewards user engagement and provides progressive benefits.

## 🌟 Overview

Graphite solves traditional lending problems by providing:
- **Instant, permissionless loans** against crypto collateral
- **Global accessibility** without geographic restrictions
- **Transparent terms** through smart contracts
- **Gamified experience** with tier-based progression
- **No credit checks** required

## 🎯 Problem Statement

Traditional lending systems face significant challenges:
- High barriers to entry and lengthy approval processes
- Geographic and regulatory restrictions
- Lack of transparency in lending terms
- Limited access for underbanked populations
- High operational costs and intermediary fees

**Graphite's Solution**: A decentralized platform that eliminates intermediaries, reduces costs, and provides instant access to loans for anyone with cryptocurrency collateral.

## ✨ Key Features

### 🏆 Tier-Based Reward System
- **Bronze**: Up to $10K loans, 60% LTV on ETH, 8.5% APR
- **Silver**: Up to $25K loans, 65% LTV on ETH, 7.0% APR  
- **Gold**: Up to $50K loans, 70% LTV on ETH, 6.0% APR
- **Platinum**: Up to $100K loans, 75% LTV on ETH, 5.5% APR
- **Diamond**: Up to $250K loans, 80% LTV on ETH, 5.0% APR

### 🔒 Security Features
- Collateral-based lending with automated liquidation protection
- OpenZeppelin security standards
- Multi-signature wallet support
- Comprehensive testing coverage

### ⚡ Instant Operations
- Real-time loan approval
- Immediate fund disbursement
- 24/7 platform availability
- Gas-optimized transactions

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** - Smart contract development
- **Foundry** - Development framework and testing
- **OpenZeppelin** - Security libraries and standards

### Frontend (Coming Soon)
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Web3.js** - Blockchain integration

### Blockchain
- **Ethereum** - Primary blockchain
- **Sepolia Testnet** - Development and testing

## 🏗️ Architecture

```
├── contracts/          # Smart contracts
│   ├── Loan.sol       # Main lending logic
│   └── Token.sol      # Platform token
├── script/            # Deployment scripts
├── test/              # Contract tests
└── frontend/          # Web application (planned)
```

## 🚀 Quick Start

### Prerequisites
- [Foundry](https://getfoundry.sh/) installed
- Ethereum wallet with Sepolia ETH
- RPC endpoint (Alchemy, Infura, etc.)

### Installation

```shell
# Clone the repository
git clone https://github.com/your-username/Graphite-hackathon.git
cd Graphite-hackathon

# Install dependencies
forge install
```

### Build

```shell
forge build
```

### Test

```shell
forge test
```

### Deploy

```shell
# Deploy to Sepolia testnet
forge script script/Deployment.s.sol:DeploymentScript \
    --rpc-url $SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast
```

## 📈 How It Works

### 1. **Connect Wallet**
Users connect their Ethereum wallet to the platform

### 2. **Deposit Collateral**
Deposit ETH or supported ERC-20 tokens as collateral

### 3. **Get Instant Loan**
Receive loan based on collateral value and user tier

### 4. **Earn Rewards**
Progress through tiers for better rates and higher limits

### 5. **Repay & Withdraw**
Repay loan to unlock collateral and earn platform rewards

## 💼 Business Impact

### Financial Inclusion
- **Global Access**: Serve 2+ billion underbanked individuals
- **24/7 Availability**: Always-on financial services
- **No Discrimination**: Equal access regardless of background

### Economic Benefits
- **Lower Costs**: Eliminate traditional banking overhead
- **Competitive Rates**: Market-driven interest rates
- **Transparent Terms**: All conditions visible on blockchain

### Market Opportunity
- **$1.7T** global lending market
- **Growing DeFi** sector with 100M+ users
- **Emerging markets** with limited banking infrastructure

## 🧪 Testing

Run comprehensive test suite:

```shell
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Generate gas report
forge test --gas-report

# Generate coverage report
forge coverage
```

## 📊 Gas Optimization

```shell
# Generate gas snapshots
forge snapshot

# Optimize contracts
forge fmt
```

## 🔧 Development Commands

### Foundry Tools

```shell
# Start local blockchain
anvil

# Interact with contracts
cast <subcommand>

# Solidity REPL
chisel

# Get help
forge --help
anvil --help
cast --help
```


## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

