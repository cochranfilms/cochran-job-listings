const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// GitHub configuration from environment variables
const GITHUB_CONFIG = {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER || 'cochranfilms',
    repo: process.env.GITHUB_REPO || 'cochran-job-listings',
    branch: process.env.GITHUB_BRANCH || 'main'
};

// Validate GitHub token is set
if (!GITHUB_CONFIG.token) {
    console.error('❌ GITHUB_TOKEN environment variable is required!');
    console.error('Please set the GITHUB_TOKEN environment variable in your Vercel dashboard');
    process.exit(1);
}

console.log('✅ GitHub configuration loaded:');
console.log(`   Owner: ${GITHUB_CONFIG.owner}`);
console.log(`   Repo: ${GITHUB_CONFIG.repo}`);
console.log(`   Branch: ${GITHUB_CONFIG.branch}`);
console.log(`   Token: configured ✓`);

// GitHub API helper function
async function githubAPI(endpoint, method = 'GET', body = null) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}${endpoint}`;
    
    const options = {
        method,
        headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${data.message || response.statusText}`);
        }
        
        return data;
    } catch (error) {
        console.error('GitHub API error:', error);
        throw error;
    }
}

// Routes

// Get file contents
app.get('/api/github/file/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const data = await githubAPI(`/contents/${filename}`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update file contents
app.put('/api/github/file/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const { content, message, sha } = req.body;
        
        console.log(`📝 PUT request for ${filename}:`, { content: typeof content, message, sha: sha ? 'present' : 'none' });
        
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        
        if (!message) {
            return res.status(400).json({ error: 'Commit message is required' });
        }
        
        // Convert content to base64 - handle both object and string content
        let contentString;
        if (typeof content === 'string') {
            contentString = content;
        } else {
            contentString = JSON.stringify(content, null, 2);
        }
        
        const updateData = {
            message,
            content: Buffer.from(contentString).toString('base64'),
            branch: GITHUB_CONFIG.branch
        };
        
        if (sha) {
            updateData.sha = sha;
        }
        
        const data = await githubAPI(`/contents/${filename}`, 'PUT', updateData);
        res.json(data);
    } catch (error) {
        console.error(`❌ PUT /api/github/file/${req.params.filename} error:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Upload file (for PDFs)
app.post('/api/github/upload/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const { content, message } = req.body;
        
        const uploadData = {
            message,
            content: content, // Already base64 encoded
            branch: GITHUB_CONFIG.branch
        };
        
        const data = await githubAPI(`/contents/${filename}`, 'PUT', uploadData);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get repository info
app.get('/api/github/info', (req, res) => {
    res.json({
        owner: GITHUB_CONFIG.owner,
        repo: GITHUB_CONFIG.repo,
        branch: GITHUB_CONFIG.branch,
        tokenConfigured: !!GITHUB_CONFIG.token
    });
});

// Old JSON file routes removed - now using /api/ routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        githubConfigured: !!GITHUB_CONFIG.token,
        deployment: 'v2.0.3' // Force new deployment
    });
});

// JSON Data API Routes (replacing direct file serving)
app.get('/api/jobs-data', (req, res) => {
    try {
        const jobs = require('./jobs-data.json');
        console.log('✅ Serving jobs data via API:', jobs.jobs.length, 'jobs');
        res.json(jobs);
    } catch (error) {
        console.error('❌ Error loading jobs-data.json:', error);
        res.status(500).json({ error: 'Failed to load jobs data' });
    }
});

app.get('/api/freelancers', (req, res) => {
    try {
        const freelancers = require('./freelancers.json');
        console.log('✅ Serving freelancers data via API');
        res.json(freelancers);
    } catch (error) {
        console.error('❌ Error loading freelancers.json:', error);
        res.status(500).json({ error: 'Failed to load freelancers data' });
    }
});

app.get('/api/uploaded-contracts', (req, res) => {
    try {
        const contracts = require('./uploaded-contracts.json');
        res.json(contracts);
    } catch (error) {
        console.error('❌ Error loading uploaded-contracts.json:', error);
        res.status(500).json({ error: 'Failed to load contracts data' });
    }
});

app.get('/api/project-status', (req, res) => {
    try {
        const status = require('./project-status.json');
        res.json(status);
    } catch (error) {
        console.error('❌ Error loading project-status.json:', error);
        res.status(500).json({ error: 'Failed to load project status data' });
    }
});

// JSON routes moved above

// Serve the main HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/contract', (req, res) => {
    res.sendFile(path.join(__dirname, 'contract.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/user-portal', (req, res) => {
    res.sendFile(path.join(__dirname, 'user-portal.html'));
});

// Start server (only for local development)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📄 Contract page: http://localhost:${PORT}/`);
        console.log(`⚙️  Admin dashboard: http://localhost:${PORT}/admin`);
        console.log(`🔧 API endpoints:`);
        console.log(`   GET  /api/github/file/:filename`);
        console.log(`   PUT  /api/github/file/:filename`);
        console.log(`   POST /api/github/upload/:filename`);
        console.log(`   GET  /api/github/info`);
        console.log(`   GET  /api/health`);
    });
}

// Export for Vercel serverless functions
module.exports = app; 