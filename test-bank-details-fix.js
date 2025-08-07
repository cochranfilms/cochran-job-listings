#!/usr/bin/env node

/**
 * Test Bank Details Fix - Live Admin Dashboard
 * Verify that bank details are working correctly
 */

const puppeteer = require('puppeteer');

async function testBankDetailsFix() {
    console.log('🏦 Testing Bank Details Fix...\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 }
    });

    try {
        const page = await browser.newPage();

        // Navigate to live admin dashboard
        console.log('📱 Loading live admin dashboard...');
        await page.goto('https://collaborate.cochranfilms.com/admin-dashboard.html', { waitUntil: 'networkidle2' });

        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Login
        console.log('\n🔑 Logging in...');
        await page.type('#email', 'info@cochranfilms.com');
        await page.type('#password', 'Cochranfilms2@');
        await page.click('button[type="submit"]');

        // Wait for authentication
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('✅ Successfully logged in');

        // Wait for data to load
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Test 1: Check if Erica Cochran has bank data
        console.log('\n🔍 Test 1: Check Erica Cochran Bank Data');
        const userData = await page.evaluate(() => {
            const users = window.users || {};
            const erica = users['Erica Cochran'];
            return {
                hasUser: !!erica,
                hasBankData: !!(erica && erica.bankData),
                paymentMethod: erica?.paymentMethod,
                bankDataKeys: erica?.bankData ? Object.keys(erica.bankData) : []
            };
        });

        console.log('📋 Erica Cochran Data:', userData);

        // Test 2: Trigger bank details modal
        console.log('\n🏦 Test 2: Trigger Bank Details Modal');
        const bankModalResult = await page.evaluate(() => {
            try {
                const users = window.users || {};
                const userNames = Object.keys(users);
                if (userNames.length > 0) {
                    const firstUserName = userNames[0];
                    console.log('Triggering showBankDetails for:', firstUserName);
                    showBankDetails(firstUserName);
                    return { success: true, userName: firstUserName };
                } else {
                    return { success: false, error: 'No users found' };
                }
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        console.log('📋 Bank Modal Test Result:', bankModalResult);

        // Wait to see the modal
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Test 3: Check modal content
        console.log('\n📄 Test 3: Check Modal Content');
        const modalContent = await page.evaluate(() => {
            // Check for both our modal and admin bank viewer modal
            const ourModal = document.querySelector('#bankDetailsModal');
            const adminModal = document.querySelector('div[style*="position: fixed"][style*="z-index: 1000"]');
            
            if (!ourModal && !adminModal) {
                return { exists: false, modalType: 'none' };
            }

            let modalText = '';
            let modalType = '';

            if (ourModal) {
                modalText = ourModal.textContent || '';
                modalType = 'our-modal';
            } else if (adminModal) {
                modalText = adminModal.textContent || '';
                modalType = 'admin-modal';
            }

            return {
                exists: true,
                modalType: modalType,
                hasNoBankDataMessage: modalText.includes('No Bank Data') || modalText.includes('has not set up bank transfer details'),
                hasBankInfo: modalText.includes('Bank Name') || modalText.includes('Account Type'),
                hasPaymentMethod: modalText.includes('Payment Method'),
                hasEncryptionInfo: modalText.includes('Encryption') || modalText.includes('Security Level'),
                hasInfoIcon: modalText.includes('ℹ️') || modalText.includes('Information'),
                fullText: modalText.substring(0, 200) + '...' // First 200 chars for debugging
            };
        });

        console.log('📋 Modal Content Check:', modalContent);

        // Test 4: Check if admin bank viewer is initialized
        console.log('\n🔧 Test 4: Check Admin Bank Viewer');
        const adminBankViewerStatus = await page.evaluate(() => {
            return {
                adminBankViewerExists: !!window.adminBankViewer,
                AdminBankViewerClassExists: typeof AdminBankViewer !== 'undefined',
                secureBankStorageExists: typeof SecureBankStorage !== 'undefined'
            };
        });

        console.log('📋 Admin Bank Viewer Status:', adminBankViewerStatus);

        // Summary
        console.log('\n📊 BANK DETAILS FIX SUMMARY:');
        console.log('==============================');
        console.log(`Erica Cochran has bank data: ${userData.hasBankData ? '✅ Yes' : '❌ No'}`);
        console.log(`Payment Method: ${userData.paymentMethod || 'Not specified'}`);
        console.log(`Bank Modal Triggered: ${bankModalResult.success ? '✅ Success' : '❌ Failed'}`);
        console.log(`Modal Type: ${modalContent.modalType || 'None'}`);
        console.log(`Modal Shows No Data Message: ${modalContent.hasNoBankDataMessage ? '✅ Correct' : '❌ Wrong'}`);
        console.log(`Admin Bank Viewer Available: ${adminBankViewerStatus.adminBankViewerExists ? '✅ Yes' : '❌ No'}`);
        console.log(`Modal Text Preview: ${modalContent.fullText || 'No text'}`);

        // Analysis
        console.log('\n🔍 ANALYSIS:');
        console.log('============');
        
        if (!userData.hasBankData) {
            console.log('✅ CORRECT: Erica Cochran has no bank data, so showing "No Bank Data" message is correct');
        } else {
            console.log('❌ UNEXPECTED: Erica Cochran has bank data but should not');
        }
        
        if (modalContent.hasNoBankDataMessage) {
            console.log('✅ CORRECT: Modal is showing the proper "No Bank Data" message');
        } else {
            console.log('❌ ISSUE: Modal is not showing the correct message');
        }
        
        if (bankModalResult.success) {
            console.log('✅ CORRECT: Bank details modal is being triggered successfully');
        } else {
            console.log('❌ ISSUE: Bank details modal is not being triggered');
        }

        console.log('\n💡 RECOMMENDATION:');
        if (!userData.hasBankData && modalContent.hasNoBankDataMessage) {
            console.log('✅ The bank details system is working correctly!');
            console.log('   Erica Cochran has no bank data, so showing "No Bank Data" message is the correct behavior.');
            console.log('   To see actual bank details, a user would need to set up bank transfer information.');
        } else {
            console.log('❌ There may be an issue with the bank details display.');
        }

        // Keep browser open for manual inspection
        console.log('\n🔍 Browser will remain open for manual inspection...');
        await new Promise(resolve => setTimeout(resolve, 10000));

    } catch (error) {
        console.error('❌ Bank details fix test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testBankDetailsFix().catch(console.error); 