#!/usr/bin/env node

/**
 * Test Sophisticated UI Features - Live Admin Dashboard
 * Check if the sophisticated UI features are working on the live site
 */

const puppeteer = require('puppeteer');

async function testSophisticatedUILive() {
    console.log('🔍 Testing Sophisticated UI Features on Live Site...\n');

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

        // Test 1: Check if sophisticated notification system exists
        console.log('\n🔔 Test 1: Sophisticated Notification System');
        const notificationSystem = await page.evaluate(() => {
            return {
                showNotification: typeof window.showNotification,
                getNotificationIcon: typeof window.getNotificationIcon,
                getNotificationColors: typeof window.getNotificationColors
            };
        });

        console.log('📋 Notification System Functions:', notificationSystem);

        // Test 2: Check if sophisticated modal functions exist
        console.log('\n🎨 Test 2: Sophisticated Modal Functions');
        const modalFunctions = await page.evaluate(() => {
            return {
                showBankDetails: typeof window.showBankDetails,
                showPerformanceReview: typeof window.showPerformanceReview,
                submitPerformanceReview: typeof window.submitPerformanceReview
            };
        });

        console.log('📋 Modal Functions:', modalFunctions);

        // Test 3: Check if secure bank storage scripts are loaded
        console.log('\n🏦 Test 3: Secure Bank Storage Scripts');
        const bankScripts = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            return scripts.map(script => script.src).filter(src => 
                src.includes('secure-bank-storage') || 
                src.includes('admin-bank-viewer')
            );
        });

        console.log('📋 Bank Storage Scripts:', bankScripts);

        // Test 4: Check current stats
        console.log('\n📊 Test 4: Current Stats');
        const stats = await page.evaluate(() => {
            return {
                totalCreators: document.getElementById('totalCreators')?.textContent,
                activeJobs: document.getElementById('activeJobs')?.textContent,
                pendingReviews: document.getElementById('pendingReviews')?.textContent,
                totalContracts: document.getElementById('totalContracts')?.textContent
            };
        });

        console.log('📊 Stats:', stats);

        // Test 5: Check if users are displayed
        console.log('\n👥 Test 5: User Display');
        const userDisplay = await page.evaluate(() => {
            const usersList = document.getElementById('usersList');
            const contractsList = document.getElementById('contractsList');
            
            return {
                usersListExists: !!usersList,
                contractsListExists: !!contractsList,
                usersCount: usersList?.children?.length || 0,
                contractsCount: contractsList?.children?.length || 0
            };
        });

        console.log('👥 User Display:', userDisplay);

        // Test 6: Try to trigger a user details view
        console.log('\n🔍 Test 6: User Details Modal');
        const userDetailsTest = await page.evaluate(() => {
            // Look for any user entries
            const userEntries = document.querySelectorAll('[onclick*="viewUserDetails"]');
            return {
                userEntriesFound: userEntries.length,
                firstUserEntry: userEntries.length > 0 ? userEntries[0].textContent : null
            };
        });

        console.log('🔍 User Details Test:', userDetailsTest);

        // Test 7: Check if the sophisticated functions are actually in the page source
        console.log('\n📄 Test 7: Page Source Analysis');
        const pageSource = await page.content();
        
        const sourceChecks = {
            hasShowNotification: pageSource.includes('showNotification'),
            hasBankDetails: pageSource.includes('showBankDetails'),
            hasPerformanceReview: pageSource.includes('showPerformanceReview'),
            hasSecureBankStorage: pageSource.includes('secure-bank-storage'),
            hasSophisticatedModals: pageSource.includes('sophisticated modal'),
            hasProfessionalNotifications: pageSource.includes('professional notification')
        };

        console.log('📄 Source Code Analysis:', sourceChecks);

        // Test 8: Check if there are any console errors
        console.log('\n⚠️ Test 8: Console Errors');
        const consoleErrors = await page.evaluate(() => {
            return window.consoleErrors || [];
        });

        console.log('⚠️ Console Errors:', consoleErrors);

        // Summary
        console.log('\n📊 SOPHISTICATED UI TEST SUMMARY:');
        console.log('====================================');
        console.log(`Notification System: ${notificationSystem.showNotification === 'function' ? '✅ Available' : '❌ Missing'}`);
        console.log(`Bank Details Function: ${modalFunctions.showBankDetails === 'function' ? '✅ Available' : '❌ Missing'}`);
        console.log(`Performance Review Function: ${modalFunctions.showPerformanceReview === 'function' ? '✅ Available' : '❌ Missing'}`);
        console.log(`Bank Storage Scripts: ${bankScripts.length > 0 ? '✅ Loaded' : '❌ Missing'}`);
        console.log(`Sophisticated Modals in Source: ${sourceChecks.hasSophisticatedModals ? '✅ Found' : '❌ Missing'}`);
        console.log(`Professional Notifications in Source: ${sourceChecks.hasProfessionalNotifications ? '✅ Found' : '❌ Missing'}`);

        // Analysis
        console.log('\n🔍 ANALYSIS:');
        console.log('============');
        
        if (!sourceChecks.hasShowNotification) {
            console.log('❌ showNotification function not found in page source');
        }
        
        if (!sourceChecks.hasBankDetails) {
            console.log('❌ showBankDetails function not found in page source');
        }
        
        if (!sourceChecks.hasPerformanceReview) {
            console.log('❌ showPerformanceReview function not found in page source');
        }
        
        if (!sourceChecks.hasSecureBankStorage) {
            console.log('❌ secure-bank-storage script not found in page source');
        }

        if (sourceChecks.hasShowNotification && sourceChecks.hasBankDetails && sourceChecks.hasPerformanceReview) {
            console.log('✅ All sophisticated functions found in page source');
        } else {
            console.log('❌ Some sophisticated functions missing from page source');
        }

        console.log('\n💡 RECOMMENDATION:');
        if (!sourceChecks.hasShowNotification || !sourceChecks.hasBankDetails || !sourceChecks.hasPerformanceReview) {
            console.log('❌ The live site is missing the sophisticated UI features. The changes may not have been deployed or there may be a caching issue.');
        } else {
            console.log('✅ All sophisticated features are present in the page source.');
        }

    } catch (error) {
        console.error('❌ Sophisticated UI test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testSophisticatedUILive().catch(console.error); 