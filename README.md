# OctantVault

Yield-powered salaries for public goods using Spark's curated yield. Deploy ERC-4626 vaults that stream yield to your team.

## Overview

OctantVault is a decentralized platform that enables sustainable funding for public goods projects through yield-generating vaults. The platform integrates with Spark Protocol to provide curated yield, allowing projects to fund contributors while preserving principal deposits.

## Features

- **ERC-4626 Compliant Vaults**: Standard interface for DeFi composability
- **Spark Integration**: Uses Spark's curated yield (SparkLend) for yield generation
- **Yield-Donating Strategy**: Only generated yield (not principal) is distributed
- **Contributor Management**: Add, update, and manage contributors with monthly allocations
- **Quadratic Voting**: Community-driven contributor nominations
- **Automated Distributions**: Schedule and execute yield distributions to contributors
- **Multiple Distribution Methods**: Proportional, equal split, or voting-weighted

## Tech Stack

### Smart Contracts
- **Solidity** ^0.8.23
- **Hardhat** - Development environment
- **OpenZeppelin** - Security libraries
- **ERC-4626** - Vault standard

### Frontend
- **Next.js** 16 - React framework
- **TypeScript** - Type safety
- **Wagmi** + **Viem** - Ethereum interaction
- **TanStack Query** - Data fetching
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library

### Backend
- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **MongoDB** + **Mongoose** - Database
- **Ethers.js** - Blockchain interaction

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm or npm
- MongoDB (local or cloud)
- MetaMask or compatible wallet
- Base Sepolia testnet ETH

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd octantvault
```

2. **Install dependencies**:
```bash
# Contracts
cd contracts
npm install

# Backend
cd ../backend
npm install

# Frontend
cd ../frontend
pnpm install
```

3. **Set up environment variables**:

**Contracts** (`contracts/.env`):
```bash
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here
```

**Backend** (`backend/.env`):
```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/octantvault
RPC_URL=https://sepolia.base.org
```

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_CHAIN_ID=84532
```

### Running the Application

1. **Start MongoDB** (if running locally):
```bash
mongod
```

2. **Start the backend**:
```bash
cd backend
npm run dev
```

3. **Start the frontend**:
```bash
cd frontend
pnpm dev
```

4. **Deploy contracts** (if not already deployed):
```bash
cd contracts
npm run deploy:base-sepolia
```

5. **Populate test data** (optional):
```bash
cd contracts
npm run populate:base-sepolia
```

## Project Structure

```
octantvault/
├── contracts/          # Smart contracts
│   ├── contracts/      # Solidity contracts
│   ├── scripts/        # Deployment scripts
│   └── test/           # Contract tests
├── backend/           # Backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── routes/
│   └── package.json
└── frontend/          # Next.js frontend
    ├── app/           # Next.js app router
    ├── components/    # React components
    ├── hooks/         # Custom hooks
    └── lib/           # Utilities
```

## Smart Contracts

### Core Contracts

- **SparkVault**: ERC-4626 vault with Spark integration
- **SparkVaultFactory**: Factory for Spark-integrated vaults
- **Vault**: Standard ERC-4626 vault
- **VaultFactory**: Factory for standard vaults
- **ContributorRegistry**: Manages contributors and allocations
- **QuadraticVoting**: Community voting system
- **Distribution**: Automated yield distribution

### Network

- **Base Sepolia Testnet** (Chain ID: 84532)
- RPC: `https://sepolia.base.org`
- Explorer: `https://sepolia.basescan.org`

## API Endpoints

### Vaults
- `GET /api/v1/vaults` - Get all vaults
- `GET /api/v1/vaults/:address` - Get vault by address
- `GET /api/v1/vaults/sync` - Sync vaults from blockchain

### Contributors
- `GET /api/v1/contributors` - Get all contributors
- `GET /api/v1/contributors/vault/:vaultAddress` - Get contributors for a vault

### Votings
- `GET /api/v1/votings` - Get all votings
- `GET /api/v1/votings/active` - Get active votings
- `GET /api/v1/votings/past` - Get past votings
- `GET /api/v1/votings/sync` - Sync votings from blockchain

### Distributions
- `GET /api/v1/distributions` - Get all distributions
- `GET /api/v1/distributions/upcoming` - Get upcoming distributions
- `GET /api/v1/distributions/recent` - Get recent distributions
- `GET /api/v1/distributions/sync` - Sync distributions from blockchain

## Development

### Contracts

```bash
cd contracts

# Compile
npm run compile

# Test
npm test

# Deploy
npm run deploy:base-sepolia

# Verify
npm run verify -- --network base-sepolia <contract-address>
```

### Backend

```bash
cd backend

# Development
npm run dev

# Build
npm run build

# Start
npm start
```

### Frontend

```bash
cd frontend

# Development
pnpm dev

# Build
pnpm build

# Start
pnpm start
```

## Testing

### Contract Tests
```bash
cd contracts
npm test
```

### Populate Test Data
```bash
cd contracts
npm run populate:base-sepolia
```

## License

MIT

