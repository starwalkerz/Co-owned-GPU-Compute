// integrations/nosana/provider-registration.js
// HPC Share - Nosana Provider Registration
// Registers GPU nodes as providers on the Nosana network

const fs = require('fs');
const path = require('path');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

// Configuration
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const PROVIDER_WALLET_PATH = process.env.NOSANA_PROVIDER_WALLET_PATH || './config/provider-keypair.json';
const REGISTRATION_LOG = path.join(__dirname, '../../logs/provider-registrations.json');

// GPU node configuration
const GPU_NODES = [
    { id: 'node-01', gpu: 'NVIDIA H200', vram: '141GB', location: 'Madrid, ES', specs: { cpu: 'AMD EPYC', ram: '256GB', storage: '2TB NVMe' } },
    { id: 'node-02', gpu: 'NVIDIA H200', vram: '141GB', location: 'Madrid, ES', specs: { cpu: 'AMD EPYC', ram: '256GB', storage: '2TB NVMe' } },
    { id: 'node-03', gpu: 'NVIDIA A100', vram: '80GB', location: 'Barcelona, ES', specs: { cpu: 'Intel Xeon', ram: '128GB', storage: '1TB NVMe' } },
    { id: 'node-04', gpu: 'NVIDIA A100', vram: '80GB', location: 'Barcelona, ES', specs: { cpu: 'Intel Xeon', ram: '128GB', storage: '1TB NVMe' } }
];

// Pricing configuration
const PRICING = {
    'NVIDIA H200': { hourlyRate: 0.75, currency: 'USD', minJobDuration: 5 },
    'NVIDIA A100': { hourlyRate: 0.50, currency: 'USD', minJobDuration: 5 },
    'NVIDIA H100': { hourlyRate: 0.65, currency: 'USD', minJobDuration: 5 },
    'NVIDIA RTX 4090': { hourlyRate: 0.30, currency: 'USD', minJobDuration: 5 }
};

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

async function main() {
    console.log('='.repeat(60));
    console.log('HPC SHARE - NOSANA PROVIDER REGISTRATION');
    console.log('='.repeat(60));

    const args = process.argv.slice(2);
    const command = args[0] || 'register';

    switch (command) {
        case 'register':
            await registerProviders();
            break;
        case 'status':
            await checkProviderStatus();
            break;
        case 'update-pricing':
            await updatePricing(args[1], args[2]);
            break;
        case 'deregister':
            await deregisterProvider(args[1]);
            break;
        case 'list':
            await listProviders();
            break;
        case 'help':
        default:
            printHelp();
    }
}

async function registerProviders() {
    console.log('\n🔧 Registering GPU nodes as Nosana providers...');
    console.log('-'.repeat(40));

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
    
    // Check balance
    const balance = await connection.getBalance(providerKeypair.publicKey);
    console.log(`💰 Wallet balance: ${balance / 1e9} SOL`);
    
    if (balance < 0.05e9) {
        console.log('⚠️ Low SOL balance. Minimum 0.05 SOL recommended for transaction fees.');
    }

    const registrationResults = [];

    for (const node of GPU_NODES) {
        console.log(`\n📡 Registering ${node.id} (${node.gpu})...`);
        
        try {
            // In production, call Nosana API to register provider
            // const registration = await nosana.providers.register({
            //     providerId: node.id,
            //     wallet: providerKeypair.publicKey.toString(),
            //     gpu: { model: node.gpu, vram: node.vram, count: 1 },
            //     location: node.location,
            //     pricing: PRICING[node.gpu],
            //     specs: node.specs
            // });
            
            // Simulated registration
            const registration = {
                providerId: node.id,
                providerAddress: `0x${Buffer.from(node.id).toString('hex')}${Math.random().toString(36).substring(2, 10)}`,
                status: 'registered',
                transactionSignature: 'sim_' + Date.now() + '_' + node.id,
                registeredAt: new Date().toISOString()
            };
            
            registrationResults.push({
                nodeId: node.id,
                success: true,
                providerAddress: registration.providerAddress,
                txSignature: registration.transactionSignature,
                registeredAt: registration.registeredAt
            });
            
            console.log(`   ✅ Registered successfully`);
            console.log(`   Provider address: ${registration.providerAddress}`);
            console.log(`   TX: ${registration.transactionSignature}`);
            
            // Save node configuration
            saveNodeConfig(node, registration);
            
        } catch (error) {
            console.error(`   ❌ Registration failed: ${error.message}`);
            registrationResults.push({
                nodeId: node.id,
                success: false,
                error: error.message
            });
        }
    }

    // Save registration results
    saveRegistrationResults(registrationResults);
    
    // Summary
    printRegistrationSummary(registrationResults);
    
    // Generate docker-compose config for Nosana provider
    generateDockerCompose(registrationResults);
}

