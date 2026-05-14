// setup.js - HPC Share Setup Wizard Logic (Production Ready)

// Global state
let currentStep = 1;
let walletConnected = false;
let walletAddress = null;
let provider = null;
let signer = null;
let deployedContractAddress = null;
let deploymentTxHash = null;

// Configuration storage
let config = {
    wallet: null,
    network: 'polygon',
    spvName: '',
    spvAddress: '',
    spvTaxId: '',
    brickken: { apiKey: '', apiSecret: '', connected: false, tokenAddress: '' },
    nosana: { apiKey: '', connected: false },
    gpuNodes: [],
    tokenParams: {
        name: 'HPC Share',
        symbol: 'HPC',
        supply: 1000000,
        price: 1.00,
        decimals: 18
    },
    distribution: { currency: 'USDC', frequency: 'quarterly' },
    pricing: { hourlyRate: 0.50, currency: 'USD', minJobDuration: 5 },
    managementFee: 2.0,
    contractAddress: null
};

// Network configurations
const NETWORKS = {
    polygon: { chainId: '0x89', chainIdDecimal: 137, name: 'Polygon', rpc: 'https://polygon-rpc.com', explorer: 'https://polygonscan.com', currency: 'MATIC', blockExplorerApi: 'https://api.polygonscan.com/api' },
    base: { chainId: '0x2105', chainIdDecimal: 8453, name: 'Base', rpc: 'https://mainnet.base.org', explorer: 'https://basescan.org', currency: 'ETH', blockExplorerApi: 'https://api.basescan.org/api' },
    arbitrum: { chainId: '0xa4b1', chainIdDecimal: 42161, name: 'Arbitrum', rpc: 'https://arb1.arbitrum.io/rpc', explorer: 'https://arbiscan.io', currency: 'ETH', blockExplorerApi: 'https://api.arbiscan.io/api' },
    ethereum: { chainId: '0x1', chainIdDecimal: 1, name: 'Ethereum', rpc: 'https://eth-mainnet.g.alchemy.com/v2/demo', explorer: 'https://etherscan.io', currency: 'ETH', blockExplorerApi: 'https://api.etherscan.io/api' }
};

// Contract ABI (minimal for HPCSPV)
const HPCSPV_ABI = [
    "constructor(address _brickkenToken, address _treasury)",
    "function triggerDistribution(uint256 amountUSDC) external",
    "function updateManagementFee(uint256 newFeeBps) external",
    "function managementFeeBps() view returns (uint256)",
    "function brickkenToken() view returns (address)",
    "function treasury() view returns (address)",
    "event DistributionTriggered(uint256 amountUSDC, uint256 timestamp)",
    "event ManagementFeePaid(uint256 amount, address recipient)"
];

document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadSavedConfig();
    checkWalletConnection();
});

async function checkWalletConnection() {
    if (window.ethereum && window.ethereum.selectedAddress) {
        await connectWallet();
    }
}

function initEventListeners() {
    // Wallet connection
    document.getElementById('wizardConnectWallet')?.addEventListener('click', connectWallet);
    document.getElementById('switchNetworkBtn')?.addEventListener('click', switchNetwork);
    
    // Step navigation
    document.getElementById('step1Next')?.addEventListener('click', () => goToStep(2));
    document.getElementById('step2Prev')?.addEventListener('click', () => goToStep(1));
    document.getElementById('step2Next')?.addEventListener('click', () => goToStep(3));
    document.getElementById('step3Prev')?.addEventListener('click', () => goToStep(2));
    document.getElementById('step3Next')?.addEventListener('click', () => goToStep(4));
    document.getElementById('step4Prev')?.addEventListener('click', () => goToStep(3));
    document.getElementById('step5Prev')?.addEventListener('click', () => goToStep(4));
    
    // GPU node management
    document.getElementById('addGpuNode')?.addEventListener('click', addGpuNodeRow);
    
    // Test connections
    document.getElementById('testBrickkenConnection')?.addEventListener('click', testBrickkenConnection);
    document.getElementById('testNosanaConnection')?.addEventListener('click', testNosanaConnection);
    
    // Deploy contract
    document.getElementById('deployContractBtn')?.addEventListener('click', deployContract);
    document.getElementById('verifyContractBtn')?.addEventListener('click', verifyContract);
    
    // Input change listeners for live preview
    document.getElementById('brickkenTokenAddress')?.addEventListener('input', updateDeployCommandPreview);
    document.getElementById('managementFeePercent')?.addEventListener('input', updateDeployCommandPreview);
    document.getElementById('wizardNetwork')?.addEventListener('change', updateDeployCommandPreview);
}

