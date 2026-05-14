// app.js - HPC Share Main Application Logic
// Shared functionality for landing page and common components

// Global state
let currentPage = 'home';
let mobileMenuOpen = false;

// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initFAQAccordion();
    initMobileMenu();
    initAnimations();
    loadDynamicContent();
});

function initEventListeners() {
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
                
                // Close mobile menu if open
                if (mobileMenuOpen) {
                    toggleMobileMenu();
                }
            }
        });
    });
    
    // FAQ accordion (for landing page)
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            if (faqItem) {
                faqItem.classList.toggle('open');
            }
        });
    });
    
    // Add hover effects to stat cards
    document.querySelectorAll('.stat-card, .step, .card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.transition = 'transform 0.2s ease';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

function initFAQAccordion() {
    // Open first FAQ item by default
    const firstFaq = document.querySelector('.faq-item');
    if (firstFaq) {
        firstFaq.classList.add('open');
    }
}

function initMobileMenu() {
    if (!mobileMenuBtn) return;
    
    // Create mobile menu overlay if needed
    const nav = document.querySelector('.nav-links');
    if (nav) {
        nav.style.transition = 'all 0.3s ease';
    }
}

function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    
    if (navLinks) {
        if (mobileMenuOpen) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.backgroundColor = 'white';
            navLinks.style.padding = '1rem';
            navLinks.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
            navLinks.style.zIndex = '100';
        } else {
            navLinks.style.display = '';
            navLinks.style.flexDirection = '';
            navLinks.style.position = '';
            navLinks.style.top = '';
            navLinks.style.left = '';
            navLinks.style.right = '';
            navLinks.style.backgroundColor = '';
            navLinks.style.padding = '';
            navLinks.style.boxShadow = '';
            navLinks.style.zIndex = '';
        }
    }
}

function initAnimations() {
    // Add fade-in animation to sections on scroll
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Animate stat values on scroll
    const statValues = document.querySelectorAll('.stat-value');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateValue(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statValues.forEach(stat => statObserver.observe(stat));
}

function animateValue(element) {
    const targetText = element.textContent;
    const targetNumber = parseFloat(targetText.replace(/[^0-9.-]+/g, ''));
    
    if (isNaN(targetNumber)) return;
    
    const suffix = targetText.replace(/[0-9.-]/g, '');
    let current = 0;
    const increment = targetNumber / 50;
    const duration = 1500;
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetNumber) {
            element.textContent = targetNumber.toLocaleString() + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString() + suffix;
        }
    }, stepTime);
}

async function loadDynamicContent() {
    // Load dynamic data for landing page
    try {
        await loadTokenStats();
        await loadNewsUpdates();
    } catch (error) {
        console.log('Dynamic content load failed (expected if APIs not configured)');
    }
}

async function loadTokenStats() {
    // In production, fetch from API
    // const response = await fetch('/api/token/stats');
    // const data = await response.json();
    
    // Simulated data
    const stats = {
        totalSupply: 1000000,
        holders: 47,
        apy: 12.5,
        price: 1.00
    };
    
    // Update DOM if elements exist
    const supplyEl = document.querySelector('.stat-supply');
    const holdersEl = document.querySelector('.stat-holders');
    const apyEl = document.querySelector('.stat-apy');
    
    if (supplyEl) supplyEl.textContent = stats.totalSupply.toLocaleString();
    if (holdersEl) holdersEl.textContent = stats.holders;
    if (apyEl) apyEl.textContent = stats.apy + '%';
}

async function loadNewsUpdates() {
    // In production, fetch from blog or RSS
    const newsContainer = document.querySelector('.news-updates');
    if (!newsContainer) return;
    
    // Simulated news
    const news = [
        { date: '2027-04-15', title: 'Q1 2027 Distribution of $9,677 USDC completed' },
        { date: '2027-04-10', title: 'Node node-04 back online after maintenance' },
        { date: '2027-04-05', title: 'New investor: Elena Petrova joins with 2,000 HPC' }
    ];
    
    newsContainer.innerHTML = news.map(item => `
        <div class="news-item">
            <span class="news-date">${item.date}</span>
            <span class="news-title">${item.title}</span>
        </div>
    `).join('');
}

// Utility functions
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function truncateAddress(address, startLength = 6, endLength = 4) {
    if (!address) return '';
    if (address.length <= startLength + endLength) return address;
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    }).catch(() => {
        alert('Could not copy to clipboard');
    });
}

function showToast(message, duration = 3000) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #1e293b;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 2rem;
        font-size: 0.875rem;
        z-index: 1000;
        animation: fadeInOut ${duration}ms ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, duration);
}

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        10% { opacity: 1; transform: translateX(-50%) translateY(0); }
        90% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatDate,
        truncateAddress,
        copyToClipboard,
        showToast
    };
}