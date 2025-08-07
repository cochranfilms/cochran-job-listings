#!/usr/bin/env node

/**
 * Test Live Admin Dashboard Data Loading
 * Tests the live admin dashboard at collaborate.cochranfilms.com
 */

const puppeteer = require('puppeteer');

async function testLiveAdminDashboard() {
    console.log('🔍 Testing Live Admin Dashboard Data Loading...\n');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 }
    });

    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            console.log(`📱 Browser: ${msg.type()}: ${msg.text()}`);
        });
        
        // Navigate to live admin dashboard
        console.log('📱 Loading live admin dashboard...');
        await page.goto('https://collaborate.cochranfilms.com/admin-dashboard', { waitUntil: 'networkidle2' });
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if login screen is visible
        console.log('\n🔍 Checking login screen...');
        const loginScreenVisible = await page.evaluate(() => {
            const loginScreen = document.getElementById('loginScreen');
            return loginScreen && loginScreen.style.display !== 'none';
        });
        
        if (loginScreenVisible) {
            console.log('✅ Login screen is visible');
            
            // Fill in Firebase credentials
            console.log('\n🔑 Logging in with Firebase...');
            await page.type('#email', 'info@cochranfilms.com');
            await page.type('#password', 'Cochranfilms2@');
            
            // Submit the form
            await page.click('button[type="submit"]');
            
            // Wait for authentication
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Check if dashboard is now visible
            const dashboardVisible = await page.evaluate(() => {
                const dashboard = document.getElementById('dashboard');
                return dashboard && dashboard.style.display !== 'none';
            });
            
            if (dashboardVisible) {
                console.log('✅ Successfully logged in, dashboard is visible');
            } else {
                console.log('❌ Dashboard not visible after login');
                return;
            }
        } else {
            console.log('⚠️ Login screen not visible, checking if already logged in...');
        }
        
        // Wait for dashboard to fully load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check current stats
        console.log('\n📊 Checking current stats...');
        const currentStats = await page.evaluate(() => {
            const stats = {
                totalCreators: document.getElementById('totalCreators')?.textContent,
                activeJobs: document.getElementById('activeJobs')?.textContent,
                pendingReviews: document.getElementById('pendingReviews')?.textContent,
                totalContracts: document.getElementById('totalContracts')?.textContent
            };
            return stats;
        });
        
        console.log('📊 Current Stats:', currentStats);
        
        // Test API endpoints on live site
        console.log('\n📋 Testing live API endpoints...');
        const apiTests = await page.evaluate(async () => {
            const results = {};
            
            // Test jobs API
            try {
                const jobsResponse = await fetch('/api/jobs-data');
                if (jobsResponse.ok) {
                    const jobsData = await jobsResponse.json();
                    results.jobs = {
                        success: true,
                        count: jobsData.jobs?.length || 0,
                        data: jobsData
                    };
                } else {
                    results.jobs = {
                        success: false,
                        status: jobsResponse.status
                    };
                }
            } catch (error) {
                results.jobs = {
                    success: false,
                    error: error.message
                };
            }
            
            // Test freelancers.json
            try {
                const freelancersResponse = await fetch('freelancers.json');
                if (freelancersResponse.ok) {
                    const freelancersData = await freelancersResponse.json();
                    results.freelancers = {
                        success: true,
                        count: Object.keys(freelancersData.approvedFreelancers || {}).length,
                        data: freelancersData
                    };
                } else {
                    results.freelancers = {
                        success: false,
                        status: freelancersResponse.status
                    };
                }
            } catch (error) {
                results.freelancers = {
                    success: false,
                    error: error.message
                };
            }
            
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
            
            return results;
        });
        
        console.log('📋 API Test Results:', JSON.stringify(apiTests, null, 2));
        
        // Check if the dashboard has functions to load users data
        console.log('\n🔍 Checking dashboard functions...');
        const dashboardFunctions = await page.evaluate(() => {
            const functions = {
                loadJobs: typeof window.loadJobs,
                loadFreelancers: typeof window.loadFreelancers,
                loadUsers: typeof window.loadUsers,
                displayUsers: typeof window.displayUsers,
                updateStats: typeof window.updateStats
            };
            
            // Check for user-related UI elements
            const userElements = {
                usersList: !!document.getElementById('usersList'),
                usersTab: !!document.getElementById('users-tab'),
                userManagement: !!document.querySelector('[onclick*="users"]'),
                userSection: !!document.querySelector('[class*="user"]')
            };
            
            return { functions, userElements };
        });
        
        console.log('🔍 Dashboard Functions:', dashboardFunctions);
        
        // Check what data is actually being displayed
        console.log('\n📋 Checking displayed data...');
        const displayedData = await page.evaluate(() => {
            const jobsList = document.getElementById('jobsList');
            const contractsList = document.getElementById('contractsList');
            
            return {
                jobsCount: jobsList?.children?.length || 0,
                contractsCount: contractsList?.children?.length || 0,
                jobsHTML: jobsList?.innerHTML?.substring(0, 300) || 'No jobs list found',
                contractsHTML: contractsList?.innerHTML?.substring(0, 300) || 'No contracts list found'
            };
        });
        
        console.log('📋 Displayed Data:', displayedData);
        
        // Check for any console errors
        console.log('\n🔍 Checking for console errors...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n✅ Live admin dashboard test completed!');
        
        // Summary
        console.log('\n📊 TEST SUMMARY:');
        console.log('================');
        console.log(`Jobs API: ${apiTests.jobs?.success ? '✅ Working' : '❌ Failed'}`);
        console.log(`Freelancers: ${apiTests.freelancers?.success ? '✅ Working' : '❌ Failed'}`);
        console.log(`Users.json: ${apiTests.users?.success ? '✅ Accessible' : '❌ Not accessible'}`);
        console.log(`Dashboard Functions: ${Object.values(dashboardFunctions.functions).every(f => f === 'function') ? '✅ Available' : '❌ Missing'}`);
        console.log(`User Elements: ${Object.values(dashboardFunctions.userElements).some(e => e) ? '✅ Found' : '❌ Not found'}`);
        
        // Analysis
        console.log('\n🔍 ANALYSIS:');
        console.log('============');
        if (apiTests.users?.success) {
            console.log('✅ users.json is accessible and contains data');
            console.log(`📊 Found ${apiTests.users.count} users in users.json`);
        } else {
            console.log('❌ users.json is not accessible or missing');
        }
        
        if (!dashboardFunctions.functions.loadUsers) {
            console.log('❌ Dashboard is missing loadUsers() function');
        }
        
        if (!dashboardFunctions.userElements.usersList) {
            console.log('❌ Dashboard is missing users list UI element');
        }
        
        if (currentStats.totalCreators === '0') {
            console.log('❌ Stats are showing 0 - users data not being loaded into stats');
        }
        
    } catch (error) {
        console.error('❌ Live admin dashboard test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testLiveAdminDashboard().catch(console.error); 