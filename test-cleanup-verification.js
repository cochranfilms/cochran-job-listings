#!/usr/bin/env node

/**
 * Test Cleanup Verification
 * Verify that freelancers.json references have been removed and only users.json is used
 */

const puppeteer = require('puppeteer');

async function testCleanupVerification() {
    console.log('🔍 Testing Cleanup Verification...\n');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 }
    });

    try {
        const page = await browser.newPage();
        
        // Navigate to live admin dashboard
        console.log('📱 Loading live admin dashboard...');
        await page.goto('https://collaborate.cochranfilms.com/admin-dashboard', { waitUntil: 'networkidle2' });
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Login
        console.log('\n🔑 Logging in...');
        await page.type('#email', 'info@cochranfilms.com');
        await page.type('#password', 'Cochranfilms2@');
        await page.click('button[type="submit"]');
        
        // Wait for authentication
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check if dashboard is visible
        const dashboardVisible = await page.evaluate(() => {
            const dashboard = document.getElementById('dashboard');
            return dashboard && dashboard.style.display !== 'none';
        });
        
        if (!dashboardVisible) {
            console.log('❌ Dashboard not visible after login');
            return;
        }
        
        console.log('✅ Successfully logged in');
        
        // Wait for data to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check stats
        console.log('\n📊 Checking stats after cleanup...');
        const stats = await page.evaluate(() => {
            return {
                totalCreators: document.getElementById('totalCreators')?.textContent,
                activeJobs: document.getElementById('activeJobs')?.textContent,
                pendingReviews: document.getElementById('pendingReviews')?.textContent,
                totalContracts: document.getElementById('totalContracts')?.textContent
            };
        });
        
        console.log('📊 Stats:', stats);
        
        // Check if both sections show the same data
        console.log('\n👥 Checking data consistency...');
        const dataConsistency = await page.evaluate(() => {
            const usersList = document.getElementById('usersList');
            const contractsList = document.getElementById('contractsList');
            
            const usersCount = usersList?.children?.length || 0;
            const contractsCount = contractsList?.children?.length || 0;
            
            return {
                usersCount,
                contractsCount,
                consistent: usersCount === contractsCount
            };
        });
        
        console.log('👥 Data Consistency:', dataConsistency);
        
        // Test API endpoints
        console.log('\n📋 Testing API endpoints...');
        const apiTests = await page.evaluate(async () => {
            const results = {};
            
            // Test users.json
            try {
                const usersResponse = await fetch('users.json');
                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    results.users = {
                        success: true,
                        count: Object.keys(usersData.users || {}).length,
                        data: usersData
                    };
                } else {
                    results.users = {
                        success: false,
                        status: usersResponse.status
                    };
                }
            } catch (error) {
                results.users = {
                    success: false,
                    error: error.message
                };
            }
            
            // Test freelancers.json (should fail)
            try {
                const freelancersResponse = await fetch('freelancers.json');
                results.freelancers = {
                    success: false,
                    status: freelancersResponse.status,
                    expected: 'Should not exist'
                };
            } catch (error) {
                results.freelancers = {
                    success: false,
                    error: error.message,
                    expected: 'Should not exist'
                };
            }
            
            return results;
        });
        
        console.log('📋 API Test Results:', JSON.stringify(apiTests, null, 2));
        
        // Check functions
        console.log('\n🔍 Checking functions after cleanup...');
        const functions = await page.evaluate(() => {
            return {
                loadUsers: typeof window.loadUsers,
                displayUsers: typeof window.displayUsers,
                loadFreelancers: typeof window.loadFreelancers,
                displayFreelancers: typeof window.displayFreelancers,
                updateStats: typeof window.updateStats
            };
        });
        
        console.log('🔍 Functions:', functions);
        
        console.log('\n✅ Cleanup verification test completed!');
        
        // Summary
        console.log('\n📊 CLEANUP VERIFICATION SUMMARY:');
        console.log('================================');
        console.log(`Total Creators: ${stats.totalCreators} (should be 1)`);
        console.log(`Total Contracts: ${stats.totalContracts} (should be 1)`);
        console.log(`Data Consistency: ${dataConsistency.consistent ? '✅ Consistent' : '❌ Inconsistent'}`);
        console.log(`Users API: ${apiTests.users?.success ? '✅ Working' : '❌ Failed'}`);
        console.log(`Freelancers API: ${apiTests.freelancers?.success ? '❌ Still exists' : '✅ Removed'}`);
        console.log(`loadUsers(): ${functions.loadUsers === 'function' ? '✅ Available' : '❌ Missing'}`);
        console.log(`displayUsers(): ${functions.displayUsers === 'function' ? '✅ Available' : '❌ Missing'}`);
        console.log(`loadFreelancers(): ${functions.loadFreelancers === 'undefined' ? '✅ Removed' : '❌ Still exists'}`);
        console.log(`displayFreelancers(): ${functions.displayFreelancers === 'undefined' ? '✅ Removed' : '❌ Still exists'}`);
        
        // Analysis
        console.log('\n🔍 ANALYSIS:');
        console.log('============');
        if (stats.totalCreators === '1' && stats.totalContracts === '1') {
            console.log('✅ Stats are consistent - both showing user count from users.json');
        } else {
            console.log('❌ Stats are inconsistent - may still be using different data sources');
        }
        
        if (dataConsistency.consistent) {
            console.log('✅ User Management and Contract Management show same data');
        } else {
            console.log('❌ User Management and Contract Management show different data');
        }
        
        if (!apiTests.freelancers?.success) {
            console.log('✅ freelancers.json successfully removed');
        } else {
            console.log('❌ freelancers.json still accessible');
        }
        
        if (functions.loadFreelancers === 'undefined' && functions.displayFreelancers === 'undefined') {
            console.log('✅ Freelancer functions successfully removed');
        } else {
            console.log('❌ Freelancer functions still exist');
        }
        
    } catch (error) {
        console.error('❌ Cleanup verification test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testCleanupVerification().catch(console.error); 