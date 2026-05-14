markdown

# Brickken Integration

## Overview

Brickken is the regulated tokenization platform for HPC Share. It handles:

- Security token issuance (ERC-20, CNMV-approved)
- Investor KYC/AML onboarding
- Cap table management
- Automated dividend distributions
- P2P secondary market

## Setup

1. Create a Brickken account at [brickken.com](https://brickken.com)
2. Complete corporate verification for the SPV
3. Request token issuance (ERC-20 security token)
4. Obtain API keys from Brickken dashboard

## Configuration

Add to your `.env` file:

```env
BRICKKEN_API_KEY=your_api_key
BRICKKEN_API_SECRET=your_api_secret
BRICKKEN_TOKEN_ID=your_hpc_share_token_id

API Methods
Investor Registration
javascript

await brickken.investors.create({
  email: "investor@example.com",
  legalName: "Maria Garcia",
  walletAddress: "0x...",
  jurisdiction: "ES"
});

Share Issuance
javascript

await brickken.securities.issue({
  tokenId: process.env.BRICKKEN_TOKEN_ID,
  to: "0x...",
  amount: 10000 // HPC tokens
});

Dividend Distribution
javascript

await brickken.distributions.create({
  tokenId: process.env.BRICKKEN_TOKEN_ID,
  amount: 50000, // USDC cents
  currency: "USDC"
});

Resources

    Brickken API Docs

    Brickken Sandbox

    ERC-7943 Standard

text


---

## File 5: `integrations/brickken/client.js`

```javascript
// integrations/brickken/client.js
// Brickken API client for tokenized security management

const axios = require('axios');
require('dotenv').config();

class BrickkenClient {
  constructor() {
    this.apiKey = process.env.BRICKKEN_API_KEY;
    this.apiSecret = process.env.BRICKKEN_API_SECRET;
    this.baseURL = process.env.BRICKKEN_ENV === 'production' 
      ? 'https://api.brickken.com/v1'
      : 'https://sandbox.brickken.com/v1';
    this.tokenId = process.env.BRICKKEN_TOKEN_ID;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-API-Key': this.apiKey,
        'X-API-Secret': this.apiSecret,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create a new investor after KYC completion
   */
  async createInvestor(investorData) {
    const response = await this.client.post('/investors', {
      email: investorData.email,
      legalName: investorData.legalName,
      walletAddress: investorData.walletAddress,
      jurisdiction: investorData.jurisdiction || 'ES',
      accreditedInvestor: investorData.accreditedInvestor || false,
      sourceOfFunds: investorData.sourceOfFunds || 'employment'
    });
    return response.data;
  }

  /**
   * Get investor by wallet address
   */
  async getInvestor(walletAddress) {
    const response = await this.client.get(`/investors/${walletAddress}`);
    return response.data;
  }

  /**
   * Issue shares to an investor
   */
  async issueShares(walletAddress, amount) {
    const response = await this.client.post('/securities/issue', {
      tokenId: this.tokenId,
      to: walletAddress,
      amount: amount,
      reason: 'Initial offering'
    });
    return response.data;
  }

  /**
   * Get token holders (cap table)
   */
  async getTokenHolders() {
    const response = await this.client.get(`/securities/${this.tokenId}/holders`);
    return response.data.holders;
  }

  /**
   * Get total supply of shares
   */
  async getTotalSupply() {
    const response = await this.client.get(`/securities/${this.tokenId}/supply`);
    return response.data.totalSupply;
  }

  /**
   * Distribute dividends to all token holders
   */
  async distributeDividends(amountUSDC, metadata = {}) {
    const response = await this.client.post('/distributions', {
      tokenId: this.tokenId,
      amount: amountUSDC,
      currency: 'USDC',
      metadata: {
        period: metadata.period,
        source: 'Nosana compute leases',
        ...metadata
      }
    });
    return response.data;
  }

  /**
   * Get distribution history
   */
  async getDistributionHistory() {
    const response = await this.client.get(`/securities/${this.tokenId}/distributions`);
    return response.data.distributions;
  }

  /**
   * Create a secondary market offer (P2P)
   */
  async createOffer(walletAddress, amount, pricePerToken) {
    const response = await this.client.post('/market/offers', {
      tokenId: this.tokenId,
      seller: walletAddress,
      amount: amount,
      pricePerToken: pricePerToken,
      currency: 'USDC'
    });
    return response.data;
  }

  /**
   * Get active offers on secondary market
   */
  async getActiveOffers() {
    const response = await this.client.get(`/market/${this.tokenId}/offers`);
    return response.data.offers;
  }

  /**
   * Generate compliance report for investor
   */
  async generateComplianceReport(walletAddress, startDate, endDate) {
    const response = await this.client.post(`/compliance/reports/${walletAddress}`, {
      startDate: startDate,
      endDate: endDate,
      format: 'pdf'
    });
    return response.data.reportUrl;
  }
}

module.exports = { BrickkenClient };