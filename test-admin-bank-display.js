/**
 * Admin Bank Display Test
 * Tests if admin dashboard now shows bank data
 */

const puppeteer = require('puppeteer');

async function testAdminBankDisplay() {
    console.log('🔍 Testing Admin Bank Display...\n');
    
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
        
        // Login to admin dashboard
        console.log('🔐 Logging in to admin dashboard...');
        await page.type('#username', 'info@cochranfilms.com');
        await page.type('#password', 'Cochranfilms2@');
        await page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Look for Bank Details button
        console.log('🔍 Looking for Bank Details button...');
        const bankButton = await page.$('button[onclick*="showUserBankDetails"]');
        
        if (bankButton) {
            console.log('✅ Found Bank Details button');
            
            // Click the button
            console.log('🏦 Clicking Bank Details button...');
            await bankButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check what modal appeared
            const modal = await page.$('div[style*="position: fixed"][style*="z-index: 1000"]');
            if (modal) {
                const modalText = await page.evaluate(el => el.textContent, modal);
                
                if (modalText.includes('NO BANK DATA')) {
                    console.log('❌ Admin still shows "NO BANK DATA"');
                    console.log('Modal content:', modalText.substring(0, 200));
                } else if (modalText.includes('Secure Bank Details')) {
                    console.log('✅ Admin shows bank details modal!');
                    console.log('🎉 SUCCESS: Bank data is working end-to-end!');
                    
                    // Check for bank information display
                    const bankInfo = await page.$('div[style*="background: rgba(255,255,255,0.05)"]');
                    if (bankInfo) {
                        const infoText = await page.evaluate(el => el.textContent, bankInfo);
                        console.log('Bank Info Displayed:', infoText.substring(0, 200) + '...');
                    }
                    
                    // Look for decrypt button
                    const decryptButton = await page.$('button[onclick*="decryptBankDetails"]');
                    if (decryptButton) {
                        console.log('✅ Decrypt button found');
                        
                        // Click decrypt button
                        console.log('🔐 Clicking decrypt button...');
                        await decryptButton.click();
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Check if password prompt appeared
                        const passwordModal = await page.$('input[type="password"]');
                        if (passwordModal) {
                            console.log('✅ Password prompt appeared');
                            
                            // Enter admin password
                            console.log('🔑 Entering admin password...');
                            await page.type('input[type="password"]', 'admin123');
                            await page.click('button[onclick*="decryptBankDetails"]');
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            
                            // Check if decrypted data appeared
                            const decryptedData = await page.$('div[style*="background: rgba(22, 163, 74, 0.1)"]');
                            if (decryptedData) {
                                const decryptedText = await page.evaluate(el => el.textContent, decryptedData);
                                console.log('✅ Decrypted bank data displayed!');
                                console.log('Decrypted data:', decryptedText.substring(0, 200) + '...');
                            } else {
                                console.log('❌ No decrypted data found');
                            }
                        } else {
                            console.log('❌ Password prompt did not appear');
                        }
                    } else {
                        console.log('❌ Decrypt button not found');
                    }
                    
                } else {
                    console.log('❓ Unknown modal content');
                    console.log('Modal content:', modalText.substring(0, 200));
                }
            } else {
                console.log('❌ No modal appeared after clicking Bank Details button');
            }
        } else {
            console.log('❌ Could not find Bank Details button');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAdminBankDisplay().catch(console.error); 