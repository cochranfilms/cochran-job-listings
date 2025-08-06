/**
 * User Portal Simple Test
 * Simple test to check user portal flow and bank modal
 */

const puppeteer = require('puppeteer');

async function testUserPortalSimple() {
    console.log('🔍 User Portal Simple Test...\n');
    
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
        
        // Go to user portal
        console.log('🏢 Going to user portal...');
        await page.goto('http://collaborate.cochranfilms.com/user-portal');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Login to user portal
        console.log('🔐 Logging in to user portal...');
        await page.type('#email', 'codylcochran89@gmail.com');
        await page.type('#password', 'youtube');
        await page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if login was successful
        console.log('✅ Login completed');
        
        // Navigate to profile tab
        console.log('👤 Navigating to profile tab...');
        const profileButton = await page.$('.btn-profile-payment');
        if (profileButton) {
            await profileButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('✅ Profile tab clicked');
        } else {
            console.log('❌ Profile button not found');
        }
        
        // Look for "Set Payment Method" button
        console.log('💰 Looking for Set Payment Method button...');
        const setPaymentButtons = await page.$$('button');
        let setPaymentButton = null;
        
        for (let i = 0; i < setPaymentButtons.length; i++) {
            const buttonText = await page.evaluate(el => el.textContent, setPaymentButtons[i]);
            if (buttonText.includes('Set Payment Method')) {
                setPaymentButton = setPaymentButtons[i];
                console.log('✅ Found Set Payment Method button');
                break;
            }
        }
        
        if (setPaymentButton) {
            await setPaymentButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('✅ Set Payment Method clicked');
            
            // Look for payment options
            console.log('💳 Looking for payment options...');
            const paymentButtons = await page.$$('button');
            let bankTransferButton = null;
            
            for (let i = 0; i < paymentButtons.length; i++) {
                const buttonText = await page.evaluate(el => el.textContent, paymentButtons[i]);
                if (buttonText.includes('Bank Transfer')) {
                    bankTransferButton = paymentButtons[i];
                    console.log('✅ Found Bank Transfer button');
                    break;
                }
            }
            
            if (bankTransferButton) {
                await bankTransferButton.click();
                await new Promise(resolve => setTimeout(resolve, 3000));
                console.log('✅ Bank Transfer clicked');
                
                // Check if bank modal appeared
                console.log('🏦 Checking if bank modal appeared...');
                const bankModal = await page.$('div[style*="position: fixed"][style*="z-index: 1000"]');
                if (bankModal) {
                    const modalText = await page.evaluate(el => el.textContent, bankModal);
                    console.log('✅ Bank modal appeared!');
                    console.log('Modal content preview:', modalText.substring(0, 200) + '...');
                    
                    // Look for form fields
                    console.log('📝 Looking for form fields...');
                    const bankNameInput = await page.$('#bankName');
                    const routingNumberInput = await page.$('#routingNumber');
                    const accountNumberInput = await page.$('#accountNumber');
                    const accountTypeSelect = await page.$('#accountType');
                    
                    console.log('Bank Name Input:', !!bankNameInput);
                    console.log('Routing Number Input:', !!routingNumberInput);
                    console.log('Account Number Input:', !!accountNumberInput);
                    console.log('Account Type Select:', !!accountTypeSelect);
                    
                    if (bankNameInput && routingNumberInput && accountNumberInput && accountTypeSelect) {
                        console.log('✅ All form fields found!');
                        
                        // Fill in the form
                        console.log('📝 Filling in form...');
                        await bankNameInput.type('Test Bank');
                        await routingNumberInput.type('021000021');
                        await accountNumberInput.type('1234567890');
                        await accountTypeSelect.select('checking');
                        
                        console.log('✅ Form filled successfully!');
                        
                        // Submit the form
                        console.log('💾 Submitting form...');
                        const submitButton = await page.$('#bankDetailsForm button[type="submit"]');
                        if (submitButton) {
                            await submitButton.click();
                            await new Promise(resolve => setTimeout(resolve, 5000));
                            console.log('✅ Form submitted!');
                            
                            // Check for success notification
                            const successNotifications = await page.$$('div[style*="position: fixed"][style*="z-index: 10000"]');
                            let successFound = false;
                            
                            for (let i = 0; i < successNotifications.length; i++) {
                                const notificationText = await page.evaluate(el => el.textContent, successNotifications[i]);
                                if (notificationText.includes('Bank details saved securely')) {
                                    console.log('🎉 SUCCESS: Bank details saved successfully!');
                                    successFound = true;
                                    break;
                                }
                            }
                            
                            if (!successFound) {
                                console.log('❌ Success notification not found');
                            }
                        } else {
                            console.log('❌ Submit button not found');
                        }
                    } else {
                        console.log('❌ Not all form fields found');
                    }
                } else {
                    console.log('❌ Bank modal did not appear');
                }
            } else {
                console.log('❌ Bank Transfer button not found');
            }
        } else {
            console.log('❌ Set Payment Method button not found');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testUserPortalSimple().catch(console.error); 