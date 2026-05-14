# HPC Share - Troubleshooting Guide

## Common Issues and Solutions

### Wallet Connection Issues

**Problem:** "MetaMask not detected" or "Please install MetaMask"

**Solution:**
1. Install MetaMask from https://metamask.io
2. Refresh the page after installation
3. Ensure MetaMask is unlocked
4. Try a different browser (Chrome, Firefox, Brave)

**Problem:** "Wrong network" error

**Solution:**
1. Click the network dropdown in MetaMask
2. Select Polygon Mainnet (Chain ID: 137)
3. If not listed, add custom network:
   - Network Name: Polygon Mainnet
   - RPC URL: https://polygon-rpc.com
   - Chain ID: 137
   - Symbol: MATIC

### Brickken Integration Issues

**Problem:** "KYC required" error when investing

**Solution:**
1. Navigate to the Account tab in the Investor Portal
2. Click "Complete KYC on Brickken"
3. Follow Brickken's verification process
4. Wait for approval (typically 24-48 hours)
5. Return to the portal and refresh

**Problem:** "API key invalid" error in admin dashboard

**Solution:**
1. Log into Brickken dashboard
2. Navigate to Settings > API Keys
3. Generate a new API key and secret
4. Update .env file with new credentials
5. Restart the application

**Problem:** Token holders not showing in dashboard

**Solution:**
1. Click "Sync from Brickken" button in Investors tab
2. Check API connectivity: `node integrations/brickken/api-examples.js`
3. Verify token ID in .env file
4. Check Brickken API status at https://status.brickken.com

### Nosana Integration Issues

**Problem:** GPU node not appearing on Nosana

**Solution:**
1. Verify Docker is installed: `docker --version`
2. Check Nosana provider logs: `nosana provider logs`
3. Restart provider: `nosana provider restart`
4. Re-register node: `npm run register-provider`

**Problem:** No rewards being collected

**Solution:**
1. Check node status: `nosana provider status`
2. Verify node is accepting jobs
3. Check Nosana dashboard for job queue
4. Run reward collector manually: `npm run collect-rewards`

**Problem:** "Insufficient SOL" error on Solana

**Solution:**
1. Fund your Solana wallet with SOL for transaction fees
2. Minimum recommended: 0.05 SOL
3. Use Jupiter or exchange to acquire SOL

### Smart Contract Issues

**Problem:** Contract deployment failing

**Solution:**
1. Verify .env has correct PRIVATE_KEY
2. Ensure wallet has sufficient MATIC for gas
3. Check network RPC is responsive
4. Run `npx hardhat clean` then `npx hardhat compile`

**Problem:** Distribution transaction failing

**Solution:**
1. Verify treasury has sufficient USDC balance
2. Check Brickken token contract is approved
3. Ensure distribution amount is not zero
4. Check gas settings (increase if needed)

### Interface Issues

**Problem:** Dashboard not loading data

**Solution:**
1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Verify API endpoints are reachable
4. Clear browser cache and reload

**Problem:** Setup wizard not saving progress

**Solution:**
1. Check browser localStorage is enabled
2. Clear site data and restart wizard
3. Use a different browser
4. Manual configuration via .env file

### Distribution Issues

**Problem:** Investors not receiving distributions

**Solution:**
1. Verify distribution was triggered in admin dashboard
2. Check transaction status on block explorer
3. Confirm investor wallets are whitelisted on Brickken
4. Contact Brickken support for failed distributions

**Problem:** Distribution amount seems incorrect

**Solution:**
1. Review revenue calculation in config/revenue.json
2. Verify management fee is applied correctly
3. Check operating expenses deductions
4. Run `npm run distribute` with --dry-run flag

### Performance Issues

**Problem:** Slow dashboard loading

**Solution:**
1. Reduce number of displayed records
2. Use pagination for large datasets
3. Clear browser cache
4. Check network connection

**Problem:** High gas fees

**Solution:**
1. Deploy on Polygon instead of Ethereum mainnet
2. Wait for lower network congestion
3. Batch operations where possible
4. Use Layer 2 solutions (Base, Arbitrum)

### Security Issues

**Problem:** Suspicious wallet activity

**Solution:**
1. Revoke API keys immediately
2. Rotate all credentials
3. Check Brickken compliance dashboard
4. Contact support: security@hpcshare.io

**Problem:** Lost access to treasury wallet

**Solution:**
1. Use wallet recovery phrase if available
2. Contact wallet provider support
3. Multi-sig recovery if configured
4. Legal process for SPV recovery

### Getting Help

| Issue Type | Contact |
|------------|---------|
| Technical issues | GitHub Issues |
| API integration | Brickken/Nosana support |
| Smart contract | Security@hpcshare.io |
| General questions | Discord community |
| Urgent security | +34 900 123 456 |

### Diagnostic Commands

```bash
# Check environment configuration
node -e "console.log(require('dotenv').config())"

# Test Brickken connection
node integrations/brickken/api-examples.js

# Test Nosana connection
node integrations/nosana/provider-registration.js --test

# Check contract deployment status
npx hardhat run scripts/deploy.js --dry-run

# Simulate distribution
node scripts/distribute-dividends.js --dry-run

# View logs
tail -f logs/hpc-share.log