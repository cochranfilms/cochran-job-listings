#!/usr/bin/env node

/**
 * Test Complete Date Fix
 * Tests the date formatting after login
 */

const puppeteer = require('puppeteer');

async function testCompleteDateFix() {
    console.log('🔍 Testing Complete Date Fix...\n');
    
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
        
        // Fill in credentials and login
        console.log('\n🔑 Logging in...');
        await page.type('input[type="email"]', 'codylcochran89@gmail.com');
        await page.type('input[type="password"]', 'youtube');
        
        // Submit the form
        await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true }));
            }
        });
        
        // Wait for the user portal to appear
        console.log('\n⏳ Waiting for user portal to appear...');
        await page.waitForFunction(() => {
            const userPortal = document.getElementById('userPortal');
            const loginScreen = document.getElementById('loginScreen');
            return userPortal && userPortal.style.display !== 'none' && 
                   loginScreen && loginScreen.style.display === 'none';
        }, { timeout: 10000 });
        
        console.log('✅ User portal appeared!');
        
        // Wait a moment for data to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test the date formatting function with logged in user
        console.log('\n🔍 Testing date formatting with logged in user...');
        const dateTestResult = await page.evaluate(() => {
            if (typeof currentUser === 'undefined' || !currentUser) {
                return { error: 'currentUser not defined or null' };
            }
            
            const testDate = "8/6/2025, 5:23:17 AM";
            const result = formatContractSignedDate(testDate);
            
            return {
                testDate: testDate,
                formattedTestDate: result,
                userContractSignedDate: currentUser.contractSignedDate,
                formattedUserDate: formatContractSignedDate(currentUser.contractSignedDate),
                functionExists: typeof formatContractSignedDate === 'function'
            };
        });
        
        console.log('📅 Date Format Test Result:');
        console.log(JSON.stringify(dateTestResult, null, 2));
        
        // Click on contracts tab
        console.log('\n📋 Clicking on contracts tab...');
        await page.evaluate(() => {
            const contractsLink = document.querySelector('a[onclick*="showSection(\'contracts\')"]');
            if (contractsLink) {
                contractsLink.click();
            }
        });
        
        // Wait for contracts content to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check the actual displayed date in the contract
        console.log('\n📋 Checking displayed contract date...');
        const displayedDate = await page.evaluate(() => {
            const container = document.getElementById('contractsContent');
            if (!container) return { error: 'Container not found' };
            
            // Look for the signed date in the displayed content
            const allDivs = container.querySelectorAll('div');
            let signedDate = 'Not found';
            
            for (const div of allDivs) {
                const text = div.textContent;
                if (text.includes('Signed Date:')) {
                    signedDate = text.replace('Signed Date:', '').trim();
                    break;
                }
            }
            
            return {
                displayedSignedDate: signedDate,
                containerHTML: container.innerHTML.substring(0, 500)
            };
        });
        
        console.log('📅 Displayed Date Result:');
        console.log(JSON.stringify(displayedDate, null, 2));
        
        console.log('\n✅ Complete date fix test completed!');
        
    } catch (error) {
        console.error('❌ Complete date fix test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testCompleteDateFix().catch(console.error); 