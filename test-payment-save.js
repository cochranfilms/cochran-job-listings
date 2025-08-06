#!/usr/bin/env node

/**
 * Test Payment Method Save
 * Tests the complete payment method flow to see why it's not saving to users.json
 */

const puppeteer = require('puppeteer');

async function testPaymentSave() {
    console.log('🔍 Testing Payment Method Save...\n');
    
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
        
        // Check initial payment method status
        console.log('\n💳 Checking initial payment method status...');
        const initialStatus = await page.evaluate(() => {
            if (typeof currentUser === 'undefined' || !currentUser) {
                return { error: 'currentUser not defined or null' };
            }
            
            return {
                currentUser: {
                    name: currentUser.name,
                    email: currentUser.email,
                    paymentMethod: currentUser.paymentMethod,
                    paymentStatus: currentUser.paymentStatus
                }
            };
        });
        
        console.log('💳 Initial Payment Status:');
        console.log(JSON.stringify(initialStatus, null, 2));
        
        // Click on profile tab
        console.log('\n👤 Clicking on profile tab...');
        await page.evaluate(() => {
            const profileLink = document.querySelector('a[onclick*="showSection(\'profile\')"]');
            if (profileLink) {
                profileLink.click();
            }
        });
        
        // Wait for profile content to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Click the Set Payment Method button
        console.log('\n💳 Clicking Set Payment Method button...');
        const buttonClickResult = await page.evaluate(() => {
            const profileSection = document.getElementById('profile-section');
            if (!profileSection) {
                return { error: 'Profile section not found' };
            }
            
            const paymentButton = Array.from(profileSection.querySelectorAll('button')).find(btn => 
                btn.textContent.includes('Payment') || btn.textContent.includes('payment')
            );
            
            if (!paymentButton) {
                return { error: 'Payment method button not found' };
            }
            
            // Click the button
            paymentButton.click();
            
            return {
                buttonFound: true,
                buttonText: paymentButton.textContent.trim(),
                buttonOnclick: paymentButton.getAttribute('onclick')
            };
        });
        
        console.log('💳 Button Click Result:');
        console.log(JSON.stringify(buttonClickResult, null, 2));
        
        // Wait for modal to appear
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if modal appeared
        console.log('\n🔍 Checking if payment modal appeared...');
        const modalCheck = await page.evaluate(() => {
            const modals = document.querySelectorAll('div[style*="position: fixed"]');
            const paymentModal = Array.from(modals).find(modal => 
                modal.textContent.includes('Set Payment Method') || 
                modal.textContent.includes('PayPal') ||
                modal.textContent.includes('Bank Transfer')
            );
            
            return {
                modalsFound: modals.length,
                paymentModalFound: !!paymentModal,
                modalText: paymentModal ? paymentModal.textContent.substring(0, 200) : 'Not found'
            };
        });
        
        console.log('🔍 Modal Check Result:');
        console.log(JSON.stringify(modalCheck, null, 2));
        
        // Click on PayPal option
        console.log('\n💳 Clicking PayPal option...');
        const paypalClickResult = await page.evaluate(() => {
            const paypalButton = Array.from(document.querySelectorAll('button')).find(btn => 
                btn.textContent.includes('PayPal')
            );
            
            if (!paypalButton) {
                return { error: 'PayPal button not found' };
            }
            
            // Click the PayPal button
            paypalButton.click();
            
            return {
                paypalButtonFound: true,
                paypalButtonText: paypalButton.textContent.trim(),
                paypalButtonOnclick: paypalButton.getAttribute('onclick')
            };
        });
        
        console.log('💳 PayPal Click Result:');
        console.log(JSON.stringify(paypalClickResult, null, 2));
        
        // Wait for modal to close and check if payment method was updated
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if payment method was updated locally
        console.log('\n💳 Checking if payment method was updated locally...');
        const localUpdateCheck = await page.evaluate(() => {
            if (typeof currentUser === 'undefined' || !currentUser) {
                return { error: 'currentUser not defined or null' };
            }
            
            return {
                currentUser: {
                    name: currentUser.name,
                    email: currentUser.email,
                    paymentMethod: currentUser.paymentMethod,
                    paymentStatus: currentUser.paymentStatus
                },
                setPaymentMethodExists: typeof setPaymentMethod === 'function'
            };
        });
        
        console.log('💳 Local Update Check:');
        console.log(JSON.stringify(localUpdateCheck, null, 2));
        
        // Test the setPaymentMethod function directly
        console.log('\n💳 Testing setPaymentMethod function directly...');
        const directFunctionTest = await page.evaluate(() => {
            if (typeof setPaymentMethod === 'undefined') {
                return { error: 'setPaymentMethod function not found' };
            }
            
            // Test the function
            try {
                setPaymentMethod('paypal');
                return { success: 'setPaymentMethod called successfully' };
            } catch (error) {
                return { error: error.message };
            }
        });
        
        console.log('💳 Direct Function Test:');
        console.log(JSON.stringify(directFunctionTest, null, 2));
        
        // Wait a moment and check the payment display
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check the payment display in the UI
        console.log('\n💳 Checking payment display in UI...');
        const uiPaymentCheck = await page.evaluate(() => {
            const profileSection = document.getElementById('profile-section');
            if (!profileSection) {
                return { error: 'Profile section not found' };
            }
            
            const paymentText = profileSection.textContent;
            const paymentMethodSection = profileSection.querySelector('#paymentMethodSection');
            
            return {
                paymentText: paymentText.includes('Payment') ? paymentText.substring(0, 500) : 'No payment text found',
                paymentMethodSection: paymentMethodSection ? paymentMethodSection.innerHTML.substring(0, 300) : 'Not found'
            };
        });
        
        console.log('💳 UI Payment Check:');
        console.log(JSON.stringify(uiPaymentCheck, null, 2));
        
        // Test if there's a function to save to backend
        console.log('\n💳 Checking for backend save functions...');
        const backendCheck = await page.evaluate(() => {
            const functions = [
                'saveUserData',
                'updateUserData',
                'savePaymentMethod',
                'updatePaymentMethod',
                'saveToBackend',
                'updateUsersJson'
            ];
            
            const existingFunctions = {};
            functions.forEach(funcName => {
                existingFunctions[funcName] = typeof window[funcName] === 'function';
            });
            
            return {
                existingFunctions: existingFunctions,
                currentUserPaymentMethod: currentUser ? currentUser.paymentMethod : null
            };
        });
        
        console.log('💳 Backend Check:');
        console.log(JSON.stringify(backendCheck, null, 2));
        
        console.log('\n✅ Payment save test completed!');
        
    } catch (error) {
        console.error('❌ Payment save test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testPaymentSave().catch(console.error); 