/**
 * Bank Storage Debug Test Script
 * Tests the complete flow from user input to admin dashboard display
 */

const puppeteer = require('puppeteer');

async function testBankStorageFlow() {
    console.log('🔍 Starting Bank Storage Debug Test...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // Test 1: Check current user data
        console.log('📋 Test 1: Checking current user data in users.json...');
        await checkCurrentUserData(page);
        
        // Test 2: Simulate user entering bank information
        console.log('\n🏦 Test 2: Simulating user entering bank information...');
        await simulateBankDataEntry(page);
        
        // Test 3: Verify data was saved to users.json
        console.log('\n💾 Test 3: Verifying data was saved to users.json...');
        await verifyDataSaved(page);
        
        // Test 4: Test admin dashboard access
        console.log('\n👨‍💼 Test 4: Testing admin dashboard bank details access...');
        await testAdminDashboardAccess(page);
        
        // Test 5: Debug encryption/decryption
        console.log('\n🔐 Test 5: Testing encryption/decryption process...');
        await testEncryptionDecryption(page);
        
        console.log('\n✅ Bank Storage Debug Test Complete!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

async function checkCurrentUserData(page) {
    try {
        // Load users.json directly
        await page.goto('http://collaborate.cochranfilms.com/users.json');
        
        const usersData = await page.evaluate(() => {
            const pre = document.querySelector('pre');
            return pre ? JSON.parse(pre.textContent) : null;
        });
        
        if (usersData && usersData.users && usersData.users['Cody Cochran']) {
            const userData = usersData.users['Cody Cochran'];
            console.log('✅ Found user data for Cody Cochran');
            console.log('   Payment Method:', userData.paymentMethod);
            console.log('   Payment Status:', userData.paymentStatus);
            console.log('   Has Bank Data:', !!userData.bankData);
            
            if (userData.bankData) {
                console.log('   Bank Data Structure:', {
                    hasEncrypted: !!userData.bankData.encrypted,
                    lastFour: userData.bankData.lastFour,
                    bankName: userData.bankData.bankName,
                    accountType: userData.bankData.accountType
                });
            } else {
                console.log('   ❌ No bankData object found');
            }
        } else {
            console.log('❌ Could not load users.json or find Cody Cochran data');
        }
    } catch (error) {
        console.error('❌ Error checking user data:', error.message);
    }
}

async function simulateBankDataEntry(page) {
    try {
        // Go to user portal
        await page.goto('http://collaborate.cochranfilms.com/user-portal');
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Login
        console.log('   🔐 Logging in to user portal...');
        await page.type('#email', 'codylcochran89@gmail.com');
        await page.type('#password', 'youtube');
        await page.click('button[type="submit"]');
        
        // Wait for login
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if login was successful
        const welcomeElement = await page.$('#welcomeMessage');
        if (welcomeElement) {
            console.log('   ✅ Login successful');
        } else {
            console.log('   ❌ Login may have failed, continuing anyway...');
        }
        
        // Navigate to profile tab
        console.log('   👤 Navigating to profile tab...');
        await page.click('button[onclick*="switchPortalTab(\'profile\')"]');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Click Set Payment Method
        console.log('   💳 Clicking Set Payment Method...');
        const paymentButton = await page.$('button[onclick*="showPaymentModal"]');
        if (paymentButton) {
            await paymentButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
            console.log('   ❌ Could not find Set Payment Method button');
            return;
        }
        
        // Select Bank Transfer
        console.log('   🏦 Selecting Bank Transfer...');
        const bankButton = await page.$('button[onclick*="setPaymentMethod(\'bank\')"]');
        if (bankButton) {
            await bankButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            console.log('   ❌ Could not find Bank Transfer button');
            return;
        }
        
        // Fill out bank details form
        console.log('   📝 Filling out bank details...');
        await page.type('#bankName', 'Test Bank');
        await page.type('#routingNumber', '021000021');
        await page.type('#accountNumber', '1234567890');
        await page.select('#accountType', 'checking');
        
        // Submit the form
        console.log('   💾 Submitting bank details...');
        const submitButton = await page.$('#bankDetailsForm button[type="submit"]');
        if (submitButton) {
            await submitButton.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
            console.log('   ❌ Could not find submit button');
        }
        
        console.log('   ✅ Bank data entry simulation complete');
        
    } catch (error) {
        console.error('❌ Error simulating bank data entry:', error.message);
    }
}

async function verifyDataSaved(page) {
    try {
        // Reload users.json to check if data was saved
        await page.goto('http://collaborate.cochranfilms.com/users.json');
        
        const usersData = await page.evaluate(() => {
            const pre = document.querySelector('pre');
            return pre ? JSON.parse(pre.textContent) : null;
        });
        
        if (usersData && usersData.users && usersData.users['Cody Cochran']) {
            const userData = usersData.users['Cody Cochran'];
            
            if (userData.bankData) {
                console.log('✅ Bank data was saved successfully!');
                console.log('   Bank Name:', userData.bankData.bankName);
                console.log('   Account Type:', userData.bankData.accountType);
                console.log('   Last Four:', userData.bankData.lastFour);
                console.log('   Has Encrypted Data:', !!userData.bankData.encrypted);
                console.log('   Saved At:', userData.bankData.savedAt);
                
                if (userData.bankData.encrypted) {
                    console.log('   Encryption Structure:', {
                        hasEncrypted: !!userData.bankData.encrypted.encrypted,
                        hasIV: !!userData.bankData.encrypted.iv,
                        hasSalt: !!userData.bankData.encrypted.salt,
                        algorithm: userData.bankData.encrypted.algorithm
                    });
                }
            } else {
                console.log('❌ Bank data was not saved - no bankData object found');
            }
        } else {
            console.log('❌ Could not verify data save - users.json not accessible');
        }
        
    } catch (error) {
        console.error('❌ Error verifying data save:', error.message);
    }
}

async function testAdminDashboardAccess(page) {
    try {
        // Go to admin dashboard
        console.log('   🏢 Going to admin dashboard...');
        await page.goto('http://collaborate.cochranfilms.com/admin-dashboard');
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if we need to login
        const loginForm = await page.$('#loginForm');
        if (loginForm) {
            console.log('   🔐 Logging in to admin dashboard...');
            await page.type('#adminEmail', 'info@cochranfilms.com');
            await page.type('#adminPassword', 'Cochranfilms2@');
            await page.click('button[type="submit"]');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Look for the Bank Details button
        console.log('   🔍 Looking for Bank Details button...');
        const bankButton = await page.$('button[onclick*="showUserBankDetails"]');
        
        if (bankButton) {
            console.log('   ✅ Found Bank Details button');
            
            // Click the button
            console.log('   🏦 Clicking Bank Details button...');
            await bankButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check what modal appeared
            const modal = await page.$('div[style*="position: fixed"][style*="z-index: 1000"]');
            if (modal) {
                const modalText = await page.evaluate(el => el.textContent, modal);
                
                if (modalText.includes('NO BANK DATA')) {
                    console.log('   ❌ Admin dashboard shows "NO BANK DATA" - data not found');
                } else if (modalText.includes('Secure Bank Details')) {
                    console.log('   ✅ Admin dashboard shows bank details modal');
                    
                    // Check if we can see the bank info
                    const bankInfo = await page.$('div[style*="background: rgba(255,255,255,0.05)"]');
                    if (bankInfo) {
                        const infoText = await page.evaluate(el => el.textContent, bankInfo);
                        console.log('   📋 Bank Info Displayed:', infoText.substring(0, 100) + '...');
                    }
                } else {
                    console.log('   ❓ Unknown modal content:', modalText.substring(0, 100));
                }
            } else {
                console.log('   ❌ No modal appeared after clicking Bank Details button');
            }
        } else {
            console.log('   ❌ Could not find Bank Details button');
        }
        
    } catch (error) {
        console.error('❌ Error testing admin dashboard access:', error.message);
    }
}

async function testEncryptionDecryption(page) {
    try {
        console.log('   🔐 Testing encryption/decryption in browser console...');
        
        // Go to user portal to test encryption
        await page.goto('http://collaborate.cochranfilms.com/user-portal');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test if SecureBankStorage is available
        const encryptionTest = await page.evaluate(() => {
            if (typeof SecureBankStorage !== 'undefined') {
                console.log('✅ SecureBankStorage is available');
                return 'SecureBankStorage available';
            } else {
                console.log('❌ SecureBankStorage not found');
                return 'SecureBankStorage not found';
            }
        });
        
        console.log('   ' + encryptionTest);
        
        // Test if BankDataCollector is available
        const collectorTest = await page.evaluate(() => {
            if (typeof BankDataCollector !== 'undefined') {
                console.log('✅ BankDataCollector is available');
                return 'BankDataCollector available';
            } else {
                console.log('❌ BankDataCollector not found');
                return 'BankDataCollector not found';
            }
        });
        
        console.log('   ' + collectorTest);
        
        // Test if AdminBankViewer is available
        await page.goto('http://collaborate.cochranfilms.com/admin-dashboard');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const viewerTest = await page.evaluate(() => {
            if (typeof AdminBankViewer !== 'undefined') {
                console.log('✅ AdminBankViewer is available');
                return 'AdminBankViewer available';
            } else {
                console.log('❌ AdminBankViewer not found');
                return 'AdminBankViewer not found';
            }
        });
        
        console.log('   ' + viewerTest);
        
    } catch (error) {
        console.error('❌ Error testing encryption/decryption:', error.message);
    }
}

// Run the test
testBankStorageFlow().catch(console.error); 