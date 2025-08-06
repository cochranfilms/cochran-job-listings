/**
 * Password Debug Test
 * Debugs the exact password comparison issue
 */

const puppeteer = require('puppeteer');

async function testPasswordDebug() {
    console.log('🔍 Password Debug Test...\n');
    
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
        
        // Debug the password comparison
        console.log('🔍 Debugging password comparison...');
        const debugResult = await page.evaluate(() => {
            const adminPassword = 'Cochranfilms2@';
            const expectedPassword = 'Cochranfilms2@';
            
            return {
                adminPassword: adminPassword,
                expectedPassword: expectedPassword,
                lengthMatch: adminPassword.length === expectedPassword.length,
                exactMatch: adminPassword === expectedPassword,
                charCodes: {
                    admin: Array.from(adminPassword).map(c => c.charCodeAt(0)),
                    expected: Array.from(expectedPassword).map(c => c.charCodeAt(0))
                },
                trimmedMatch: adminPassword.trim() === expectedPassword.trim(),
                toLowerCaseMatch: adminPassword.toLowerCase() === expectedPassword.toLowerCase()
            };
        });
        
        console.log('Password Debug Result:', debugResult);
        
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
            console.log('Password length:', actualPassword.length);
            console.log('Password char codes:', Array.from(actualPassword).map(c => c.charCodeAt(0)));
            
            // Test the comparison directly
            const comparisonTest = await page.evaluate((actualPassword) => {
                const expectedPassword = 'Cochranfilms2@';
                return {
                    actualPassword: actualPassword,
                    expectedPassword: expectedPassword,
                    exactMatch: actualPassword === expectedPassword,
                    lengthMatch: actualPassword.length === expectedPassword.length,
                    charCodes: {
                        actual: Array.from(actualPassword).map(c => c.charCodeAt(0)),
                        expected: Array.from(expectedPassword).map(c => c.charCodeAt(0))
                    }
                };
            }, actualPassword);
            
            console.log('Comparison Test:', comparisonTest);
            
            // Click decrypt button
            console.log('🔐 Clicking decrypt button...');
            const decryptButton = await page.$('button[onclick*="decryptBankDetails"]');
            if (decryptButton) {
                await decryptButton.click();
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Check for error messages
                const errorNotifications = await page.$$('div[style*="position: fixed"][style*="z-index: 10000"]');
                if (errorNotifications.length > 0) {
                    for (let i = 0; i < errorNotifications.length; i++) {
                        const errorText = await page.evaluate(el => el.textContent, errorNotifications[i]);
                        console.log('Error notification:', errorText);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testPasswordDebug().catch(console.error); 