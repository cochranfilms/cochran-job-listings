/**
 * Simple Bank Modal Test
 * Tests if the bank details modal appears when selecting Bank Transfer
 */

const puppeteer = require('puppeteer');

async function testBankModal() {
    console.log('🔍 Testing Bank Modal Appearance...\n');
    
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
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Login
        console.log('🔐 Logging in...');
        await page.type('#email', 'codylcochran89@gmail.com');
        await page.type('#password', 'youtube');
        await page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Go to profile tab
        console.log('👤 Going to profile tab...');
        const profileButton = await page.$('.btn-profile-payment');
        if (profileButton) {
            await profileButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('✅ Profile tab clicked');
        } else {
            console.log('❌ Could not find profile tab button');
            return;
        }
        
        // Click Set Payment Method
        console.log('💳 Clicking Set Payment Method...');
        const paymentButton = await page.$('button[onclick*="showPaymentModal"]');
        if (paymentButton) {
            await paymentButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('✅ Payment modal opened');
        } else {
            console.log('❌ Could not find Set Payment Method button');
            return;
        }
        
        // Look for Bank Transfer button
        console.log('🏦 Looking for Bank Transfer button...');
        const bankButton = await page.$('button[onclick*="setPaymentMethod(\'bank\')"]');
        if (bankButton) {
            console.log('✅ Found Bank Transfer button');
            await bankButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if bank modal appeared
            const bankModal = await page.$('div[style*="position: fixed"][style*="z-index: 1000"]');
            if (bankModal) {
                const modalText = await page.evaluate(el => el.textContent, bankModal);
                console.log('✅ Bank modal appeared!');
                console.log('Modal content preview:', modalText.substring(0, 200) + '...');
                
                // Check for form fields
                const bankNameField = await page.$('#bankName');
                const routingField = await page.$('#routingNumber');
                const accountField = await page.$('#accountNumber');
                const typeField = await page.$('#accountType');
                
                console.log('Form fields found:');
                console.log('  Bank Name field:', !!bankNameField);
                console.log('  Routing Number field:', !!routingField);
                console.log('  Account Number field:', !!accountField);
                console.log('  Account Type field:', !!typeField);
                
                if (bankNameField && routingField && accountField && typeField) {
                    console.log('✅ All form fields are present!');
                    
                    // Test filling out the form
                    console.log('📝 Testing form fill...');
                    await page.type('#bankName', 'Test Bank');
                    await page.type('#routingNumber', '021000021');
                    await page.type('#accountNumber', '1234567890');
                    await page.select('#accountType', 'checking');
                    
                    console.log('✅ Form filled successfully!');
                    
                    // Look for submit button
                    const submitButton = await page.$('#bankDetailsForm button[type="submit"]');
                    if (submitButton) {
                        console.log('✅ Submit button found!');
                        console.log('Ready to test form submission...');
                    } else {
                        console.log('❌ Submit button not found');
                    }
                } else {
                    console.log('❌ Some form fields are missing');
                }
            } else {
                console.log('❌ Bank modal did not appear');
            }
        } else {
            console.log('❌ Could not find Bank Transfer button');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testBankModal().catch(console.error); 