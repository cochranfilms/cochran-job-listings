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
        await fs.writeFile(PERFORMANCE_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving performance data:', error);
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
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { method, url, params } = req;
        const pathSegments = url.split('/').filter(Boolean);
        const email = pathSegments[1]; // For /api/performance/:email

        // GET /api/performance - Get all performance reviews
        if (method === 'GET' && pathSegments.length === 1) {
            const data = await loadPerformanceData();
            res.json(data);
            return;
        }

        // GET /api/performance/:email - Get specific performance review
        if (method === 'GET' && pathSegments.length === 2) {
            const data = await loadPerformanceData();
            const review = data.performanceReviews[email];
            
            if (!review) {
                return res.status(404).json({ error: 'Performance review not found' });
            }
            
            res.json(review);
            return;
        }

        // GET /api/performance/options - Get review options
        if (method === 'GET' && pathSegments[1] === 'options') {
            const data = await loadPerformanceData();
            res.json(data.reviewOptions);
            return;
        }

        // POST /api/performance - Create/Update performance reviews
        if (method === 'POST' && pathSegments.length === 1) {
            const requestData = req.body;
            
            if (!requestData || !requestData.performanceReviews) {
                return res.status(400).json({ error: 'Invalid request data' });
            }
            
            const data = await loadPerformanceData();
            data.performanceReviews = requestData.performanceReviews;
            data.lastUpdated = new Date().toISOString();
            data.totalReviews = Object.keys(requestData.performanceReviews).length;
            
            const success = await savePerformanceData(data);
            
            if (success) {
                res.json({ message: 'Performance reviews updated successfully', totalReviews: data.totalReviews });
            } else {
                res.status(500).json({ error: 'Failed to save performance reviews' });
            }
            return;
        }

        // PUT /api/performance/:email - Update performance review (disabled in production)
        if (method === 'PUT' && pathSegments.length === 2) {
            return res.status(405).json({ error: 'Method not allowed - Use admin dashboard for updating reviews' });
        }

        // DELETE /api/performance/:email - Delete performance review (disabled in production)
        if (method === 'DELETE' && pathSegments.length === 2) {
            return res.status(405).json({ error: 'Method not allowed - Use admin dashboard for deleting reviews' });
        }

        // Method not allowed
        res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Error in performance API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 