/**
 * Re-enter Bank Data Test
 * Re-enters bank data through user portal to generate fresh encryption key
 */

const puppeteer = require('puppeteer');

async function testReenterBankData() {
    console.log('🔍 Re-enter Bank Data Test...\n');
    
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
        
        // Navigate to profile tab
        console.log('👤 Navigating to profile tab...');
        const profileButton = await page.$('.btn-profile-payment');
        if (profileButton) {
            await profileButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Click "Set Payment Method" button
        console.log('💰 Clicking Set Payment Method...');
        const setPaymentButton = await page.$('button[onclick*="showPaymentModal"]');
        if (setPaymentButton) {
            await setPaymentButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Click "Bank Transfer" button
        console.log('🏦 Clicking Bank Transfer...');
        const bankTransferButton = await page.$('button[onclick*="SecureBankModal"]');
        if (bankTransferButton) {
            await bankTransferButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Fill in bank details
        console.log('📝 Filling in bank details...');
        await page.type('#bankName', 'Test Bank');
        await page.type('#routingNumber', '021000021');
        await page.type('#accountNumber', '1234567890');
        
        // Select account type
        const accountTypeSelect = await page.$('#accountType');
        if (accountTypeSelect) {
            await accountTypeSelect.select('checking');
        }
        
        // Submit the form
        console.log('💾 Submitting bank details...');
        const submitButton = await page.$('#bankDetailsForm button[type="submit"]');
        if (submitButton) {
            await submitButton.click();
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        // Check for success notification
        console.log('✅ Checking for success notification...');
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
        
        // Wait a bit for the data to be saved
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('✅ Bank data re-entered successfully!');
        console.log('🔄 Fresh encryption key should now be generated');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testReenterBankData().catch(console.error); 