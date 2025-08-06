#!/usr/bin/env node

/**
 * Test Date Formatting
 * Tests the date formatting function directly
 */

const puppeteer = require('puppeteer');

async function testDateFormat() {
    console.log('🔍 Testing Date Formatting...\n');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 }
    });

    try {
        const page = await browser.newPage();
        
        // Navigate to user portal
        console.log('📱 Loading user portal...');
        await page.goto('http://collaborate.cochranfilms.com/user-portal', { waitUntil: 'networkidle2' });
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test the date formatting function directly
        console.log('\n🔍 Testing date formatting function...');
        const dateTestResult = await page.evaluate(() => {
            // Test the formatContractSignedDate function
            const testDate = "8/6/2025, 5:23:17 AM";
            const result = formatContractSignedDate(testDate);
            
            return {
                inputDate: testDate,
                outputDate: result,
                functionExists: typeof formatContractSignedDate === 'function'
            };
        });
        
        console.log('📅 Date Format Test Result:');
        console.log(JSON.stringify(dateTestResult, null, 2));
        
        // Test with current user data
        console.log('\n🔍 Testing with current user data...');
        const userDataTest = await page.evaluate(() => {
            if (typeof currentUser === 'undefined') {
                return { error: 'currentUser not defined' };
            }
            
            return {
                contractSignedDate: currentUser.contractSignedDate,
                formattedDate: formatContractSignedDate(currentUser.contractSignedDate),
                userExists: !!currentUser
            };
        });
        
        console.log('👤 User Data Test Result:');
        console.log(JSON.stringify(userDataTest, null, 2));
        
        console.log('\n✅ Date format test completed!');
        
    } catch (error) {
        console.error('❌ Date format test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testDateFormat().catch(console.error); 