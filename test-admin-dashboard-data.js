#!/usr/bin/env node

/**
 * Test Admin Dashboard Data Loading
 * Tests if the admin dashboard is properly loading and displaying users.json data
 */

const puppeteer = require('puppeteer');

async function testAdminDashboardData() {
    console.log('🔍 Testing Admin Dashboard Data Loading...\n');
    
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
        
        // Navigate to admin dashboard
        console.log('📱 Loading admin dashboard...');
        await page.goto('http://localhost:8000/admin-dashboard.html', { waitUntil: 'networkidle2' });
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
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
            await page.type('#email', 'cody@cochranfilms.com');
            await page.type('#password', 'your-firebase-password'); // You'll need to provide the actual password
            
            // Submit the form
            await page.click('button[type="submit"]');
            
            // Wait for authentication
            await new Promise(resolve => setTimeout(resolve, 3000));
            
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
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if stats are loading
        console.log('\n📊 Checking stats loading...');
        const statsData = await page.evaluate(() => {
            const stats = {
                totalCreators: document.getElementById('totalCreators')?.textContent,
                activeJobs: document.getElementById('activeJobs')?.textContent,
                pendingReviews: document.getElementById('pendingReviews')?.textContent,
                totalContracts: document.getElementById('totalContracts')?.textContent
            };
            return stats;
        });
        
        console.log('📊 Current Stats:', statsData);
        
        // Check if jobs are loading from API
        console.log('\n📋 Testing jobs data loading...');
        const jobsTest = await page.evaluate(async () => {
            try {
                const response = await fetch('/api/jobs-data');
                if (response.ok) {
                    const data = await response.json();
                    return {
                        success: true,
                        jobsCount: data.jobs?.length || 0,
                        data: data
                    };
                } else {
                    return {
                        success: false,
                        status: response.status,
                        error: 'API request failed'
                    };
                }
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        });
        
        console.log('📋 Jobs API Test:', jobsTest);
        
        // Check if freelancers are loading
        console.log('\n👥 Testing freelancers data loading...');
        const freelancersTest = await page.evaluate(async () => {
            try {
                const response = await fetch('freelancers.json');
                if (response.ok) {
                    const data = await response.json();
                    return {
                        success: true,
                        freelancersCount: Object.keys(data.approvedFreelancers || {}).length,
                        data: data
                    };
                } else {
                    return {
                        success: false,
                        status: response.status,
                        error: 'Freelancers file not found'
                    };
                }
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        });
        
        console.log('👥 Freelancers Test:', freelancersTest);
        
        // Check if users.json is accessible
        console.log('\n👤 Testing users.json access...');
        const usersTest = await page.evaluate(async () => {
            try {
                const response = await fetch('users.json');
                if (response.ok) {
                    const data = await response.json();
                    return {
                        success: true,
                        usersCount: Object.keys(data.users || {}).length,
                        data: data
                    };
                } else {
                    return {
                        success: false,
                        status: response.status,
                        error: 'Users file not found'
                    };
                }
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        });
        
        console.log('👤 Users.json Test:', usersTest);
        
        // Check if the admin dashboard is trying to load users data
        console.log('\n🔍 Checking admin dashboard data loading functions...');
        const dashboardFunctions = await page.evaluate(() => {
            const functions = {
                loadJobs: typeof window.loadJobs,
                loadFreelancers: typeof window.loadFreelancers,
                loadUsers: typeof window.loadUsers,
                displayUsers: typeof window.displayUsers,
                updateStats: typeof window.updateStats
            };
            
            // Check if there are any user-related elements
            const userElements = {
                usersList: !!document.getElementById('usersList'),
                usersTab: !!document.getElementById('users-tab'),
                userManagement: !!document.querySelector('[onclick*="users"]')
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
                jobsHTML: jobsList?.innerHTML?.substring(0, 500) || 'No jobs list found',
                contractsHTML: contractsList?.innerHTML?.substring(0, 500) || 'No contracts list found'
            };
        });
        
        console.log('📋 Displayed Data:', displayedData);
        
        // Check for any console errors
        console.log('\n🔍 Checking for console errors...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n✅ Admin dashboard data test completed!');
        
        // Summary
        console.log('\n📊 TEST SUMMARY:');
        console.log('================');
        console.log(`Jobs API: ${jobsTest.success ? '✅ Working' : '❌ Failed'}`);
        console.log(`Freelancers: ${freelancersTest.success ? '✅ Working' : '❌ Failed'}`);
        console.log(`Users.json: ${usersTest.success ? '✅ Accessible' : '❌ Not accessible'}`);
        console.log(`Dashboard Functions: ${Object.values(dashboardFunctions.functions).every(f => f === 'function') ? '✅ Available' : '❌ Missing'}`);
        console.log(`User Elements: ${Object.values(dashboardFunctions.userElements).some(e => e) ? '✅ Found' : '❌ Not found'}`);
        
    } catch (error) {
        console.error('❌ Admin dashboard test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testAdminDashboardData().catch(console.error); 