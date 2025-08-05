const AutomatedTestRunner = require('../test-runner-vercel');

module.exports = async (req, res) => {
    // Set CORS headers for Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'POST') {
            const { categories } = req.body;
            
            console.log('🧪 Starting automated test suite on Vercel...');
            console.log('📋 Selected categories:', categories);
            
            // Create test runner instance
            const testRunner = new AutomatedTestRunner();
            
            // Run tests based on selected categories
            const results = await testRunner.runAllTests(categories);
            
            // Prepare results (Vercel environment doesn't allow file writing)
            const filename = await testRunner.saveTestResults();
            console.log('💾 Test results prepared:', filename);
            
            // Return results to frontend
            res.status(200).json(results);
            
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('❌ Test runner API error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            stack: error.stack
        });
    }
}; 