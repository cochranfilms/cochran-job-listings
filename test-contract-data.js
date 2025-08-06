#!/usr/bin/env node

/**
 * Test Contract Data
 * Tests the contract data structure and access
 */

const puppeteer = require('puppeteer');

async function testContractData() {
    console.log('🔍 Testing Contract Data Structure...\n');
    
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
        
        // Navigate to user portal
        console.log('📱 Loading user portal...');
        await page.goto('http://collaborate.cochranfilms.com/user-portal', { waitUntil: 'networkidle2' });
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fill in credentials and login
        console.log('\n🔑 Logging in...');
        await page.type('input[type="email"]', 'codylcochran89@gmail.com');
        await page.type('input[type="password"]', 'youtube');
        
        // Submit the form
        await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true }));
            }
        });
        
        // Wait for the user portal to appear
        console.log('\n⏳ Waiting for user portal to appear...');
        await page.waitForFunction(() => {
            const userPortal = document.getElementById('userPortal');
            const loginScreen = document.getElementById('loginScreen');
            return userPortal && userPortal.style.display !== 'none' && 
                   loginScreen && loginScreen.style.display === 'none';
        }, { timeout: 10000 });
        
        console.log('✅ User portal appeared!');
        
        // Wait a moment for data to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check current user data
        const currentUserData = await page.evaluate(() => {
            if (typeof currentUser === 'undefined') {
                return { error: 'currentUser not defined' };
            }
            
            return {
                name: currentUser.name,
                email: currentUser.email,
                contractStatus: currentUser.contractStatus,
                contractId: currentUser.contractId,
                contractSignedDate: currentUser.contractSignedDate,
                contract: currentUser.contract,
                jobs: currentUser.jobs,
                primaryJob: currentUser.primaryJob
            };
        });
        
        console.log('\n📊 Current User Data:');
        console.log(JSON.stringify(currentUserData, null, 2));
        
        // Click on contracts tab
        console.log('\n📋 Clicking on contracts tab...');
        await page.evaluate(() => {
            const contractsLink = document.querySelector('a[onclick*="showSection(\'contracts\')"]');
            if (contractsLink) {
                contractsLink.click();
            }
        });
        
        // Wait for contracts content to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check contracts content
        const contractsContent = await page.evaluate(() => {
            const container = document.getElementById('contractsContent');
            return container ? container.innerHTML : 'Container not found';
        });
        
        console.log('\n📋 Contracts Content:');
        console.log(contractsContent.substring(0, 500) + '...');
        
        // Check if download button exists
        const downloadButton = await page.evaluate(() => {
            const button = document.querySelector('button[onclick*="downloadUserContract"]');
            return button ? {
                exists: true,
                text: button.textContent,
                onclick: button.getAttribute('onclick')
            } : { exists: false };
        });
        
        console.log('\n📥 Download Button:');
        console.log(JSON.stringify(downloadButton, null, 2));
        
        // Test API data directly
        console.log('\n🔍 Testing API data...');
        const apiData = await page.evaluate(async () => {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();
                return {
                    success: true,
                    totalUsers: data.totalUsers,
                    users: Object.keys(data.users || {}),
                    codyUser: data.users['Cody Cochran'] ? {
                        email: data.users['Cody Cochran'].profile?.email,
                        contractStatus: data.users['Cody Cochran'].contract?.contractStatus,
                        contractId: data.users['Cody Cochran'].contract?.contractId
                    } : null
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('\n📡 API Data:');
        console.log(JSON.stringify(apiData, null, 2));
        
        console.log('\n✅ Contract data test completed!');
        
    } catch (error) {
        console.error('❌ Contract data test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testContractData().catch(console.error); 