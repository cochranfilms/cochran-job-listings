const fs = require('fs').promises;
const path = require('path');

// Performance reviews data file path
const PERFORMANCE_FILE = path.join(__dirname, '../performance.json');

// Load performance reviews data
async function loadPerformanceData() {
    try {
        const data = await fs.readFile(PERFORMANCE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading performance data:', error);
        return {
            performanceReviews: {},
            reviewOptions: {
                rating: [1, 2, 3, 4, 5],
                categories: [
                    "Professionalism",
                    "Quality", 
                    "Communication",
                    "Reliability",
                    "Overall Performance"
                ],
                status: ["pending", "completed", "overdue"]
            },
            lastUpdated: new Date().toISOString(),
            totalReviews: 0
        };
    }
}

// Save performance reviews data
async function savePerformanceData(data) {
    try {
        console.log('💾 Attempting to save performance data to:', PERFORMANCE_FILE);
        console.log('📊 Data to save:', JSON.stringify(data, null, 2));
        
        // Ensure the directory exists
        const dir = path.dirname(PERFORMANCE_FILE);
        try {
            await fs.access(dir);
            console.log('✅ Directory exists:', dir);
        } catch (dirError) {
            console.log('⚠️ Directory does not exist, creating:', dir);
            await fs.mkdir(dir, { recursive: true });
        }
        
        await fs.writeFile(PERFORMANCE_FILE, JSON.stringify(data, null, 2));
        console.log('✅ Performance data saved successfully');
        return true;
    } catch (error) {
        console.error('❌ Error saving performance data:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ File path:', PERFORMANCE_FILE);
        return false;
    }
}

// Authentication middleware (disabled for now - can be enhanced later)
function authenticateRequest(req, res) {
    // For now, allow all requests without authentication
    // TODO: Add proper authentication when needed
    return true;
}

module.exports = async (req, res) => {
    console.log('🔍 Performance API called:', req.method, req.url);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('✅ Handling preflight request');
        res.status(200).end();
        return;
    }

    try {
        const { method, url, params } = req;
        console.log('🔍 Full URL:', url);
        console.log('🔍 Method:', method);
        
        // Remove /api/performance prefix to get the remaining path
        const remainingPath = url.replace('/api/performance', '').replace(/^\/+/, '');
        const pathSegments = remainingPath.split('/').filter(Boolean);
        console.log('🔍 Remaining path:', remainingPath);
        console.log('🔍 Path segments:', pathSegments);
        
        const email = pathSegments[0]; // For /api/performance/:email

        // GET /api/performance - Get all performance reviews
        if (method === 'GET' && pathSegments.length === 0) {
            console.log('📖 Loading performance data...');
            const data = await loadPerformanceData();
            console.log('✅ Performance data loaded:', Object.keys(data.performanceReviews).length, 'reviews');
            res.json(data);
            return;
        }

        // GET /api/performance/:email - Get specific performance review
        if (method === 'GET' && pathSegments.length === 1) {
            const data = await loadPerformanceData();
            const review = data.performanceReviews[email];
            
            if (!review) {
                return res.status(404).json({ error: 'Performance review not found' });
            }
            
            res.json(review);
            return;
        }

        // GET /api/performance/options - Get review options
        if (method === 'GET' && pathSegments[0] === 'options') {
            const data = await loadPerformanceData();
            res.json(data.reviewOptions);
            return;
        }

        // POST /api/performance - Create/Update performance reviews
        if (method === 'POST' && pathSegments.length === 0) {
            console.log('📝 Processing POST request for performance reviews');
            const requestData = req.body;
            console.log('📥 Received request data:', JSON.stringify(requestData, null, 2));
            
            if (!requestData || !requestData.performanceReviews) {
                console.error('❌ Invalid request data - missing performanceReviews');
                return res.status(400).json({ error: 'Invalid request data' });
            }
            
            console.log('📖 Loading existing performance data...');
            const data = await loadPerformanceData();
            console.log('📊 Existing data loaded:', Object.keys(data.performanceReviews).length, 'reviews');
            
            data.performanceReviews = requestData.performanceReviews;
            data.lastUpdated = new Date().toISOString();
            data.totalReviews = Object.keys(requestData.performanceReviews).length;
            
            console.log('💾 Attempting to save updated data...');
            const success = await savePerformanceData(data);
            
            if (success) {
                console.log('✅ Performance reviews updated successfully');
                res.json({ message: 'Performance reviews updated successfully', totalReviews: data.totalReviews });
            } else {
                console.error('❌ Failed to save performance reviews');
                res.status(500).json({ error: 'Failed to save performance reviews' });
            }
            return;
        }

        // PUT /api/performance/:email - Update performance review (disabled in production)
        if (method === 'PUT' && pathSegments.length === 1) {
            return res.status(405).json({ error: 'Method not allowed - Use admin dashboard for updating reviews' });
        }

        // DELETE /api/performance/:email - Delete performance review (disabled in production)
        if (method === 'DELETE' && pathSegments.length === 1) {
            return res.status(405).json({ error: 'Method not allowed - Use admin dashboard for deleting reviews' });
        }

        // Method not allowed
        res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Error in performance API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 