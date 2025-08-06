/**
 * Direct Bank Modal Test
 * Tests if the bank modal appears when called directly
 */

const puppeteer = require('puppeteer');

async function testBankModalDirect() {
    console.log('🔍 Testing Direct Bank Modal Call...\n');
    
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
        
        // Test direct bank modal call
        console.log('🏦 Testing direct bank modal call...');
        const modalResult = await page.evaluate(() => {
            try {
                // Check if SecureBankModal is available
                if (typeof SecureBankModal === 'undefined') {
                    return '❌ SecureBankModal not found';
                }
                
                // Try to create instance
                const bankModal = new SecureBankModal();
                if (!bankModal) {
                    return '❌ Failed to create SecureBankModal instance';
                }
                
                // Try to show modal
                bankModal.showBankDetailsModal();
                
                // Check if modal appeared
                const modal = document.querySelector('div[style*="position: fixed"][style*="z-index: 1000"]');
                if (modal) {
                    return '✅ Bank modal appeared successfully';
                } else {
                    return '❌ Bank modal did not appear';
                }
                
            } catch (error) {
                return '❌ Error: ' + error.message;
            }
        });
        
        console.log('Modal Test Result:', modalResult);
        
        // Wait a bit to see the modal
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if modal is still there
        const modalStillThere = await page.$('div[style*="position: fixed"][style*="z-index: 1000"]');
        if (modalStillThere) {
            console.log('✅ Modal is still visible');
            
            // Check modal content
            const modalText = await page.evaluate(el => el.textContent, modalStillThere);
            console.log('Modal content preview:', modalText.substring(0, 200) + '...');
            
            // Look for form fields
            const formFields = await page.evaluate(() => {
                const fields = {};
                fields.bankName = !!document.querySelector('#bankName');
                fields.routingNumber = !!document.querySelector('#routingNumber');
                fields.accountNumber = !!document.querySelector('#accountNumber');
                fields.accountType = !!document.querySelector('#accountType');
                fields.submitButton = !!document.querySelector('#bankDetailsForm button[type="submit"]');
                return fields;
            });
            
            console.log('Form fields found:');
            console.log('  Bank Name:', formFields.bankName ? '✅' : '❌');
            console.log('  Routing Number:', formFields.routingNumber ? '✅' : '❌');
            console.log('  Account Number:', formFields.accountNumber ? '✅' : '❌');
            console.log('  Account Type:', formFields.accountType ? '✅' : '❌');
            console.log('  Submit Button:', formFields.submitButton ? '✅' : '❌');
            
        } else {
            console.log('❌ Modal disappeared or was never created');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testBankModalDirect().catch(console.error); 