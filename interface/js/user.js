// user.js - HPC Share Investor Portal Logic

// Global state
let provider;
let signer;
let userAddress = null;
let isConnected = false;
let userData = null;

// Current tab
let currentTab = 'dashboard';

// Data cache
let userPortfolio = null;
let userDistributions = [];

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
    const connectBtn = document.getElementById('connectUserBtn');
    if (connectBtn) connectBtn.addEventListener('click', connectWallet);
    
    // Tab switching
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Invest button
    const investBtn = document.getElementById('investBtn');
    if (investBtn) investBtn.addEventListener('click', startInvestment);
    
    // Euro amount input (live calculation)
    const euroInput = document.getElementById('investEuroAmount');
    if (euroInput) euroInput.addEventListener('input', calculateHpcAmount);
    
    // Go to marketplace button
    const marketplaceBtn = document.getElementById('gotoMarketplaceBtn');
    if (marketplaceBtn) marketplaceBtn.addEventListener('click', () => {
        window.open('https://brickken.com/marketplace', '_blank');
    });
    
    // Download tax report button
    const taxBtn = document.getElementById('downloadTaxReportBtn');
    if (taxBtn) taxBtn.addEventListener('click', downloadTaxReport);
    
    // Update profile button
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    if (updateProfileBtn) updateProfileBtn.addEventListener('click', updateProfile);
    
    // Start KYC button
    const startKycBtn = document.getElementById('startKycBtn');
    if (startKycBtn) startKycBtn.addEventListener('click', startKYC);
    
    // Notification checkboxes
    const emailNotif = document.getElementById('emailNotifications');
    const payoutNotif = document.getElementById('payoutNotifications');
    if (emailNotif) emailNotif.addEventListener('change', saveNotificationSettings);
    if (payoutNotif) payoutNotif.addEventListener('change', saveNotificationSettings);
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
        alert('Please install MetaMask to use the investor portal');
        return;
    }
    
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAddress = accounts[0];
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        isConnected = true;
        
        updateConnectionUI(true);
        
        // Load user data after connection
        await loadUserData();
        
        // Load saved settings
        loadNotificationSettings();
        
    } catch (error) {
        console.error('Wallet connection failed:', error);
        updateConnectionUI(false);
    }
}

function updateConnectionUI(connected) {
    const walletSpan = document.getElementById('userWallet');
    const connectBtn = document.getElementById('connectUserBtn');
    
    if (connected && userAddress) {
        walletSpan.innerHTML = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
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
    if (tabId === 'dashboard') refreshDashboard();
    if (tabId === 'portfolio') renderPortfolioTable();
    if (tabId === 'distributions') renderUserDistributions();
    if (tabId === 'account') loadAccountInfo();
}

async function loadUserData() {
    // Simulated user data - replace with actual API calls
    userData = {
        name: 'Maria Garcia',
        email: 'maria@example.com',
        walletAddress: userAddress,
        kycStatus: 'approved',
        hpcBalance: 10000,
        portfolioValue: 10000,
        totalDistributions: 845,
        nextDistributionEstimate: 120
    };
    
    userPortfolio = {
        hpc: 10000,
        percentage: 1.0,
        value: 10000,
        costBasis: 10000,
        unrealizedGain: 0
    };
    
    userDistributions = [
        { date: '2027-04-15', amount: 96.77, perToken: 0.0097, status: 'Received' },
        { date: '2027-01-15', amount: 84.50, perToken: 0.0085, status: 'Received' }
    ];
    
    refreshDashboard();
    renderPortfolioTable();
    renderUserDistributions();
    loadAccountInfo();
}

function refreshDashboard() {
    if (!userData) return;
    
    document.getElementById('userName').textContent = userData.name.split(' ')[0];
    document.getElementById('userHpcBalance').textContent = userData.hpcBalance.toLocaleString();
    document.getElementById('userPortfolioValue').textContent = `$${userData.portfolioValue.toLocaleString()}`;
    document.getElementById('userTotalDistributions').textContent = `$${userData.totalDistributions.toLocaleString()}`;
    document.getElementById('userNextDistribution').textContent = `$${userData.nextDistributionEstimate} (est.)`;
    
    // Cluster status
    const clusterDiv = document.getElementById('clusterStatus');
    if (clusterDiv) {
        clusterDiv.innerHTML = `
            <div class="cluster-stat">🖥️ Active Nodes: 3/4</div>
            <div class="cluster-stat">⚡ GPU Utilization: 67%</div>
            <div class="cluster-stat">💰 Hourly Revenue Rate: $1.20 per node</div>
            <div class="progress-bar mt-2"><div class="progress-fill" style="width: 67%"></div></div>
        `;
    }
}

function renderPortfolioTable() {
    const tbody = document.getElementById('holdingsTableBody');
    if (!tbody) return;
    
    if (!userPortfolio) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Connect wallet to view portfolio</td></tr>';
        return;
    }
    
    tbody.innerHTML = `
        <tr>
            <td><strong>HPC Share Token</strong><br><small style="color: var(--gray);">HPC</small></td>
            <td>${userPortfolio.hpc.toLocaleString()} HPC</td>
            <td>$${userPortfolio.value.toLocaleString()}</td>
            <td>${userPortfolio.percentage}%</td>
        </tr>
    `;
}

