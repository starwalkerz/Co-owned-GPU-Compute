markdown

# HPC Share - API Reference

## Brickken API

Base URL: `https://api.brickken.com/v1`

Authentication: API Key + Secret

### Get Token Holders

GET /securities/{tokenId}/holders
text


Returns list of all token holders with balances.

Response:
```json
{
  "holders": [
    {
      "walletAddress": "0x...",
      "balance": 10000,
      "percentage": 1.0
    }
  ]
}

Issue Shares
text

POST /securities/issue

Body:
json

{
  "tokenId": "hpc-token-id",
  "to": "0x...",
  "amount": 1000,
  "reason": "Initial offering"
}

Distribute Dividends
text

POST /distributions

Body:
json

{
  "tokenId": "hpc-token-id",
  "amount": 50000,
  "currency": "USDC",
  "metadata": {
    "period": "Q1 2027",
    "source": "Nosana compute leases"
  }
}

Nosana API

Base URL: https://api.nosana.io/v1

Authentication: API Key
Register Provider
text

POST /providers/register

Body:
json

{
  "nodeId": "node-01",
  "gpu": "NVIDIA H200",
  "location": "Madrid, ES",
  "hourlyRate": 0.50
}

Get Provider Status
text

GET /providers/{providerId}/status

Claim Rewards
text

POST /rewards/claim

Jupiter API (NOS to USDC Swaps)

Base URL: https://quote-api.jup.ag/v6
Get Quote
text

GET /quote?inputMint=NOS&outputMint=USDC&amount={amount}

Execute Swap
text

POST /swap

Body:
json

{
  "quoteResponse": {...},
  "userPublicKey": "0x...",
  "wrapAndUnwrapSol": true
}

Local API (Interface)

The interface exposes a local API for admin operations:
Get Cluster Status
text

GET /api/cluster/status

Get Revenue Summary
text

GET /api/revenue/summary

Trigger Distribution (Admin only)
text

POST /api/distributions/trigger

Body:
json

{
  "amount": 50000,
  "period": "Q1 2027"
}

text


---

## Complete HPC Share Repository Summary

| File | Purpose |
|------|---------|
| `interface/index.html` | Landing page |
| `interface/admin.html` | Admin dashboard |
| `interface/user.html` | Investor portal |
| `interface/setup.html` | Setup wizard |
| `interface/css/styles.css` | Stylesheet |
| `interface/js/api.js` | API client |
| `interface/js/admin.js` | Admin logic |
| `interface/js/user.js` | User logic |
| `interface/js/setup.js` | Setup wizard logic |
| `install.sh` | Linux/macOS installer |
| `install.bat` | Windows installer |
| `requirements.txt` | System requirements |
| `docs/admin-guide.md` | Admin documentation |
| `docs/user-guide.md` | User documentation |
| `docs/api-reference.md` | API reference |
| `docs/troubleshooting.md` | Troubleshooting guide |

**The HPC Share repository is now complete with setup wizard, installation scripts, and full documentation.**