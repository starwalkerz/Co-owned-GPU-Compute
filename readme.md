markdown

# HPC Share — Shared GPU Cluster

## Co-own a GPU cluster. Earn passive yield from AI compute leases.

This SPV (Special Purpose Vehicle) owns and operates high-performance GPU hardware registered as providers on the Nosana decentralized compute network. Shares are tokenized as regulated security tokens via Brickken (CNMV-approved, $500M+ tokenized).

---

## How It Works

1. **Investors** complete KYC via Brickken and purchase HPC Share tokens
2. **SPV** owns and operates NVIDIA H200/A100 GPU cluster
3. **Nosana** matches AI inference jobs to available GPUs
4. **Revenue** collected in NOS tokens, converted to USDC
5. **Distributions** paid quarterly to token holders via Brickken

---

## Token Details

| Parameter | Value |
|-----------|-------|
| Token Standard | ERC-20 (via Brickken, ERC-7943 compliant) |
| Legal Status | Regulated security token (CNMV-approved) |
| Issuance Platform | Brickken |
| Underlying Asset | Proportional ownership of GPU cluster SPV |
| Distributions | Quarterly (USDC) |
| Secondary Market | Brickken P2P + potential future 21X listing |

---

## Quick Start

### Prerequisites

- Node.js v18+
- npm or yarn
- Brickken account (for token issuance)
- Nosana account (for compute registration)

### Installation

```bash
git clone https://github.com/your-org/hpc-share.git
cd hpc-share
npm install

Environment Setup
bash

cp .env.example .env
# Edit .env with your Brickken API key and Nosana credentials

Architecture
text

┌─────────────────────────────────────────────────────────────────┐
│                      PHYSICAL LAYER                             │
│  GPU Cluster (NVIDIA H200/A100) — owned by SPV                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NOSANA LAYER                               │
│  • Provider registration                                        │
│  • Job matching and execution                                   │
│  • NOS token rewards                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BRICKKEN LAYER                             │
│  • Regulated security token issuance                            │
│  • KYC/AML investor onboarding                                  │
│  • Cap table management                                         │
│  • Automated dividend distribution                              │
│  • P2P secondary market                                         │
└─────────────────────────────────────────────────────────────────┘

Key Parameters
Parameter	Value
Cluster size	4x NVIDIA H200 (expandable)
Total shares	1,000,000 HPC
Share price (initial)	€1.00 / HPC
SPV management fee	2% annually
Distribution frequency	Quarterly
Nosana provider fee	5% (market rate)
Legal Framework

    Issuance: Brickken (CNMV sandbox-approved)

    Token standard: ERC-20 (security token compliant)

    Investor eligibility: EU residents, accredited investors

    Tax treatment: Capital gains + dividend income (per local jurisdiction)

Roadmap
Phase	Timeline	Milestone
1	Q3 2026	Token issuance via Brickken
2	Q4 2026	First cluster online, Nosana registration
3	Q1 2027	First compute jobs, first distribution
4	Q2 2027	Secondary market listing
5	Q4 2027	Cluster expansion (additional GPUs)
Links

    Tokenization platform: Brickken

    Compute marketplace: Nosana

    DeFi collateral: Credefi (via Brickken integration)

License

MIT
Disclaimer

This is not financial advice. Tokens represent equity in a real SPV. Past performance does not guarantee future results. Always conduct your own research.