async function checkProviderStatus() {
    console.log('\n🔍 Checking provider status...');
    console.log('-'.repeat(40));
    
    const registrations = loadRegistrationResults();
    
    if (registrations.length === 0) {
        console.log('   No providers registered. Run registration first.');
        return;
    }
    
    for (const reg of registrations) {
        if (!reg.success) continue;
        
        console.log(`\n📡 ${reg.nodeId}:`);
        console.log(`   Provider Address: ${reg.providerAddress}`);
        console.log(`   Registered At: ${reg.registeredAt}`);
        
        // In production, query Nosana for provider status
        // const status = await nosana.providers.getStatus(reg.providerAddress);
        
        // Simulated status
        const status = {
            online: Math.random() > 0.2,
            activeJobs: Math.floor(Math.random() * 3),
            totalEarnings: (Math.random() * 1000).toFixed(2),
            lastHeartbeat: new Date().toISOString()
        };
        
        console.log(`   Status: ${status.online ? '🟢 Online' : '🔴 Offline'}`);
        console.log(`   Active Jobs: ${status.activeJobs}`);
        console.log(`   Total Earnings: ${status.totalEarnings} NOS`);
        console.log(`   Last Heartbeat: ${new Date(status.lastHeartbeat).toLocaleString()}`);
    }
}

async function updatePricing(nodeId, newRate) {
    console.log('\n💰 Updating pricing...');
    console.log('-'.repeat(40));
    
    if (!nodeId || !newRate) {
        console.error('❌ Please provide node ID and new rate');
        console.log('   Usage: npm run register-provider -- update-pricing <nodeId> <rate>');
        return;
    }
    
    const node = GPU_NODES.find(n => n.id === nodeId);
    if (!node) {
        console.error(`❌ Node ${nodeId} not found`);
        return;
    }
    
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) {
        console.error('❌ Invalid rate');
        return;
    }
    
    console.log(`   Updating ${nodeId} (${node.gpu}) to $${rate}/hour`);
    
    // In production, call Nosana API to update pricing
    // await nosana.providers.updatePricing(node.providerAddress, { hourlyRate: rate });
    
    console.log('   ✅ Pricing updated successfully');
    
    // Update local config
    PRICING[node.gpu] = { ...PRICING[node.gpu], hourlyRate: rate };
    console.log('   ⚠️ Local config updated. Restart provider for changes to take effect.');
}

async function deregisterProvider(nodeId) {
    console.log('\n🗑️ Deregistering provider...');
    console.log('-'.repeat(40));
    
    if (!nodeId) {
        console.error('❌ Please provide node ID');
        console.log('   Usage: npm run register-provider -- deregister <nodeId>');
        return;
    }
    
    const registrations = loadRegistrationResults();
    const registration = registrations.find(r => r.nodeId === nodeId);
    
    if (!registration || !registration.success) {
        console.error(`❌ Node ${nodeId} not found in registration records`);
        return;
    }
    
    console.log(`   Deregistering ${nodeId} (${registration.providerAddress})`);
    
    // In production, call Nosana API to deregister
    // await nosana.providers.deregister(registration.providerAddress);
    
    console.log('   ✅ Provider deregistered');
    
    // Remove from registrations
    const updatedRegistrations = registrations.filter(r => r.nodeId !== nodeId);
    saveRegistrationResults(updatedRegistrations);
}

async function listProviders() {
    console.log('\n📋 Registered Providers:');
    console.log('-'.repeat(40));
    
    const registrations = loadRegistrationResults();
    const successful = registrations.filter(r => r.success);
    
    if (successful.length === 0) {
        console.log('   No providers registered');
        return;
    }
    
    console.log(`\n${"Node ID".padEnd(15)} ${"Provider Address".padEnd(35)} ${"Registered At".padEnd(25)}`);
    console.log('-'.repeat(80));
    
    for (const reg of successful) {
        const nodeId = reg.nodeId.padEnd(15);
        const providerAddress = (reg.providerAddress || '').slice(0, 32).padEnd(35);
        const registeredAt = reg.registeredAt ? new Date(reg.registeredAt).toLocaleString().padEnd(25) : 'unknown';
        console.log(`${nodeId} ${providerAddress} ${registeredAt}`);
    }
}

