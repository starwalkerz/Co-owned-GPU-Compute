markdown

# Nosana Integration

## Overview

Nosana is a decentralized GPU marketplace on Solana. HPC Share registers its GPU cluster as providers on Nosana, receiving NOS tokens for completed compute jobs.

## How It Works

1. SPV registers each GPU as a Nosana provider
2. AI inference jobs are matched to available GPUs
3. Jobs run in Docker containers with GPU requirements
4. NOS rewards are automatically distributed to provider wallets
5. SPV treasury collects NOS, converts to USDC

## Setup

### Prerequisites

- Solana wallet with SOL for transaction fees
- NOS tokens for staking (if required)
- Docker installed on each GPU node

### Provider Registration

```bash
npm run register-provider

Job Monitoring
bash

npm run monitor-jobs

Reward Collection
bash

npm run collect-rewards

Configuration

Add to your .env file:
env

NOSANA_API_KEY=your_nosana_api_key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NOSANA_PROVIDER_WALLET=your_provider_wallet_private_key

Resources

    Nosana Docs

    Nosana Provider Guide

    Nosana Dashboard

text


---

## File 7: `integrations/nosana/provider-registration.js`

```javascript
// integrations/nosana/provider-registration.js
// Registers GPU nodes as Nosana providers

const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { NosanaClient } = require('@nosana/sdk');
const fs = require('fs');
require('dotenv').config();

// Configuration
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const PROVIDER_WALLET_PATH = process.env.NOSANA_PROVIDER_WALLET_PATH || './config/provider-keypair.json';

// GPU node configuration
const GPU_NODES = [
  { id: 'node-01', gpu: 'NVIDIA H200', vram: '141GB', location: 'Madrid, ES' },
  { id: 'node-02', gpu: 'NVIDIA H200', vram: '141GB', location: 'Madrid, ES' },
  { id: 'node-03', gpu: 'NVIDIA A100', vram: '80GB', location: 'Barcelona, ES' },
  { id: 'node-04', gpu: 'NVIDIA A100', vram: '80GB', location: 'Barcelona, ES' }
];

async function main() {
  console.log('='.repeat(60));
  console.log('HPC SHARE - NOSANA PROVIDER REGISTRATION');
  console.log('='.repeat(60));

  // Load or create provider wallet
  let providerKeypair;
  if (fs.existsSync(PROVIDER_WALLET_PATH)) {
    const keypairData = JSON.parse(fs.readFileSync(PROVIDER_WALLET_PATH, 'utf8'));
    providerKeypair = Keypair.fromSecretKey(Buffer.from(keypairData));
    console.log('✅ Loaded existing provider wallet:', providerKeypair.publicKey.toString());
  } else {
    providerKeypair = Keypair.generate();
    fs.writeFileSync(PROVIDER_WALLET_PATH, JSON.stringify(Array.from(providerKeypair.secretKey)));
    console.log('✅ Generated new provider wallet:', providerKeypair.publicKey.toString());
    console.log('⚠️ Fund this wallet with SOL for transaction fees');
  }

  // Initialize Solana connection
  const connection = new Connection(SOLANA_RPC, 'confirmed');
  
  // Initialize Nosana client
  const nosana = new NosanaClient({
    connection,
    wallet: providerKeypair
  });

  console.log('\n📋 Registering GPU nodes as Nosana providers...');
  console.log('-'.repeat(40));

  const registrationResults = [];

  for (const node of GPU_NODES) {
    console.log(`\n🔧 Registering ${node.id} (${node.gpu})...`);
    
    try {
      // Register provider on Nosana
      const registration = await nosana.providers.register({
        providerId: node.id,
        gpu: {
          model: node.gpu,
          vram: node.vram,
          count: 1
        },
        location: node.location,
        pricing: {
          baseRate: 0.50, // $0.50 per hour (example)
          currency: 'USD'
        },
        specs: {
          cpu: 'Intel Xeon',
          ram: '256GB',
          storage: '2TB NVMe'
        }
      });
      
      registrationResults.push({
        nodeId: node.id,
        success: true,
        providerAddress: registration.providerAddress,
        txSignature: registration.signature
      });
      
      console.log(`   ✅ Registered successfully`);
      console.log(`   Provider address: ${registration.providerAddress}`);
      console.log(`   TX: ${registration.signature}`);
      
    } catch (error) {
      console.error(`   ❌ Registration failed: ${error.message}`);
      registrationResults.push({
        nodeId: node.id,
        success: false,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('REGISTRATION SUMMARY');
  console.log('='.repeat(60));
  
  const successful = registrationResults.filter(r => r.success).length;
  const failed = registrationResults.filter(r => !r.success).length;
  
  console.log(`\n✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (successful > 0) {
    console.log('\n📋 Registered providers:');
    registrationResults.filter(r => r.success).forEach(r => {
      console.log(`   - ${r.nodeId}: ${r.providerAddress}`);
    });
  }
  
  // Save registration results
  fs.writeFileSync(
    './config/provider-registrations.json',
    JSON.stringify(registrationResults, null, 2)
  );
  console.log('\n📁 Registration results saved to: config/provider-registrations.json');
}

main().catch(console.error);