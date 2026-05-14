// api.js - HPC Share API Client

const API_BASE = window.location.origin + '/api';

class HPCShareAPI {
    constructor() {
        this.brickkenToken = null;
        this.nosanaClient = null;
    }

    // Brickken Integration
    async getTokenHolders() {
        const response = await fetch(`${API_B