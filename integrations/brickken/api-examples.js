// integrations/brickken/api-examples.js
// HPC Share - Brickken API Examples
// Demonstrates all major Brickken API operations

require('dotenv').config();

// Simulated API responses (replace with actual Brickken API calls in production)
// Base URL: https://api.brickken.com/v1
// API Key and Secret required in .env

const BRICKKEN_API_BASE = process.env.BRICKKEN_API_BASE || 'https://api.brickken.com/v1';
const BRICKKEN_API_KEY = process.env.BRICKKEN_API_KEY;
const BRICKKEN_API_SECRET = process.env.BRICKKEN_API_SECRET;
const BRICKKEN_TOKEN_ID = process.env.BRICKKEN_TOKEN_ID;

console.log('='.repeat(60));
console.log('BRICKKEN API EXAMPLES');
console.log('='.repeat(60));

// ============================================
// Example 1: Create Investor (KYC)
// ============================================

async function exampleCreateInvestor() {
    console.log('\n📝 Example 1: Create Investor');
    console.log('-'.repeat(40));
    
    const investorData = {
        email: "investor@example.com",
        legalName: "Maria Garcia Lopez",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0",
        jurisdiction: "ES",
        accreditedInvestor: false,
        sourceOfFunds: "employment"
    };
    
    console.log('Request:', JSON.stringify(investorData, null, 2));
    
    // In production, call Brickken API:
    // const response = await axios.post(`${BRICKKEN_API_BASE}/investors`, investorData, {
    //     headers: { 'X-API-Key': BRICKKEN_API_KEY, 'X-API-Secret': BRICKKEN_API_SECRET }
    // });
    
    // Simulated response
    const simulatedResponse = {
        id: "inv_123456",
        email: "investor@example.com",
        legalName: "Maria Garcia Lopez",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0",
        kycStatus: "pending",
        createdAt: "2027-01-15T10:30:00Z",
        jurisdiction: "ES",
        accreditedInvestor: false
    };
    
    console.log('Response:', JSON.stringify(simulatedResponse, null, 2));
    return simulatedResponse;
}

// ============================================
// Example 2: Get Investor by Wallet
// ============================================

async function exampleGetInvestor() {
    console.log('\n📝 Example 2: Get Investor');
    console.log('-'.repeat(40));
    
    const walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0";
    
    console.log('Request: GET /investors/' + walletAddress);
    
    // Simulated response
    const simulatedResponse = {
        id: "inv_123456",
        email: "investor@example.com",
        legalName: "Maria Garcia Lopez",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0",
        kycStatus: "approved",
        verifiedAt: "2027-01-16T14:20:00Z",
        jurisdiction: "ES",
        accreditedInvestor: false
    };
    
    console.log('Response:', JSON.stringify(simulatedResponse, null, 2));
    return simulatedResponse;
}

// ============================================
// Example 3: Issue Security Tokens
// ============================================

async function exampleIssueShares() {
    console.log('\n📝 Example 3: Issue Security Tokens');
    console.log('-'.repeat(40));
    
    const issuanceRequest = {
        tokenId: BRICKKEN_TOKEN_ID || "hpc-token-001",
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0",
        amount: 10000,
        reason: "Initial offering - Q1 2027"
    };
    
    console.log('Request:', JSON.stringify(issuanceRequest, null, 2));
    
    // Simulated response
    const simulatedResponse = {
        transactionId: "tx_789012",
        tokenId: "hpc-token-001",
        to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0",
        amount: 10000,
        transactionHash: "0xabc123def456789...",
        status: "completed",
        timestamp: "2027-01-20T09:15:00Z"
    };
    
    console.log('Response:', JSON.stringify(simulatedResponse, null, 2));
    return simulatedResponse;
}

// ============================================
// Example 4: Get Token Holders (Cap Table)
// ============================================

