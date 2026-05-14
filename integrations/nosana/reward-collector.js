// integrations/nosana/reward-collector.js
// Collects NOS rewards from compute leases and converts to USDC

const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { NosanaClient } = require('@nosana/sdk');
const { BrickkenClient } = require('../brickken/client');
const fs = require('fs');
require('dotenv').config();

// Configuration
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const PROVIDER_WALLET_PATH = process.env.NOSANA_PROVIDER_WALLET_PATH || './config/provider-keypair.json';
const TREASURY_WALLET = process.env.TREASURY_WALLET;

// Jupiter API for NOS → USDC swap
const JUPITER_API = 'https://quote-api.jup.ag/v6';

async function main() {
  console.log('='.repeat(60));
  console.log('HPC SHARE - NOSANA REWARD COLLECTOR');
  console.log('='.repeat(60));

  // Load provider wallet
  let providerKeypair;
  if (fs.existsSync(PROVIDER_WALLET_PATH)) {
    const keypairData = JSON.parse(fs.readFileSync(PROVIDER_WALLET_PATH, 'utf8'));
    providerKeypair = Keypair.fromSecretKey(Buffer.from(keypairData));
    console.log('✅ Loaded provider wallet:', providerKeypair.publicKey.toString());
  } else {
    console.error('❌ Provider wallet not found. Run provider-registration.js first.');
    process.exit(1);
  }

  // Initialize connections
  const connection = new Connection(SOLANA_RPC, 'confirmed');
  const nosana = new NosanaClient({ connection, wallet: providerKeypair });
  const brickken = new BrickkenClient();

  // Step 1: Get pending rewards
  console.log('\n📊 Checking pending rewards...');
  const rewards = await nosana.rewards.getPending(providerKeypair.publicKey);
  
  if (rewards.total === 0) {
    console.log('   No pending rewards.');
    return;
  }
  
  console.log(`   Total NOS pending: ${rewards.total}`);
  console.log(`   Number of jobs: ${rewards.jobs.length}`);

  // Step 2: Claim rewards
  console.log('\n💰 Claiming rewards...');
  const claimResult = await nosana.rewards.claimAll();
  console.log(`   Claimed: ${claimResult.amount} NOS`);
  console.log(`   TX: ${claimResult.signature}`);

  // Step 3: Swap NOS to USDC via Jupiter
  console.log('\n🔄 Swapping NOS to USDC...');
  
  const swapQuote = await getSwapQuote(claimResult.amount);
  console.log(`   Quote: ${claimResult.amount} NOS → ${swapQuote.outAmount} USDC`);
  console.log(`   Price impact: ${swapQuote.priceImpact}%`);
  
  const swapResult = await executeSwap(claimResult.amount, providerKeypair);
  console.log(`   Swapped: ${swapResult.inputAmount} NOS → ${swapResult.outputAmount} USDC`);
  console.log(`   TX: ${swapResult.signature}`);

  // Step 4: Transfer USDC to SPV treasury
  console.log('\n🏦 Transferring USDC to SPV treasury...');
  
  const usdcBalance = await getUSDCBalance(providerKeypair.publicKey);
  console.log(`   USDC balance: ${usdcBalance}`);
  
  const transferResult = await transferUSDC(TREASURY_WALLET, usdcBalance, providerKeypair);
  console.log(`   Transferred: ${transferResult.amount} USDC to ${TREASURY_WALLET}`);
  console.log(`   TX: ${transferResult.signature}`);

  // Step 5: Trigger distribution via Brickken (called separately)
  console.log('\n📊 Summary:');
  console.log(`   NOS claimed: ${claimResult.amount}`);
  console.log(`   USDC received: ${swapResult.outputAmount}`);
  console.log(`   USDC to treasury: ${usdcBalance}`);
  
  console.log('\n📝 Next step: Run distribute-dividends.js to pay token holders');
}

async function getSwapQuote(amountNOS) {
  const response = await fetch(
    `${JUPITER_API}/quote?inputMint=NOS_TOKEN_MINT&outputMint=USDC_TOKEN_MINT&amount=${amountNOS}&slippageBps=50`
  );
  const data = await response.json();
  return {
    outAmount: data.outAmount,
    priceImpact: data.priceImpact,
    routePlan: data.routePlan
  };
}

async function executeSwap(amountNOS, wallet) {
  // Simplified: in production, use Jupiter SDK
  return {
    inputAmount: amountNOS,
    outputAmount: amountNOS * 0.95, // Placeholder: 5% slippage/fees
    signature: 'simulated_tx_signature'
  };
}

async function getUSDCBalance(address) {
  // Simplified: query USDC token account balance
  return 1000; // Placeholder
}

async function transferUSDC(to, amount, fromWallet) {
  // Simplified: transfer USDC to treasury
  return {
    amount: amount,
    to: to,
    signature: 'simulated_tx_signature'
  };
}

main().catch(console.error);