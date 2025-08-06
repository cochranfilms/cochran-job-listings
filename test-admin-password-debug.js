/**
 * Admin Password Debug Test
 * Tests password input and decryption process
 */

const puppeteer = require('puppeteer');

async function testAdminPasswordDebug() {
    console.log('🔍 Admin Password Debug Test...\n');
    
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
        
        // Manually load user data
        console.log('📋 Manually loading user data...');
        await page.evaluate(async () => {
            if (typeof loadUsers !== 'undefined') {
                await loadUsers();
            }
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test bank details function
        console.log('🏦 Testing bank details function...');
        await page.evaluate(() => {
            if (typeof showUserBankDetails === 'function') {
                showUserBankDetails('Cody Cochran');
            }
        });
        
        // Wait for modal to appear
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for password input fields
        console.log('🔍 Checking password input fields...');
        const passwordInputs = await page.$$('input[type="password"]');
        console.log('Found password inputs:', passwordInputs.length);
        
        if (passwordInputs.length > 0) {
            // Get details of each password input
            for (let i = 0; i < passwordInputs.length; i++) {
                const inputDetails = await page.evaluate(el => ({
                    id: el.id,
                    name: el.name,
                    placeholder: el.placeholder,
                    value: el.value,
                    visible: el.offsetParent !== null
                }), passwordInputs[i]);
                
                console.log(`Password input ${i + 1}:`, inputDetails);
            }
            
            // Try to enter password in the adminPassword field specifically
            const adminPasswordInput = await page.$('#adminPassword');
            console.log('Admin password input found:', !!adminPasswordInput);
            
            if (adminPasswordInput) {
                console.log('🔑 Entering admin password...');
                
                // Clear the input first
                await adminPasswordInput.click();
                await adminPasswordInput.evaluate(el => el.value = '');
                
                // Type the password
                await adminPasswordInput.type('Cochranfilms2@');
                
                // Verify the password was entered
                const passwordValue = await adminPasswordInput.evaluate(el => el.value);
                console.log('Password value after typing:', passwordValue);
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Look for decrypt button
                console.log('🔐 Looking for decrypt button...');
                const decryptButtons = await page.$$('button[onclick*="decryptBankDetails"]');
                console.log('Found decrypt buttons:', decryptButtons.length);
                
                if (decryptButtons.length > 0) {
                    console.log('🔐 Clicking decrypt button...');
                    await decryptButtons[0].click();
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    // Check if decrypted data appeared
                    const decryptedData = await page.$('div[style*="background: rgba(22, 163, 74, 0.1)"]');
                    if (decryptedData) {
                        const decryptedText = await page.evaluate(el => el.textContent, decryptedData);
                        console.log('✅ Decrypted bank data displayed!');
                        console.log('Decrypted data:', decryptedText.substring(0, 200) + '...');
                        
                        // Check for specific bank details
                        if (decryptedText.includes('Test Bank') && decryptedText.includes('021000021') && decryptedText.includes('1234567890')) {
                            console.log('🎉 SUCCESS: Admin decryption is working perfectly!');
                            console.log('✅ Bank Name: Test Bank');
                            console.log('✅ Routing Number: 021000021');
                            console.log('✅ Account Number: 1234567890');
                            console.log('✅ Account Type: checking');
                        } else {
                            console.log('❌ Decrypted data does not match expected values');
                        }
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
                console.log('❌ Admin password input not found');
            }
        } else {
            console.log('❌ No password inputs found');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAdminPasswordDebug().catch(console.error); 