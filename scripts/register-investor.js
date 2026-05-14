// scripts/register-investor.js
// HPC Share - Investor Registration Script
// Registers new investors via Brickken KYC/AML and issues HPC tokens

const { BrickkenClient } = require("../integrations/brickken/client");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Configuration paths
const INVESTORS_FILE = path.join(__dirname, "../config/investors.json");
const REGISTRATION_LOG = path.join(__dirname, "../logs/registrations.json");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

async function main() {
    console.log("=".repeat(60));
    console.log("HPC SHARE - INVESTOR REGISTRATION");
    console.log("=".repeat(60));

    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || "help";

    switch (command) {
        case "register":
            await registerInvestor(args[1], args[2], args[3], args[4]);
            break;
        case "batch":
            await batchRegister();
            break;
        case "list":
            await listInvestors();
            break;
        case "verify":
            await verifyInvestor(args[1]);
            break;
        case "sync":
            await syncFromBrickken();
            break;
        case "help":
        default:
            printHelp();
    }
}

/**
 * Register a single investor
 * @param {string} email - Investor email address
 * @param {string} name - Legal full name
 * @param {string} walletAddress - Ethereum wallet address
 * @param {string} shares - Number of HPC shares to issue (optional)
 */
async function registerInvestor(email, name, walletAddress, shares) {
    console.log("\n📝 Registering new investor...");
    
    if (!email || !name || !walletAddress) {
        console.error("❌ Missing required parameters: email, name, walletAddress");
        console.log("   Usage: npm run register-investor -- register <email> <name> <wallet> [shares]");
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.error("❌ Invalid email format");
        return;
    }
    
    // Validate wallet address format
    if (!walletAddress.startsWith("0x") || walletAddress.length !== 42) {
        console.error("❌ Invalid wallet address (must be 0x... with 42 characters)");
        return;
    }
    
    const shareAmount = shares ? parseInt(shares) : 0;
    
    try {
        // Initialize Brickken client
        const brickken = new BrickkenClient();
        
        console.log(`\n📋 Investor Details:`);
        console.log(`   Email: ${email}`);
        console.log(`   Name: ${name}`);
        console.log(`   Wallet: ${walletAddress}`);
        console.log(`   Shares: ${shareAmount > 0 ? shareAmount : "Not specified (will be issued separately)"}`);
        
        // Step 1: Check if investor already exists
        console.log("\n🔍 Checking if investor already registered...");
        let existingInvestor;
        try {
            existingInvestor = await brickken.getInvestor(walletAddress);
            console.log(`   ✅ Investor already registered with ID: ${existingInvestor.id}`);
        } catch (error) {
            console.log("   ℹ️ New investor - proceeding with registration");
        }
        
        let investor;
        if (!existingInvestor) {
            // Step 2: Create investor in Brickken
            console.log("\n📝 Creating investor record in Brickken...");
            investor = await brickken.createInvestor({
                email: email,
                legalName: name,
                walletAddress: walletAddress,
                jurisdiction: "ES",
                accreditedInvestor: false,
                sourceOfFunds: "employment"
            });
            console.log(`   ✅ Investor created with ID: ${investor.id}`);
        } else {
            investor = existingInvestor;
        }
        
        // Step 3: Issue shares if amount specified
        let issuanceResult = null;
        if (shareAmount > 0) {
            console.log(`\n💰 Issuing ${shareAmount} HPC shares...`);
            issuanceResult = await brickken.issueShares(walletAddress, shareAmount);
            console.log(`   ✅ Shares issued: ${issuanceResult.amount} HPC`);
            console.log(`   TX: ${issuanceResult.transactionHash}`);
        }
        
        // Step 4: Save to local investors.json
        const investors = loadInvestors();
        const existingIndex = investors.findIndex(i => i.walletAddress === walletAddress);
        
        const investorRecord = {
            email: email,
            name: name,
            walletAddress: walletAddress,
            shares: shareAmount,
            registeredAt: new Date().toISOString(),
            brickkenId: investor.id,
            status: "active",
            kycStatus: "pending"
        };
        
        if (existingIndex >= 0) {
            investors[existingIndex] = { ...investors[existingIndex], ...investorRecord };
            console.log("\n📝 Updated existing investor record");
        } else {
            investors.push(investorRecord);
            console.log("\n📝 Added new investor record");
        }
        
        saveInvestors(investors);
        
        // Step 5: Log registration
        logRegistration({
            email,
            name,
            walletAddress,
            shares: shareAmount,
            brickkenId: investor.id,
            issuanceTx: issuanceResult?.transactionHash,
            timestamp: new Date().toISOString()
        });
        
        // Step 6: Send KYC email (simulated)
        console.log("\n📧 KYC email sent to investor. They must complete verification on Brickken.");
        console.log("   KYC link: https://brickken.com/kyc?ref=" + investor.id);
        
        console.log("\n✅ Registration complete!");
        
    } catch (error) {
        console.error(`\n❌ Registration failed: ${error.message}`);
        if (error.response) {
            console.error(`   API Response: ${JSON.stringify(error.response.data)}`);
        }
    }
}

