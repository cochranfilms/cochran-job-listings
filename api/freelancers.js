const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    console.log('📄 /api/freelancers endpoint hit');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const freelancersPath = path.join(process.cwd(), 'freelancers.json');
        console.log('📁 Looking for freelancers file at:', freelancersPath);
        const freelancersData = JSON.parse(fs.readFileSync(freelancersPath, 'utf8'));
        console.log('✅ Serving freelancers data via API:', freelancersData.freelancers?.length || 0, 'freelancers');
        res.json(freelancersData);
    } catch (error) {
        console.error('❌ Error loading freelancers.json:', error);
        res.status(500).json({ 
            error: 'Failed to load freelancers data', 
            details: error.message,
            path: path.join(process.cwd(), 'freelancers.json')
        });
    }
};