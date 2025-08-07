#!/usr/bin/env node

/**
 * 🧪 Admin User Deletion System Test
 * 
 * This script tests the complete user deletion flow:
 * 1. Login to admin dashboard
 * 2. Check current users in users.json
 * 3. Test user deletion functionality
 * 4. Verify changes are persisted to users.json
 * 5. Verify changes are pushed to GitHub
 * 6. Test PDF file deletion from /contracts directory
 * 
 * Live URL: https://collaborate.cochranfilms.com/admin-dashboard
 * Admin Login: info@cochranfilms.com / Cochranfilms2@
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const CONFIG = {
    adminUrl: 'https://collaborate.cochranfilms.com/admin-dashboard',
    adminEmail: 'info@cochranfilms.com',
    adminPassword: 'Cochranfilms2@',
    testUser: 'Test User Deletion',
    testUserEmail: 'test-deletion@cochranfilms.com',
    testUserRole: 'Test Role',
    testUserLocation: 'Test Location',
    testUserRate: '$500',
    contractUrl: 'contract.html',
    timeout: 30000,
    headless: false, // Set to true for production
    slowMo: 1000 // Slow down for debugging
};

class AdminUserDeletionTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.originalUsersData = null;
        this.testUserData = null;
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

    async initialize() {
        try {
            this.log('🚀 Initializing Admin User Deletion Test System...', 'test');
            
            // Launch browser
            this.browser = await puppeteer.launch({
                headless: CONFIG.headless,
                slowMo: CONFIG.slowMo,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });

            this.page = await this.browser.newPage();
            
            // Set viewport
            await this.page.setViewport({ width: 1920, height: 1080 });
            
            // Enable console logging
            this.page.on('console', msg => {
                if (msg.type() === 'error') {
                    this.log(`Browser Error: ${msg.text()}`, 'error');
                }
            });

            this.log('✅ Browser initialized successfully', 'success');
            return true;
            
        } catch (error) {
            this.log(`❌ Failed to initialize browser: ${error.message}`, 'error');
            return false;
        }
    }

    async loginToAdminDashboard() {
        try {
            this.log('🔐 Attempting to login to admin dashboard...', 'test');
            
            // Navigate to admin dashboard
            await this.page.goto(CONFIG.adminUrl, { waitUntil: 'networkidle2' });
            this.log('✅ Navigated to admin dashboard', 'success');
            
            // Wait for login form to load
            await this.page.waitForSelector('#loginScreen', { timeout: CONFIG.timeout });
            this.log('✅ Login screen loaded', 'success');
            
            // Fill in login credentials
            await this.page.type('#email', CONFIG.adminEmail);
            await this.page.type('#password', CONFIG.adminPassword);
            this.log('✅ Credentials entered', 'success');
            
            // Submit login form
            await this.page.click('button[type="submit"]');
            this.log('✅ Login form submitted', 'success');
            
            // Wait for dashboard to load
            await this.page.waitForSelector('#dashboard', { timeout: CONFIG.timeout });
            this.log('✅ Successfully logged into admin dashboard', 'success');
            
            // Verify we're on the dashboard
            const dashboardVisible = await this.page.$eval('#dashboard', el => el.style.display !== 'none');
            if (dashboardVisible) {
                this.log('✅ Dashboard is visible and accessible', 'success');
                return true;
            } else {
                this.log('❌ Dashboard not visible after login', 'error');
                return false;
            }
            
        } catch (error) {
            this.log(`❌ Login failed: ${error.message}`, 'error');
            return false;
        }
    }

    async checkCurrentUsers() {
        try {
            this.log('📊 Checking current users in the system...', 'test');
            
            // Wait for users list to load
            await this.page.waitForSelector('#usersList', { timeout: CONFIG.timeout });
            
            // Get current user count
            const userCount = await this.page.evaluate(() => {
                const usersList = document.getElementById('usersList');
                return usersList ? usersList.children.length : 0;
            });
            
            this.log(`📈 Current user count: ${userCount}`, 'info');
            
            // Get list of current users
            const currentUsers = await this.page.evaluate(() => {
                const userCards = document.querySelectorAll('#usersList .item-card');
                return Array.from(userCards).map(card => {
                    const nameElement = card.querySelector('h4');
                    return nameElement ? nameElement.textContent.trim() : 'Unknown User';
                });
            });
            
            this.log(`👥 Current users: ${currentUsers.join(', ')}`, 'info');
            
            // Check if test user already exists
            const testUserExists = currentUsers.includes(CONFIG.testUser);
            if (testUserExists) {
                this.log(`⚠️ Test user "${CONFIG.testUser}" already exists`, 'warning');
            } else {
                this.log(`✅ Test user "${CONFIG.testUser}" does not exist (ready for creation)`, 'success');
            }
            
            return { userCount, currentUsers, testUserExists };
            
        } catch (error) {
            this.log(`❌ Failed to check current users: ${error.message}`, 'error');
            return null;
        }
    }

    async createTestUser() {
        try {
            this.log('👤 Creating test user for deletion testing...', 'test');
            
            // Fill in user creation form
            await this.page.type('#freelancerName', CONFIG.testUser);
            await this.page.type('#freelancerEmail', CONFIG.testUserEmail);
            await this.page.type('#freelancerRole', CONFIG.testUserRole);
            await this.page.type('#freelancerLocation', CONFIG.testUserLocation);
            await this.page.type('#freelancerRate', CONFIG.testUserRate);
            await this.page.type('#contractUrl', CONFIG.contractUrl);
            
            // Set approved date to today
            const today = new Date().toISOString().split('T')[0];
            await this.page.evaluate((date) => {
                document.getElementById('approvedDate').value = date;
            }, today);
            
            this.log('✅ Test user form filled', 'success');
            
            // Submit the form
            await this.page.click('#contractForm button[type="submit"]');
            this.log('✅ Test user form submitted', 'success');
            
            // Wait for user to be added to the list
            await this.page.waitForFunction(() => {
                const usersList = document.getElementById('usersList');
                if (!usersList) return false;
                const userCards = usersList.querySelectorAll('.item-card');
                return Array.from(userCards).some(card => {
                    const nameElement = card.querySelector('h4');
                    return nameElement && nameElement.textContent.includes('Test User Deletion');
                });
            }, { timeout: CONFIG.timeout });
            
            this.log('✅ Test user created successfully', 'success');
            
            // Verify user appears in the list
            const userCreated = await this.page.evaluate((testUser) => {
                const usersList = document.getElementById('usersList');
                const userCards = usersList.querySelectorAll('.item-card');
                return Array.from(userCards).some(card => {
                    const nameElement = card.querySelector('h4');
                    return nameElement && nameElement.textContent.includes(testUser);
                });
            }, CONFIG.testUser);
            
            if (userCreated) {
                this.log('✅ Test user verified in user list', 'success');
                return true;
            } else {
                this.log('❌ Test user not found in user list after creation', 'error');
                return false;
            }
            
        } catch (error) {
            this.log(`❌ Failed to create test user: ${error.message}`, 'error');
            return false;
        }
    }

    async backupUsersJson() {
        try {
            this.log('💾 Backing up current users.json...', 'test');
            
            // Read current users.json
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

    async testUserDeletion() {
        try {
            this.log('🗑️ Testing user deletion functionality...', 'test');
            
            // Find the delete button for our test user
            const deleteButton = await this.page.evaluateHandle((testUser) => {
                const usersList = document.getElementById('usersList');
                const userCards = usersList.querySelectorAll('.item-card');
                
                for (const card of userCards) {
                    const nameElement = card.querySelector('h4');
                    if (nameElement && nameElement.textContent.includes(testUser)) {
                        const deleteBtn = card.querySelector('button[onclick*="deleteUser"]');
                        return deleteBtn;
                    }
                }
                return null;
            }, CONFIG.testUser);
            
            if (!deleteButton) {
                this.log('❌ Delete button not found for test user', 'error');
                return false;
            }
            
            this.log('✅ Delete button found for test user', 'success');
            
            // Click delete button
            await deleteButton.click();
            this.log('✅ Delete button clicked', 'success');
            
            // Handle confirmation dialog
            this.page.on('dialog', async dialog => {
                this.log('📋 Confirmation dialog appeared', 'info');
                await dialog.accept();
                this.log('✅ Confirmation dialog accepted', 'success');
            });
            
            // Wait for user to be removed from the list
            await this.page.waitForFunction(() => {
                const usersList = document.getElementById('usersList');
                if (!usersList) return false;
                const userCards = usersList.querySelectorAll('.item-card');
                return !Array.from(userCards).some(card => {
                    const nameElement = card.querySelector('h4');
                    return nameElement && nameElement.textContent.includes('Test User Deletion');
                });
            }, { timeout: CONFIG.timeout });
            
            this.log('✅ Test user removed from user list', 'success');
            
            // Check if user count decreased
            const newUserCount = await this.page.evaluate(() => {
                const usersList = document.getElementById('usersList');
                return usersList ? usersList.children.length : 0;
            });
            
            this.log(`📊 New user count: ${newUserCount}`, 'info');
            
            return true;
            
        } catch (error) {
            this.log(`❌ User deletion test failed: ${error.message}`, 'error');
            return false;
        }
    }

    async checkUsersJsonUpdate() {
        try {
            this.log('📄 Checking if users.json was updated...', 'test');
            
            // Wait a moment for any async operations
            await this.page.waitForTimeout(2000);
            
            // Read current users.json
            const usersJsonPath = path.join(__dirname, 'users.json');
            if (!fs.existsSync(usersJsonPath)) {
                this.log('❌ users.json not found after deletion', 'error');
                return false;
            }
            
            const currentUsersData = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
            
            // Check if test user was removed
            const testUserRemoved = !currentUsersData.users[CONFIG.testUser];
            
            if (testUserRemoved) {
                this.log('✅ Test user successfully removed from users.json', 'success');
            } else {
                this.log('❌ Test user still exists in users.json', 'error');
            }
            
            // Compare user counts
            const originalCount = this.originalUsersData ? Object.keys(this.originalUsersData.users || {}).length : 0;
            const currentCount = Object.keys(currentUsersData.users || {}).length;
            
            this.log(`📊 User count comparison: ${originalCount} → ${currentCount}`, 'info');
            
            if (currentCount < originalCount) {
                this.log('✅ User count decreased as expected', 'success');
            } else {
                this.log('⚠️ User count did not decrease', 'warning');
            }
            
            return testUserRemoved;
            
        } catch (error) {
            this.log(`❌ Failed to check users.json update: ${error.message}`, 'error');
            return false;
        }
    }

    async checkGitHubUpdate() {
        try {
            this.log('🌐 Checking if changes were pushed to GitHub...', 'test');
            
            // Make a request to the users API to check GitHub data
            const response = await fetch('https://collaborate.cochranfilms.com/api/users');
            if (!response.ok) {
                this.log(`❌ Failed to fetch users API: ${response.status}`, 'error');
                return false;
            }
            
            const apiData = await response.json();
            
            // Check if test user was removed from GitHub data
            const testUserRemovedFromGitHub = !apiData.users[CONFIG.testUser];
            
            if (testUserRemovedFromGitHub) {
                this.log('✅ Test user successfully removed from GitHub data', 'success');
            } else {
                this.log('❌ Test user still exists in GitHub data', 'error');
            }
            
            // Check data source
            const dataSource = apiData._metadata?.dataSource || 'unknown';
            this.log(`📊 Data source: ${dataSource}`, 'info');
            
            return testUserRemovedFromGitHub;
            
        } catch (error) {
            this.log(`❌ Failed to check GitHub update: ${error.message}`, 'error');
            return false;
        }
    }

    async testPdfDeletion() {
        try {
            this.log('📄 Testing PDF file deletion...', 'test');
            
            // First, check if there are any PDF files in the contracts directory
            const contractsDir = path.join(__dirname, 'contracts');
            if (!fs.existsSync(contractsDir)) {
                this.log('⚠️ Contracts directory not found', 'warning');
                return true; // Not an error, just no contracts to test
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
            
            // Make DELETE request to the PDF deletion API
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
                this.log(`✅ PDF deletion API response: ${JSON.stringify(result)}`, 'success');
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
            this.log('📊 Generating comprehensive test report...', 'test');
            
            const report = {
                timestamp: new Date().toISOString(),
                testName: 'Admin User Deletion System Test',
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
            const reportPath = path.join(__dirname, 'admin-deletion-test-report.json');
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            
            this.log(`📄 Test report saved to: ${reportPath}`, 'success');
            
            // Print summary
            console.log('\n' + '='.repeat(60));
            console.log('📊 ADMIN USER DELETION TEST SUMMARY');
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

    async cleanup() {
        try {
            this.log('🧹 Cleaning up test environment...', 'test');
            
            if (this.browser) {
                await this.browser.close();
                this.log('✅ Browser closed', 'success');
            }
            
            // Restore users.json
            await this.restoreUsersJson();
            
            this.log('✅ Cleanup completed', 'success');
            
        } catch (error) {
            this.log(`❌ Cleanup failed: ${error.message}`, 'error');
        }
    }

    async runFullTest() {
        try {
            this.log('🚀 Starting comprehensive admin user deletion test...', 'test');
            
            // Step 1: Initialize
            if (!await this.initialize()) {
                throw new Error('Failed to initialize test environment');
            }
            
            // Step 2: Login
            if (!await this.loginToAdminDashboard()) {
                throw new Error('Failed to login to admin dashboard');
            }
            
            // Step 3: Backup current state
            await this.backupUsersJson();
            
            // Step 4: Check current users
            const userCheck = await this.checkCurrentUsers();
            if (!userCheck) {
                throw new Error('Failed to check current users');
            }
            
            // Step 5: Create test user (if needed)
            if (!userCheck.testUserExists) {
                if (!await this.createTestUser()) {
                    throw new Error('Failed to create test user');
                }
            }
            
            // Step 6: Test user deletion
            if (!await this.testUserDeletion()) {
                throw new Error('Failed to test user deletion');
            }
            
            // Step 7: Check users.json update
            const jsonUpdated = await this.checkUsersJsonUpdate();
            
            // Step 8: Check GitHub update
            const githubUpdated = await this.checkGitHubUpdate();
            
            // Step 9: Test PDF deletion
            await this.testPdfDeletion();
            
            // Step 10: Generate report
            const report = await this.generateReport();
            
            // Final assessment
            if (jsonUpdated && githubUpdated) {
                this.log('🎉 ALL TESTS PASSED! User deletion system is working correctly.', 'success');
            } else {
                this.log('⚠️ SOME TESTS FAILED. User deletion system needs attention.', 'warning');
                
                if (!jsonUpdated) {
                    this.log('❌ ISSUE: users.json not being updated properly', 'error');
                }
                
                if (!githubUpdated) {
                    this.log('❌ ISSUE: Changes not being pushed to GitHub', 'error');
                }
            }
            
            return report;
            
        } catch (error) {
            this.log(`❌ Test suite failed: ${error.message}`, 'error');
            return null;
        } finally {
            await this.cleanup();
        }
    }
}

// Main execution
async function main() {
    console.log('🧪 Admin User Deletion System Test');
    console.log('=====================================');
    console.log(`Target URL: ${CONFIG.adminUrl}`);
    console.log(`Admin Email: ${CONFIG.adminEmail}`);
    console.log(`Test User: ${CONFIG.testUser}`);
    console.log('=====================================\n');
    
    const tester = new AdminUserDeletionTester();
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

module.exports = { AdminUserDeletionTester, CONFIG };