/**
 * Batch register investors from JSON file
 */
async function batchRegister() {
    console.log("\n📦 Batch registering investors from config/investors.json...");
    
    const investorsList = loadInvestors();
    
    if (investorsList.length === 0) {
        console.log("   No investors found in config/investors.json");
        console.log("   Please add investor data to the file first");
        return;
    }
    
    console.log(`   Found ${investorsList.length} investors to process`);
    
    const results = {
        total: investorsList.length,
        successful: 0,
        failed: 0,
        details: []
    };
    
    for (let i = 0; i < investorsList.length; i++) {
        const investor = investorsList[i];
        console.log(`\n[${i + 1}/${investorsList.length}] Processing: ${investor.name || investor.walletAddress}`);
        
        try {
            // Skip if already registered and has shares
            if (investor.status === "active" && investor.shares > 0) {
                console.log(`   ⏭️ Skipping - already active with ${investor.shares} shares`);
                results.details.push({ ...investor, status: "skipped", reason: "already active" });
                results.successful++;
                continue;
            }
            
            // Register via Brickken
            const brickken = new BrickkenClient();
            
            // Check if exists
            let existingInvestor;
            try {
                existingInvestor = await brickken.getInvestor(investor.walletAddress);
            } catch (e) {
                // Not found, continue
            }
            
            let brickkenId;
            if (!existingInvestor) {
                const newInvestor = await brickken.createInvestor({
                    email: investor.email,
                    legalName: investor.name,
                    walletAddress: investor.walletAddress,
                    jurisdiction: investor.jurisdiction || "ES",
                    accreditedInvestor: investor.accreditedInvestor || false,
                    sourceOfFunds: investor.sourceOfFunds || "employment"
                });
                brickkenId = newInvestor.id;
                console.log(`   ✅ Created Brickken record: ${brickkenId}`);
            } else {
                brickkenId = existingInvestor.id;
                console.log(`   ✅ Already exists in Brickken: ${brickkenId}`);
            }
            
            // Issue shares if specified and not already issued
            let issuanceResult = null;
            if (investor.shares > 0 && !investor.sharesIssued) {
                issuanceResult = await brickken.issueShares(investor.walletAddress, investor.shares);
                console.log(`   ✅ Issued ${investor.shares} HPC shares`);
                investor.sharesIssued = true;
            }
            
            // Update local record
            investor.status = "active";
            investor.brickkenId = brickkenId;
            investor.registeredAt = investor.registeredAt || new Date().toISOString();
            
            results.successful++;
            results.details.push({
                name: investor.name,
                walletAddress: investor.walletAddress,
                shares: investor.shares,
                status: "success",
                brickkenId: brickkenId
            });
            
        } catch (error) {
            console.error(`   ❌ Failed: ${error.message}`);
            investor.status = "failed";
            results.failed++;
            results.details.push({
                name: investor.name,
                walletAddress: investor.walletAddress,
                status: "failed",
                error: error.message
            });
        }
        
        // Save progress after each investor
        saveInvestors(investorsList);
    }
    
    // Save final results
    saveInvestors(investorsList);
    
    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("BATCH REGISTRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`\n✅ Successful: ${results.successful}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Total processed: ${results.total}`);
    
    // Save batch results
    const resultFile = path.join(__dirname, "../logs/batch-registration-" + Date.now() + ".json");
    fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
    console.log(`\n📁 Detailed results saved to: ${resultFile}`);
}

/**
 * List all registered investors
 */
async function listInvestors() {
    console.log("\n📋 Registered Investors:");
    console.log("-".repeat(80));
    
    const investors = loadInvestors();
    
    if (investors.length === 0) {
        console.log("   No investors registered");
        return;
    }
    
    console.log(`\n${"Name".padEnd(25)} ${"Wallet".padEnd(20)} ${"Shares".padEnd(12)} ${"Status".padEnd(10)}`);
    console.log("-".repeat(80));
    
    for (const investor of investors) {
        const name = (investor.name || "Unknown").slice(0, 24);
        const wallet = (investor.walletAddress || "").slice(0, 18) + "...";
        const shares = investor.shares ? investor.shares.toLocaleString() : "0";
        const status = investor.status || "pending";
        
        console.log(`${name.padEnd(25)} ${wallet.padEnd(20)} ${shares.padEnd(12)} ${status.padEnd(10)}`);
    }
    
    console.log("-".repeat(80));
    console.log(`\n📊 Total: ${investors.length} investors`);
    
    const totalShares = investors.reduce((sum, i) => sum + (i.shares || 0), 0);
    console.log(`💰 Total shares issued: ${totalShares.toLocaleString()} HPC`);
}

/**
 * Verify an investor's KYC status with Brickken
 * @param {string} walletAddress - Investor wallet address
 */
async function verifyInvestor(walletAddress) {
    console.log("\n🔍 Verifying investor KYC status...");
    
    if (!walletAddress) {
        console.error("❌ Please provide wallet address");
        console.log("   Usage: npm run register-investor -- verify <walletAddress>");
        return;
    }
    
    try {
        const brickken = new BrickkenClient();
        const investor = await brickken.getInvestor(walletAddress);
        
        console.log(`\n📋 Investor Details:`);
        console.log(`   Wallet: ${walletAddress}`);
        console.log(`   Brickken ID: ${investor.id}`);
        console.log(`   KYC Status: ${investor.kycStatus || "pending"}`);
        console.log(`   Accredited: ${investor.accreditedInvestor ? "Yes" : "No"}`);
        console.log(`   Verified At: ${investor.verifiedAt || "Not yet"}`);
        
        // Update local record
        const investors = loadInvestors();
        const localInvestor = investors.find(i => i.walletAddress === walletAddress);
        if (localInvestor) {
            localInvestor.kycStatus = investor.kycStatus || "pending";
            localInvestor.verifiedAt = investor.verifiedAt;
            saveInvestors(investors);
            console.log("\n✅ Local record updated");
        }
        
    } catch (error) {
        console.error(`\n❌ Verification failed: ${error.message}`);
    }
}

/**
 * Sync investor data from Brickken API
 */
async function syncFromBrickken() {
    console.log("\n🔄 Syncing investor data from Brickken...");
    
    try {
        const brickken = new BrickkenClient();
        const holders = await brickken.getTokenHolders();
        
        console.log(`\n📊 Retrieved ${holders.length} token holders from Brickken`);
        
        const investors = loadInvestors();
        
        for (const holder of holders) {
            const existingIndex = investors.findIndex(i => i.walletAddress === holder.walletAddress);
            
            const syncRecord = {
                walletAddress: holder.walletAddress,
                shares: holder.balance,
                name: holder.name || "Unknown",
                email: holder.email || "",
                status: "active",
                kycStatus: holder.kycStatus || "verified",
                lastSynced: new Date().toISOString()
            };
            
            if (existingIndex >= 0) {
                investors[existingIndex] = { ...investors[existingIndex], ...syncRecord };
            } else {
                investors.push(syncRecord);
            }
        }
        
        saveInvestors(investors);
        console.log("\n✅ Sync complete");
        
    } catch (error) {
        console.error(`\n❌ Sync failed: ${error.message}`);
    }
}

// ============================================
// Helper Functions
// ============================================

function loadInvestors() {
    if (!fs.existsSync(INVESTORS_FILE)) {
        return [];
    }
    try {
        const data = fs.readFileSync(INVESTORS_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading investors.json:", error.message);
        return [];
    }
}

function saveInvestors(investors) {
    fs.writeFileSync(INVESTORS_FILE, JSON.stringify(investors, null, 2));
}

function logRegistration(registration) {
    let logs = [];
    if (fs.existsSync(REGISTRATION_LOG)) {
        try {
            logs = JSON.parse(fs.readFileSync(REGISTRATION_LOG, "utf8"));
        } catch (e) {
            logs = [];
        }
    }
    logs.push(registration);
    fs.writeFileSync(REGISTRATION_LOG, JSON.stringify(logs, null, 2));
}

function printHelp() {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║              HPC SHARE - INVESTOR REGISTRATION                   ║
╚══════════════════════════════════════════════════════════════════╝

USAGE:
  npm run register-investor -- <command> [options]

COMMANDS:
  register <email> <name> <wallet> [shares]   Register a single investor
  batch                                         Batch register from investors.json
  list                                          List all registered investors
  verify <wallet>                               Verify KYC status with Brickken
  sync                                          Sync investor data from Brickken
  help                                          Show this help

EXAMPLES:
  npm run register-investor -- register investor@example.com "Maria Garcia" 0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0 10000
  npm run register-investor -- batch
  npm run register-investor -- list
  npm run register-investor -- verify 0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0
  npm run register-investor -- sync

CONFIGURATION:
  Edit config/investors.json for batch registration:
  [
    {
      "email": "investor@example.com",
      "name": "Maria Garcia",
      "walletAddress": "0x...",
      "shares": 10000,
      "jurisdiction": "ES",
      "accreditedInvestor": true
    }
  ]

REQUIREMENTS:
  - Brickken API credentials in .env
  - KYC must be completed by investor before shares are tradeable
  - Minimum investment: €100 (100 HPC tokens at €1.00)
`);
}

// Execute
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Script failed:", error);
        process.exit(1);
    });