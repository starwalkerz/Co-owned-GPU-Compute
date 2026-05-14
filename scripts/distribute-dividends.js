// scripts/distribute-dividends.js
// Distributes quarterly dividends to HPC Share token holders via Brickken

const { BrickkenClient } = require("../integrations/brickken/client");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("=".repeat(60));
  console.log("HPC SHARE - DIVIDEND DISTRIBUTION");
  console.log("=".repeat(60));

  const brickken = new BrickkenClient();
  
  // Load revenue data from Nosana rewards
  let revenueData;
  try {
    const revenueFile = fs.readFileSync("./config/revenue.json", "utf8");
    revenueData = JSON.parse(revenueFile);
    console.log(`\n✅ Loaded revenue data from config`);
  } catch (error) {
    console.log("⚠️ No revenue.json found. Using demo data.");
    revenueData = getDemoRevenue();
  }
  
  console.log(`\n💰 Revenue this quarter:`);
  console.log(`   NOS collected: ${revenueData.nosAmount}`);
  console.log(`   USDC after swap: $${revenueData.usdcAmount}`);
  console.log(`   Operating expenses: $${revenueData.operatingExpenses}`);
  console.log(`   Management fee (2%): $${revenueData.managementFee}`);
  console.log(`   Net distribution: $${revenueData.netDistribution}`);
  
  console.log("\n📊 Fetching token holders...");
  const holders = await brickken.getTokenHolders();
  console.log(`   Total holders: ${holders.length}`);
  console.log(`   Total supply: ${holders.reduce((sum, h) => sum + h.balance, 0)} HPC`);
  
  console.log("\n📝 Distributing dividends...");
  
  const distribution = await brickken.distributeDividends(
    revenueData.netDistribution,
    {
      period: revenueData.period,
      source: "Nosana compute leases",
      nosCollected: revenueData.nosAmount,
      operatingExpenses: revenueData.operatingExpenses
    }
  );
  
  console.log(`\n✅ Distribution complete:`);
  console.log(`   Distribution ID: ${distribution.id}`);
  console.log(`   Amount: $${distribution.amount} USDC`);
  console.log(`   Holders: ${distribution.recipientCount}`);
  console.log(`   TX: ${distribution.transactionHash}`);
  
  // Save distribution record
  const distributionRecord = {
    timestamp: new Date().toISOString(),
    period: revenueData.period,
    totalUSDC: revenueData.netDistribution,
    holderCount: holders.length,
    transactionHash: distribution.transactionHash,
    details: revenueData
  };
  
  const history = fs.existsSync("./distribution-history.json") 
    ? JSON.parse(fs.readFileSync("./distribution-history.json", "utf8"))
    : [];
  history.push(distributionRecord);
  fs.writeFileSync("./distribution-history.json", JSON.stringify(history, null, 2));
  
  console.log("\n📁 Distribution history saved to: distribution-history.json");
}

function getDemoRevenue() {
  return {
    period: "Q1 2027",
    nosAmount: 12500,
    usdcAmount: 11875, // After swap (5% slippage/fees)
    operatingExpenses: 2000, // Electricity, hosting, maintenance
    managementFee: 198, // 2% of (11875 - 2000)
    netDistribution: 9677
  };
}

main().catch(console.error);