const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import API routes
const performanceRouter = require('./api/performance');
const firebaseRouter = require('./api/firebase');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API Routes
app.get('/api/users', async (req, res) => {
    try {
        const usersPath = path.join(__dirname, 'users.json');
        
        if (!fs.existsSync(usersPath)) {
            console.log('⚠️ users.json not found, attempting to create from existing data...');
            
            // Try to read freelancers.json and project-status.json to create users.json
            const freelancersPath = path.join(__dirname, 'freelancers.json');
            const projectStatusPath = path.join(__dirname, 'project-status.json');
            
            let users = {};
            
            if (fs.existsSync(freelancersPath)) {
                const freelancersData = JSON.parse(fs.readFileSync(freelancersPath, 'utf8'));
                const approvedFreelancers = freelancersData.approvedFreelancers || {};
                
                // Convert freelancers data to users format
                Object.entries(approvedFreelancers).forEach(([name, data]) => {
                    users[name] = {
                        profile: {
                            email: data.email,
                            password: data.password,
                            role: data.role,
                            location: data.location,
                            projectStart: data.projectStart,
                            rate: data.rate,
                            approvedDate: data.approvedDate
                        },
                        contract: {
                            contractUrl: data.contractUrl,
                            contractStatus: data.contractStatus || 'pending',
                            contractSignedDate: data.contractSignedDate || null,
                            contractUploadedDate: data.contractUploadedDate || null,
                            contractId: data.contractId || null
                        },
                        jobs: {},
                        primaryJob: data.primaryJob || null,
                        paymentMethod: data.paymentMethod || null
                    };
                });
            }
            
            if (fs.existsSync(projectStatusPath)) {
                const projectStatusData = JSON.parse(fs.readFileSync(projectStatusPath, 'utf8'));
                const projectStatus = projectStatusData.projectStatus || {};
                
                // Merge project status data into users
                Object.entries(projectStatus).forEach(([name, data]) => {
                    if (users[name]) {
                        users[name].jobs = data.jobs || {};
                    } else {
                        // Create user if they don't exist
                        users[name] = {
                            profile: {},
                            contract: {},
                            jobs: data.jobs || {},
                            paymentMethod: null
                        };
                    }
                });
            }
            
            // Create the users.json file
            const usersData = {
                users: users,
                statusOptions: {
                    projectStatus: ["upcoming", "in-progress", "completed", "cancelled"],
                    paymentStatus: ["pending", "processing", "paid", "overdue"]
                },
                lastUpdated: new Date().toISOString().split('T')[0],
                totalUsers: Object.keys(users).length
            };
            
            fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
            console.log('✅ Created users.json from existing data');
        }
        
        // Read and return the users data
        const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        
        res.status(200).json(usersData);
        
    } catch (error) {
        console.error('❌ Error in users API:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

app.get('/api/jobs-data', async (req, res) => {
    try {
        const jobsPath = path.join(__dirname, 'jobs-data.json');
        
        if (fs.existsSync(jobsPath)) {
            const jobsData = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
            res.status(200).json(jobsData);
        } else {
            res.status(200).json({
                jobs: [],
                lastUpdated: new Date().toISOString().split('T')[0],
                totalJobs: 0
            });
        }
    } catch (error) {
        console.error('❌ Error in jobs API:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

app.get('/api/uploaded-contracts', async (req, res) => {
    try {
        const contractsPath = path.join(__dirname, 'uploaded-contracts.json');
        
        if (fs.existsSync(contractsPath)) {
            const contractsData = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));
            res.status(200).json(contractsData);
        } else {
            res.status(200).json({
                uploadedContracts: [],
                lastUpdated: new Date().toISOString().split('T')[0],
                totalContracts: 0
            });
        }
    } catch (error) {
        console.error('❌ Error in contracts API:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

app.get('/api/dropdown-options', async (req, res) => {
    try {
        const dropdownPath = path.join(__dirname, 'dropdown-options.json');
        
        if (fs.existsSync(dropdownPath)) {
            const dropdownData = JSON.parse(fs.readFileSync(dropdownPath, 'utf8'));
            res.status(200).json(dropdownData);
        } else {
            // Return default options
            res.status(200).json({
                roles: ['Backdrop Photographer', 'Editor', 'Videographer', 'Photographer', 'Full Stack Designer', 'Video Editor', 'Corporate Videographer'],
                locations: ['6695 Church Street, Douglasville, GA 30134', 'Sandy Springs, GA', 'Douglasville, GA', 'Atlanta, GA', 'Atlanta Area'],
                rates: ['$400.00 USD (Flat)', '$450.00 USD (Flat)', '$500.00 USD (Flat)', '$750.00 USD (Flat)', '$900.00 USD (Flat)', '$150/day', '$200/day'],
                projectTypes: ['Photography', 'Video', 'Editor Project', 'Corporate Video', 'Event Coverage', 'Product Photography', 'Real Estate', 'Wedding', 'Commercial'],
                paymentMethods: ['Cash', 'Check', 'Zelle', 'PayPal', 'Invoice Request'],
                projectStatuses: ['upcoming', 'in-progress', 'completed', 'cancelled'],
                paymentStatuses: ['pending', 'processing', 'paid', 'overdue']
            });
        }
    } catch (error) {
        console.error('❌ Error in dropdown API:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// GitHub API endpoints (simplified for local testing)
app.get('/api/github/info', async (req, res) => {
    try {
        // For local testing, return a mock SHA
        res.status(200).json({
            sha: 'mock-sha-for-local-testing',
            message: 'Local development mode'
        });
    } catch (error) {
        console.error('❌ Error in GitHub info API:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

app.put('/api/github/file/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const { content, message, sha } = req.body;
        
        if (!content || !message) {
            return res.status(400).json({ error: 'content and message are required' });
        }

        // For local testing, just log the update
        console.log(`🔄 Local GitHub update: ${filename}`);
        console.log(`📝 Message: ${message}`);
        console.log(`📄 Content length: ${content.length} characters`);
        
        // In a real environment, this would update the file on GitHub
        // For local testing, we'll just return success
        res.status(200).json({
            commit: {
                sha: 'local-test-sha',
                message: message
            },
            content: {
                sha: 'local-content-sha'
            }
        });
        
    } catch (error) {
        console.error('❌ Error in GitHub file API:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Performance API routes
app.use('/api/performance', performanceRouter);

// Firebase API routes
app.use('/api/firebase', firebaseRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: 'local-development'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Local server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available:`);
    console.log(`   - GET  /api/users`);
    console.log(`   - GET  /api/jobs-data`);
    console.log(`   - GET  /api/uploaded-contracts`);
    console.log(`   - GET  /api/dropdown-options`);
    console.log(`   - GET  /api/health`);
    console.log(`   - GET  /api/performance`);
    console.log(`   - POST /api/performance`);
    console.log(`   - PUT  /api/performance/:email`);
    console.log(`   - DELETE /api/performance/:email`);
    console.log(`   - DELETE /api/firebase (delete user)`);
    console.log(`   - PUT  /api/github/file/:filename`);
    console.log(`\n🌐 Test page: http://localhost:${PORT}/test-api.html`);
    console.log(`📋 Admin dashboard: http://localhost:${PORT}/admin-dashboard.html`);
}); 