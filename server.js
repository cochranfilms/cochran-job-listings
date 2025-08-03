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
    console.error('Set it with: export GITHUB_TOKEN=your_token_here');
    process.exit(1);
}

console.log('✅ GitHub configuration loaded:');
console.log(`   Owner: ${GITHUB_CONFIG.owner}`);
console.log(`   Repo: ${GITHUB_CONFIG.repo}`);
console.log(`   Branch: ${GITHUB_CONFIG.branch}`);
console.log(`   Token: ${GITHUB_CONFIG.token.substring(0, 10)}...${GITHUB_CONFIG.token.substring(GITHUB_CONFIG.token.length - 4)}`);

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
        
        const updateData = {
            message,
            content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
            branch: GITHUB_CONFIG.branch
        };
        
        if (sha) {
            updateData.sha = sha;
        }
        
        const data = await githubAPI(`/contents/${filename}`, 'PUT', updateData);
        res.json(data);
    } catch (error) {
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        githubConfigured: !!GITHUB_CONFIG.token
    });
});

// Serve the main HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'contract.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// Start server
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