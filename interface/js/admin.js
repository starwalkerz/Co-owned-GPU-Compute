// admin.js - HPC Share Admin Dashboard Logic

// Global state
let provider;
let signer;
let adminAddress = null;
let isConnected = false;

// Current tab
let currentTab = 'overview';

// Data cache
let investors = [];
let nodes = [];
let distributions = [];

// DOM Elements
const tabs = document.querySelectorAll('.sidebar-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    checkConnection();
});

function initEventListeners() {
    // Connect wallet button
    const connectBtn = document.getElementById('connectAdminBtn');
    if (connectBtn) connectBtn.addEventListener('click', connectWallet);
    
    // Tab switching
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Sync investors button
    const syncBtn = document.getElementById('syncInvestorsBtn');
    if (syncBtn) syncBtn.addEventListener('click', syncInvestors);
    
    // Register investor button
    const registerBtn = document.getElementById('registerInvestorBtn');
    if (registerBtn) registerBtn.addEventListener('click', registerInvestor);
    
    // Refresh nodes button
    const refreshNodesBtn = document.getElementById('refreshNodesBtn');
    if (refreshNodesBtn) refreshNodesBtn.addEventListener('click', refreshNodes);
    
    // Register node button
    const registerNodeBtn = document.getElementById('registerNodeBtn');
    if (registerNodeBtn) registerNodeBtn.addEventListener('click', registerNode);
    
    // Trigger distribution button
    const triggerDistBtn = document.getElementById('triggerDistributionBtn');
    if (triggerDistBtn) triggerDistBtn.addEventListener('click', triggerDistribution);
    
    // Update fee button
    const updateFeeBtn = document.getElementById('updateFeeBtn');
    if (updateFeeBtn) updateFeeBtn.addEventListener('click', updateManagementFee);
    
    // Update treasury button
    const updateTreasuryBtn = document.getElementById('updateTreasuryBtn');
    if (updateTreasuryBtn) updateTreasuryBtn.addEventListener('click', updateTreasury);
    
    // Save API keys button
    const saveApiBtn = document.getElementById('saveApiKeysBtn');
    if (saveApiBtn) saveApiBtn.addEventListener('click', saveApiKeys);
}

async function checkConnection() {
    if (window.ethereum && window.ethereum.selectedAddress) {
        await connectWallet();
    } else {
        updateConnectionUI(false);
    }
}

async function connectWallet() {
    if (!window.ethereum) {
        alert('Please install MetaMask to use the admin dashboard');
        return;
    }
    
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        adminAddress = accounts[0];
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        isConnected = true;
        
        updateConnectionUI(true);
        
        // Load all data after connection
        await loadAllData();
        
    } catch (error) {
        console.error('Wallet connection failed:', error);
        updateConnectionUI(false);
    }
}

function updateConnectionUI(connected) {
    const walletSpan = document.getElementById('adminWallet');
    const connectBtn = document.getElementById('connectAdminBtn');
    
    if (connected && adminAddress) {
        walletSpan.innerHTML = `${adminAddress.slice(0, 6)}...${adminAddress.slice(-4)}`;
        walletSpan.style.background = '#dcfce7';
        walletSpan.style.color = '#166534';
        connectBtn.textContent = 'Connected';
        connectBtn.disabled = true;
    } else {
        walletSpan.innerHTML = 'Not Connected';
        walletSpan.style.background = '#fee2e2';
        walletSpan.style.color = '#991b1b';
        connectBtn.textContent = 'Connect Wallet';
        connectBtn.disabled = false;
    }
}

