#!/usr/bin/env node

/**
 * Test Login Success
 * Tests if login actually works and shows the user portal
 */

const puppeteer = require('puppeteer');

async function testLoginSuccess() {
    console.log('🔍 Testing Login Success...\n');
    
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
        
        // Check if we're on the login page
        const isLoginPage = await page.evaluate(() => {
            const emailInput = document.querySelector('input[type="email"]');
            const passwordInput = document.querySelector('input[type="password"]');
            return !!(emailInput && passwordInput);
        });
        
        console.log(`🔍 Is login page: ${isLoginPage}`);
        
        if (!isLoginPage) {
            console.log('❌ Not on login page - user might already be logged in');
            return;
        }
        
        // Fill in credentials
        console.log('\n🔑 Filling in credentials...');
        await page.type('input[type="email"]', 'codylcochran89@gmail.com');
        await page.type('input[type="password"]', 'youtube');
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Submit the form
        console.log('\n🔑 Submitting login form...');
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
        
        // Check if login was successful
        const loginResult = await page.evaluate(() => {
            const userNameElement = document.getElementById('userName');
            const userPortal = document.getElementById('userPortal');
            const loginScreen = document.getElementById('loginScreen');
            
            return {
                userName: userNameElement ? userNameElement.textContent : null,
                userPortalVisible: userPortal && userPortal.style.display !== 'none',
                loginScreenHidden: loginScreen && loginScreen.style.display === 'none',
                isLoggedIn: userNameElement && userNameElement.textContent !== 'User' && userNameElement.textContent !== 'null'
            };
        });
        
        console.log('\n📊 Login result:');
        console.log(`   - User name: "${loginResult.userName}"`);
        console.log(`   - User portal visible: ${loginResult.userPortalVisible ? '✅' : '❌'}`);
        console.log(`   - Login screen hidden: ${loginResult.loginScreenHidden ? '✅' : '❌'}`);
        console.log(`   - Is logged in: ${loginResult.isLoggedIn ? '✅' : '❌'}`);
        
        if (loginResult.isLoggedIn) {
            console.log('🎉 SUCCESS: Login is working correctly!');
        } else {
            console.log('❌ Login failed - user name not updated');
        }
        
        console.log('\n✅ Login success test completed!');
        
    } catch (error) {
        console.error('❌ Login success test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testLoginSuccess().catch(console.error); 