async function exampleGetTokenHolders() {
    console.log('\n📝 Example 4: Get Token Holders');
    console.log('-'.repeat(40));
    
    const tokenId = BRICKKEN_TOKEN_ID || "hpc-token-001";
    
    console.log('Request: GET /securities/' + tokenId + '/holders');
    
    // Simulated response
    const simulatedResponse = {
        tokenId: "hpc-token-001",
        totalSupply: 1000000,
        holderCount: 47,
        holders: [
            {
                rank: 1,
                walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0",
                name: "Maria Garcia Lopez",
                balance: 10000,
                percentage: 1.00,
                lastActivity: "2027-01-20T09:15:00Z"
            },
            {
                rank: 2,
                walletAddress: "0x8ba1f109551bD432803012645Ac136ddd64DBa72",
                name: "Lukas Weber",
                balance: 5000,
                percentage: 0.50,
                lastActivity: "2027-01-21T11:30:00Z"
            }
        ]
    };
    
    console.log('Response:', JSON.stringify(simulatedResponse, null, 2));
    return simulatedResponse;
}

// ============================================
// Example 5: Distribute Dividends
// ============================================

async function exampleDistributeDividends() {
    console.log('\n📝 Example 5: Distribute Dividends');
    console.log('-'.repeat(40));
    
    const distributionRequest = {
        tokenId: BRICKKEN_TOKEN_ID || "hpc-token-001",
        amount: 9677,
        currency: "USDC",
        metadata: {
            period: "Q1 2027",
            source: "Nosana compute leases",
            nosCollected: 12500,
            operatingExpenses: 2000,
            managementFee: 198,
            exchangeRate: 0.95
        }
    };
    
    console.log('Request:', JSON.stringify(distributionRequest, null, 2));
    
    // Simulated response
    const simulatedResponse = {
        distributionId: "dist_456789",
        tokenId: "hpc-token-001",
        amount: 9677,
        currency: "USDC",
        recipientCount: 47,
        transactionHash: "0xdef456ghi789...",
        status: "completed",
        timestamp: "2027-04-15T00:00:00Z"
    };
    
    console.log('Response:', JSON.stringify(simulatedResponse, null, 2));
    return simulatedResponse;
}

// ============================================
// Example 6: Get Distribution History
// ============================================

async function exampleGetDistributionHistory() {
    console.log('\n📝 Example 6: Get Distribution History');
    console.log('-'.repeat(40));
    
    const tokenId = BRICKKEN_TOKEN_ID || "hpc-token-001";
    
    console.log('Request: GET /securities/' + tokenId + '/distributions');
    
    // Simulated response
    const simulatedResponse = {
        tokenId: "hpc-token-001",
        distributions: [
            {
                distributionId: "dist_456789",
                amount: 9677,
                currency: "USDC",
                perToken: 0.009677,
                date: "2027-04-15T00:00:00Z",
                status: "completed"
            },
            {
                distributionId: "dist_456788",
                amount: 8450,
                currency: "USDC",
                perToken: 0.008450,
                date: "2027-01-15T00:00:00Z",
                status: "completed"
            }
        ]
    };
    
    console.log('Response:', JSON.stringify(simulatedResponse, null, 2));
    return simulatedResponse;
}

// ============================================
// Example 7: Create P2P Market Offer
// ============================================

async function exampleCreateMarketOffer() {
    console.log('\n📝 Example 7: Create P2P Market Offer');
    console.log('-'.repeat(40));
    
    const offerRequest = {
        tokenId: BRICKKEN_TOKEN_ID || "hpc-token-001",
        seller: "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0",
        amount: 1000,
        pricePerToken: 1.05,
        currency: "USDC"
    };
    
    console.log('Request:', JSON.stringify(offerRequest, null, 2));
    
    // Simulated response
    const simulatedResponse = {
        offerId: "offer_123456",
        tokenId: "hpc-token-001",
        seller: "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0",
        amount: 1000,
        pricePerToken: 1.05,
        currency: "USDC",
        status: "active",
        createdAt: "2027-04-20T10:00:00Z"
    };
    
    console.log('Response:', JSON.stringify(simulatedResponse, null, 2));
    return simulatedResponse;
}

