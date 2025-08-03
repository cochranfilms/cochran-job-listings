const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    console.log('📄 /api/uploaded-contracts endpoint hit');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const contractsPath = path.join(process.cwd(), 'uploaded-contracts.json');
        console.log('📁 Looking for contracts file at:', contractsPath);
        const contractsData = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));
        console.log('✅ Serving contracts data via API:', contractsData.contracts?.length || 0, 'contracts');
        res.json(contractsData);
    } catch (error) {
        console.error('❌ Error loading uploaded-contracts.json:', error);
        res.status(500).json({ 
            error: 'Failed to load contracts data', 
            details: error.message,
            path: path.join(process.cwd(), 'uploaded-contracts.json')
        });
    }
};