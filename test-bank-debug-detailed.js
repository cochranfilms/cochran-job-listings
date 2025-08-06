/**
 * Detailed Bank Debug Test
 * Tests the bank data save process with detailed logging
 */

const puppeteer = require('puppeteer');

async function testBankDebugDetailed() {
    console.log('🔍 Detailed Bank Debug Test...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            console.log('📱 Browser Console:', msg.text());
        });
        
        // Go to user portal
        console.log('🏠 Going to user portal...');
        await page.goto('http://collaborate.cochranfilms.com/user-portal');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Login
        console.log('🔐 Logging in...');
        await page.type('#email', 'codylcochran89@gmail.com');
        await page.type('#password', 'youtube');
        await page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check current user data before test
        console.log('📋 Checking current user data...');
        const currentUserBefore = await page.evaluate(() => {
            if (typeof currentUser !== 'undefined') {
                return {
                    email: currentUser.email,
                    paymentMethod: currentUser.paymentMethod,
                    paymentStatus: currentUser.paymentStatus,
                    hasBankData: !!currentUser.bankData
                };
            }
            return null;
        });
        console.log('Current user before test:', currentUserBefore);
        
        // Open payment modal
        console.log('💳 Opening payment modal...');
        await page.evaluate(() => {
            if (typeof showPaymentModal === 'function') {
                showPaymentModal();
            }
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Click Bank Transfer
        console.log('🏦 Clicking Bank Transfer...');
        const bankButton = await page.$('button[onclick*="setPaymentMethod(\'bank\')"]');
        if (bankButton) {
            await bankButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Fill out bank form
            console.log('📝 Filling out bank form...');
            await page.type('#bankName', 'Test Bank');
            await page.type('#routingNumber', '021000021');
            await page.type('#accountNumber', '1234567890');
            await page.select('#accountType', 'checking');
            
            // Submit form
            console.log('💾 Submitting bank form...');
            const submitButton = await page.$('#bankDetailsForm button[type="submit"]');
            if (submitButton) {
                await submitButton.click();
                console.log('✅ Submit button clicked');
                
                // Wait and monitor for any errors
                await new Promise(resolve => setTimeout(resolve, 8000));
                
                // Check current user data after submission
                console.log('📋 Checking user data after submission...');
                const currentUserAfter = await page.evaluate(() => {
                    if (typeof currentUser !== 'undefined') {
                        return {
                            email: currentUser.email,
                            paymentMethod: currentUser.paymentMethod,
                            paymentStatus: currentUser.paymentStatus,
                            hasBankData: !!currentUser.bankData,
                            bankData: currentUser.bankData
                        };
                    }
                    return null;
                });
                console.log('Current user after submission:', currentUserAfter);
                
                // Check if any errors occurred
                const errors = await page.evaluate(() => {
                    return window.lastError || 'No errors captured';
                });
                console.log('Errors during submission:', errors);
                
                // Check users.json directly
                console.log('📄 Checking users.json...');
                await page.goto('http://collaborate.cochranfilms.com/users.json');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const usersData = await page.evaluate(() => {
                    const pre = document.querySelector('pre');
                    return pre ? JSON.parse(pre.textContent) : null;
                });
                
                if (usersData && usersData.users && usersData.users['Cody Cochran']) {
                    const userData = usersData.users['Cody Cochran'];
                    console.log('✅ Found user data in users.json');
                    console.log('   Payment Method:', userData.paymentMethod);
                    console.log('   Payment Status:', userData.paymentStatus);
                    console.log('   Has Bank Data:', !!userData.bankData);
                    
                    if (userData.bankData) {
                        console.log('✅ Bank data was saved to users.json!');
                        console.log('   Bank Name:', userData.bankData.bankName);
                        console.log('   Account Type:', userData.bankData.accountType);
                        console.log('   Last Four:', userData.bankData.lastFour);
                        console.log('   Has Encrypted Data:', !!userData.bankData.encrypted);
                        console.log('   Saved At:', userData.bankData.savedAt);
                    } else {
                        console.log('❌ No bank data in users.json');
                    }
                } else {
                    console.log('❌ Could not load users.json or find user data');
                }
                
            } else {
                console.log('❌ Submit button not found');
            }
        } else {
            console.log('❌ Bank Transfer button not found');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testBankDebugDetailed().catch(console.error); 