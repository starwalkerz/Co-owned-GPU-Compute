// tests/HPCShare.test.js
// Unit tests for HPCShare SPV contract

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HPCSPV", function () {
  let spv;
  let mockToken;
  let owner;
  let treasury;
  let user1;
  
  const MANAGEMENT_FEE_BPS = 200; // 2%
  
  beforeEach(async function () {
    [owner, treasury, user1] = await ethers.getSigners();
    
    // Deploy mock token (simulating Brickken token)
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock Token", "MCK");
    await mockToken.deployed();
    
    // Deploy SPV
    const HPCSPV = await ethers.getContractFactory("HPCSPV");
    spv = await HPCSPV.deploy(mockToken.address, treasury.address);
    await spv.deployed();
  });
  
  describe("Deployment", function () {
    it("should set the correct Brickken token address", async function () {
      expect(await spv.brickkenToken()).to.equal(mockToken.address);
    });
    
    it("should set the correct treasury address", async function () {
      expect(await spv.treasury()).to.equal(treasury.address);
    });
    
    it("should have default management fee of 2%", async function () {
      expect(await spv.managementFeeBps()).to.equal(MANAGEMENT_FEE_BPS);
    });
  });
  
  describe("Distribution Trigger", function () {
    it("should allow treasury to trigger distribution", async function () {
      const amount = ethers.utils.parseEther("10000");
      
      await expect(spv.connect(treasury).triggerDistribution(amount))
        .to.emit(spv, "DistributionTriggered")
        .withArgs(amount - amount * MANAGEMENT_FEE_BPS / 10000, ethers.provider.blockNumber);
    });
    
    it("should not allow non-treasury to trigger distribution", async function () {
      const amount = ethers.utils.parseEther("10000");
      
      await expect(
        spv.connect(user1).triggerDistribution(amount)
      ).to.be.revertedWith("Only treasury");
    });
    
    it("should calculate management fee correctly", async function () {
      const amount = ethers.utils.parseEther("10000");
      const expectedFee = amount.mul(MANAGEMENT_FEE_BPS).div(10000);
      const expectedDistribution = amount.sub(expectedFee);
      
      const tx = await spv.connect(treasury).triggerDistribution(amount);
      const receipt = await tx.wait();
      
      const event = receipt.events.find(e => e.event === "DistributionTriggered");
      expect(event.args.amount).to.equal(expectedDistribution);
    });
  });
  
  describe("Management Fee Update", function () {
    it("should allow treasury to update management fee", async function () {
      const newFee = 300; // 3%
      await spv.connect(treasury).updateManagementFee(newFee);
      expect(await spv.managementFeeBps()).to.equal(newFee);
    });
    
    it("should not allow fee above 5%", async function () {
      await expect(
        spv.connect(treasury).updateManagementFee(600)
      ).to.be.revertedWith("Fee too high (max 5%)");
    });
  });
});

// Mock ERC-20 for testing
contract("MockERC20", [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address) view returns (uint256)"
]);