// ============================================
// Example 8: Generate Compliance Report
// ============================================

async function exampleGenerateComplianceReport() {
    console.log('\n📝 Example 8: Generate Compliance Report');
    console.log('-'.repeat(40));
    
    const reportRequest = {
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0",
        startDate: "2027-01-01",
        endDate: "2027-12-31",
        format: "pdf"
    };
    
    console.log('Request:', JSON.stringify(reportRequest, null, 2));
    
    // Simulated response
    const simulatedResponse = {
        reportId: "report_789012",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0",
        reportUrl: "https://brickken.com/reports/789012.pdf",
        generatedAt: "2027-04-20T11:00:00Z",
        expiresAt: "2028-04-20T11:00:00Z"
    };
    
    console.log('Response:', JSON.stringify(simulatedResponse, null, 2));
    return simulatedResponse;
}

// ============================================
// Example 9: Get Token Supply
// ============================================

async function exampleGetTokenSupply() {
    console.log('\n📝 Example 9: Get Token Supply');
    console.log('-'.repeat(40));
    
    const tokenId = BRICKKEN_TOKEN_ID || "hpc-token-001";
    
    console.log('Request: GET /securities/' + tokenId + '/supply');
    
    // Simulated response
    const simulatedResponse = {
        tokenId: "hpc-token-001",
        totalSupply: 1000000,
        circulatingSupply: 850000,
        treasuryReserve: 150000,
        decimals: 18,
        lastUpdated: "2027-04-20T12:00:00Z"
    };
    
    console.log('Response:', JSON.stringify(simulatedResponse, null, 2));
    return simulatedResponse;
}

// ============================================
// Example 10: Check Investor KYC Status
// ============================================

async function exampleCheckKYCStatus() {
    console.log('\n📝 Example 10: Check Investor KYC Status');
    console.log('-'.repeat(40));
    
    const walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0";
    
    console.log('Request: GET /investors/' + walletAddress + '/kyc');
    
    // Simulated response
    const simulatedResponse = {
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0",
        kycStatus: "approved",
        verificationLevel: 2,
        verifiedAt: "2027-01-16T14:20:00Z",
        documents: [
            { type: "passport", status: "approved", submittedAt: "2027-01-15T10:35:00Z" },
            { type: "proof_of_address", status: "approved", submittedAt: "2027-01-15T10:40:00Z" }
        ],
        accreditedInvestor: false,
        sanctionsScreening: "passed"
    };
    
    console.log('Response:', JSON.stringify(simulatedResponse, null, 2));
    return simulatedResponse;
}

// ============================================
// Run all examples
// ============================================

async function runAllExamples() {
    console.log('\n🚀 Running Brickken API Examples...\n');
    
    await exampleCreateInvestor();
    await exampleGetInvestor();
    await exampleIssueShares();
    await exampleGetTokenHolders();
    await exampleDistributeDividends();
    await exampleGetDistributionHistory();
    await exampleCreateMarketOffer();
    await exampleGenerateComplianceReport();
    await exampleGetTokenSupply();
    await exampleCheckKYCStatus();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All examples completed');
    console.log('='.repeat(60));
    console.log('\n⚠️ Note: These are simulated responses.');
    console.log('   Replace with actual Brickken API calls in production.');
    console.log('   API Key required in .env: BRICKKEN_API_KEY, BRICKKEN_API_SECRET');
}

// Run if called directly
if (require.main === module) {
    runAllExamples().catch(console.error);
}

module.exports = {
    exampleCreateInvestor,
    exampleGetInvestor,
    exampleIssueShares,
    exampleGetTokenHolders,
    exampleDistributeDividends,
    exampleGetDistributionHistory,
    exampleCreateMarketOffer,
    exampleGenerateComplianceReport,
    exampleGetTokenSupply,
    exampleCheckKYCStatus,
    runAllExamples
};