function switchTab(tabId) {
    currentTab = tabId;
    
    // Update sidebar buttons
    tabs.forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update content visibility
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}Tab`).classList.add('active');
    
    // Refresh data for the tab
    if (tabId === 'investors') renderInvestorsTable();
    if (tabId === 'shifts') renderNodesTable();
    if (tabId === 'distributions') renderDistributionsTable();
}

async function loadAllData() {
    await loadOverviewStats();
    await loadInvestors();
    await loadNodes();
    await loadDistributions();
    await loadRecentActivity();
}

async function loadOverviewStats() {
    // Simulated data - replace with actual API calls
    document.getElementById('totalShares').textContent = '125,000 HPC';
    document.getElementById('totalHolders').textContent = '47';
    document.getElementById('gpuUtilization').textContent = '67%';
    document.getElementById('treasuryBalance').textContent = '$12,450 USDC';
}

async function loadInvestors() {
    // Simulated data - replace with Brickken API call
    investors = [
        { wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0b6a0', name: 'Maria Garcia', balance: 10000, status: 'Active' },
        { wallet: '0x8ba1f109551bD432803012645Ac136ddd64DBa72', name: 'Lukas Weber', balance: 5000, status: 'Active' },
        { wallet: '0x1a0E31B85A9AaB1eaBCB10d736EdA105cF9fA8a8', name: 'Elena Petrova', balance: 2000, status: 'Pending KYC' }
    ];
    renderInvestorsTable();
}

async function loadNodes() {
    // Simulated data - replace with Nosana API call
    nodes = [
        { id: 'node-01', gpu: 'NVIDIA H200', status: 'Online', utilization: 72, jobs: 145, earnings: 12500 },
        { id: 'node-02', gpu: 'NVIDIA H200', status: 'Online', utilization: 68, jobs: 138, earnings: 11800 },
        { id: 'node-03', gpu: 'NVIDIA A100', status: 'Online', utilization: 55, jobs: 98, earnings: 8900 },
        { id: 'node-04', gpu: 'NVIDIA A100', status: 'Offline', utilization: 0, jobs: 0, earnings: 0 }
    ];
    renderNodesTable();
}

async function loadDistributions() {
    // Simulated data
    distributions = [
        { date: '2027-04-15', amount: 9677, perToken: 0.0097, holders: 47, status: 'Completed' },
        { date: '2027-01-15', amount: 8450, perToken: 0.0085, holders: 42, status: 'Completed' }
    ];
    renderDistributionsTable();
}

async function loadRecentActivity() {
    const activityDiv = document.getElementById('recentActivity');
    if (!activityDiv) return;
    
    activityDiv.innerHTML = `
        <div class="activity-item">✅ Distribution of $9,677 completed - Apr 15, 2027</div>
        <div class="activity-item">🖥️ Node node-04 went offline - Apr 14, 2027</div>
        <div class="activity-item">💰 $12,500 NOS rewards collected - Apr 10, 2027</div>
        <div class="activity-item">👤 New investor: Elena Petrova (2,000 HPC) - Apr 5, 2027</div>
        <div class="activity-item">📊 Q1 2027 report published - Apr 1, 2027</div>
    `;
}

function renderInvestorsTable() {
    const tbody = document.getElementById('investorsTableBody');
    if (!tbody) return;
    
    if (investors.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No investors found</td></tr>';
        return;
    }
    
    tbody.innerHTML = investors.map(inv => `
        <tr>
            <td>${inv.wallet.slice(0, 8)}...${inv.wallet.slice(-6)}</td>
            <td>${inv.name}</td>
            <td>${inv.balance.toLocaleString()} HPC</td>
            <td><span class="status-badge status-${inv.status.toLowerCase().replace(' ', '-')}">${inv.status}</span></td>
            <td><button class="btn-outline-small" onclick="viewInvestor('${inv.wallet}')">View</button></td>
        </tr>
    `).join('');
}

function renderNodesTable() {
    const tbody = document.getElementById('nodesTableBody');
    if (!tbody) return;
    
    if (nodes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No nodes registered</td></tr>';
        return;
    }
    
    tbody.innerHTML = nodes.map(node => `
        <tr>
            <td>${node.id}</td>
            <td>${node.gpu}</td>
            <td><span class="status-badge status-${node.status.toLowerCase()}">${node.status}</span></td>
            <td>${node.utilization}%</td>
            <td>${node.jobs}</td>
            <td>${node.earnings.toLocaleString()} NOS</td>
        </tr>
    `).join('');
}

function renderDistributionsTable() {
    const tbody = document.getElementById('distributionHistoryBody');
    if (!tbody) return;
    
    if (distributions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No distributions yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = distributions.map(dist => `
        <tr>
            <td>${dist.date}</td>
            <td>$${dist.amount.toLocaleString()} USDC</td>
            <td>$${dist.perToken} per HPC</td>
            <td>${dist.holders}</td>
            <td><span class="status-badge status-${dist.status.toLowerCase()}">${dist.status}</span></td>
        </tr>
    `).join('');
}

async function syncInvestors() {
    const syncBtn = document.getElementById('syncInvestorsBtn');
    syncBtn.textContent = '🔄 Syncing...';
    syncBtn.disabled = true;
    
    // Simulate API call
    setTimeout(async () => {
        await loadInvestors();
        syncBtn.textContent = '🔄 Sync from Brickken';
        syncBtn.disabled = false;
        alert('Investor data synced successfully');
    }, 1500);
}

async function registerInvestor() {
    const name = document.getElementById('newInvestorName').value;
    const email = document.getElementById('newInvestorEmail').value;
    const wallet = document.getElementById('newInvestorWallet').value;
    const shares = document.getElementById('newInvestorShares').value;
    
    if (!name || !email || !wallet || !shares) {
        alert('Please fill in all fields');
        return;
    }
    
    // Simulate registration
    alert(`Investor ${name} registered with ${shares} HPC shares. KYC email sent to ${email}.`);
    
    // Clear form
    document.getElementById('newInvestorName').value = '';
    document.getElementById('newInvestorEmail').value = '';
    document.getElementById('newInvestorWallet').value = '';
    document.getElementById('newInvestorShares').value = '';
    
    await loadInvestors();
}

async function registerNode() {
    const nodeId = document.getElementById('nodeId').value;
    const gpuModel = document.getElementById('nodeGpuModel').value;
    
    if (!nodeId) {
        alert('Please enter a node ID');
        return;
    }
    
    alert(`Node ${nodeId} (${gpuModel}) registered on Nosana. Run the provider registration script to complete setup.`);
    
    document.getElementById('nodeId').value = '';
    await loadNodes();
}

async function triggerDistribution() {
    const amount = document.getElementById('distributionAmount').value;
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (confirm(`Trigger distribution of $${amount} USDC to all token holders?`)) {
        const btn = document.getElementById('triggerDistributionBtn');
        btn.textContent = '🔄 Processing...';
        btn.disabled = true;
        
        // Simulate distribution
        setTimeout(() => {
            alert(`Distribution of $${amount} USDC triggered successfully.`);
            btn.textContent = 'Trigger Distribution';
            btn.disabled = false;
            document.getElementById('distributionAmount').value = '';
            loadDistributions();
        }, 2000);
    }
}

async function updateManagementFee() {
    const fee = document.getElementById('managementFee').value;
    
    if (!fee || fee < 0 || fee > 5) {
        alert('Please enter a fee between 0% and 5%');
        return;
    }
    
    alert(`Management fee updated to ${fee}%`);
}

async function updateTreasury() {
    const newAddress = document.getElementById('treasuryAddress').value;
    
    if (!newAddress || !newAddress.startsWith('0x')) {
        alert('Please enter a valid wallet address');
        return;
    }
    
    alert(`Treasury address updated to ${newAddress.slice(0, 10)}...`);
}

async function saveApiKeys() {
    const brickkenKey = document.getElementById('brickkenApiKey').value;
    const nosanaKey = document.getElementById('nosanaApiKey').value;
    
    if (brickkenKey) {
        localStorage.setItem('brickken_api_key', brickkenKey);
    }
    if (nosanaKey) {
        localStorage.setItem('nosana_api_key', nosanaKey);
    }
    
    alert('API keys saved (browser storage). Restart the application for changes to take effect.');
    
    document.getElementById('brickkenApiKey').value = '';
    document.getElementById('nosanaApiKey').value = '';
}

async function refreshNodes() {
    const btn = document.getElementById('refreshNodesBtn');
    btn.textContent = '🔄 Refreshing...';
    btn.disabled = true;
    
    await loadNodes();
    
    btn.textContent = '🔄 Refresh';
    btn.disabled = false;
}

// Helper function for investor view (called from table)
window.viewInvestor = function(wallet) {
    alert(`Viewing investor: ${wallet}\n\nFull details would be shown here in production.`);
};