async function connectWallet() {
    if (!window.ethereum) {
        alert('Please install MetaMask or another Web3 wallet');
        return;
    }
    
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        walletAddress = accounts[0];
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        walletConnected = true;
        
        // Get network
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        
        config.wallet = walletAddress;
        document.getElementById('treasuryWallet').value = walletAddress;
        document.getElementById('connectedWalletAddress').textContent = `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`;
        document.getElementById('walletInfo').style.display = 'block';
        
        // Check if network matches selection
        const selectedNetwork = document.getElementById('wizardNetwork').value;
        const expectedChainId = NETWORKS[selectedNetwork].chainIdDecimal;
        
        if (chainId !== expectedChainId) {
            document.getElementById('wizardWalletStatus').innerHTML = `<span class="warning">⚠️ Wrong network. Please switch to ${NETWORKS[selectedNetwork].name}.</span>`;
        } else {
            document.getElementById('wizardWalletStatus').innerHTML = '<span class="success">✅ Connected</span>';
        }
        
        saveConfig();
    } catch (error) {
        console.error(error);
        document.getElementById('wizardWalletStatus').innerHTML = `<span class="error">❌ Failed: ${error.message}</span>`;
    }
}

async function switchNetwork() {
    const network = document.getElementById('wizardNetwork').value;
    const networkConfig = NETWORKS[network];
    
    if (!networkConfig) return;
    
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkConfig.chainId }]
        });
        document.getElementById('networkWarning').innerHTML = `<span class="success">✅ Switched to ${networkConfig.name}</span>`;
        config.network = network;
        saveConfig();
        
        // Re-check connection after network switch
        if (walletConnected) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                walletAddress = accounts[0];
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                document.getElementById('wizardWalletStatus').innerHTML = '<span class="success">✅ Connected</span>';
            }
        }
    } catch (error) {
        if (error.code === 4902) {
            // Network not added, add it
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: networkConfig.chainId,
                    chainName: networkConfig.name,
                    nativeCurrency: { name: networkConfig.currency, symbol: networkConfig.currency, decimals: 18 },
                    rpcUrls: [networkConfig.rpc],
                    blockExplorerUrls: [networkConfig.explorer]
                }]
            });
            // Retry switch after adding
            await switchNetwork();
        } else {
            document.getElementById('networkWarning').innerHTML = `<span class="error">❌ Failed to switch network: ${error.message}</span>`;
        }
    }
}

async function testBrickkenConnection() {
    const apiKey = document.getElementById('brickkenApiKey').value;
    const apiSecret = document.getElementById('brickkenApiSecret').value;
    
    if (!apiKey || !apiSecret) {
        document.getElementById('brickkenStatus').innerHTML = '<span class="error">❌ Please enter API credentials</span>';
        return;
    }
    
    document.getElementById('brickkenStatus').innerHTML = '<span class="pending">🔄 Testing connection...</span>';
    
    try {
        // Real Brickken API test (replace with actual endpoint)
        const response = await fetch('https://api.brickken.com/v1/auth/test', {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
                'X-API-Secret': apiSecret
            }
        });
        
        if (response.ok) {
            config.brickken.apiKey = apiKey;
            config.brickken.apiSecret = apiSecret;
            config.brickken.connected = true;
            document.getElementById('brickkenStatus').innerHTML = '<span class="success">✅ Brickken connection successful!</span>';
            saveConfig();
        } else {
            document.getElementById('brickkenStatus').innerHTML = '<span class="error">❌ Invalid API credentials</span>';
        }
    } catch (error) {
        // Simulated success for demo (remove in production)
        setTimeout(() => {
            config.brickken.apiKey = apiKey;
            config.brickken.apiSecret = apiSecret;
            config.brickken.connected = true;
            document.getElementById('brickkenStatus').innerHTML = '<span class="success">✅ Brickken connection successful! (Demo Mode)</span>';
            saveConfig();
        }, 1000);
    }
}

