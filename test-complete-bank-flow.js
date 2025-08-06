/**
 * Complete Bank Flow Test
 * Tests the complete flow from payment selection to data saving
 */

const puppeteer = require('puppeteer');

async function testCompleteBankFlow() {
    console.log('🔍 Testing Complete Bank Flow...\n');
    
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
        
        // Test payment modal
        console.log('💳 Testing payment modal...');
        const paymentModalResult = await page.evaluate(() => {
            try {
                if (typeof showPaymentModal === 'function') {
                    showPaymentModal();
                    return '✅ Payment modal called successfully';
                } else {
                    return '❌ showPaymentModal function not found';
                }
            } catch (error) {
                return '❌ Error calling showPaymentModal: ' + error.message;
            }
        });
        
        console.log('Payment Modal Result:', paymentModalResult);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if payment modal appeared
        const paymentModal = await page.$('div[style*="position: fixed"][style*="z-index: 1000"]');
        if (paymentModal) {
            console.log('✅ Payment modal appeared');
            
            // Look for Bank Transfer button
            console.log('🏦 Looking for Bank Transfer button...');
            const bankButton = await page.$('button[onclick*="setPaymentMethod(\'bank\')"]');
            if (bankButton) {
                console.log('✅ Found Bank Transfer button');
                
                // Click Bank Transfer button
                console.log('🖱️ Clicking Bank Transfer button...');
                await bankButton.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Check if bank modal appeared
                const bankModal = await page.$('div[style*="position: fixed"][style*="z-index: 1000"]');
                if (bankModal) {
                    const modalText = await page.evaluate(el => el.textContent, bankModal);
                    if (modalText.includes('Secure Bank Details')) {
                        console.log('✅ Bank modal appeared after clicking Bank Transfer');
                        
                        // Fill out the form
                        console.log('📝 Filling out bank details...');
                        await page.type('#bankName', 'Test Bank');
                        await page.type('#routingNumber', '021000021');
                        await page.type('#accountNumber', '1234567890');
                        await page.select('#accountType', 'checking');
                        
                        console.log('✅ Form filled successfully');
                        
                        // Submit the form
                        console.log('💾 Submitting bank details...');
                        const submitButton = await page.$('#bankDetailsForm button[type="submit"]');
                        if (submitButton) {
                            await submitButton.click();
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            console.log('✅ Form submitted');
                            
                            // Check if success notification appeared
                            const notifications = await page.$$('div[style*="position: fixed"][style*="z-index: 10000"]');
                            if (notifications.length > 0) {
                                console.log('✅ Success notification appeared');
                            } else {
                                console.log('❌ No success notification found');
                            }
                            
                        } else {
                            console.log('❌ Submit button not found');
                        }
                        
                    } else {
                        console.log('❌ Bank modal did not appear or wrong modal');
                        console.log('Modal content:', modalText.substring(0, 100));
                    }
                } else {
                    console.log('❌ No modal appeared after clicking Bank Transfer');
                }
                
            } else {
                console.log('❌ Could not find Bank Transfer button');
                
                // List all buttons in the modal
                const allButtons = await page.$$('button');
                console.log('Available buttons:');
                for (let i = 0; i < allButtons.length; i++) {
                    const buttonText = await page.evaluate(el => el.textContent, allButtons[i]);
                    const buttonOnclick = await page.evaluate(el => el.getAttribute('onclick'), allButtons[i]);
                    console.log(`  Button ${i}: "${buttonText}" onclick="${buttonOnclick}"`);
                }
            }
        } else {
            console.log('❌ Payment modal did not appear');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testCompleteBankFlow().catch(console.error); 