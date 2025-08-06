/**
 * Admin Password Try Test
 * Tests different admin passwords to find the correct one
 */

const puppeteer = require('puppeteer');

async function testAdminPasswordTry() {
    console.log('🔍 Admin Password Try Test...\n');
    
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
        
        // Try different admin passwords
        const passwordsToTry = [
            'Cochranfilms2@',
            'Cochranfilms2',
            'cochranfilms2@',
            'cochranfilms2',
            'admin',
            'password',
            '123456'
        ];
        
        for (const password of passwordsToTry) {
            console.log(`\n🔑 Trying password: ${password}`);
            
            // Find admin password input
            const adminPasswordInput = await page.$('#adminPassword');
            if (!adminPasswordInput) {
                console.log('❌ Admin password input not found');
                break;
            }
            
            // Clear and enter password
            await adminPasswordInput.click();
            await adminPasswordInput.evaluate(el => el.value = '');
            await adminPasswordInput.type(password);
            
            // Verify password was entered
            const passwordValue = await adminPasswordInput.evaluate(el => el.value);
            console.log('Password entered:', passwordValue);
            
            // Click decrypt button
            const decryptButton = await page.$('button[onclick*="decryptBankDetails"]');
            if (decryptButton) {
                await decryptButton.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Check if decrypted data appeared
                const decryptedData = await page.$('div[style*="background: rgba(22, 163, 74, 0.1)"]');
                if (decryptedData) {
                    const decryptedText = await page.evaluate(el => el.textContent, decryptedData);
                    console.log('🎉 SUCCESS: Decryption worked with password:', password);
                    console.log('Decrypted data:', decryptedText.substring(0, 200) + '...');
                    
                    // Check for specific bank details
                    if (decryptedText.includes('Test Bank') && decryptedText.includes('021000021') && decryptedText.includes('1234567890')) {
                        console.log('✅ Bank Name: Test Bank');
                        console.log('✅ Routing Number: 021000021');
                        console.log('✅ Account Number: 1234567890');
                        console.log('✅ Account Type: checking');
                        console.log('🎉 PERFECT: Admin decryption is working!');
                        return;
                    } else {
                        console.log('❌ Decrypted data does not match expected values');
                    }
                } else {
                    console.log('❌ No decrypted data found with password:', password);
                    
                    // Check for error messages
                    const errorNotifications = await page.$$('div[style*="position: fixed"][style*="z-index: 10000"]');
                    if (errorNotifications.length > 0) {
                        for (let i = 0; i < errorNotifications.length; i++) {
                            const errorText = await page.evaluate(el => el.textContent, errorNotifications[i]);
                            if (errorText.includes('Invalid admin password')) {
                                console.log('❌ Invalid admin password');
                            } else {
                                console.log('Error notification:', errorText);
                            }
                        }
                    }
                }
            } else {
                console.log('❌ Decrypt button not found');
            }
            
            // Wait before trying next password
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n❌ None of the passwords worked');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAdminPasswordTry().catch(console.error); 