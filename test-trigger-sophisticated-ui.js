#!/usr/bin/env node

/**
 * Test Trigger Sophisticated UI Features - Live Admin Dashboard
 * Actually trigger the sophisticated UI features to see if they work
 */

const puppeteer = require('puppeteer');

async function testTriggerSophisticatedUI() {
    console.log('🎯 Testing Trigger of Sophisticated UI Features...\n');

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

        // Check if dashboard is visible
        const dashboardVisible = await page.evaluate(() => {
            const dashboard = document.getElementById('dashboard');
            return dashboard && dashboard.style.display !== 'none';
        });

        if (!dashboardVisible) {
            console.log('❌ Dashboard not visible after login');
            return;
        }

        console.log('✅ Successfully logged in');

        // Wait for data to load
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Test 1: Trigger a notification
        console.log('\n🔔 Test 1: Trigger Professional Notification');
        const notificationResult = await page.evaluate(() => {
            try {
                // Trigger a test notification
                showNotification('This is a test of the professional notification system!', 'success');
                return { success: true, message: 'Notification triggered' };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        console.log('📋 Notification Test Result:', notificationResult);

        // Wait a moment to see the notification
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Test 2: Trigger user details modal
        console.log('\n👤 Test 2: Trigger User Details Modal');
        const userDetailsResult = await page.evaluate(() => {
            try {
                // Get the first user name from the users object
                const userNames = Object.keys(window.users || {});
                if (userNames.length > 0) {
                    const firstUserName = userNames[0];
                    console.log('Triggering viewUserDetails for:', firstUserName);
                    viewUserDetails(firstUserName);
                    return { success: true, userName: firstUserName };
                } else {
                    return { success: false, error: 'No users found' };
                }
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        console.log('📋 User Details Modal Test Result:', userDetailsResult);

        // Wait to see the modal
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Test 3: Check if modal appeared
        console.log('\n🎨 Test 3: Check Modal Appearance');
        const modalCheck = await page.evaluate(() => {
            const userDetailsModal = document.getElementById('userDetailsModal');
            const bankDetailsModal = document.getElementById('bankDetailsModal');
            const performanceReviewModal = document.getElementById('performanceReviewModal');
            
            return {
                userDetailsModalExists: !!userDetailsModal,
                bankDetailsModalExists: !!bankDetailsModal,
                performanceReviewModalExists: !!performanceReviewModal,
                anyModalVisible: !!(userDetailsModal || bankDetailsModal || performanceReviewModal)
            };
        });

        console.log('📋 Modal Check Result:', modalCheck);

        // Test 4: Try to trigger bank details
        console.log('\n🏦 Test 4: Trigger Bank Details Modal');
        const bankDetailsResult = await page.evaluate(() => {
            try {
                const userNames = Object.keys(window.users || {});
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

        console.log('📋 Bank Details Modal Test Result:', bankDetailsResult);

        // Wait to see the bank modal
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Test 5: Try to trigger performance review
        console.log('\n📊 Test 5: Trigger Performance Review Modal');
        const performanceReviewResult = await page.evaluate(() => {
            try {
                const userNames = Object.keys(window.users || {});
                if (userNames.length > 0) {
                    const firstUserName = userNames[0];
                    console.log('Triggering showPerformanceReview for:', firstUserName);
                    showPerformanceReview(firstUserName);
                    return { success: true, userName: firstUserName };
                } else {
                    return { success: false, error: 'No users found' };
                }
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        console.log('📋 Performance Review Modal Test Result:', performanceReviewResult);

        // Wait to see the performance review modal
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Test 6: Final modal check
        console.log('\n🎯 Test 6: Final Modal Check');
        const finalModalCheck = await page.evaluate(() => {
            const allModals = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 10000"]');
            const modalCount = allModals.length;
            
            return {
                totalModalsFound: modalCount,
                modalDetails: Array.from(allModals).map(modal => ({
                    id: modal.id,
                    visible: modal.style.display !== 'none',
                    hasCloseButton: !!modal.querySelector('button[onclick*="remove"]')
                }))
            };
        });

        console.log('📋 Final Modal Check Result:', finalModalCheck);

        // Test 7: Check for any console errors during testing
        console.log('\n⚠️ Test 7: Console Errors During Testing');
        const consoleErrors = await page.evaluate(() => {
            return window.consoleErrors || [];
        });

        console.log('⚠️ Console Errors:', consoleErrors);

        // Summary
        console.log('\n📊 TRIGGER TEST SUMMARY:');
        console.log('==========================');
        console.log(`Notification Triggered: ${notificationResult.success ? '✅ Success' : '❌ Failed'}`);
        console.log(`User Details Modal: ${userDetailsResult.success ? '✅ Success' : '❌ Failed'}`);
        console.log(`Bank Details Modal: ${bankDetailsResult.success ? '✅ Success' : '❌ Failed'}`);
        console.log(`Performance Review Modal: ${performanceReviewResult.success ? '✅ Success' : '❌ Failed'}`);
        console.log(`Modals Visible: ${finalModalCheck.totalModalsFound > 0 ? '✅ Found' : '❌ None'}`);

        // Analysis
        console.log('\n🔍 ANALYSIS:');
        console.log('============');
        
        if (!notificationResult.success) {
            console.log('❌ Professional notification system not working');
        }
        
        if (!userDetailsResult.success) {
            console.log('❌ User details modal not working');
        }
        
        if (!bankDetailsResult.success) {
            console.log('❌ Bank details modal not working');
        }
        
        if (!performanceReviewResult.success) {
            console.log('❌ Performance review modal not working');
        }

        if (finalModalCheck.totalModalsFound === 0) {
            console.log('❌ No sophisticated modals are appearing');
        } else {
            console.log(`✅ Found ${finalModalCheck.totalModalsFound} sophisticated modals`);
        }

        console.log('\n💡 RECOMMENDATION:');
        if (finalModalCheck.totalModalsFound === 0) {
            console.log('❌ The sophisticated UI features are not appearing. This could be due to:');
            console.log('   - CSS conflicts preventing modals from showing');
            console.log('   - JavaScript errors preventing function execution');
            console.log('   - Z-index issues with modal positioning');
            console.log('   - Missing dependencies or script loading issues');
        } else {
            console.log('✅ Sophisticated UI features are working correctly!');
        }

        // Keep browser open for manual inspection
        console.log('\n🔍 Browser will remain open for manual inspection...');
        await new Promise(resolve => setTimeout(resolve, 10000));

    } catch (error) {
        console.error('❌ Sophisticated UI trigger test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testTriggerSophisticatedUI().catch(console.error); 