const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

class AutomatedTestRunner {
    constructor() {
        // Use the actual domain for Vercel deployment
        this.baseUrl = 'https://collaborate.cochranfilms.com';
        this.testResults = {
            timestamp: new Date().toISOString(),
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            },
            tests: [],
            systemHealth: {},
            recommendations: []
        };
        
        // Test data for creating/updating records
        this.testData = {
            user: {
                name: 'Test User',
                email: 'test@cochranfilms.com',
                role: 'Photographer',
                location: 'Atlanta, GA',
                rate: '$400.00 USD (Flat)',
                projectStart: '2025-01-15',
                approvedDate: new Date().toISOString().split('T')[0],
                // Ensure test user doesn't interfere with real data
                isTestUser: true,
                testData: true
            },
            job: {
                title: 'Test Photography Job',
                date: '2025-12-15',
                location: 'Atlanta, GA',
                pay: '$500',
                description: 'Test job for automated testing',
                status: 'Active',
                // Ensure test job doesn't interfere with real data
                isTestJob: true,
                testData: true
            },
            contract: {
                fileName: 'test-contract.pdf',
                contractId: 'TEST-001',
                status: 'pending',
                uploadedDate: new Date().toISOString(),
                // Ensure test contract doesn't interfere with real data
                isTestContract: true,
                testData: true
            },
            performance: {
                rating: 4,
                category: 'Professionalism',
                notes: 'Test performance review',
                status: 'completed',
                // Ensure test performance review doesn't interfere with real data
                isTestReview: true,
                testData: true
            },
            notification: {
                title: 'Test Notification',
                message: 'This is a test notification',
                type: 'info',
                read: false,
                timestamp: new Date().toISOString(),
                // Ensure test notification doesn't interfere with real data
                isTestNotification: true,
                testData: true
            }
        };
        
