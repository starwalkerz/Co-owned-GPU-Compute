// integrations/nosana/job-monitor.js
// HPC Share - Nosana Job Monitor
// Monitors compute jobs, tracks utilization, and logs earnings

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const MONITOR_INTERVAL = parseInt(process.env.NOSANA_MONITOR_INTERVAL) || 60000; // 60 seconds
const LOGS_DIR = path.join(__dirname, '../../logs');
const JOBS_LOG = path.join(LOGS_DIR, 'nosana-jobs.json');
const METRICS_LOG = path.join(LOGS_DIR, 'nosana-metrics.json');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Node configuration (should match registered providers)
const GPU_NODES = [
    { id: 'node-01', gpu: 'NVIDIA H200', location: 'Madrid, ES', status: 'online' },
    { id: 'node-02', gpu: 'NVIDIA H200', location: 'Madrid, ES', status: 'online' },
    { id: 'node-03', gpu: 'NVIDIA A100', location: 'Barcelona, ES', status: 'online' },
    { id: 'node-04', gpu: 'NVIDIA A100', location: 'Barcelona, ES', status: 'maintenance' }
];

// Mock job queue (in production, fetch from Nosana API)
let activeJobs = [];
let completedJobs = [];

async function main() {
    console.log('='.repeat(60));
    console.log('HPC SHARE - NOSANA JOB MONITOR');
    console.log('='.repeat(60));
    
    const args = process.argv.slice(2);
    const command = args[0] || 'start';
    
    switch (command) {
        case 'start':
            await startMonitoring();
            break;
        case 'status':
            await showStatus();
            break;
        case 'history':
            await showHistory();
            break;
        case 'reset':
            await resetMetrics();
            break;
        case 'help':
        default:
            printHelp();
    }
}

async function startMonitoring() {
    console.log('\n🔄 Starting Nosana job monitor...');
    console.log(`   Check interval: ${MONITOR_INTERVAL / 1000} seconds`);
    console.log('   Press Ctrl+C to stop\n');
    
    // Initial status
    await updateMetrics();
    
    // Set up interval
    const interval = setInterval(async () => {
        await updateMetrics();
    }, MONITOR_INTERVAL);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Stopping monitor...');
        clearInterval(interval);
        process.exit(0);
    });
}

async function updateMetrics() {
    const timestamp = new Date().toISOString();
    
    // Simulate fetching active jobs from Nosana API
    // In production: const jobs = await nosana.jobs.list({ status: 'running' });
    const activeJobsCount = Math.floor(Math.random() * 8); // 0-7 active jobs
    const utilization = calculateUtilization(activeJobsCount);
    
    // Simulate new completed jobs
    const newCompletedJobs = simulateCompletedJobs();
    completedJobs.push(...newCompletedJobs);
    
    // Update active jobs list
    activeJobs = simulateActiveJobs(activeJobsCount);
    
    // Calculate metrics
    const totalJobsToday = completedJobs.filter(j => {
        const jobDate = new Date(j.completedAt).toDateString();
        const today = new Date().toDateString();
        return jobDate === today;
    }).length;
    
    const totalEarningsToday = completedJobs
        .filter(j => {
            const jobDate = new Date(j.completedAt).toDateString();
            const today = new Date().toDateString();
            return jobDate === today;
        })
        .reduce((sum, j) => sum + j.earningsNOS, 0);
    
    const metrics = {
        timestamp: timestamp,
        nodes: GPU_NODES.map(node => ({
            id: node.id,
            gpu: node.gpu,
            status: node.status,
            activeJobs: activeJobs.filter(j => j.nodeId === node.id).length,
            utilization: node.status === 'online' ? Math.floor(Math.random() * 100) : 0
        })),
        summary: {
            totalNodes: GPU_NODES.length,
            onlineNodes: GPU_NODES.filter(n => n.status === 'online').length,
            activeJobs: activeJobs.length,
            completedJobsToday: totalJobsToday,
            earningsTodayNOS: totalEarningsToday,
            earningsTodayUSD: totalEarningsToday * 0.95, // Assuming 1 NOS = $0.95
            averageUtilization: utilization
        },
        recentJobs: completedJobs.slice(-10)
    };
    
    // Save metrics
    saveMetrics(metrics);
    
    // Print to console
    console.clear();
    console.log('='.repeat(60));
    console.log(`📊 NOSANA METRICS - ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));
    console.log(`\n🖥️  Nodes: ${metrics.summary.onlineNodes}/${metrics.summary.totalNodes} online`);
    console.log(`⚡ Active Jobs: ${metrics.summary.activeJobs}`);
    console.log(`📈 Utilization: ${metrics.summary.averageUtilization}%`);
    console.log(`💰 Earnings Today: ${metrics.summary.earningsTodayNOS.toFixed(2)} NOS (≈ $${metrics.summary.earningsTodayUSD.toFixed(2)})`);
    
    console.log('\n🖥️  Node Status:');
    for (const node of metrics.nodes) {
        const statusIcon = node.status === 'online' ? '🟢' : '🔴';
        console.log(`   ${statusIcon} ${node.id}: ${node.gpu} - ${node.activeJobs} jobs - ${node.utilization}% util`);
    }
    
    if (metrics.recentJobs.length > 0) {
        console.log('\n📋 Recent Jobs:');
        for (const job of metrics.recentJobs.slice(-5)) {
            console.log(`   ✅ ${job.jobId} | ${job.nodeId} | ${job.durationMinutes} min | ${job.earningsNOS.toFixed(2)} NOS`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📁 Logs saved to: ${METRICS_LOG}`);
}

