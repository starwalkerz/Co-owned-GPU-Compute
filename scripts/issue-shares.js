// scripts/issue-shares.js
// Issues HPC Share tokens to investors via Brickken

const { BrickkenClient } = require("../integrations/brickken/client");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("=".repeat(60));
  console.log("HPC SHARE - ISSUE SHARES");
  console.log("=".repeat(60));

  const brickken = new BrickkenClient();
  
  // Load investor list
  let investors;
  try {
    const investorsFile = fs.readFileSync("./config/investors.json", "utf8");
    investors = JSON.parse(investorsFile);
    console.log(`\n✅ Loaded ${investors.length} investors from config`);
  } catch (error) {
    console.log("⚠️ No investors.json found. Using demo data.");
    investors = getDemoInvestors();
  }
  
  console.log("\n📋 Processing investors...");
  console.log("-".repeat(40));
  
  const results = [];
  
  for (const investor of investors) {
    console.log(`\n👤 Processing: ${investor.name} (${investor.walletAddress})`);
    console.log(`   Shares: ${investor.shares} HPC`);
    console.log(`   Investment: €${investor.shares * 1.00}`);
    
    try {
      // Register investor in Brickken (if not already)
      let brickkenInvestor;
      try {
        brickkenInvestor = await brickken.getInvestor(investor.walletAddress);
        console.log(`   ✅ Already registered in Brickken`);
      } catch (error) {
        brickkenInvestor = await brickken.createInvestor({
          email: investor.email,
          legalName: investor.name,
          walletAddress: investor.walletAddress,
          jurisdiction: investor.jurisdiction || "ES",
          accreditedInvestor: investor.accreditedInvestor || false
        });
        console.log(`   ✅ Registered in Brickken: ${brickkenInvestor.id}`);
      }
      
      // Issue shares
      const issuance = await brickken.issueShares(investor.walletAddress, investor.shares);
      console.log(`   ✅ Issued ${investor.shares} HPC tokens`);
      console.log(`   TX: ${issuance.transactionHash}`);
      
      results.push({
        name: investor.name,
        walletAddress: investor.walletAddress,
        shares: investor.shares,
        success: true,
        transactionHash: issuance.transactionHash
      });
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      results.push({
        name: investor.name,
        walletAddress: investor.walletAddress,
        shares: investor.shares,
        success: false,
        error: error.message
      });
    }
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("ISSUANCE SUMMARY");
  console.log("=".repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalShares = successful.reduce((sum, r) => sum + r.shares, 0);
  
  console.log(`\n✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📊 Total shares issued: ${totalShares} HPC`);
  console.log(`💰 Total raised: €${totalShares * 1.00}`);
  
  // Save results
  fs.writeFileSync("./issuance-results.json", JSON.stringify(results, null, 2));
  console.log("\n📁 Results saved to: issuance-results.json");
}

function getDemoInvestors() {
  return [
    {
      name: "Demo Investor 1",
      email: "investor1@example.com",
      walletAddress: "0x0000000000000000000000000000000000000001",
      shares: 10000,
      jurisdiction: "ES",
      accreditedInvestor: true
    },
    {
      name: "Demo Investor 2",
      email: "investor2@example.com",
      walletAddress: "0x0000000000000000000000000000000000000002",
      shares: 5000,
      jurisdiction: "DE",
      accreditedInvestor: false
    }
  ];
}

main().catch(console.error);