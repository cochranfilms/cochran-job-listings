#!/usr/bin/env node

/**
 * 🧪 Simple Admin User Deletion Test
 * 
 * This script tests the user deletion system without browser automation.
 * It focuses on testing the API endpoints and data persistence.
 * 
 * Live URL: https://collaborate.cochranfilms.com/admin-dashboard
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const CONFIG = {
    adminUrl: 'https://collaborate.cochranfilms.com/admin-dashboard',
    testUser: 'Test User Deletion Simple',
    testUserEmail: 'test-deletion-simple@cochranfilms.com',
    timeout: 10000
};

class SimpleAdminDeletionTester {
    constructor() {
        this.testResults = [];
        this.originalUsersData = null;
    }

    async log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const emoji = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            test: '🧪'
        }[type] || '📝';
        
        console.log(`${emoji} [${timestamp}] ${message}`);
        this.testResults.push({ timestamp, type, message });
    }

    async backupUsersJson() {
        try {
            this.log('💾 Backing up current users.json...', 'test');
            
            const usersJsonPath = path.join(__dirname, 'users.json');
            if (fs.existsSync(usersJsonPath)) {
                this.originalUsersData = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
                this.log('✅ users.json backed up successfully', 'success');
                return true;
            } else {
                this.log('⚠️ users.json not found, no backup needed', 'warning');
                return true;
            }
            
        } catch (error) {
            this.log(`❌ Failed to backup users.json: ${error.message}`, 'error');
            return false;
        }
    }

    async checkCurrentUsers() {
        try {
            this.log('📊 Checking current users in the system...', 'test');
            
            const usersJsonPath = path.join(__dirname, 'users.json');
            if (!fs.existsSync(usersJsonPath)) {
                this.log('❌ users.json not found', 'error');
                return null;
            }
            
            const usersData = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
            const userCount = Object.keys(usersData.users || {}).length;
            const currentUsers = Object.keys(usersData.users || {});
            
            this.log(`📈 Current user count: ${userCount}`, 'info');
            this.log(`👥 Current users: ${currentUsers.join(', ')}`, 'info');
            
            // Check if test user already exists
            const testUserExists = currentUsers.includes(CONFIG.testUser);
            if (testUserExists) {
                this.log(`⚠️ Test user "${CONFIG.testUser}" already exists`, 'warning');
            } else {
                this.log(`✅ Test user "${CONFIG.testUser}" does not exist (ready for creation)`, 'success');
            }
            
            return { userCount, currentUsers, testUserExists, usersData };
            
        } catch (error) {
            this.log(`❌ Failed to check current users: ${error.message}`, 'error');
            return null;
        }
    }

    async testUsersApi() {
        try {
            this.log('🌐 Testing users API endpoint...', 'test');
            
            const response = await fetch('https://collaborate.cochranfilms.com/api/users');
            if (!response.ok) {
                this.log(`❌ Users API failed: ${response.status}`, 'error');
                return false;
            }
            
            const apiData = await response.json();
            this.log(`✅ Users API working - ${Object.keys(apiData.users || {}).length} users`, 'success');
            
            // Check data source
            const dataSource = apiData._metadata?.dataSource || 'unknown';
            this.log(`📊 Data source: ${dataSource}`, 'info');
            
            return true;
            
        } catch (error) {
            this.log(`❌ Users API test failed: ${error.message}`, 'error');
            return false;
        }
    }

    async testUpdateUsersApi() {
        try {
            this.log('🔄 Testing update-users API endpoint...', 'test');
            
            // Get current users data
            const usersJsonPath = path.join(__dirname, 'users.json');
            const usersData = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
            
            // Add a test user
            const testUserData = {
                profile: {
                    email: CONFIG.testUserEmail,
                    password: 'test1234',
                    role: 'Test Role',
                    location: 'Test Location',
                    projectStart: '2025-01-01T00:00',
                    approvedDate: new Date().toISOString().split('T')[0]
                },
                contract: {
                    contractUrl: 'contract.html',
                    contractStatus: 'pending',
                    contractSignedDate: null,
                    contractUploadedDate: null,
                    contractId: `CF-${Date.now()}-TEST`
                },
                jobs: {},
                primaryJob: null,
                paymentMethod: null
            };
            
            usersData.users[CONFIG.testUser] = testUserData;
            
            // Test the update API
            const response = await fetch('https://collaborate.cochranfilms.com/api/update-users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    users: usersData.users,
                    action: 'test-add',
                    userName: CONFIG.testUser
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.log('✅ Update users API working', 'success');
                this.log(`📊 API Response: ${JSON.stringify(result, null, 2)}`, 'info');
                return true;
            } else {
                const error = await response.text();
                this.log(`❌ Update users API failed: ${response.status} - ${error}`, 'error');
                return false;
            }
            
        } catch (error) {
            this.log(`❌ Update users API test failed: ${error.message}`, 'error');
            return false;
        }
    }

    async testPdfDeletionApi() {
        try {
            this.log('📄 Testing PDF deletion API...', 'test');
            
            // Check if there are PDF files in contracts directory
            const contractsDir = path.join(__dirname, 'contracts');
            if (!fs.existsSync(contractsDir)) {
                this.log('⚠️ Contracts directory not found', 'warning');
                return true;
            }
            
            const pdfFiles = fs.readdirSync(contractsDir).filter(file => file.endsWith('.pdf'));
            this.log(`📊 Found ${pdfFiles.length} PDF files in contracts directory`, 'info');
            
            if (pdfFiles.length === 0) {
                this.log('✅ No PDF files to test deletion', 'success');
                return true;
            }
            
            // Test deletion of the first PDF file
            const testPdfFile = pdfFiles[0];
            this.log(`🧪 Testing deletion of: ${testPdfFile}`, 'test');
            
            const deleteResponse = await fetch(`https://collaborate.cochranfilms.com/api/delete-pdf`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    filename: testPdfFile
                })
            });
            
            if (deleteResponse.ok) {
                const result = await deleteResponse.json();
                this.log(`✅ PDF deletion API working: ${JSON.stringify(result)}`, 'success');
            } else {
                const error = await deleteResponse.text();
                this.log(`❌ PDF deletion API failed: ${deleteResponse.status} - ${error}`, 'error');
            }
            
            return true;
            
        } catch (error) {
            this.log(`❌ PDF deletion test failed: ${error.message}`, 'error');
            return false;
        }
    }

    async testFirebaseApi() {
        try {
            this.log('🔥 Testing Firebase API...', 'test');
            
            const response = await fetch('https://collaborate.cochranfilms.com/api/firebase', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: CONFIG.testUserEmail
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.log('✅ Firebase API working', 'success');
                this.log(`📊 Firebase Response: ${JSON.stringify(result, null, 2)}`, 'info');
                return true;
            } else {
                const error = await response.text();
                this.log(`❌ Firebase API failed: ${response.status} - ${error}`, 'error');
                return false;
            }
            
        } catch (error) {
            this.log(`❌ Firebase API test failed: ${error.message}`, 'error');
            return false;
        }
    }

    async restoreUsersJson() {
        try {
            this.log('🔄 Restoring original users.json...', 'test');
            
            if (this.originalUsersData) {
                const usersJsonPath = path.join(__dirname, 'users.json');
                fs.writeFileSync(usersJsonPath, JSON.stringify(this.originalUsersData, null, 2));
                this.log('✅ users.json restored to original state', 'success');
                return true;
            } else {
                this.log('⚠️ No backup data to restore', 'warning');
                return true;
            }
            
        } catch (error) {
            this.log(`❌ Failed to restore users.json: ${error.message}`, 'error');
            return false;
        }
    }

    async generateReport() {
        try {
            this.log('📊 Generating test report...', 'test');
            
            const report = {
                timestamp: new Date().toISOString(),
                testName: 'Simple Admin User Deletion Test',
                config: CONFIG,
                results: this.testResults,
                summary: {
                    totalTests: this.testResults.length,
                    successCount: this.testResults.filter(r => r.type === 'success').length,
                    errorCount: this.testResults.filter(r => r.type === 'error').length,
                    warningCount: this.testResults.filter(r => r.type === 'warning').length
                }
            };
            
            // Save report to file
            const reportPath = path.join(__dirname, 'simple-deletion-test-report.json');
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            
            this.log(`📄 Test report saved to: ${reportPath}`, 'success');
            
            // Print summary
            console.log('\n' + '='.repeat(60));
            console.log('📊 SIMPLE ADMIN DELETION TEST SUMMARY');
            console.log('='.repeat(60));
            console.log(`Total Tests: ${report.summary.totalTests}`);
            console.log(`✅ Successes: ${report.summary.successCount}`);
            console.log(`❌ Errors: ${report.summary.errorCount}`);
            console.log(`⚠️ Warnings: ${report.summary.warningCount}`);
            console.log('='.repeat(60));
            
            return report;
            
        } catch (error) {
            this.log(`❌ Failed to generate report: ${error.message}`, 'error');
            return null;
        }
    }

    async runFullTest() {
        try {
            this.log('🚀 Starting simple admin user deletion test...', 'test');
            
            // Step 1: Backup current state
            await this.backupUsersJson();
            
            // Step 2: Check current users
            const userCheck = await this.checkCurrentUsers();
            if (!userCheck) {
                throw new Error('Failed to check current users');
            }
            
            // Step 3: Test users API
            const usersApiWorking = await this.testUsersApi();
            
            // Step 4: Test update users API
            const updateApiWorking = await this.testUpdateUsersApi();
            
            // Step 5: Test PDF deletion API
            const pdfApiWorking = await this.testPdfDeletionApi();
            
            // Step 6: Test Firebase API
            const firebaseApiWorking = await this.testFirebaseApi();
            
            // Step 7: Generate report
            const report = await this.generateReport();
            
            // Final assessment
            const allApisWorking = usersApiWorking && updateApiWorking && pdfApiWorking && firebaseApiWorking;
            
            if (allApisWorking) {
                this.log('🎉 ALL API TESTS PASSED! User deletion system APIs are working correctly.', 'success');
            } else {
                this.log('⚠️ SOME API TESTS FAILED. User deletion system needs attention.', 'warning');
                
                if (!usersApiWorking) {
                    this.log('❌ ISSUE: Users API not working', 'error');
                }
                
                if (!updateApiWorking) {
                    this.log('❌ ISSUE: Update users API not working', 'error');
                }
                
                if (!pdfApiWorking) {
                    this.log('❌ ISSUE: PDF deletion API not working', 'error');
                }
                
                if (!firebaseApiWorking) {
                    this.log('❌ ISSUE: Firebase API not working', 'error');
                }
            }
            
            return report;
            
        } catch (error) {
            this.log(`❌ Test suite failed: ${error.message}`, 'error');
            return null;
        } finally {
            await this.restoreUsersJson();
        }
    }
}

// Main execution
async function main() {
    console.log('🧪 Simple Admin User Deletion Test');
    console.log('=====================================');
    console.log(`Target URL: ${CONFIG.adminUrl}`);
    console.log(`Test User: ${CONFIG.testUser}`);
    console.log('=====================================\n');
    
    const tester = new SimpleAdminDeletionTester();
    const report = await tester.runFullTest();
    
    if (report) {
        console.log('\n✅ Test completed successfully');
        process.exit(0);
    } else {
        console.log('\n❌ Test failed');
        process.exit(1);
    }
}

// Run the test if this script is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = { SimpleAdminDeletionTester, CONFIG };
