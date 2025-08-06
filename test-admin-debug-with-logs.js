/**
 * Admin Debug With Logs Test
 * Tests admin decryption with detailed password debug logs
 */

const puppeteer = require('puppeteer');

async function testAdminDebugWithLogs() {
    console.log('🔍 Admin Debug With Logs Test...\n');
    
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
        
        // Go to admin dashboard
        console.log('🏢 Going to admin dashboard...');
        await page.goto('http://collaborate.cochranfilms.com/admin-dashboard');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Login to admin dashboard
        console.log('🔐 Logging in to admin dashboard...');
        await page.type('#username', 'info@cochranfilms.com');
        await page.type('#password', 'Cochranfilms2@');
        await page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Load user data
        await page.evaluate(async () => {
            if (typeof loadUsers !== 'undefined') {
                await loadUsers();
            }
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show bank details
        await page.evaluate(() => {
            if (typeof showUserBankDetails === 'function') {
                showUserBankDetails('Cody Cochran');
            }
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Enter password and test
        console.log('🔑 Entering admin password...');
        const passwordInput = await page.$('#adminPassword');
        if (passwordInput) {
            await passwordInput.click();
            await passwordInput.evaluate(el => el.value = '');
            await passwordInput.type('Cochranfilms2@');
            
            // Get the actual value that was entered
            const actualPassword = await passwordInput.evaluate(el => el.value);
            console.log('Actual password entered:', actualPassword);
            
            // Click decrypt button
            console.log('🔐 Clicking decrypt button...');
            const decryptButton = await page.$('button[onclick*="decryptBankDetails"]');
            if (decryptButton) {
                await decryptButton.click();
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                // Check if decrypted data appeared
                const decryptedData = await page.$('div[style*="background: rgba(22, 163, 74, 0.1)"]');
                if (decryptedData) {
                    const decryptedText = await page.evaluate(el => el.textContent, decryptedData);
                    console.log('🎉 SUCCESS: Decryption worked!');
                    console.log('Decrypted data:', decryptedText.substring(0, 200) + '...');
                } else {
                    console.log('❌ No decrypted data found');
                    
                    // Check for error messages
                    const errorNotifications = await page.$$('div[style*="position: fixed"][style*="z-index: 10000"]');
                    if (errorNotifications.length > 0) {
                        for (let i = 0; i < errorNotifications.length; i++) {
                            const errorText = await page.evaluate(el => el.textContent, errorNotifications[i]);
                            console.log('Error notification:', errorText);
                        }
                    }
                }
            } else {
                console.log('❌ Decrypt button not found');
            }
        } else {
            console.log('❌ Password input not found');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAdminDebugWithLogs().catch(console.error); 