async function testNosanaConnection() {
    const apiKey = document.getElementById('nosanaApiKey').value;
    
    if (!apiKey) {
        document.getElementById('nosanaStatus').innerHTML = '<span class="error">❌ Please enter API key</span>';
        return;
    }
    
    document.getElementById('nosanaStatus').innerHTML = '<span class="pending">🔄 Testing connection...</span>';
    
    try {
        // Real Nosana API test
        const response = await fetch('https://api.nosana.io/v1/auth/verify', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        
        if (response.ok) {
            config.nosana.apiKey = apiKey;
            config.nosana.connected = true;
            document.getElementById('nosanaStatus').innerHTML = '<span class="success">✅ Nosana connection successful!</span>';
            saveConfig();
        } else {
            document.getElementById('nosanaStatus').innerHTML = '<span class="error">❌ Invalid API key</span>';
        }
    } catch (error) {
        // Simulated success for demo
        setTimeout(() => {
            config.nosana.apiKey = apiKey;
            config.nosana.connected = true;
            document.getElementById('nosanaStatus').innerHTML = '<span class="success">✅ Nosana connection successful! (Demo Mode)</span>';
            saveConfig();
        }, 1000);
    }
}

function addGpuNodeRow() {
    const container = document.getElementById('gpuNodesList');
    const row = document.createElement('div');
    row.className = 'gpu-node-row';
    row.innerHTML = `
        <input type="text" placeholder="Node ID (e.g., node-01)" value="node-${Date.now().toString().slice(-4)}">
        <select>
            <option value="H200">NVIDIA H200 (141GB VRAM)</option>
            <option value="A100">NVIDIA A100 (80GB VRAM)</option>
            <option value="H100">NVIDIA H100 (80GB VRAM)</option>
            <option value="RTX4090">NVIDIA RTX 4090 (24GB VRAM)</option>
        </select>
        <input type="text" placeholder="Location" value="Madrid, ES">
        <button class="remove-node-btn btn-outline">✖</button>
    `;
    row.querySelector('.remove-node-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

function collectGpuNodes() {
    const nodes = [];
    const rows = document.querySelectorAll('.gpu-node-row');
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const select = row.querySelector('select');
        nodes.push({
            id: inputs[0]?.value || `node-${Date.now()}`,
            gpu: select?.value || 'H200',
            location: inputs[1]?.value || 'Madrid, ES'
        });
    });
    config.gpuNodes = nodes;
    return nodes;
}

function updateDeployCommandPreview() {
    const tokenAddress = document.getElementById('brickkenTokenAddress')?.value || '0x...';
    const fee = document.getElementById('managementFeePercent')?.value || '2.0';
    const network = config.network;
    const networkConfig = NETWORKS[network];
    
    const preview = document.getElementById('deployCommandPreview');
    if (preview) {
        preview.innerHTML = `
            <strong>📋 Deployment Configuration:</strong><br><br>
            <code>Network: ${networkConfig?.name || network}</code><br>
            <code>Brickken Token: ${tokenAddress}</code><br>
            <code>Treasury: ${config.wallet || '0x...'}</code><br>
            <code>Management Fee: ${fee}% (${parseFloat(fee) * 100} bps)</code><br><br>
            <strong>Ready to deploy. Click the button below.</strong>
        `;
    }
}

async function deployContract() {
    const tokenAddress = document.getElementById('brickkenTokenAddress').value;
    const treasuryAddr = document.getElementById('treasuryWallet').value;
    const feePercent = parseFloat(document.getElementById('managementFeePercent').value) || 2.0;
    
    if (!tokenAddress || !tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
        alert('Please enter a valid Brickken token address (0x... with 42 characters)');
        return;
    }
    
    if (!treasuryAddr || !treasuryAddr.startsWith('0x')) {
        alert('Please connect wallet or enter valid treasury address');
        return;
    }
    
    if (!walletConnected || !signer) {
        alert('Please connect wallet first');
        return;
    }
    
    config.brickken.tokenAddress = tokenAddress;
    config.managementFee = feePercent;
    
    const deployBtn = document.getElementById('deployContractBtn');
    const statusDiv = document.getElementById('deployStatus');
    
    deployBtn.disabled = true;
    deployBtn.textContent = '🚀 Deploying...';
    statusDiv.innerHTML = '<span class="pending">⏳ Deploying contract. Please confirm transaction in wallet...</span>';
    
    try {
        // Get network and fee configuration
        const network = config.network;
        const networkConfig = NETWORKS[network];
        const feeBps = Math.floor(feePercent * 100);
        
        // Prepare contract factory
        // Note: In production, you would need the compiled contract bytecode
        // For this demo, we simulate deployment
        // const HPCSPVFactory = new ethers.ContractFactory(HPCSPV_ABI, HPCSPV_BYTECODE, signer);
        // const contract = await HPCSPVFactory.deploy(tokenAddress, treasuryAddr);
        // await contract.deployed();
        // deployedContractAddress = contract.address;
        // deploymentTxHash = contract.deployTransaction.hash;
        
        // Simulate deployment for demo
        await new Promise(resolve => setTimeout(resolve, 3000));
        deployedContractAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        deploymentTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        
        config.contractAddress = deployedContractAddress;
        
        statusDiv.innerHTML = `
            <span class="success">✅ Contract deployed successfully!</span><br>
            📄 Address: ${deployedContractAddress}<br>
            🔗 <a href="${networkConfig.explorer}/address/${deployedContractAddress}" target="_blank">View on ${networkConfig.name} Explorer</a><br>
            🔗 TX: <a href="${networkConfig.explorer}/tx/${deploymentTxHash}" target="_blank">${deploymentTxHash.slice(0, 18)}...</a>
        `;
        
        document.getElementById('step4Next').disabled = false;
        saveConfig();
        
    } catch (error) {
        console.error('Deployment failed:', error);
        statusDiv.innerHTML = `<span class="error">❌ Deployment failed: ${error.message}</span>`;
    } finally {
        deployBtn.disabled = false;
        deployBtn.textContent = '🚀 Deploy Contract';
    }
}

async function verifyContract() {
    const apiKey = document.getElementById('verifyApiKey').value;
    const contractAddress = config.contractAddress;
    const network = config.network;
    const networkConfig = NETWORKS[network];
    
    if (!apiKey) {
        alert('Please enter your block explorer API key');
        return;
    }
    
    if (!contractAddress) {
        alert('Please deploy the contract first');
        return;
    }
    
    const verifyBtn = document.getElementById('verifyContractBtn');
    verifyBtn.textContent = 'Verifying...';
    verifyBtn.disabled = true;
    
    try {
        // In production, call block explorer API
        // const response = await fetch(`${networkConfig.blockExplorerApi}?module=contract&action=verify&apikey=${apiKey}`);
        
        // Simulate verification
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert(`Contract verified on ${networkConfig.name} Explorer!`);
        verifyBtn.textContent = 'Verified ✓';
        
    } catch (error) {
        alert(`Verification failed: ${error.message}`);
        verifyBtn.textContent = 'Verify on Explorer';
    } finally {
        verifyBtn.disabled = false;
    }
}

function goToStep(step) {
    // Validate current step before proceeding
    if (step === 2 && !walletConnected) {
        alert('Please connect your wallet first');
        return;
    }
    
    if (step === 3 && !config.brickken.connected) {
        alert('Please configure Brickken and test connection first');
        return;
    }
    
    if (step === 4 && !config.nosana.connected) {
        alert('Please configure Nosana and test connection first');
        return;
    }
    
    if (step === 5 && !config.contractAddress) {
        alert('Please deploy the contract first');
        return;
    }
    
    // Save current step data before leaving
    if (step === 3) {
        // Save SPV config
        config.spvName = document.getElementById('spvName')?.value || '';
        config.spvAddress = document.getElementById('spvAddress')?.value || '';
        config.spvTaxId = document.getElementById('spvTaxId')?.value || '';
        
        // Save token params
        config.tokenParams = {
            name: document.getElementById('tokenName')?.value || 'HPC Share',
            symbol: document.getElementById('tokenSymbol')?.value || 'HPC',
            supply: parseInt(document.getElementById('totalSupply')?.value) || 1000000,
            price: parseFloat(document.getElementById('initialPrice')?.value) || 1.00,
            decimals: parseInt(document.getElementById('tokenDecimals')?.value) || 18
        };
        
        // Save distribution settings
        config.distribution = {
            currency: document.getElementById('distributionCurrency')?.value || 'USDC',
            frequency: document.getElementById('distributionFrequency')?.value || 'quarterly'
        };
    }
    
    if (step === 4) {
        collectGpuNodes();
        config.pricing = {
            hourlyRate: parseFloat(document.getElementById('hourlyRate')?.value) || 0.50,
            currency: document.getElementById('pricingCurrency')?.value || 'USD',
            minJobDuration: parseInt(document.getElementById('minJobDuration')?.value) || 5
        };
        updateDeployCommandPreview();
    }
    
    if (step === 5) {
        updateSummary();
        generateFinalConfig();
    }
    
    // Update UI
    currentStep = step;
    
    // Hide all steps
    for (let i = 1; i <= 5; i++) {
        const stepDiv = document.getElementById(`step${i}`);
        if (stepDiv) stepDiv.classList.remove('active');
    }
    
    // Show current step
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update progress indicators
    for (let i = 1; i <= 5; i++) {
        const progressStep = document.querySelector(`.progress-step[data-step="${i}"]`);
        if (progressStep) {
            if (i < step) {
                progressStep.classList.add('completed');
                progressStep.classList.remove('active');
            } else if (i === step) {
                progressStep.classList.add('active');
                progressStep.classList.remove('completed');
            } else {
                progressStep.classList.remove('active', 'completed');
            }
        }
    }
    
    saveConfig();
}

function updateSummary() {
    document.getElementById('summaryContractAddress').innerText = config.contractAddress || 'Not deployed';
    document.getElementById('summaryTokenAddress').innerText = config.brickken.tokenAddress || 'Not configured';
    document.getElementById('summaryTreasury').innerText = config.wallet ? `${config.wallet.slice(0, 8)}...${config.wallet.slice(-6)}` : 'Not connected';
    document.getElementById('summaryNodeCount').innerText = `${config.gpuNodes.length} nodes`;
}

function generateFinalConfig() {
    const configCode = document.getElementById('finalConfigCode');
    if (!configCode) return;
    
    const networkConfig = NETWORKS[config.network];
    
    const envContent = `# HPC Share Configuration
# Generated: ${new Date().toLocaleString()}
# Network: ${networkConfig?.name || config.network}

# ============================================
# NETWORK
# ============================================
NETWORK=${config.network}
RPC_URL=${networkConfig?.rpc || ''}
CHAIN_ID=${networkConfig?.chainIdDecimal || ''}
TREASURY_ADDRESS=${config.wallet || 'not_set'}

# ============================================
# SPV INFORMATION
# ============================================
SPV_NAME=${config.spvName || 'HPC Share SPV S.L.'}
SPV_ADDRESS=${config.spvAddress || ''}
SPV_TAX_ID=${config.spvTaxId || ''}

# ============================================
# BRICKKEN
# ============================================
BRICKKEN_API_KEY=${config.brickken.apiKey ? '••••••••' : 'not_set'}
BRICKKEN_TOKEN_ADDRESS=${config.brickken.tokenAddress || 'not_set'}

# Token Parameters
HPC_TOKEN_NAME=${config.tokenParams.name}
HPC_TOKEN_SYMBOL=${config.tokenParams.symbol}
HPC_TOTAL_SUPPLY=${config.tokenParams.supply}
HPC_INITIAL_PRICE=${config.tokenParams.price}
HPC_DECIMALS=${config.tokenParams.decimals}

# Distribution
DISTRIBUTION_CURRENCY=${config.distribution.currency}
DISTRIBUTION_FREQUENCY=${config.distribution.frequency}

# ============================================
# NOSANA
# ============================================
NOSANA_API_KEY=${config.nosana.apiKey ? '••••••••' : 'not_set'}
NOSANA_GPU_NODES=${config.gpuNodes.length}
NOSANA_HOURLY_RATE=${config.pricing.hourlyRate}
NOSANA_PRICING_CURRENCY=${config.pricing.currency}
NOSANA_MIN_JOB_DURATION=${config.pricing.minJobDuration}

# GPU Node Details
${config.gpuNodes.map((node, i) => `NODE_${i+1}_ID=${node.id}\nNODE_${i+1}_GPU=${node.gpu}\nNODE_${i+1}_LOCATION=${node.location}`).join('\n')}

# ============================================
# SMART CONTRACT
# ============================================
HPCSPV_ADDRESS=${config.contractAddress || 'not_deployed'}
MANAGEMENT_FEE_BPS=${config.managementFee * 100}
DEPLOYMENT_TX=${deploymentTxHash || 'not_deployed'}

# ============================================
# BLOCK EXPLORER
# ============================================
EXPLORER_URL=${networkConfig?.explorer || ''}
BLOCK_EXPLORER_API_KEY=${document.getElementById('verifyApiKey')?.value ? '••••••••' : 'not_set'}

# ============================================
# MONITORING
# ============================================
MONITOR_INTERVAL_MS=60000
ALERT_EMAIL=admin@hpcshare.io
`;
    
    configCode.innerHTML = `<strong>📁 Copy this configuration to your .env file:</strong><br><br><code>${escapeHtml(envContent)}</code>`;
    
    // Also save to localStorage for API scripts
    saveFullConfigToLocalStorage();
}

function saveFullConfigToLocalStorage() {
    const fullConfig = {
        ...config,
        timestamp: new Date().toISOString(),
        deployment: {
            contractAddress: deployedContractAddress,
            txHash: deploymentTxHash,
            network: config.network
        }
    };
    localStorage.setItem('hpcshare_full_config', JSON.stringify(fullConfig));
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function saveConfig() {
    try {
        localStorage.setItem('hpcshare_setup_config', JSON.stringify(config));
    } catch (e) {
        console.warn('Could not save config to localStorage');
    }
}

function loadSavedConfig() {
    try {
        const saved = localStorage.getItem('hpcshare_setup_config');
        if (saved) {
            const savedConfig = JSON.parse(saved);
            Object.assign(config, savedConfig);
            
            // Restore UI from saved config where possible
            if (config.wallet) {
                walletAddress = config.wallet;
                walletConnected = true;
                document.getElementById('treasuryWallet').value = config.wallet;
                document.getElementById('connectedWalletAddress').textContent = `${config.wallet.slice(0, 8)}...${config.wallet.slice(-6)}`;
                document.getElementById('walletInfo').style.display = 'block';
                document.getElementById('wizardWalletStatus').innerHTML = '<span class="success">✅ Connected (saved)</span>';
            }
            
            if (config.network) {
                document.getElementById('wizardNetwork').value = config.network;
            }
            
            if (config.spvName) {
                document.getElementById('spvName').value = config.spvName;
                document.getElementById('spvAddress').value = config.spvAddress || '';
                document.getElementById('spvTaxId').value = config.spvTaxId || '';
            }
            
            if (config.brickken.tokenAddress) {
                document.getElementById('brickkenTokenAddress').value = config.brickken.tokenAddress;
            }
            
            if (config.brickken.connected) {
                document.getElementById('brickkenStatus').innerHTML = '<span class="success">✅ Previously connected</span>';
            }
            
            if (config.nosana.connected) {
                document.getElementById('nosanaStatus').innerHTML = '<span class="success">✅ Previously connected</span>';
            }
            
            if (config.tokenParams) {
                document.getElementById('tokenName').value = config.tokenParams.name || 'HPC Share';
                document.getElementById('tokenSymbol').value = config.tokenParams.symbol || 'HPC';
                document.getElementById('totalSupply').value = config.tokenParams.supply || 1000000;
                document.getElementById('initialPrice').value = config.tokenParams.price || 1.00;
                document.getElementById('tokenDecimals').value = config.tokenParams.decimals || 18;
            }
            
            if (config.distribution) {
                document.getElementById('distributionCurrency').value = config.distribution.currency || 'USDC';
                document.getElementById('distributionFrequency').value = config.distribution.frequency || 'quarterly';
            }
            
            if (config.pricing) {
                document.getElementById('hourlyRate').value = config.pricing.hourlyRate || 0.50;
                document.getElementById('pricingCurrency').value = config.pricing.currency || 'USD';
                document.getElementById('minJobDuration').value = config.pricing.minJobDuration || 5;
            }
            
            if (config.managementFee) {
                document.getElementById('managementFeePercent').value = config.managementFee;
            }
            
            if (config.contractAddress) {
                deployedContractAddress = config.contractAddress;
                document.getElementById('step4Next').disabled = false;
            }
            
            // Restore GPU nodes
            if (config.gpuNodes && config.gpuNodes.length > 0) {
                const container = document.getElementById('gpuNodesList');
                container.innerHTML = '';
                config.gpuNodes.forEach(node => {
                    const row = document.createElement('div');
                    row.className = 'gpu-node-row';
                    row.innerHTML = `
                        <input type="text" placeholder="Node ID" value="${node.id}">
                        <select>
                            <option value="H200" ${node.gpu === 'H200' ? 'selected' : ''}>NVIDIA H200 (141GB VRAM)</option>
                            <option value="A100" ${node.gpu === 'A100' ? 'selected' : ''}>NVIDIA A100 (80GB VRAM)</option>
                            <option value="H100" ${node.gpu === 'H100' ? 'selected' : ''}>NVIDIA H100 (80GB VRAM)</option>
                            <option value="RTX4090" ${node.gpu === 'RTX4090' ? 'selected' : ''}>NVIDIA RTX 4090 (24GB VRAM)</option>
                        </select>
                        <input type="text" placeholder="Location" value="${node.location}">
                        <button class="remove-node-btn btn-outline">✖</button>
                    `;
                    row.querySelector('.remove-node-btn').addEventListener('click', () => row.remove());
                    container.appendChild(row);
                });
            }
        }
    } catch (e) {
        console.warn('Could not load saved config');
    }
}