        // Initialize test data tracking for cleanup
        this.testDataLog = [];
        this.testDataLogFile = `test-data-log-${new Date().toISOString().split('T')[0]}.json`;
    }

    async log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            test: '🧪'
        }[type] || 'ℹ️';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    // Internal logging for test data tracking and cleanup
    logTestData(action, data) {
        const logEntry = {
            action: action,
            timestamp: new Date().toISOString(),
            data: data
        };
        
        this.testDataLog.push(logEntry);
        
        // In Vercel environment, we can't write files, so we'll just log to console
        try {
            console.log(`📝 Test data logged: ${action}`, logEntry);
        } catch (error) {
            console.error('❌ Failed to log test data:', error.message);
        }
    }

    getTestDataForCleanup() {
        const cleanupData = {
            users: [],
            jobs: [],
            contracts: [],
            performance: [],
            notifications: [],
            files: []
        };
        
        this.testDataLog.forEach(entry => {
            switch (entry.action) {
                case 'USER_CREATED':
                    cleanupData.users.push(entry.data.email);
                    break;
                case 'JOB_CREATED':
                    cleanupData.jobs.push(entry.data.title);
                    break;
                case 'CONTRACT_CREATED':
                    cleanupData.contracts.push({
                        fileName: entry.data.fileName,
                        contractId: entry.data.contractId
                    });
                    cleanupData.files.push(entry.data.fileName);
                    break;
                case 'PERFORMANCE_CREATED':
                    cleanupData.performance.push(entry.data.email);
                    break;
                case 'NOTIFICATION_CREATED':
                    cleanupData.notifications.push(entry.data.title);
                    break;
            }
        });
        
        return cleanupData;
    }

    async cleanupTestData() {
        await this.log('🧹 Starting test data cleanup...', 'info');
        const cleanupData = this.getTestDataForCleanup();
        let cleanedCount = 0;
        
        try {
            // Clean up users
            if (cleanupData.users.length > 0) {
                try {
                    const usersData = JSON.parse(await fs.readFile('users.json', 'utf8'));
                    const initialCount = usersData.users.length;
                    usersData.users = usersData.users.filter(user => 
                        !cleanupData.users.includes(user.email)
                    );
                    usersData.totalUsers = usersData.users.length;
                    usersData.lastUpdated = new Date().toISOString().split('T')[0];
                    await fs.writeFile('users.json', JSON.stringify(usersData, null, 2));
                    cleanedCount += initialCount - usersData.users.length;
                } catch (error) {
                    console.log(`⚠️ Could not clean up users: ${error.message}`);
                }
            }
            
            // Clean up jobs
            if (cleanupData.jobs.length > 0) {
                try {
                    const jobsData = JSON.parse(await fs.readFile('jobs-data.json', 'utf8'));
                    const initialCount = jobsData.jobs.length;
                    jobsData.jobs = jobsData.jobs.filter(job => 
                        !cleanupData.jobs.includes(job.title)
                    );
                    jobsData.totalJobs = jobsData.jobs.length;
                    jobsData.lastUpdated = new Date().toISOString().split('T')[0];
                    await fs.writeFile('jobs-data.json', JSON.stringify(jobsData, null, 2));
                    cleanedCount += initialCount - jobsData.jobs.length;
                } catch (error) {
                    console.log(`⚠️ Could not clean up jobs: ${error.message}`);
                }
            }
            
            // Clean up contracts
            if (cleanupData.contracts.length > 0) {
                try {
                    const contractsData = JSON.parse(await fs.readFile('uploaded-contracts.json', 'utf8'));
                    const initialCount = contractsData.uploadedContracts.length;
                    contractsData.uploadedContracts = contractsData.uploadedContracts.filter(contract => 
                        !cleanupData.contracts.some(c => c.fileName === contract.fileName)
                    );
                    contractsData.totalContracts = contractsData.uploadedContracts.length;
                    contractsData.lastUpdated = new Date().toISOString().split('T')[0];
                    await fs.writeFile('uploaded-contracts.json', JSON.stringify(contractsData, null, 2));
                    cleanedCount += initialCount - contractsData.uploadedContracts.length;
                } catch (error) {
                    console.log(`⚠️ Could not clean up contracts: ${error.message}`);
                }
            }
            
            // Clean up performance reviews
            if (cleanupData.performance.length > 0) {
                try {
                    const performanceData = JSON.parse(await fs.readFile('performance.json', 'utf8'));
                    const initialCount = performanceData.reviews.length;
                    performanceData.reviews = performanceData.reviews.filter(review => 
                        !cleanupData.performance.includes(review.email)
                    );
                    performanceData.totalReviews = performanceData.reviews.length;
                    performanceData.lastUpdated = new Date().toISOString().split('T')[0];
                    await fs.writeFile('performance.json', JSON.stringify(performanceData, null, 2));
                    cleanedCount += initialCount - performanceData.reviews.length;
                } catch (error) {
                    console.log(`⚠️ Could not clean up performance reviews: ${error.message}`);
                }
            }
            
            // Clean up notifications
            if (cleanupData.notifications.length > 0) {
                try {
                    const notificationsData = JSON.parse(await fs.readFile('notifications.json', 'utf8'));
                    const initialCount = notificationsData.notifications.length;
                    notificationsData.notifications = notificationsData.notifications.filter(notification => 
                        !cleanupData.notifications.includes(notification.title)
                    );
                    notificationsData.totalNotifications = notificationsData.notifications.length;
                    notificationsData.unreadCount = notificationsData.notifications.filter(n => !n.read).length;
                    notificationsData.lastUpdated = new Date().toISOString().split('T')[0];
                    await fs.writeFile('notifications.json', JSON.stringify(notificationsData, null, 2));
                    cleanedCount += initialCount - notificationsData.notifications.length;
                } catch (error) {
                    console.log(`⚠️ Could not clean up notifications: ${error.message}`);
                }
            }
            
            // Clean up test files (Vercel environment - files are read-only)
            cleanupData.files.forEach(fileName => {
                try {
                    console.log(`📄 Test file cleanup skipped (Vercel read-only): ${fileName}`);
                    // In Vercel environment, we can't delete files, so we just log
                } catch (error) {
                    console.log(`⚠️ Could not process test file: ${fileName}`);
                }
            });
            
            // Clean up PDF files via GitHub API
            if (cleanupData.contracts.length > 0) {
                for (const contract of cleanupData.contracts) {
                    if (contract.fileName) {
                        try {
                            console.log(`🗑️ Attempting to delete test PDF file: ${contract.fileName}`);
                            const deleteResponse = await fetch(`${this.baseUrl}/api/github/file/${contract.fileName}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    message: `Cleanup test contract ${contract.contractId || 'unknown'} - ${contract.fileName}`,
                                    sha: 'latest'
                                })
                            });
                            
                            if (deleteResponse.ok || deleteResponse.status === 404) {
                                console.log(`✅ Deleted test PDF file: ${contract.fileName}`);
                            } else {
                                console.log(`⚠️ Could not delete test PDF file: ${contract.fileName} (Status: ${deleteResponse.status})`);
                            }
                        } catch (error) {
                            console.log(`⚠️ Could not cleanup PDF file: ${error.message}`);
                        }
                    }
                }
            }
            
            await this.log(`✅ Cleanup completed: ${cleanedCount} items removed`, 'success');
            
            // Clear the test data log (Vercel environment)
            this.testDataLog = [];
            console.log('🧹 Test data log cleared (Vercel environment)');
            
        } catch (error) {
            await this.log(`❌ Cleanup failed: ${error.message}`, 'error');
        }
    }

    async runTest(testName, testFunction) {
        const startTime = Date.now();
        
        try {
            await this.log(`🧪 Starting test: ${testName}`, 'test');
            const result = await testFunction();
            const duration = Date.now() - startTime;
            
            if (result.success) {
                await this.log(`✅ PASSED: ${testName}`, 'success');
            } else {
                await this.log(`❌ FAILED: ${testName}`, 'error');
            }
            
            return {
                name: testName,
                success: result.success,
                message: result.message,
                details: result.details || {},
                duration: duration,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            const duration = Date.now() - startTime;
            await this.log(`❌ ERROR in ${testName}: ${error.message}`, 'error');
            
            return {
                name: testName,
                success: false,
                message: `Test failed with error: ${error.message}`,
                details: { error: error.message },
                duration: duration,
                timestamp: new Date().toISOString()
            };
        }
    }

    async testServerHealth() {
        return this.runTest('Server Health Check', async () => {
            const response = await fetch(`${this.baseUrl}/api/health`);
            
            if (!response.ok) {
                throw new Error(`Server health check failed: ${response.status}`);
            }
            
            const data = await response.json();
            return {
                success: true,
                message: 'Server is healthy and responding',
                details: data
            };
        });
    }

    async testFileSystemAccess() {
        return this.runTest('File System Access', async () => {
            const requiredFiles = [
                'users.json',
                'jobs-data.json', 
                'uploaded-contracts.json',
                'dropdown-options.json',
                'performance.json',
                'notifications.json'
            ];
            
            const fileStatus = {};
            
            for (const file of requiredFiles) {
                try {
                    const stats = await fs.stat(file);
                    fileStatus[file] = {
                        accessible: true,
                        size: stats.size
                    };
                } catch (error) {
                    fileStatus[file] = {
                        accessible: false,
                        error: error.message
                    };
                }
            }
            
            const allAccessible = Object.values(fileStatus).every(status => status.accessible);
            
            return {
                success: allAccessible,
                message: allAccessible ? 'All required files are accessible' : 'Some files are not accessible',
                details: fileStatus
            };
        });
    }

    async testUserCreation() {
        return this.runTest('User Creation', async () => {
            // Load current users or create if doesn't exist
            let usersData;
            try {
                usersData = JSON.parse(await fs.readFile('users.json', 'utf8'));
            } catch (error) {
                // File doesn't exist, create default structure
                usersData = {
                    users: [],
                    totalUsers: 0,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
            }
            
            const initialCount = usersData.users.length;
            
            // Add test user
            usersData.users.push(this.testData.user);
            usersData.totalUsers = usersData.users.length;
            usersData.lastUpdated = new Date().toISOString().split('T')[0];
            
            await fs.writeFile('users.json', JSON.stringify(usersData, null, 2));
            
            // Log for cleanup
            this.logTestData('USER_CREATED', {
                email: this.testData.user.email,
                file: 'users.json'
            });
            
            return {
                success: true,
                message: `Test user created successfully (${initialCount} → ${usersData.totalUsers} users)`,
                details: {
                    user: this.testData.user.email,
                    totalUsers: usersData.totalUsers
                }
            };
        });
    }

    async testUserDeletion() {
        return this.runTest('User Deletion', async () => {
            // Load current users or create if doesn't exist
            let usersData;
            try {
                usersData = JSON.parse(await fs.readFile('users.json', 'utf8'));
            } catch (error) {
                // File doesn't exist, create default structure
                usersData = {
                    users: [],
                    totalUsers: 0,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
            }
            
            const initialCount = usersData.users.length;
            
            // Remove test users (by email and test data flag)
            usersData.users = usersData.users.filter(user => 
                user.email !== this.testData.user.email && 
                !user.isTestUser && 
                !user.testData
            );
            usersData.totalUsers = usersData.users.length;
            usersData.lastUpdated = new Date().toISOString().split('T')[0];
            
            await fs.writeFile('users.json', JSON.stringify(usersData, null, 2));
            
            return {
                success: true,
                message: `Test user deleted successfully (${initialCount} → ${usersData.totalUsers} users)`,
                details: {
                    deletedUser: this.testData.user.email,
                    totalUsers: usersData.totalUsers
                }
            };
        });
    }

    async testJobCreation() {
        return this.runTest('Job Creation', async () => {
            // Load current jobs or create if doesn't exist
            let jobsData;
            try {
                jobsData = JSON.parse(await fs.readFile('jobs-data.json', 'utf8'));
            } catch (error) {
                // File doesn't exist, create default structure
                jobsData = {
                    jobs: [],
                    totalJobs: 0,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
            }
            
            const initialCount = jobsData.jobs.length;
            
            // Add test job
            jobsData.jobs.push(this.testData.job);
            jobsData.totalJobs = jobsData.jobs.length;
            jobsData.lastUpdated = new Date().toISOString().split('T')[0];
            
            await fs.writeFile('jobs-data.json', JSON.stringify(jobsData, null, 2));
            
            // Log for cleanup
            this.logTestData('JOB_CREATED', {
                title: this.testData.job.title,
                file: 'jobs-data.json'
            });
            
            return {
                success: true,
                message: `Test job created successfully (${initialCount} → ${jobsData.totalJobs} jobs)`,
                details: {
                    job: this.testData.job.title,
                    totalJobs: jobsData.totalJobs
                }
            };
        });
    }

    async testJobDeletion() {
        return this.runTest('Job Deletion', async () => {
            // Load current jobs or create if doesn't exist
            let jobsData;
            try {
                jobsData = JSON.parse(await fs.readFile('jobs-data.json', 'utf8'));
            } catch (error) {
                // File doesn't exist, create default structure
                jobsData = {
                    jobs: [],
                    totalJobs: 0,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
            }
            
            const initialCount = jobsData.jobs.length;
            
            // Remove test jobs (by title and test data flag)
            jobsData.jobs = jobsData.jobs.filter(job => 
                job.title !== this.testData.job.title && 
                !job.isTestJob && 
                !job.testData
            );
            jobsData.totalJobs = jobsData.jobs.length;
            jobsData.lastUpdated = new Date().toISOString().split('T')[0];
            
            await fs.writeFile('jobs-data.json', JSON.stringify(jobsData, null, 2));
            
            return {
                success: true,
                message: `Test job deleted successfully (${initialCount} → ${jobsData.totalJobs} jobs)`,
                details: {
                    deletedJob: this.testData.job.title,
                    totalJobs: jobsData.totalJobs
                }
            };
        });
    }

    async testContractAddition() {
        return this.runTest('Contract Addition', async () => {
            // Load current contracts or create if doesn't exist
            let contractsData;
            try {
                contractsData = JSON.parse(await fs.readFile('uploaded-contracts.json', 'utf8'));
            } catch (error) {
                // File doesn't exist, create default structure
                contractsData = {
                    uploadedContracts: [],
                    totalContracts: 0,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
            }
            
            const initialCount = contractsData.uploadedContracts.length;
            
            // Add test contract
            contractsData.uploadedContracts.push(this.testData.contract);
            contractsData.totalContracts = contractsData.uploadedContracts.length;
            contractsData.lastUpdated = new Date().toISOString().split('T')[0];
            
            await fs.writeFile('uploaded-contracts.json', JSON.stringify(contractsData, null, 2));
            
            // Log for cleanup
            this.logTestData('CONTRACT_CREATED', {
                fileName: this.testData.contract.fileName,
                contractId: this.testData.contract.contractId,
                file: 'uploaded-contracts.json'
            });
            
            return {
                success: true,
                message: `Test contract added successfully (${initialCount} → ${contractsData.totalContracts} contracts)`,
                details: {
                    contract: this.testData.contract.fileName,
                    totalContracts: contractsData.totalContracts
                }
            };
        });
    }

    async testContractDeletion() {
        return this.runTest('Contract Deletion', async () => {
            // Load current contracts or create if doesn't exist
            let contractsData;
            try {
                contractsData = JSON.parse(await fs.readFile('uploaded-contracts.json', 'utf8'));
            } catch (error) {
                // File doesn't exist, create default structure
                contractsData = {
                    uploadedContracts: [],
                    totalContracts: 0,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
            }
            
            const initialCount = contractsData.uploadedContracts.length;
            
            // Remove test contract
            contractsData.uploadedContracts = contractsData.uploadedContracts.filter(contract => 
                contract.fileName !== this.testData.contract.fileName
            );
            contractsData.totalContracts = contractsData.uploadedContracts.length;
            contractsData.lastUpdated = new Date().toISOString().split('T')[0];
            
            await fs.writeFile('uploaded-contracts.json', JSON.stringify(contractsData, null, 2));
            
            return {
                success: true,
                message: `Test contract deleted successfully (${initialCount} → ${contractsData.totalContracts} contracts)`,
                details: {
                    deletedContract: this.testData.contract.fileName,
                    totalContracts: contractsData.totalContracts
                }
            };
        });
    }

    async testPerformanceReviewCreation() {
        return this.runTest('Performance Review Creation', async () => {
            // Load current performance reviews or create if doesn't exist
            let performanceData;
            try {
                performanceData = JSON.parse(await fs.readFile('performance.json', 'utf8'));
            } catch (error) {
                // File doesn't exist, create default structure
                performanceData = {
                    reviews: [],
                    totalReviews: 0,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
            }
            
            const initialCount = performanceData.reviews.length;
            
            // Add test performance review
            const testReview = {
                email: this.testData.user.email,
                rating: this.testData.performance.rating,
                category: this.testData.performance.category,
                notes: this.testData.performance.notes,
                status: this.testData.performance.status,
                reviewDate: new Date().toISOString().split('T')[0]
            };
            
            performanceData.reviews.push(testReview);
            performanceData.totalReviews = performanceData.reviews.length;
            performanceData.lastUpdated = new Date().toISOString().split('T')[0];
            
            await fs.writeFile('performance.json', JSON.stringify(performanceData, null, 2));
            
            // Log for cleanup
            this.logTestData('PERFORMANCE_CREATED', {
                email: this.testData.user.email,
                file: 'performance.json'
            });
            
            return {
                success: true,
                message: `Test performance review created successfully (${initialCount} → ${performanceData.totalReviews} reviews)`,
                details: {
                    review: this.testData.user.email,
                    totalReviews: performanceData.totalReviews
                }
            };
        });
    }

    async testPerformanceReviewDeletion() {
        return this.runTest('Performance Review Deletion', async () => {
            // Load current performance reviews or create if doesn't exist
            let performanceData;
            try {
                performanceData = JSON.parse(await fs.readFile('performance.json', 'utf8'));
            } catch (error) {
                // File doesn't exist, create default structure
                performanceData = {
                    reviews: [],
                    totalReviews: 0,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
            }
            
            const initialCount = performanceData.reviews.length;
            
            // Remove test performance review
            performanceData.reviews = performanceData.reviews.filter(review => 
                review.email !== this.testData.user.email
            );
            performanceData.totalReviews = performanceData.reviews.length;
            performanceData.lastUpdated = new Date().toISOString().split('T')[0];
            
            await fs.writeFile('performance.json', JSON.stringify(performanceData, null, 2));
            
            return {
                success: true,
                message: `Test performance review deleted successfully (${initialCount} → ${performanceData.totalReviews} reviews)`,
                details: {
                    deletedReview: this.testData.user.email,
                    totalReviews: performanceData.totalReviews
                }
            };
        });
    }

    async testNotificationCreation() {
        return this.runTest('Notification Creation', async () => {
            // Load current notifications or create if doesn't exist
            let notificationsData;
            try {
                notificationsData = JSON.parse(await fs.readFile('notifications.json', 'utf8'));
            } catch (error) {
                // File doesn't exist, create default structure
                notificationsData = {
                    notifications: [],
                    totalNotifications: 0,
                    unreadCount: 0,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
            }
            
            const initialCount = notificationsData.notifications.length;
            
            // Add test notification
            notificationsData.notifications.push(this.testData.notification);
            notificationsData.totalNotifications = notificationsData.notifications.length;
            notificationsData.unreadCount = notificationsData.notifications.filter(n => !n.read).length;
            notificationsData.lastUpdated = new Date().toISOString().split('T')[0];
            
            await fs.writeFile('notifications.json', JSON.stringify(notificationsData, null, 2));
            
            // Log for cleanup
            this.logTestData('NOTIFICATION_CREATED', {
                title: this.testData.notification.title,
                file: 'notifications.json'
            });
            
            return {
                success: true,
                message: `Test notification created successfully (${initialCount} → ${notificationsData.totalNotifications} notifications)`,
                details: {
                    notification: this.testData.notification.title,
                    totalNotifications: notificationsData.totalNotifications
                }
            };
        });
    }

    async testNotificationDeletion() {
        return this.runTest('Notification Deletion', async () => {
            // Load current notifications or create if doesn't exist
            let notificationsData;
            try {
                notificationsData = JSON.parse(await fs.readFile('notifications.json', 'utf8'));
            } catch (error) {
                // File doesn't exist, create default structure
                notificationsData = {
                    notifications: [],
                    totalNotifications: 0,
                    unreadCount: 0,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
            }
            
            const initialCount = notificationsData.notifications.length;
            
            // Remove test notification
            notificationsData.notifications = notificationsData.notifications.filter(notification => 
                notification.title !== this.testData.notification.title
            );
            notificationsData.totalNotifications = notificationsData.notifications.length;
            notificationsData.unreadCount = notificationsData.notifications.filter(n => !n.read).length;
            notificationsData.lastUpdated = new Date().toISOString().split('T')[0];
            
            await fs.writeFile('notifications.json', JSON.stringify(notificationsData, null, 2));
            
            return {
                success: true,
                message: `Test notification deleted successfully (${initialCount} → ${notificationsData.totalNotifications} notifications)`,
                details: {
                    deletedNotification: this.testData.notification.title,
                    totalNotifications: notificationsData.totalNotifications
                }
            };
        });
    }

    async testAllAPIEndpoints() {
        return this.runTest('All API Endpoints', async () => {
            const endpoints = [
                '/api/users',
                '/api/jobs-data',
                '/api/uploaded-contracts',
                '/api/dropdown-options',
                '/api/performance',
                '/api/notifications',
                '/api/health'
            ];
            
            const results = {};
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${this.baseUrl}${endpoint}`);
                    const data = await response.json();
                    
                    results[endpoint] = {
                        status: response.status,
                        working: response.ok,
                        hasData: data && Object.keys(data).length > 0
                    };
                } catch (error) {
                    results[endpoint] = {
                        status: 0,
                        working: false,
                        error: error.message
                    };
                }
            }
            
            const allWorking = Object.values(results).every(result => result.working);
            
            return {
                success: allWorking,
                message: allWorking ? 'All API endpoints are working' : 'Some API endpoints are not working',
                details: results
            };
        });
    }

    async testProjectTimelineUpdates() {
        return this.runTest('Project Timeline Updates', async () => {
            // First ensure test user exists
            const usersData = JSON.parse(await fs.readFile('users.json', 'utf8'));
            const testUser = usersData.users.find(user => user.email === this.testData.user.email);
            
            if (!testUser) {
                // Create test user if it doesn't exist
                usersData.users.push(this.testData.user);
                usersData.totalUsers = usersData.users.length;
                usersData.lastUpdated = new Date().toISOString().split('T')[0];
                await fs.writeFile('users.json', JSON.stringify(usersData, null, 2));
            }
            
            // Update user's project timeline
            const updatedUser = usersData.users.find(user => user.email === this.testData.user.email);
            updatedUser.currentProject = 'Test Project';
            updatedUser.projectStatus = 'in-progress';
            updatedUser.lastUpdated = new Date().toISOString().split('T')[0];
            
            await fs.writeFile('users.json', JSON.stringify(usersData, null, 2));
            
            return {
                success: true,
                message: 'Project timeline updated successfully',
                details: {
                    user: this.testData.user.email,
                    job: 'Test Project',
                    status: 'in-progress'
                }
            };
        });
    }

    async testPdfDeletion() {
        return this.runTest('PDF Deletion API', async () => {
            const testFileName = 'test-delete-pdf.pdf';
            const testContractId = 'TEST-DELETE-001';
            
            // Step 1: Create a test PDF file via GitHub API
            console.log('📄 Creating test PDF file...');
            const createPdfResponse = await fetch(`${this.baseUrl}/api/github/file/contracts/${testFileName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Create test contract ${testContractId} - ${testFileName}`,
                    content: btoa('Test PDF content for deletion testing'),
                    branch: 'main'
                })
            });
            
            const createPdfResult = await createPdfResponse.json();
            console.log('📄 PDF creation result:', createPdfResult);
            console.log('📄 PDF creation status:', createPdfResponse.status);
            
            // Step 2: Add contract record to uploaded-contracts.json
            console.log('📋 Adding contract record...');
            let contractsData;
            try {
                contractsData = JSON.parse(await fs.readFile('uploaded-contracts.json', 'utf8'));
            } catch (error) {
                contractsData = {
                    uploadedContracts: [],
                    totalContracts: 0,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
            }
            
            const testContract = {
                fileName: testFileName,
                contractId: testContractId,
                status: 'signed',
                uploadedDate: new Date().toISOString(),
                userEmail: this.testData.user.email,
                isTestContract: true,
                testData: true
            };
            
            contractsData.uploadedContracts.push(testContract);
            contractsData.totalContracts = contractsData.uploadedContracts.length;
            contractsData.lastUpdated = new Date().toISOString().split('T')[0];
            
            // Log for cleanup
            this.logTestData('CONTRACT_CREATED', {
                fileName: testFileName,
                contractId: testContractId,
                file: 'uploaded-contracts.json'
            });
            
            // Step 3: Test the delete-pdf API endpoint
            console.log('🗑️ Testing PDF deletion...');
            const deletePdfResponse = await fetch(`${this.baseUrl}/api/delete-pdf`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileName: testFileName,
                    contractId: testContractId
                })
            });
            
            const deletePdfResult = await deletePdfResponse.json();
            console.log('🗑️ PDF deletion result:', deletePdfResult);
            console.log('🗑️ PDF deletion status:', deletePdfResponse.status);
            
            // Step 4: Test GitHub API deletion endpoint
            console.log('🗑️ Testing GitHub API deletion...');
            const githubDeleteResponse = await fetch(`${this.baseUrl}/api/github/file/contracts/${testFileName}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Delete test contract ${testContractId} - ${testFileName}`,
                    sha: 'latest'
                })
            });
            
            const githubDeleteResult = await githubDeleteResponse.json();
            console.log('🗑️ GitHub deletion result:', githubDeleteResult);
            console.log('🗑️ GitHub deletion status:', githubDeleteResponse.status);
            
            // Determine success based on all API responses
            const pdfCreated = createPdfResponse.status === 200 || createPdfResponse.status === 201;
            const deletePdfApiWorking = deletePdfResponse.status === 200;
            const githubDeleteWorking = githubDeleteResponse.status === 200 || githubDeleteResponse.status === 404;
            
            // Create detailed success message
            let successMessage = 'Complete PDF lifecycle test: ';
            if (pdfCreated) {
                successMessage += '✅ PDF Created → ';
            } else {
                successMessage += '❌ PDF Creation Failed → ';
            }
            
            if (deletePdfApiWorking) {
                successMessage += '✅ Delete API Working → ';
            } else {
                successMessage += '❌ Delete API Failed → ';
            }
            
            if (githubDeleteWorking) {
                successMessage += '✅ GitHub Delete Working';
            } else {
                successMessage += '❌ GitHub Delete Failed';
            }
            
            return {
                success: pdfCreated && deletePdfApiWorking && githubDeleteWorking,
                message: successMessage,
                details: {
                    pdfCreated: pdfCreated,
                    createPdfStatus: createPdfResponse.status,
                    createPdfResult: createPdfResult,
                    deletePdfApiWorking: deletePdfApiWorking,
                    deletePdfStatus: deletePdfResponse.status,
                    deletePdfResult: deletePdfResult,
                    githubDeleteWorking: githubDeleteWorking,
                    githubDeleteStatus: githubDeleteResponse.status,
                    githubDeleteResult: githubDeleteResult,
                    testFileName: testFileName,
                    testContractId: testContractId,
                    contractRecordAdded: true,
                    // Add specific error details
                    errors: {
                        pdfCreationFailed: !pdfCreated ? `Status: ${createPdfResponse.status}, Result: ${JSON.stringify(createPdfResult)}` : null,
                        deleteApiFailed: !deletePdfApiWorking ? `Status: ${deletePdfResponse.status}, Result: ${JSON.stringify(deletePdfResult)}` : null,
                        githubDeleteFailed: !githubDeleteWorking ? `Status: ${githubDeleteResponse.status}, Result: ${JSON.stringify(githubDeleteResult)}` : null
                    }
                }
            };
        });
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Analyze test results and generate recommendations
        const failedTests = this.testResults.tests.filter(test => !test.success);
        
        if (failedTests.length > 0) {
            for (const test of failedTests) {
                recommendations.push({
                    priority: 'HIGH',
                    title: `Fix ${test.name}`,
                    description: `Test failed: ${test.message}`
                });
            }
        }
        
        // Check for performance issues
        const slowTests = this.testResults.tests.filter(test => test.duration > 1000);
        if (slowTests.length > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                title: 'Optimize Slow Tests',
                description: `${slowTests.length} tests are taking longer than 1 second to complete`
            });
        }
        
        // Check for system health issues
        const healthTests = this.testResults.tests.filter(test => 
            test.name.includes('Health') || test.name.includes('API')
        );
        const failedHealthTests = healthTests.filter(test => !test.success);
        
        if (failedHealthTests.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                title: 'System Health Issues',
                description: `${failedHealthTests.length} system health tests failed`
            });
        }
        
        return recommendations;
    }

    async runAllTests(categories = null) {
        await this.log('🚀 Starting Automated Test Suite', 'info');
        await this.log('================================', 'info');
        
        // Define test categories and their corresponding tests
        const testCategories = {
            'system-health': [
                this.testServerHealth(),
                this.testFileSystemAccess(),
                this.testAllAPIEndpoints()
            ],
            'user-management': [
                this.testUserCreation(),
                this.testUserDeletion()
            ],
            'job-management': [
                this.testJobCreation(),
                this.testJobDeletion()
            ],
            'contract-management': [
                this.testContractAddition(),
                this.testContractDeletion()
            ],
            'performance-reviews': [
                this.testPerformanceReviewCreation(),
                this.testPerformanceReviewDeletion()
            ],
            'notifications': [
                this.testNotificationCreation(),
                this.testNotificationDeletion()
            ],
            'project-timeline': [
                this.testProjectTimelineUpdates()
            ],
            'pdf-deletion': [
                this.testPdfDeletion()
            ]
        };
        
        // If no categories specified, run all tests
        if (!categories || categories.length === 0) {
            categories = Object.keys(testCategories);
        }
        
        // Build the list of tests to run based on selected categories
        const testsToRun = [];
        categories.forEach(category => {
            if (testCategories[category]) {
                testsToRun.push(...testCategories[category]);
            }
        });
        
        await this.log(`📋 Running tests for categories: ${categories.join(', ')}`, 'info');
        
        const results = await Promise.all(testsToRun);
        
        // Update summary
        this.testResults.tests = results;
        this.testResults.summary.total = results.length;
        this.testResults.summary.passed = results.filter(r => r.success).length;
        this.testResults.summary.failed = results.filter(r => !r.success).length;
        this.testResults.summary.warnings = 0;
        
        // Generate recommendations
        this.testResults.recommendations = this.generateRecommendations();
        
        // Log test data for cleanup
        await this.log('📝 Test data logged for cleanup', 'info');
        await this.log(`   Vercel environment: In-memory logging`, 'info');
        await this.log(`   Total log entries: ${this.testDataLog.length}`, 'info');
        
        // Log summary
        await this.log('================================', 'info');
        await this.log('📊 Test Summary:', 'info');
        await this.log(`   Total Tests: ${this.testResults.summary.total}`, 'info');
        await this.log(`   Passed: ${this.testResults.summary.passed}`, this.testResults.summary.passed > 0 ? 'success' : 'info');
        await this.log(`   Failed: ${this.testResults.summary.failed}`, this.testResults.summary.failed > 0 ? 'error' : 'info');
        await this.log(`   Success Rate: ${((this.testResults.summary.passed / this.testResults.summary.total) * 100).toFixed(1)}%`, 'success');
        
        return this.testResults;
    }

    async saveTestResults() {
        const timestamp = new Date().toISOString();
        const filename = `test-results-${timestamp}.json`;
        
        try {
            // In Vercel environment, we can't write files, so we'll just return the results
            // The API will handle returning the results to the client
            await this.log(`💾 Test results ready for return (Vercel environment)`, 'success');
            return 'test-results-in-memory.json';
        } catch (error) {
            await this.log(`❌ Failed to prepare test results: ${error.message}`, 'error');
            throw error;
        }
    }
}

module.exports = AutomatedTestRunner; 