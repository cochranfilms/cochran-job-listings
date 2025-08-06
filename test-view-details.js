#!/usr/bin/env node

/**
 * Test View Details Button
 * Tests the View Details functionality after login
 */

const puppeteer = require('puppeteer');

async function testViewDetails() {
    console.log('🔍 Testing View Details Button...\n');
    
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
        
        // Test the getUserContractStatus function directly
        console.log('\n🔍 Testing getUserContractStatus function...');
        const contractStatusTest = await page.evaluate(() => {
            if (typeof currentUser === 'undefined' || !currentUser) {
                return { error: 'currentUser not defined or null' };
            }
            
            const userContract = getUserContractStatus(currentUser.email, 'job-editor-default');
            
            return {
                userContract: userContract,
                currentUserContractStatus: currentUser.contractStatus,
                currentUserContractId: currentUser.contractId,
                currentUserContractSignedDate: currentUser.contractSignedDate,
                functionExists: typeof getUserContractStatus === 'function'
            };
        });
        
        console.log('📄 Contract Status Test Result:');
        console.log(JSON.stringify(contractStatusTest, null, 2));
        
        // Click the View Details button
        console.log('\n👁️ Clicking View Details button...');
        const viewDetailsResult = await page.evaluate(() => {
            const viewDetailsButton = document.querySelector('button[onclick="viewContractDetails()"]');
            if (!viewDetailsButton) {
                return { error: 'View Details button not found' };
            }
            
            // Click the button
            viewDetailsButton.click();
            
            // Wait a moment for modal to appear
            setTimeout(() => {
                const modal = document.querySelector('div[style*="position: fixed"][style*="z-index: 10000"]');
                if (modal) {
                    console.log('✅ Contract details modal appeared!');
                } else {
                    console.log('❌ Contract details modal not found');
                }
            }, 1000);
            
            return {
                buttonFound: true,
                buttonText: viewDetailsButton.textContent.trim(),
                buttonOnclick: viewDetailsButton.getAttribute('onclick')
            };
        });
        
        console.log('👁️ View Details Test Result:');
        console.log(JSON.stringify(viewDetailsResult, null, 2));
        
        // Wait for modal to appear and check its content
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('\n📋 Checking modal content...');
        const modalContent = await page.evaluate(() => {
            const modal = document.querySelector('div[style*="position: fixed"][style*="z-index: 10000"]');
            if (!modal) {
                return { error: 'Modal not found' };
            }
            
            // Extract modal content
            const modalText = modal.textContent;
            const modalHTML = modal.innerHTML.substring(0, 1000);
            
            return {
                modalText: modalText,
                modalHTML: modalHTML,
                modalFound: true
            };
        });
        
        console.log('📋 Modal Content Result:');
        console.log(JSON.stringify(modalContent, null, 2));
        
        console.log('\n✅ View Details test completed!');
        
    } catch (error) {
        console.error('❌ View Details test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testViewDetails().catch(console.error); 