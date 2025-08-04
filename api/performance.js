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

// Authentication middleware (you can enhance this)
function authenticateRequest(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Missing or invalid token' });
    }
    
    const token = authHeader.substring(7);
    // Add your token validation logic here
    // For now, we'll accept any token for development
    
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

        // POST /api/performance - Create new performance review
        if (method === 'POST' && pathSegments.length === 1) {
            if (!authenticateRequest(req, res)) {
                return;
            }

            const {
                userEmail,
                overallRating,
                categories,
                comments,
                adminNotes,
                status = 'completed',
                reviewedBy = 'admin'
            } = req.body;
            
            if (!userEmail || !overallRating || !categories) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            
            const data = await loadPerformanceData();
            
            // Check if review already exists
            if (data.performanceReviews[userEmail]) {
                return res.status(409).json({ error: 'Performance review already exists for this user' });
            }
            
            // Create new review
            const newReview = {
                userEmail,
                reviewDate: new Date().toISOString().split('T')[0],
                overallRating: parseInt(overallRating),
                categories,
                comments: comments || '',
                adminNotes: adminNotes || '',
                status,
                reviewedBy,
                lastUpdated: new Date().toISOString()
            };
            
            data.performanceReviews[userEmail] = newReview;
            data.totalReviews = Object.keys(data.performanceReviews).length;
            data.lastUpdated = new Date().toISOString();
            
            const saved = await savePerformanceData(data);
            if (!saved) {
                return res.status(500).json({ error: 'Failed to save performance review' });
            }
            
            res.status(201).json({
                message: 'Performance review created successfully',
                review: newReview
            });
            return;
        }

        // PUT /api/performance/:email - Update performance review
        if (method === 'PUT' && pathSegments.length === 2) {
            if (!authenticateRequest(req, res)) {
                return;
            }

            const {
                overallRating,
                categories,
                comments,
                adminNotes,
                status
            } = req.body;
            
            const data = await loadPerformanceData();
            
            if (!data.performanceReviews[email]) {
                return res.status(404).json({ error: 'Performance review not found' });
            }
            
            // Update review
            const updatedReview = {
                ...data.performanceReviews[email],
                ...(overallRating && { overallRating: parseInt(overallRating) }),
                ...(categories && { categories }),
                ...(comments !== undefined && { comments }),
                ...(adminNotes !== undefined && { adminNotes }),
                ...(status && { status }),
                lastUpdated: new Date().toISOString()
            };
            
            data.performanceReviews[email] = updatedReview;
            data.lastUpdated = new Date().toISOString();
            
            const saved = await savePerformanceData(data);
            if (!saved) {
                return res.status(500).json({ error: 'Failed to update performance review' });
            }
            
            res.json({
                message: 'Performance review updated successfully',
                review: updatedReview
            });
            return;
        }

        // DELETE /api/performance/:email - Delete performance review
        if (method === 'DELETE' && pathSegments.length === 2) {
            if (!authenticateRequest(req, res)) {
                return;
            }

            const data = await loadPerformanceData();
            
            if (!data.performanceReviews[email]) {
                return res.status(404).json({ error: 'Performance review not found' });
            }
            
            // Delete review
            delete data.performanceReviews[email];
            data.totalReviews = Object.keys(data.performanceReviews).length;
            data.lastUpdated = new Date().toISOString();
            
            const saved = await savePerformanceData(data);
            if (!saved) {
                return res.status(500).json({ error: 'Failed to delete performance review' });
            }
            
            res.json({
                message: 'Performance review deleted successfully',
                deletedEmail: email
            });
            return;
        }

        // Method not allowed
        res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Error in performance API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 