async function showStatus() {
    console.log('\n📊 Current Status:');
    console.log('-'.repeat(40));
    
    // Load latest metrics
    let metrics = null;
    if (fs.existsSync(METRICS_LOG)) {
        try {
            const data = fs.readFileSync(METRICS_LOG, 'utf8');
            const logs = JSON.parse(data);
            metrics = logs[logs.length - 1];
        } catch (e) {
            console.log('   No metrics available');
        }
    }
    
    if (metrics) {
        console.log(`\n🕐 Last Update: ${metrics.timestamp}`);
        console.log(`🖥️  Nodes: ${metrics.summary.onlineNodes}/${metrics.summary.totalNodes} online`);
        console.log(`⚡ Active Jobs: ${metrics.summary.activeJobs}`);
        console.log(`📈 Utilization: ${metrics.summary.averageUtilization}%`);
        console.log(`💰 Total Earnings Today: ${metrics.summary.earningsTodayNOS.toFixed(2)} NOS`);
    } else {
        console.log('\n   No metrics available. Run monitor first: npm run monitor-jobs -- start');
    }
}

async function showHistory() {
    console.log('\n📜 Job History:');
    console.log('-'.repeat(40));
    
    if (fs.existsSync(JOBS_LOG)) {
        try {
            const jobs = JSON.parse(fs.readFileSync(JOBS_LOG, 'utf8'));
            const recentJobs = jobs.slice(-20);
            
            console.log(`\n${"Job ID".padEnd(20)} ${"Node".padEnd(12)} ${"Duration".padEnd(10)} ${"Earnings (NOS)".padEnd(15)} ${"Completed".padEnd(20)}`);
            console.log('-'.repeat(80));
            
            for (const job of recentJobs.reverse()) {
                const jobId = (job.jobId || 'unknown').slice(0, 18);
                const nodeId = (job.nodeId || 'unknown').slice(0, 10);
                const duration = `${job.durationMinutes || 0} min`;
                const earnings = (job.earningsNOS || 0).toFixed(2);
                const completedAt = job.completedAt ? new Date(job.completedAt).toLocaleString() : 'unknown';
                
                console.log(`${jobId.padEnd(20)} ${nodeId.padEnd(12)} ${duration.padEnd(10)} ${earnings.padEnd(15)} ${completedAt.padEnd(20)}`);
            }
            
            console.log(`\n📊 Total Jobs: ${jobs.length}`);
            const totalEarnings = jobs.reduce((sum, j) => sum + (j.earningsNOS || 0), 0);
            console.log(`💰 Total Earnings: ${totalEarnings.toFixed(2)} NOS`);
            
        } catch (e) {
            console.log('   Error reading job history:', e.message);
        }
    } else {
        console.log('\n   No job history available');
    }
}

