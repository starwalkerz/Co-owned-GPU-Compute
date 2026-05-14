// scripts/deploy.js
// Deploys the HPCShare SPV contract (reference only; actual tokens via Brickken)

const { ethers } = require("hardhat");

async function main() {
  console.log("=".repeat(60));
  console.log("HPC SHARE - DEPLOYMENT");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("\n📋 Deployer:", deployer.address);

  // Note: Actual HPCShare tokens are deployed via Brickken platform
  // This contract is the SPV that receives revenue and triggers distributions
  
  console.log("\n📝 Deploying HPCSPV contract...");
  
  const brickkenTokenAddress = process.env.BRICKKEN_TOKEN_ADDRESS;
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  
  if (!brickkenTokenAddress || !treasuryAddress) {
    console.error("❌ Missing environment variables: BRICKKEN_TOKEN_ADDRESS, TREASURY_ADDRESS");
    process.exit(1);
  }
  
  const HPCSPV = await ethers.getContractFactory("HPCSPV");
  const spv = await HPCSPV.deploy(brickkenTokenAddress, treasuryAddress);
  await spv.deployed();
  
  console.log("✅ HPCSPV deployed to:", spv.address);
  
  // Save deployment info
  const fs = require("fs");
  const deployment = {
    network: network.name,
    deployer: deployer.address,
    spvContract: spv.address,
    brickkenToken: brickkenTokenAddress,
    treasury: treasuryAddress,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync("./deployment.json", JSON.stringify(deployment, null, 2));
  console.log("\n📁 Deployment info saved to: deployment.json");
  
  console.log("\n📝 Next steps:");
  console.log("   1. Configure Brickken token to use SPV contract for distributions");
  console.log("   2. Register GPU nodes as Nosana providers");
  console.log("   3. Issue shares to investors via Brickken");
}

main().catch(console.error);