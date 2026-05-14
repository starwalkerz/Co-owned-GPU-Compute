# HPC Share - Admin Guide

## Overview

This guide is for SPV administrators who manage the GPU cluster, token issuance, and distributions.

## Accessing the Admin Dashboard

1. Navigate to `admin.html` in the interface directory
2. Connect your treasury wallet (MetaMask)
3. Ensure you're on the correct network (Polygon recommended)

## Dashboard Sections

### Overview Tab

| Metric | Description |
|--------|-------------|
| Total HPC Issued | Number of tokens in circulation |
| Total Holders | Number of unique token holders |
| GPU Utilization | Percentage of compute capacity used |
| Treasury Balance | USDC available for distribution |

### Investor Management

- View all token holders and balances
- Sync data from Brickken API
- Register new investors manually
- Issue HPC tokens to investors

### Compute Nodes

- Monitor GPU node status and utilization
- View job completion history
- Register new GPU nodes on Nosana
- Update pricing and availability

### Distributions

- Calculate distributable revenue
- Trigger quarterly dividend payments
- View distribution history
- Download tax reports

### Settings

- Update management fee (default 2%)
- Change treasury address
- Configure API keys

## Regular Operations

### Daily

1. Check GPU node status
2. Monitor Nosana job queue
3. Verify no node failures

### Weekly

1. Review utilization metrics
2. Check for pending rewards on Nosana
3. Update pricing if market conditions change

### Quarterly

1. Calculate net revenue (after expenses)
2. Run reward collection script
3. Convert NOS to USDC
4. Trigger distribution via Brickken
5. Publish quarterly report

## Troubleshooting

### Node Offline

1. SSH into node
2. Check Docker service: `systemctl status docker`
3. Restart Nosana provider: `nosana provider restart`
4. Check logs: `nosana provider logs`

### Distribution Failed

1. Verify treasury has sufficient USDC
2. Check Brickken API connectivity
3. Ensure token holders are whitelisted
4. Contact Brickken support

### API Key Issues

1. Regenerate keys in Brickken/Nosana dashboard
2. Update .env file
3. Restart any running services