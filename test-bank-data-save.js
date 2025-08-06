/**
 * Bank Data Save Test
 * Tests if bank data is now being saved properly to users.json
 */

const puppeteer = require('puppeteer');

async function testBankDataSave() {
    console.log('🔍 Testing Bank Data Save...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
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
        
        // Open payment modal and select bank transfer
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
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait longer for save
                console.log('✅ Form submitted');
                
                // Check for success notification
                const notifications = await page.$$('div[style*="position: fixed"][style*="z-index: 10000"]');
                if (notifications.length > 0) {
                    console.log('✅ Success notification appeared');
                }
                
                // Wait a bit more for the save to complete
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Check if data was saved by loading users.json
                console.log('📋 Checking if data was saved...');
                await page.goto('http://collaborate.cochranfilms.com/users.json');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const usersData = await page.evaluate(() => {
                    const pre = document.querySelector('pre');
                    return pre ? JSON.parse(pre.textContent) : null;
                });
                
                if (usersData && usersData.users && usersData.users['Cody Cochran']) {
                    const userData = usersData.users['Cody Cochran'];
                    console.log('✅ Found user data');
                    console.log('   Payment Method:', userData.paymentMethod);
                    console.log('   Payment Status:', userData.paymentStatus);
                    console.log('   Has Bank Data:', !!userData.bankData);
                    
                    if (userData.bankData) {
                        console.log('✅ Bank data was saved!');
                        console.log('   Bank Name:', userData.bankData.bankName);
                        console.log('   Account Type:', userData.bankData.accountType);
                        console.log('   Last Four:', userData.bankData.lastFour);
                        console.log('   Has Encrypted Data:', !!userData.bankData.encrypted);
                        console.log('   Saved At:', userData.bankData.savedAt);
                        
                        // Test admin dashboard access
                        console.log('\n👨‍💼 Testing admin dashboard access...');
                        await page.goto('http://collaborate.cochranfilms.com/admin-dashboard');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        // Look for Bank Details button
                        const adminBankButton = await page.$('button[onclick*="showUserBankDetails"]');
                        if (adminBankButton) {
                            console.log('✅ Found Bank Details button in admin dashboard');
                            await adminBankButton.click();
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            
                            // Check what modal appeared
                            const adminModal = await page.$('div[style*="position: fixed"][style*="z-index: 1000"]');
                            if (adminModal) {
                                const modalText = await page.evaluate(el => el.textContent, adminModal);
                                if (modalText.includes('NO BANK DATA')) {
                                    console.log('❌ Admin still shows "NO BANK DATA"');
                                } else if (modalText.includes('Secure Bank Details')) {
                                    console.log('✅ Admin shows bank details modal!');
                                    console.log('🎉 SUCCESS: Bank data is working end-to-end!');
                                } else {
                                    console.log('❓ Unknown admin modal content');
                                }
                            } else {
                                console.log('❌ No admin modal appeared');
                            }
                        } else {
                            console.log('❌ Could not find Bank Details button in admin dashboard');
                        }
                        
                    } else {
                        console.log('❌ Bank data was not saved');
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
testBankDataSave().catch(console.error); 