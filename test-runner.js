const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

class AutomatedTestRunner {
    constructor() {
        this.baseUrl = 'http://localhost:8000';
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
                approvedDate: new Date().toISOString().split('T')[0]
            },
            job: {
                title: 'Test Photography Job',
                date: '2025-12-15',
                location: 'Atlanta, GA',
                pay: '$500',
                description: 'Test job for automated testing',
                status: 'Active'
            },
            contract: {
                fileName: 'test-contract.pdf',
                contractId: 'TEST-001',
                status: 'pending',
                uploadedDate: new Date().toISOString()
            },
            performance: {
                rating: 4,
                category: 'Professionalism',
                notes: 'Test performance review',
                status: 'completed'
            },
            notification: {
                title: 'Test Notification',
                message: 'This is a test notification',
                type: 'info',
                read: false,
                timestamp: new Date().toISOString()
            }
        };
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

    async runTest(testName, testFunction) {
        this.testResults.summary.total++;
        
        try {
            await this.log(`Starting test: ${testName}`, 'test');
            const result = await testFunction();
            
            if (result.success) {
                this.testResults.summary.passed++;
                await this.log(`✅ PASSED: ${testName}`, 'success');
            } else {
                this.testResults.summary.failed++;
                await this.log(`❌ FAILED: ${testName}`, 'error');
            }
            
            this.testResults.tests.push({
                name: testName,
                success: result.success,
                message: result.message,
                details: result.details,
                duration: result.duration || 0,
                timestamp: new Date().toISOString()
            });
            
            return result;
        } catch (error) {
            this.testResults.summary.failed++;
            await this.log(`❌ ERROR in ${testName}: ${error.message}`, 'error');
            
            this.testResults.tests.push({
                name: testName,
                success: false,
                message: error.message,
                details: { error: error.stack },
                duration: 0,
                timestamp: new Date().toISOString()
            });
            
            return { success: false, message: error.message };
        }
    }

    // System Health Tests
    async testServerHealth() {
        const startTime = Date.now();
        
        try {
            const response = await fetch(`${this.baseUrl}/api/health`);
            const data = await response.json();
            
            const duration = Date.now() - startTime;
            
            if (response.ok && data.status === 'OK') {
                return {
                    success: true,
                    message: 'Server is healthy and responding',
                    details: data,
                    duration
                };
            } else {
                return {
                    success: false,
                    message: 'Server health check failed',
                    details: data
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Cannot connect to server',
                details: { error: error.message }
            };
        }
    }

    async testFileSystemAccess() {
        const startTime = Date.now();
        const requiredFiles = [
            'users.json',
            'jobs-data.json',
            'uploaded-contracts.json',
            'dropdown-options.json',
            'performance.json',
            'notifications.json'
        ];
        
        const results = {};
        let allAccessible = true;
        
        for (const file of requiredFiles) {
            try {
                const filePath = path.join(__dirname, file);
                await fs.access(filePath);
                results[file] = { accessible: true, size: (await fs.stat(filePath)).size };
            } catch (error) {
                results[file] = { accessible: false, error: error.message };
                allAccessible = false;
            }
        }
        
        const duration = Date.now() - startTime;
        
        return {
            success: allAccessible,
            message: allAccessible ? 'All required files are accessible' : 'Some files are not accessible',
            details: results,
            duration
        };
    }

    // User Management Tests
    async testUserCreation() {
        const startTime = Date.now();
        
        try {
            // Get current users
            const response = await fetch(`${this.baseUrl}/api/users`);
            const usersData = await response.json();
            
            const initialCount = usersData.totalUsers || 0;
            
            // Simulate user creation by updating the users.json
            const testUser = {
                ...this.testData.user,
                contract: {
                    contractUrl: null,
                    contractStatus: 'pending',
                    contractSignedDate: null,
                    contractUploadedDate: null,
                    contractId: null
                },
                jobs: {},
                primaryJob: null,
                paymentMethod: null
            };
            
            usersData.users[testUser.email] = testUser;
            usersData.totalUsers = Object.keys(usersData.users).length;
            usersData.lastUpdated = new Date().toISOString().split('T')[0];
            
            // Save updated users data
            await fs.writeFile(
                path.join(__dirname, 'users.json'),
                JSON.stringify(usersData, null, 2)
            );
            
            const duration = Date.now() - startTime;
            
            return {
                success: true,
                message: `Test user created successfully (${initialCount} → ${usersData.totalUsers} users)`,
                details: { user: testUser.email, totalUsers: usersData.totalUsers },
                duration
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create test user',
                details: { error: error.message }
            };
        }
    }

    async testUserDeletion() {
        const startTime = Date.now();
        
        try {
            // Get current users
            const response = await fetch(`${this.baseUrl}/api/users`);
            const usersData = await response.json();
            
            const initialCount = usersData.totalUsers || 0;
            const testUserEmail = this.testData.user.email;
            
            if (usersData.users[testUserEmail]) {
                delete usersData.users[testUserEmail];
                usersData.totalUsers = Object.keys(usersData.users).length;
                usersData.lastUpdated = new Date().toISOString().split('T')[0];
                
                // Save updated users data
                await fs.writeFile(
                    path.join(__dirname, 'users.json'),
                    JSON.stringify(usersData, null, 2)
                );
                
                const duration = Date.now() - startTime;
                
                return {
                    success: true,
                    message: `Test user deleted successfully (${initialCount} → ${usersData.totalUsers} users)`,
                    details: { deletedUser: testUserEmail, totalUsers: usersData.totalUsers },
                    duration
                };
            } else {
                return {
                    success: true,
                    message: 'Test user not found (already deleted or never existed)',
                    details: { totalUsers: usersData.totalUsers },
                    duration: Date.now() - startTime
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete test user',
                details: { error: error.message }
            };
        }
    }

    // Job Management Tests
    async testJobCreation() {
        const startTime = Date.now();
        
        try {
            // Get current jobs
            const response = await fetch(`${this.baseUrl}/api/jobs-data`);
            const jobsData = await response.json();
            
            const initialCount = jobsData.totalJobs || 0;
            
            // Add test job
            jobsData.jobs.push(this.testData.job);
            jobsData.totalJobs = jobsData.jobs.length;
            jobsData.lastUpdated = new Date().toISOString().split('T')[0];
            
            // Save updated jobs data
            await fs.writeFile(
                path.join(__dirname, 'jobs-data.json'),
                JSON.stringify(jobsData, null, 2)
            );
            
            const duration = Date.now() - startTime;
            
            return {
                success: true,
                message: `Test job created successfully (${initialCount} → ${jobsData.totalJobs} jobs)`,
                details: { job: this.testData.job.title, totalJobs: jobsData.totalJobs },
                duration
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create test job',
                details: { error: error.message }
            };
        }
    }

    async testJobDeletion() {
        const startTime = Date.now();
        
        try {
            // Get current jobs
            const response = await fetch(`${this.baseUrl}/api/jobs-data`);
            const jobsData = await response.json();
            
            const initialCount = jobsData.totalJobs || 0;
            const testJobTitle = this.testData.job.title;
            
            // Remove test job
            const jobIndex = jobsData.jobs.findIndex(job => job.title === testJobTitle);
            
            if (jobIndex !== -1) {
                jobsData.jobs.splice(jobIndex, 1);
                jobsData.totalJobs = jobsData.jobs.length;
                jobsData.lastUpdated = new Date().toISOString().split('T')[0];
                
                // Save updated jobs data
                await fs.writeFile(
                    path.join(__dirname, 'jobs-data.json'),
                    JSON.stringify(jobsData, null, 2)
                );
                
                const duration = Date.now() - startTime;
                
                return {
                    success: true,
                    message: `Test job deleted successfully (${initialCount} → ${jobsData.totalJobs} jobs)`,
                    details: { deletedJob: testJobTitle, totalJobs: jobsData.totalJobs },
                    duration
                };
            } else {
                return {
                    success: true,
                    message: 'Test job not found (already deleted or never existed)',
                    details: { totalJobs: jobsData.totalJobs },
                    duration: Date.now() - startTime
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete test job',
                details: { error: error.message }
            };
        }
    }

    // Contract Management Tests
    async testContractAddition() {
        const startTime = Date.now();
        
        try {
            // Get current contracts
            const response = await fetch(`${this.baseUrl}/api/uploaded-contracts`);
            const contractsData = await response.json();
            
            const initialCount = contractsData.totalContracts || 0;
            
            // Add test contract
            const testContract = {
                ...this.testData.contract,
                uploadedDate: new Date().toISOString()
            };
            
            contractsData.uploadedContracts.push(testContract);
            contractsData.totalContracts = contractsData.uploadedContracts.length;
            contractsData.lastUpdated = new Date().toISOString().split('T')[0];
            
            // Save updated contracts data
            await fs.writeFile(
                path.join(__dirname, 'uploaded-contracts.json'),
                JSON.stringify(contractsData, null, 2)
            );
            
            const duration = Date.now() - startTime;
            
            return {
                success: true,
                message: `Test contract added successfully (${initialCount} → ${contractsData.totalContracts} contracts)`,
                details: { contract: testContract.fileName, totalContracts: contractsData.totalContracts },
                duration
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to add test contract',
                details: { error: error.message }
            };
        }
    }

    async testContractDeletion() {
        const startTime = Date.now();
        
        try {
            // Get current contracts
            const response = await fetch(`${this.baseUrl}/api/uploaded-contracts`);
            const contractsData = await response.json();
            
            const initialCount = contractsData.totalContracts || 0;
            const testFileName = this.testData.contract.fileName;
            
            // Remove test contract
            const contractIndex = contractsData.uploadedContracts.findIndex(
                contract => contract.fileName === testFileName
            );
            
            if (contractIndex !== -1) {
                contractsData.uploadedContracts.splice(contractIndex, 1);
                contractsData.totalContracts = contractsData.uploadedContracts.length;
                contractsData.lastUpdated = new Date().toISOString().split('T')[0];
                
                // Save updated contracts data
                await fs.writeFile(
                    path.join(__dirname, 'uploaded-contracts.json'),
                    JSON.stringify(contractsData, null, 2)
                );
                
                const duration = Date.now() - startTime;
                
                return {
                    success: true,
                    message: `Test contract deleted successfully (${initialCount} → ${contractsData.totalContracts} contracts)`,
                    details: { deletedContract: testFileName, totalContracts: contractsData.totalContracts },
                    duration
                };
            } else {
                return {
                    success: true,
                    message: 'Test contract not found (already deleted or never existed)',
                    details: { totalContracts: contractsData.totalContracts },
                    duration: Date.now() - startTime
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete test contract',
                details: { error: error.message }
            };
        }
    }

    // Performance Review Tests
    async testPerformanceReviewCreation() {
        const startTime = Date.now();
        
        try {
            // Get current performance data
            const response = await fetch(`${this.baseUrl}/api/performance`);
            const performanceData = await response.json();
            
            const initialCount = performanceData.totalReviews || 0;
            
            // Add test performance review
            const testReview = {
                email: this.testData.user.email,
                rating: this.testData.performance.rating,
                category: this.testData.performance.category,
                notes: this.testData.performance.notes,
                status: this.testData.performance.status,
                reviewDate: new Date().toISOString()
            };
            
            performanceData.performanceReviews[testReview.email] = testReview;
            performanceData.totalReviews = Object.keys(performanceData.performanceReviews).length;
            performanceData.lastUpdated = new Date().toISOString();
            
            // Save updated performance data
            await fs.writeFile(
                path.join(__dirname, 'performance.json'),
                JSON.stringify(performanceData, null, 2)
            );
            
            const duration = Date.now() - startTime;
            
            return {
                success: true,
                message: `Test performance review created successfully (${initialCount} → ${performanceData.totalReviews} reviews)`,
                details: { review: testReview.email, totalReviews: performanceData.totalReviews },
                duration
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create test performance review',
                details: { error: error.message }
            };
        }
    }

    async testPerformanceReviewDeletion() {
        const startTime = Date.now();
        
        try {
            // Get current performance data
            const response = await fetch(`${this.baseUrl}/api/performance`);
            const performanceData = await response.json();
            
            const initialCount = performanceData.totalReviews || 0;
            const testEmail = this.testData.user.email;
            
            if (performanceData.performanceReviews[testEmail]) {
                delete performanceData.performanceReviews[testEmail];
                performanceData.totalReviews = Object.keys(performanceData.performanceReviews).length;
                performanceData.lastUpdated = new Date().toISOString();
                
                // Save updated performance data
                await fs.writeFile(
                    path.join(__dirname, 'performance.json'),
                    JSON.stringify(performanceData, null, 2)
                );
                
                const duration = Date.now() - startTime;
                
                return {
                    success: true,
                    message: `Test performance review deleted successfully (${initialCount} → ${performanceData.totalReviews} reviews)`,
                    details: { deletedReview: testEmail, totalReviews: performanceData.totalReviews },
                    duration
                };
            } else {
                return {
                    success: true,
                    message: 'Test performance review not found (already deleted or never existed)',
                    details: { totalReviews: performanceData.totalReviews },
                    duration: Date.now() - startTime
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete test performance review',
                details: { error: error.message }
            };
        }
    }

    // Notification Tests
    async testNotificationCreation() {
        const startTime = Date.now();
        
        try {
            // Get current notifications
            const response = await fetch(`${this.baseUrl}/api/notifications`);
            const notificationsData = await response.json();
            
            const initialCount = notificationsData.totalNotifications || 0;
            
            // Add test notification
            const testNotification = {
                ...this.testData.notification,
                id: `test-${Date.now()}`
            };
            
            notificationsData.notifications.push(testNotification);
            notificationsData.totalNotifications = notificationsData.notifications.length;
            notificationsData.unreadCount = notificationsData.notifications.filter(n => !n.read).length;
            notificationsData.lastUpdated = new Date().toISOString();
            
            // Save updated notifications data
            await fs.writeFile(
                path.join(__dirname, 'notifications.json'),
                JSON.stringify(notificationsData, null, 2)
            );
            
            const duration = Date.now() - startTime;
            
            return {
                success: true,
                message: `Test notification created successfully (${initialCount} → ${notificationsData.totalNotifications} notifications)`,
                details: { notification: testNotification.title, totalNotifications: notificationsData.totalNotifications },
                duration
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to create test notification',
                details: { error: error.message }
            };
        }
    }

    async testNotificationDeletion() {
        const startTime = Date.now();
        
        try {
            // Get current notifications
            const response = await fetch(`${this.baseUrl}/api/notifications`);
            const notificationsData = await response.json();
            
            const initialCount = notificationsData.totalNotifications || 0;
            const testTitle = this.testData.notification.title;
            
            // Remove test notification
            const notificationIndex = notificationsData.notifications.findIndex(
                notification => notification.title === testTitle
            );
            
            if (notificationIndex !== -1) {
                notificationsData.notifications.splice(notificationIndex, 1);
                notificationsData.totalNotifications = notificationsData.notifications.length;
                notificationsData.unreadCount = notificationsData.notifications.filter(n => !n.read).length;
                notificationsData.lastUpdated = new Date().toISOString();
                
                // Save updated notifications data
                await fs.writeFile(
                    path.join(__dirname, 'notifications.json'),
                    JSON.stringify(notificationsData, null, 2)
                );
                
                const duration = Date.now() - startTime;
                
                return {
                    success: true,
                    message: `Test notification deleted successfully (${initialCount} → ${notificationsData.totalNotifications} notifications)`,
                    details: { deletedNotification: testTitle, totalNotifications: notificationsData.totalNotifications },
                    duration
                };
            } else {
                return {
                    success: true,
                    message: 'Test notification not found (already deleted or never existed)',
                    details: { totalNotifications: notificationsData.totalNotifications },
                    duration: Date.now() - startTime
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Failed to delete test notification',
                details: { error: error.message }
            };
        }
    }

    // API Endpoint Tests
    async testAllAPIEndpoints() {
        const startTime = Date.now();
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
        let allWorking = true;
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`);
                const data = await response.json();
                
                results[endpoint] = {
                    status: response.status,
                    working: response.ok,
                    hasData: data && Object.keys(data).length > 0
                };
                
                if (!response.ok) {
                    allWorking = false;
                }
            } catch (error) {
                results[endpoint] = {
                    status: 'error',
                    working: false,
                    error: error.message
                };
                allWorking = false;
            }
        }
        
        const duration = Date.now() - startTime;
        
        return {
            success: allWorking,
            message: allWorking ? 'All API endpoints are working' : 'Some API endpoints are not working',
            details: results,
            duration
        };
    }

    // Project Timeline Tests
    async testProjectTimelineUpdates() {
        const startTime = Date.now();
        
        try {
            // Get current users data
            const response = await fetch(`${this.baseUrl}/api/users`);
            const usersData = await response.json();
            
            // Simulate project timeline update
            const testUserEmail = this.testData.user.email;
            const testJob = {
                id: 'test-job-001',
                title: 'Test Project',
                status: 'in-progress',
                startDate: '2025-01-15',
                endDate: '2025-02-15',
                progress: 50,
                lastUpdated: new Date().toISOString()
            };
            
            // Create test user if it doesn't exist
            if (!usersData.users[testUserEmail]) {
                const testUser = {
                    ...this.testData.user,
                    contract: {
                        contractUrl: null,
                        contractStatus: 'pending',
                        contractSignedDate: null,
                        contractUploadedDate: null,
                        contractId: null
                    },
                    jobs: {},
                    primaryJob: null,
                    paymentMethod: null
                };
                usersData.users[testUserEmail] = testUser;
            }
            
            // Update the user's jobs
            usersData.users[testUserEmail].jobs = {
                [testJob.id]: testJob
            };
            usersData.lastUpdated = new Date().toISOString().split('T')[0];
            
            // Save updated users data
            await fs.writeFile(
                path.join(__dirname, 'users.json'),
                JSON.stringify(usersData, null, 2)
            );
            
            const duration = Date.now() - startTime;
            
            return {
                success: true,
                message: 'Project timeline updated successfully',
                details: { user: testUserEmail, job: testJob.title, status: testJob.status },
                duration
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to update project timeline',
                details: { error: error.message }
            };
        }
    }

    // PDF Deletion Tests
    async testPdfDeletion() {
        const startTime = Date.now();
        
        try {
            // Test the PDF deletion API
            const testFileName = 'test-delete-pdf.pdf';
            const testContractId = 'TEST-DELETE-001';
            
            const response = await fetch(`${this.baseUrl}/api/delete-pdf`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fileName: testFileName,
                    contractId: testContractId
                })
            });
            
            const result = await response.json();
            const duration = Date.now() - startTime;
            
            if (response.ok) {
                return {
                    success: true,
                    message: 'PDF deletion API is working correctly',
                    details: result,
                    duration
                };
            } else {
                return {
                    success: false,
                    message: 'PDF deletion API returned an error',
                    details: result,
                    duration
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Failed to test PDF deletion API',
                details: { error: error.message }
            };
        }
    }

    // Generate Recommendations
    generateRecommendations() {
        const recommendations = [];
        
        // Analyze test results
        const failedTests = this.testResults.tests.filter(test => !test.success);
        const slowTests = this.testResults.tests.filter(test => test.duration > 2000);
        
        if (failedTests.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'Critical Issues',
                title: 'Fix Failed Tests',
                description: `${failedTests.length} tests failed and need immediate attention`,
                tests: failedTests.map(test => test.name)
            });
        }
        
        if (slowTests.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'Performance',
                title: 'Optimize Slow Operations',
                description: `${slowTests.length} tests are taking longer than 2 seconds`,
                tests: slowTests.map(test => test.name)
            });
        }
        
        // Check for missing files
        const missingFiles = this.testResults.tests
            .filter(test => test.name.includes('File System'))
            .filter(test => !test.success);
        
        if (missingFiles.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'System Health',
                title: 'Create Missing Files',
                description: 'Some required JSON files are missing and need to be created',
                details: 'Check that all required JSON files exist in the root directory'
            });
        }
        
        // Check API health
        const apiTests = this.testResults.tests
            .filter(test => test.name.includes('API'))
            .filter(test => !test.success);
        
        if (apiTests.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'API Issues',
                title: 'Fix API Endpoints',
                description: 'Some API endpoints are not responding correctly',
                tests: apiTests.map(test => test.name)
            });
        }
        
        this.testResults.recommendations = recommendations;
    }

    // Run all tests
    async runAllTests() {
        await this.log('🚀 Starting Automated Test Suite', 'info');
        await this.log('================================', 'info');
        
        // System Health Tests
        await this.runTest('Server Health Check', () => this.testServerHealth());
        await this.runTest('File System Access', () => this.testFileSystemAccess());
        await this.runTest('All API Endpoints', () => this.testAllAPIEndpoints());
        
        // User Management Tests
        await this.runTest('User Creation', () => this.testUserCreation());
        await this.runTest('User Deletion', () => this.testUserDeletion());
        
        // Job Management Tests
        await this.runTest('Job Creation', () => this.testJobCreation());
        await this.runTest('Job Deletion', () => this.testJobDeletion());
        
        // Contract Management Tests
        await this.runTest('Contract Addition', () => this.testContractAddition());
        await this.runTest('Contract Deletion', () => this.testContractDeletion());
        
        // Performance Review Tests
        await this.runTest('Performance Review Creation', () => this.testPerformanceReviewCreation());
        await this.runTest('Performance Review Deletion', () => this.testPerformanceReviewDeletion());
        
        // Notification Tests
        await this.runTest('Notification Creation', () => this.testNotificationCreation());
        await this.runTest('Notification Deletion', () => this.testNotificationDeletion());
        
        // Project Timeline Tests
        await this.runTest('Project Timeline Updates', () => this.testProjectTimelineUpdates());
        
        // PDF Deletion Tests
        await this.runTest('PDF Deletion API', () => this.testPdfDeletion());
        
        // Generate recommendations
        this.generateRecommendations();
        
        // Calculate summary
        const totalTests = this.testResults.summary.total;
        const passedTests = this.testResults.summary.passed;
        const failedTests = this.testResults.summary.failed;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        await this.log('================================', 'info');
        await this.log(`📊 Test Summary:`, 'info');
        await this.log(`   Total Tests: ${totalTests}`, 'info');
        await this.log(`   Passed: ${passedTests}`, 'success');
        await this.log(`   Failed: ${failedTests}`, failedTests > 0 ? 'error' : 'info');
        await this.log(`   Success Rate: ${successRate}%`, successRate >= 90 ? 'success' : 'warning');
        
        if (this.testResults.recommendations.length > 0) {
            await this.log('📋 Recommendations:', 'info');
            for (let index = 0; index < this.testResults.recommendations.length; index++) {
                const rec = this.testResults.recommendations[index];
                await this.log(`   ${index + 1}. ${rec.title} (${rec.priority} priority)`, 'warning');
            }
        }
        
        return this.testResults;
    }

    // Save test results to file
    async saveTestResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `test-results-${timestamp}.json`;
        
        try {
            await fs.writeFile(filename, JSON.stringify(this.testResults, null, 2));
            await this.log(`💾 Test results saved to: ${filename}`, 'success');
            return filename;
        } catch (error) {
            await this.log(`❌ Failed to save test results: ${error.message}`, 'error');
            return null;
        }
    }
}

module.exports = AutomatedTestRunner; 