async function resetMetrics() {
    console.log('\n🔄 Resetting metrics...');
    
    if (fs.existsSync(METRICS_LOG)) {
        fs.unlinkSync(METRICS_LOG);
        console.log('   ✅ Metrics log cleared');
    }
    
    if (fs.existsSync(JOBS_LOG)) {
        fs.unlinkSync(JOBS_LOG);
        console.log('   ✅ Jobs log cleared');
    }
    
    activeJobs = [];
    completedJobs = [];
    console.log('   ✅ In-memory state reset');
}

function calculateUtilization(activeJobsCount) {
    // Simulate utilization based on active jobs
    const maxJobs = GPU_NODES.filter(n => n.status === 'online').length * 2;
    return Math.min(100, Math.floor((activeJobsCount / maxJobs) * 100));
}

function simulateActiveJobs(count) {
    const onlineNodes = GPU_NODES.filter(n => n.status === 'online');
    const jobs = [];
    
    for (let i = 0; i < count; i++) {
        const node = onlineNodes[Math.floor(Math.random() * onlineNodes.length)];
        jobs.push({
            jobId: `job_${Date.now()}_${i}`,
            nodeId: node.id,
            gpu: node.gpu,
            startedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            estimatedDuration: Math.floor(Math.random() * 60) + 5, // 5-65 minutes
            status: 'running'
        });
    }
    
    return jobs;
}

function simulateCompletedJobs() {
    const newJobs = [];
    const now = Date.now();
    
    // Randomly generate 0-3 new completed jobs
    const numNewJobs = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numNewJobs; i++) {
        const node = GPU_NODES[Math.floor(Math.random() * GPU_NODES.length)];
        const durationMinutes = Math.floor(Math.random() * 60) + 5; // 5-65 minutes
        const earningsNOS = durationMinutes * 0.00833; // ~0.50 NOS per hour = 0.00833 per minute
        
        newJobs.push({
            jobId: `job_${now}_${i}`,
            nodeId: node.id,
            gpu: node.gpu,
            durationMinutes: durationMinutes,
            earningsNOS: earningsNOS,
            completedAt: new Date().toISOString(),
            status: 'completed'
        });
    }
    
    // Append to jobs log
    if (newJobs.length > 0) {
        let existingJobs = [];
        if (fs.existsSync(JOBS_LOG)) {
            try {
                existingJobs = JSON.parse(fs.readFileSync(JOBS_LOG, 'utf8'));
            } catch (e) {
                existingJobs = [];
            }
        }
        const updatedJobs = [...existingJobs, ...newJobs];
        fs.writeFileSync(JOBS_LOG, JSON.stringify(updatedJobs, null, 2));
    }
    
    return newJobs;
}

function saveMetrics(metrics) {
    let existingMetrics = [];
    if (fs.existsSync(METRICS_LOG)) {
        try {
            existingMetrics = JSON.parse(fs.readFileSync(METRICS_LOG, 'utf8'));
        } catch (e) {
            existingMetrics = [];
        }
    }
    
    // Keep last 1000 entries
    existingMetrics.push(metrics);
    if (existingMetrics.length > 1000) {
        existingMetrics = existingMetrics.slice(-1000);
    }
    
    fs.writeFileSync(METRICS_LOG, JSON.stringify(existingMetrics, null, 2));
}

function printHelp() {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                    NOSANA JOB MONITOR - HELP                     ║
╚══════════════════════════════════════════════════════════════════╝

USAGE:
  npm run monitor-jobs -- <command>

COMMANDS:
  start               Start continuous monitoring
  status              Show current status
  history             Show job history
  reset               Reset all metrics
  help                Show this help

EXAMPLES:
  npm run monitor-jobs -- start
  npm run monitor-jobs -- status
  npm run monitor-jobs -- history

CONFIGURATION:
  Edit MONITOR_INTERVAL in .env to change check frequency (default: 60000 ms)

LOGS:
  - Job history: logs/nosana-jobs.json
  - Metrics: logs/nosana-metrics.json
`);
}

// Execute
main().catch(console.error);