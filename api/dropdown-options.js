const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'dropdown-options.json');
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Dropdown options file not found' });
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        const options = JSON.parse(data);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        res.json(options);
    } catch (error) {
        console.error('Error reading dropdown options:', error);
        res.status(500).json({ error: 'Failed to load dropdown options' });
    }
}; 