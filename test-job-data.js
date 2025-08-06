#!/usr/bin/env node

/**
 * Test Job Data Structure
 * Tests the job data structure to understand why role isn't mapping correctly
 */

const puppeteer = require('puppeteer');

async function testJobData() {
    console.log('🔍 Testing Job Data Structure...\n');
    
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
        
        // Test the job data structure
        console.log('\n🔍 Testing job data structure...');
        const jobDataTest = await page.evaluate(() => {
            if (typeof currentUser === 'undefined' || !currentUser) {
                return { error: 'currentUser not defined or null' };
            }
            
            const jobId = 'job-editor-default';
            const jobData = currentUser.jobs && currentUser.jobs[jobId];
            
            return {
                currentUser: {
                    name: currentUser.name,
                    email: currentUser.email,
                    primaryJob: currentUser.primaryJob,
                    jobs: currentUser.jobs ? Object.keys(currentUser.jobs) : null
                },
                jobData: jobData,
                jobId: jobId,
                role: jobData?.role,
                rate: jobData?.rate,
                pay: jobData?.pay,
                location: jobData?.location,
                description: jobData?.description
            };
        });
        
        console.log('📄 Job Data Test Result:');
        console.log(JSON.stringify(jobDataTest, null, 2));
        
        console.log('\n✅ Job data test completed!');
        
    } catch (error) {
        console.error('❌ Job data test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testJobData().catch(console.error); 