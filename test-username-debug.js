#!/usr/bin/env node

/**
 * Test Username Display Debug
 * Debugs the username display issue to find what's causing the scrambled text
 */

const puppeteer = require('puppeteer');

async function testUsernameDebug() {
    console.log('🔍 Testing Username Display Debug...\n');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 }
    });

    try {
        const page = await browser.newPage();
        
        // Listen for console messages
        page.on('console', msg => {
            console.log('📱 Browser:', msg.type(), ':', msg.text());
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
        
        // Debug the username element step by step
        console.log('\n🔍 Debugging username element...');
        const usernameDebug = await page.evaluate(() => {
            const userNameElement = document.getElementById('userName');
            const h1Element = document.querySelector('h1');
            
            return {
                userNameElement: {
                    exists: !!userNameElement,
                    textContent: userNameElement?.textContent,
                    innerHTML: userNameElement?.innerHTML,
                    outerHTML: userNameElement?.outerHTML
                },
                h1Element: {
                    exists: !!h1Element,
                    textContent: h1Element?.textContent,
                    innerHTML: h1Element?.innerHTML,
                    outerHTML: h1Element?.outerHTML
                },
                currentUser: typeof currentUser !== 'undefined' ? {
                    name: currentUser.name,
                    email: currentUser.email
                } : null
            };
        });
        
        console.log('🔍 Username Debug Result:');
        console.log(JSON.stringify(usernameDebug, null, 2));
        
        // Test the loadUserData function directly
        console.log('\n🔍 Testing loadUserData function...');
        const loadUserDataTest = await page.evaluate(() => {
            if (typeof loadUserData === 'undefined') {
                return { error: 'loadUserData function not found' };
            }
            
            // Call loadUserData and see what happens
            try {
                loadUserData();
                return { success: 'loadUserData called successfully' };
            } catch (error) {
                return { error: error.message };
            }
        });
        
        console.log('🔍 LoadUserData Test Result:');
        console.log(JSON.stringify(loadUserDataTest, null, 2));
        
        // Wait a moment and check the username again
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('\n🔍 Checking username after loadUserData...');
        const usernameAfterTest = await page.evaluate(() => {
            const userNameElement = document.getElementById('userName');
            const h1Element = document.querySelector('h1');
            
            return {
                userNameElement: {
                    textContent: userNameElement?.textContent,
                    innerHTML: userNameElement?.innerHTML
                },
                h1Element: {
                    textContent: h1Element?.textContent,
                    innerHTML: h1Element?.innerHTML
                }
            };
        });
        
        console.log('🔍 Username After Test Result:');
        console.log(JSON.stringify(usernameAfterTest, null, 2));
        
        // Test the profile section
        console.log('\n👤 Testing profile section...');
        const profileSectionTest = await page.evaluate(() => {
            const profileSection = document.getElementById('profile-section');
            const profileInfo = document.getElementById('userInfo');
            const paymentMethodSection = document.getElementById('paymentMethodSection');
            
            return {
                profileSection: {
                    exists: !!profileSection,
                    className: profileSection?.className,
                    innerHTML: profileSection?.innerHTML.substring(0, 500)
                },
                profileInfo: {
                    exists: !!profileInfo,
                    textContent: profileInfo?.textContent,
                    innerHTML: profileInfo?.innerHTML.substring(0, 500)
                },
                paymentMethodSection: {
                    exists: !!paymentMethodSection,
                    textContent: paymentMethodSection?.textContent,
                    innerHTML: paymentMethodSection?.innerHTML.substring(0, 500)
                }
            };
        });
        
        console.log('👤 Profile Section Test Result:');
        console.log(JSON.stringify(profileSectionTest, null, 2));
        
        console.log('\n✅ Username debug test completed!');
        
    } catch (error) {
        console.error('❌ Username debug test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testUsernameDebug().catch(console.error); 