function renderUserDistributions() {
    const tbody = document.getElementById('userDistributionBody');
    if (!tbody) return;
    
    if (!userDistributions || userDistributions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No distributions yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = userDistributions.map(dist => `
        <tr>
            <td>${dist.date}</td>
            <td>$${dist.amount.toFixed(2)} USDC</td>
            <td>$${dist.perToken} per HPC</td>
            <td><span class="status-badge status-received">${dist.status}</span></td>
        </tr>
    `).join('');
}

function loadAccountInfo() {
    if (!userData) return;
    
    document.getElementById('profileEmail').value = userData.email || '';
    document.getElementById('profileWallet').value = userAddress || '';
    
    const kycDiv = document.getElementById('kycStatus');
    if (kycDiv) {
        if (userData.kycStatus === 'approved') {
            kycDiv.innerHTML = '<span class="status-badge status-approved">✅ Approved</span>';
        } else if (userData.kycStatus === 'pending') {
            kycDiv.innerHTML = '<span class="status-badge status-pending">⏳ Pending</span>';
        } else {
            kycDiv.innerHTML = '<span class="status-badge status-not-started">❌ Not Started</span>';
        }
    }
}

function calculateHpcAmount() {
    const euroAmount = document.getElementById('investEuroAmount').value;
    const price = 1.00; // Current price per HPC
    const hpcAmount = euroAmount / price;
    
    document.getElementById('investHpcAmount').value = hpcAmount.toFixed(2) + ' HPC';
}

async function startInvestment() {
    const euroAmount = document.getElementById('investEuroAmount').value;
    
    if (!euroAmount || euroAmount < 100) {
        alert('Minimum investment is €100');
        return;
    }
    
    if (!userData || userData.kycStatus !== 'approved') {
        alert('Please complete KYC before investing. Redirecting to Brickken...');
        startKYC();
        return;
    }
    
    alert(`Investment of €${euroAmount} initiated. You will be redirected to Brickken to complete payment.`);
    window.open('https://brickken.com/checkout', '_blank');
}

async function startKYC() {
    alert('Redirecting to Brickken KYC portal...');
    window.open('https://brickken.com/kyc', '_blank');
}

async function downloadTaxReport() {
    alert('Generating tax report... The report will be available in PDF format shortly.');
    // Simulate download
    setTimeout(() => {
        alert('Tax report generated and downloaded.');
    }, 1500);
}

async function updateProfile() {
    const email = document.getElementById('profileEmail').value;
    
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    userData.email = email;
    alert('Profile updated successfully!');
}

function saveNotificationSettings() {
    const emailNotif = document.getElementById('emailNotifications').checked;
    const payoutNotif = document.getElementById('payoutNotifications').checked;
    
    localStorage.setItem('hpcshare_email_notifications', emailNotif);
    localStorage.setItem('hpcshare_payout_notifications', payoutNotif);
    
    console.log('Notification settings saved:', { emailNotif, payoutNotif });
}

function loadNotificationSettings() {
    const emailNotif = localStorage.getItem('hpcshare_email_notifications') === 'true';
    const payoutNotif = localStorage.getItem('hpcshare_payout_notifications') === 'true';
    
    const emailCheckbox = document.getElementById('emailNotifications');
    const payoutCheckbox = document.getElementById('payoutNotifications');
    
    if (emailCheckbox) emailCheckbox.checked = emailNotif;
    if (payoutCheckbox) payoutCheckbox.checked = payoutNotif;
}