const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        // Only allow GET requests for now
        if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        // First, try to get the latest data from GitHub
        let usersData = null;
        let dataSource = 'local';
        
        try {
            console.log('🔄 Attempting to fetch latest users data from GitHub...');
            
            // Get GitHub configuration from environment variables
            const GITHUB_CONFIG = {
                token: process.env.GITHUB_TOKEN,
                owner: process.env.GITHUB_OWNER || 'cochranfilms',
                repo: process.env.GITHUB_REPO || 'cochran-job-listings',
                branch: process.env.GITHUB_BRANCH || 'main'
            };

            if (GITHUB_CONFIG.token) {
                const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/users.json?ref=${GITHUB_CONFIG.branch}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `token ${GITHUB_CONFIG.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Cochran-Films-Users-API'
                    }
                });

                if (response.ok) {
                    const fileData = await response.json();
                    const content = Buffer.from(fileData.content, 'base64').toString();
                    usersData = JSON.parse(content);
                    dataSource = 'github';
                    console.log('✅ Successfully loaded users data from GitHub');
                    
                    // Update local file with GitHub data for consistency
                    const usersFilePath = path.join(__dirname, '..', 'users.json');
                    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
                    console.log('✅ Updated local users.json with GitHub data');
                } else {
                    console.warn('⚠️ Could not fetch from GitHub, falling back to local file');
                }
            } else {
                console.warn('⚠️ GitHub token not configured, using local file');
            }
        } catch (githubError) {
            console.warn('⚠️ Error fetching from GitHub:', githubError.message);
        }

        // If GitHub fetch failed, use local file
        if (!usersData) {
            console.log('📄 Loading users data from local file...');
            const usersFilePath = path.join(__dirname, '..', 'users.json');
            
            if (!fs.existsSync(usersFilePath)) {
                // If users.json doesn't exist, try to create it from existing data
                console.log('⚠️ users.json not found, attempting to create from existing data...');
                
                // Try to read freelancers.json and project-status.json to create users.json
                const freelancersPath = path.join(__dirname, '..', 'freelancers.json');
                const projectStatusPath = path.join(__dirname, '..', 'project-status.json');
                
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
                usersData = {
                    users: users,
                    statusOptions: {
                        projectStatus: ["upcoming", "in-progress", "completed", "cancelled"],
                        paymentStatus: ["pending", "processing", "paid", "overdue"]
                    },
                    lastUpdated: new Date().toISOString().split('T')[0],
                    totalUsers: Object.keys(users).length
                };
                
                fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
                console.log('✅ Created users.json from existing data');
            } else {
                // Read and return the users data
                usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
            }
        }
        
        // Add metadata about data source
        usersData._metadata = {
            dataSource: dataSource,
            fetchedAt: new Date().toISOString(),
            totalUsers: Object.keys(usersData.users || {}).length
        };
        
        console.log(`✅ Returning users data (source: ${dataSource}, users: ${usersData._metadata.totalUsers})`);
        res.status(200).json(usersData);
        
    } catch (error) {
        console.error('❌ Error in users API:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
}; 