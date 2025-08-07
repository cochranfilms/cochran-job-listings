#!/usr/bin/env node

/**
 * Test User Management Functionality
 * Quick test to verify users.json data is now loading in admin dashboard
 */

const puppeteer = require('puppeteer');

async function testUserManagement() {
    console.log('🔍 Testing User Management Functionality...\n');
    
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
        console.log('\n📊 Checking updated stats...');
        const stats = await page.evaluate(() => {
            return {
                totalCreators: document.getElementById('totalCreators')?.textContent,
                activeJobs: document.getElementById('activeJobs')?.textContent,
                pendingReviews: document.getElementById('pendingReviews')?.textContent,
                totalContracts: document.getElementById('totalContracts')?.textContent
            };
        });
        
        console.log('📊 Stats:', stats);
        
        // Check if users section exists
        console.log('\n👥 Checking user management section...');
        const userSection = await page.evaluate(() => {
            const usersList = document.getElementById('usersList');
            const userManagement = document.querySelector('h2');
            return {
                usersListExists: !!usersList,
                userManagementExists: !!userManagement?.textContent?.includes('User Management'),
                usersCount: usersList?.children?.length || 0
            };
        });
        
        console.log('👥 User Section:', userSection);
        
        // Check if users are displayed
        if (userSection.usersListExists) {
            console.log('\n📋 Checking displayed users...');
            const usersData = await page.evaluate(() => {
                const usersList = document.getElementById('usersList');
                const users = [];
                
                if (usersList) {
                    const userCards = usersList.querySelectorAll('.item-card');
                    userCards.forEach(card => {
                        const name = card.querySelector('h4')?.textContent;
                        const email = card.querySelector('.item-meta span')?.textContent;
                        users.push({ name, email });
                    });
                }
                
                return users;
            });
            
            console.log('📋 Displayed Users:', usersData);
        }
        
        // Test user functions
        console.log('\n🔍 Testing user management functions...');
        const userFunctions = await page.evaluate(() => {
            return {
                loadUsers: typeof window.loadUsers,
                displayUsers: typeof window.displayUsers,
                exportUsersData: typeof window.exportUsersData,
                downloadUsersJSON: typeof window.downloadUsersJSON,
                viewUserDetails: typeof window.viewUserDetails,
                deleteUser: typeof window.deleteUser
            };
        });
        
        console.log('🔍 User Functions:', userFunctions);
        
        console.log('\n✅ User management test completed!');
        
        // Summary
        console.log('\n📊 TEST SUMMARY:');
        console.log('================');
        console.log(`Total Creators: ${stats.totalCreators} (should be 1)`);
        console.log(`User Section: ${userSection.userManagementExists ? '✅ Found' : '❌ Missing'}`);
        console.log(`Users List: ${userSection.usersListExists ? '✅ Found' : '❌ Missing'}`);
        console.log(`Users Count: ${userSection.usersCount} (should be 1)`);
        console.log(`User Functions: ${Object.values(userFunctions).every(f => f === 'function') ? '✅ All Available' : '❌ Missing Some'}`);
        
    } catch (error) {
        console.error('❌ User management test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testUserManagement().catch(console.error); 