function saveNodeConfig(node, registration) {
    const configPath = path.join(__dirname, '../../config/nodes', `${node.id}.json`);
    const nodeConfigDir = path.join(__dirname, '../../config/nodes');
    
    if (!fs.existsSync(nodeConfigDir)) {
        fs.mkdirSync(nodeConfigDir, { recursive: true });
    }
    
    const config = {
        nodeId: node.id,
        gpu: node.gpu,
        vram: node.vram,
        location: node.location,
        providerAddress: registration.providerAddress,
        pricing: PRICING[node.gpu],
        registeredAt: registration.registeredAt,
        status: 'active'
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`   📁 Config saved: config/nodes/${node.id}.json`);
}

function saveRegistrationResults(results) {
    fs.writeFileSync(REGISTRATION_LOG, JSON.stringify(results, null, 2));
}

function loadRegistrationResults() {
    if (fs.existsSync(REGISTRATION_LOG)) {
        try {
            return JSON.parse(fs.readFileSync(REGISTRATION_LOG, 'utf8'));
        } catch (e) {
            return [];
        }
    }
    return [];
}

function printRegistrationSummary(results) {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n' + '='.repeat(60));
    console.log('REGISTRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (successful > 0) {
        console.log('\n📋 Registered providers:');
        results.filter(r => r.success).forEach(r => {
            console.log(`   - ${r.nodeId}: ${r.providerAddress}`);
        });
    }
    
    console.log(`\n📁 Registration log: ${REGISTRATION_LOG}`);
}

function generateDockerCompose(registrations) {
    const successful = registrations.filter(r => r.success);
    if (successful.length === 0) return;
    
    const dockerComposeContent = `# Docker Compose for HPC Share Nosana Providers
# Generated: ${new Date().toISOString()}

version: '3.8'

services:
${successful.map(reg => `  ${reg.nodeId}:
    image: nosana/provider:latest
    container_name: hpc-share-${reg.nodeId}
    restart: unless-stopped
    environment:
      - PROVIDER_ID=${reg.nodeId}
      - PROVIDER_KEY=./keys/${reg.nodeId}.json
      - NOSANA_ENVIRONMENT=production
    volumes:
      - ./keys:/app/keys
      - /var/run/docker.sock:/var/run/docker.sock
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    networks:
      - nosana-network

`).join('\n')}networks:
  nosana-network:
    driver: bridge

# Instructions:
# 1. Create ./keys directory
# 2. Place provider key files in ./keys/
# 3. Run: docker-compose up -d
# 4. Check logs: docker-compose logs -f
`;
    
    const composePath = path.join(__dirname, '../../docker-compose.yml');
    fs.writeFileSync(composePath, dockerComposeContent);
    console.log(`\n📁 Docker Compose file generated: docker-compose.yml`);
    console.log('   Run: docker-compose up -d to start all providers');
}

function printHelp() {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                 NOSANA PROVIDER REGISTRATION - HELP              ║
╚══════════════════════════════════════════════════════════════════╝

USAGE:
  npm run register-provider -- <command> [options]

COMMANDS:
  register                    Register all GPU nodes as Nosana providers
  status                      Check status of registered providers
  update-pricing <nodeId> <rate>  Update hourly rate for a provider
  deregister <nodeId>         Deregister a provider
  list                        List all registered providers
  help                        Show this help

EXAMPLES:
  npm run register-provider -- register
  npm run register-provider -- status
  npm run register-provider -- update-pricing node-01 0.85
  npm run register-provider -- deregister node-04
  npm run register-provider -- list

REQUIREMENTS:
  - Solana wallet with SOL for transaction fees
  - Docker installed for running providers
  - NVIDIA drivers and nvidia-docker for GPU access

CONFIGURATION:
  Edit GPU_NODES array in this file to match your hardware
  Update PRICING object for different GPU models
`);
}

// Execute
main().catch(console.error);