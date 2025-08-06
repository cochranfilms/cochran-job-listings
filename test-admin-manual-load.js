/**
 * Admin Manual Load Test
 * Manually loads user data and tests bank decryption
 */

const puppeteer = require('puppeteer');

async function testAdminManualLoad() {
    console.log('🔍 Admin Manual Load Test...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // Go to admin dashboard
        console.log('🏢 Going to admin dashboard...');
        await page.goto('http://collaborate.cochranfilms.com/admin-dashboard');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Manually load user data
        console.log('📋 Manually loading user data...');
        const loadResult = await page.evaluate(async () => {
            try {
                // Check if loadUsers function exists
                if (typeof loadUsers === 'undefined') {
                    return { success: false, error: 'loadUsers function not found' };
                }
                
                // Call loadUsers function
                await loadUsers();
                
                // Check if users data is now available
                if (typeof users !== 'undefined' && users['Cody Cochran']) {
                    const userData = users['Cody Cochran'];
                    return {
                        success: true,
                        hasBankData: !!userData.bankData,
                        bankName: userData.bankData ? userData.bankData.bankName : null,
                        lastFour: userData.bankData ? userData.bankData.lastFour : null,
                        hasEncryptionKey: userData.bankData ? !!userData.bankData.encryptionKey : false
                    };
                } else {
                    return { success: false, error: 'User data still not available after loadUsers' };
                }
                
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('Load Result:', loadResult);
        
        if (loadResult.success && loadResult.hasBankData) {
            console.log('✅ User data loaded successfully with bank information!');
            
            // Test bank details function
            console.log('🏦 Testing bank details function...');
            const bankDetailsResult = await page.evaluate(() => {
                try {
                    if (typeof showUserBankDetails === 'function') {
                        showUserBankDetails('Cody Cochran');
                        return '✅ showUserBankDetails function called';
                    } else {
                        return '❌ showUserBankDetails function not found';
                    }
                } catch (error) {
                    return '❌ Error calling showUserBankDetails: ' + error.message;
                }
            });
            
            console.log('Bank Details Result:', bankDetailsResult);
            
            // Wait for modal to appear
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if modal appeared
            const modal = await page.$('div[style*="position: fixed"][style*="z-index: 1000"]');
            if (modal) {
                const modalText = await page.evaluate(el => el.textContent, modal);
                console.log('✅ Modal appeared!');
                console.log('Modal content preview:', modalText.substring(0, 200) + '...');
                
                if (modalText.includes('Secure Bank Details')) {
                    console.log('✅ Shows bank details modal!');
                    
                    // Look for password input
                    const passwordInput = await page.$('input[type="password"]');
                    if (passwordInput) {
                        console.log('✅ Password input found');
                        
                        // Enter admin password
                        console.log('🔑 Entering admin password...');
                        await page.type('input[type="password"]', 'Cochranfilms2@');
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Click decrypt button
                        console.log('🔐 Clicking decrypt button...');
                        const decryptButton = await page.$('button[onclick*="decryptBankDetails"]');
                        if (decryptButton) {
                            await decryptButton.click();
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
                        console.log('❌ Password input not found');
                    }
                } else {
                    console.log('❌ Modal does not show bank details');
                }
            } else {
                console.log('❌ No modal appeared');
            }
            
        } else {
            console.log('❌ User data not loaded or no bank data found');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAdminManualLoad().catch(console.error); 