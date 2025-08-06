/**
 * Admin Password Check Test
 * Checks what the correct admin password should be
 */

const puppeteer = require('puppeteer');

async function testAdminPasswordCheck() {
    console.log('🔍 Admin Password Check Test...\n');
    
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
        
        // Check if we need to login
        console.log('🔍 Checking if admin login is required...');
        const loginForm = await page.$('#loginForm');
        if (loginForm) {
            console.log('✅ Login form found');
            
            // Try to login with the known admin credentials
            console.log('🔐 Trying admin login...');
            await page.type('#username', 'info@cochranfilms.com');
            await page.type('#password', 'Cochranfilms2@');
            await page.click('button[type="submit"]');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check if login was successful
            const loginStatus = await page.evaluate(() => {
                const loginScreen = document.getElementById('loginScreen');
                const adminInterface = document.getElementById('adminInterface');
                
                return {
                    loginScreenHidden: loginScreen ? loginScreen.style.display === 'none' : false,
                    adminInterfaceVisible: adminInterface ? adminInterface.style.display === 'block' : false,
                    isAuthenticated: sessionStorage.getItem('adminDashboardAuthenticated') === 'true'
                };
            });
            
            console.log('Login Status:', loginStatus);
            
            if (loginStatus.isAuthenticated) {
                console.log('✅ Admin login successful!');
            } else {
                console.log('❌ Admin login failed');
            }
        } else {
            console.log('✅ Already logged in or no login required');
        }
        
        // Now test the bank decryption with the same password
        console.log('\n🏦 Testing bank decryption with admin password...');
        
        // Manually load user data
        await page.evaluate(async () => {
            if (typeof loadUsers !== 'undefined') {
                await loadUsers();
            }
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test bank details function
        await page.evaluate(() => {
            if (typeof showUserBankDetails === 'function') {
                showUserBankDetails('Cody Cochran');
            }
        });
        
        // Wait for modal to appear
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Enter the same admin password
        console.log('🔑 Entering admin password for decryption...');
        const passwordInput = await page.$('#adminPassword');
        if (passwordInput) {
            await passwordInput.click();
            await passwordInput.evaluate(el => el.value = '');
            await passwordInput.type('Cochranfilms2@');
            
            // Verify password was entered
            const passwordValue = await passwordInput.evaluate(el => el.value);
            console.log('Password entered:', passwordValue);
            
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
testAdminPasswordCheck().catch(console.error); 