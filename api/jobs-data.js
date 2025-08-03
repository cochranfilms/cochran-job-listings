const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    console.log('📄 /api/jobs-data endpoint hit');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const jobsPath = path.join(process.cwd(), 'jobs-data.json');
        console.log('📁 Looking for jobs file at:', jobsPath);
        const jobsData = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
        console.log('✅ Serving jobs data via API:', jobsData.jobs?.length || 0, 'jobs');
        res.json(jobsData);
    } catch (error) {
        console.error('❌ Error loading jobs-data.json:', error);
        res.status(500).json({ 
            error: 'Failed to load jobs data', 
            details: error.message, 
            path: path.join(process.cwd(), 'jobs-data.json') 
        });
    }
};