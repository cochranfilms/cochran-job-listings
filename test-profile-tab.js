#!/usr/bin/env node

/**
 * Test Profile Tab Section
 * Tests the profile tab functionality, payment method button, and username display issues
 */

const puppeteer = require('puppeteer');

async function testProfileTab() {
    console.log('🔍 Testing Profile Tab Section...\n');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 }
    });

    try {
        const page = await browser.newPage();
        
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
        
        // Test the username display issue
        console.log('\n👤 Testing username display...');
        const usernameTest = await page.evaluate(() => {
            // Find all elements that might contain the username
            const userNameElements = document.querySelectorAll('*');
            const usernameTexts = [];
            
            userNameElements.forEach(element => {
                const text = element.textContent;
                if (text && (text.includes('Cody') || text.includes('Cochran') || text.includes('Welcome'))) {
                    usernameTexts.push({
                        element: element.tagName,
                        text: text.trim(),
                        className: element.className,
                        id: element.id
                    });
                }
            });
            
            return {
                usernameTexts: usernameTexts,
                userNameElement: document.getElementById('userName'),
                welcomeElement: document.querySelector('.welcome-text'),
                userInfoElement: document.querySelector('.user-info')
            };
        });
        
        console.log('👤 Username Display Test Result:');
        console.log(JSON.stringify(usernameTest, null, 2));
        
        // Click on profile tab
        console.log('\n👤 Clicking on profile tab...');
        const profileTabResult = await page.evaluate(() => {
            const profileLink = document.querySelector('a[onclick*="showSection(\'profile\')"]');
            if (!profileLink) {
                return { error: 'Profile tab not found' };
            }
            
            // Click the profile tab
            profileLink.click();
            
            return {
                tabFound: true,
                tabText: profileLink.textContent.trim(),
                tabOnclick: profileLink.getAttribute('onclick')
            };
        });
        
        console.log('👤 Profile Tab Test Result:');
        console.log(JSON.stringify(profileTabResult, null, 2));
        
        // Wait for profile content to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test the profile content
        console.log('\n👤 Testing profile content...');
        const profileContentTest = await page.evaluate(() => {
            const profileSection = document.getElementById('profile-section');
            if (!profileSection) {
                return { error: 'Profile section container not found' };
            }
            
            // Check for payment method button
            const paymentButtons = profileSection.querySelectorAll('button');
            const paymentButton = Array.from(paymentButtons).find(btn => 
                btn.textContent.includes('Payment') || btn.textContent.includes('payment')
            );
            
            // Check for user info display
            const userInfoElements = profileSection.querySelectorAll('*');
            const userInfoTexts = [];
            
            userInfoElements.forEach(element => {
                const text = element.textContent;
                if (text && text.trim()) {
                    userInfoTexts.push({
                        element: element.tagName,
                        text: text.trim(),
                        className: element.className
                    });
                }
            });
            
            return {
                profileSectionFound: true,
                profileSectionHTML: profileSection.innerHTML.substring(0, 1000),
                paymentButton: paymentButton ? {
                    text: paymentButton.textContent.trim(),
                    onclick: paymentButton.getAttribute('onclick'),
                    className: paymentButton.className
                } : null,
                userInfoTexts: userInfoTexts.slice(0, 10) // First 10 elements
            };
        });
        
        console.log('👤 Profile Content Test Result:');
        console.log(JSON.stringify(profileContentTest, null, 2));
        
        // Test the Set Payment Method button functionality
        console.log('\n💳 Testing Set Payment Method button...');
        const paymentButtonTest = await page.evaluate(() => {
            const profileSection = document.getElementById('profile-section');
            if (!profileSection) {
                return { error: 'Profile section not found' };
            }
            
            // Find the payment method button
            const paymentButton = Array.from(profileSection.querySelectorAll('button')).find(btn => 
                btn.textContent.includes('Payment') || btn.textContent.includes('payment')
            );
            
            if (!paymentButton) {
                return { error: 'Payment method button not found' };
            }
            
            // Check if the button has an onclick handler
            const onclick = paymentButton.getAttribute('onclick');
            
            // Try to click the button and see what happens
            try {
                paymentButton.click();
            } catch (error) {
                console.log('❌ Error clicking payment button:', error);
            }
            
            return {
                buttonFound: true,
                buttonText: paymentButton.textContent.trim(),
                buttonOnclick: onclick,
                buttonClassName: paymentButton.className,
                buttonDisabled: paymentButton.disabled
            };
        });
        
        console.log('💳 Payment Button Test Result:');
        console.log(JSON.stringify(paymentButtonTest, null, 2));
        
        // Wait a moment and check for any modals or popups
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('\n🔍 Checking for payment modal or popup...');
        const modalTest = await page.evaluate(() => {
            const modals = document.querySelectorAll('div[style*="position: fixed"]');
            const popups = document.querySelectorAll('.modal, .popup, [class*="modal"], [class*="popup"]');
            
            return {
                modals: modals.length,
                popups: popups.length,
                modalTexts: Array.from(modals).map(modal => modal.textContent.trim().substring(0, 200))
            };
        });
        
        console.log('🔍 Modal/Popup Test Result:');
        console.log(JSON.stringify(modalTest, null, 2));
        
        // Test the current user data structure
        console.log('\n👤 Testing current user data structure...');
        const userDataTest = await page.evaluate(() => {
            if (typeof currentUser === 'undefined' || !currentUser) {
                return { error: 'currentUser not defined or null' };
            }
            
            return {
                currentUser: {
                    name: currentUser.name,
                    email: currentUser.email,
                    paymentMethod: currentUser.paymentMethod,
                    paymentStatus: currentUser.paymentStatus,
                    profile: currentUser.profile,
                    jobs: currentUser.jobs ? Object.keys(currentUser.jobs) : null
                },
                userNameElement: document.getElementById('userName')?.textContent,
                welcomeText: document.querySelector('.welcome-text')?.textContent
            };
        });
        
        console.log('👤 User Data Test Result:');
        console.log(JSON.stringify(userDataTest, null, 2));
        
        console.log('\n✅ Profile tab test completed!');
        
    } catch (error) {
        console.error('❌ Profile tab test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testProfileTab().catch(console.error); 