/**
 * Check Buttons Test
 * Checks what buttons are available on the user portal page
 */

const puppeteer = require('puppeteer');

async function testCheckButtons() {
    console.log('🔍 Check Buttons Test...\n');
    
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
        
        console.log('✅ Login completed');
        
        // Check all buttons on the page
        console.log('🔍 Checking all buttons on the page...');
        const allButtons = await page.$$('button');
        console.log('Total buttons found:', allButtons.length);
        
        for (let i = 0; i < allButtons.length; i++) {
            try {
                const buttonText = await page.evaluate(el => el.textContent, allButtons[i]);
                const buttonClass = await page.evaluate(el => el.className, allButtons[i]);
                const buttonId = await page.evaluate(el => el.id, allButtons[i]);
                const buttonOnclick = await page.evaluate(el => el.getAttribute('onclick'), allButtons[i]);
                
                console.log(`Button ${i + 1}:`);
                console.log(`  Text: "${buttonText}"`);
                console.log(`  Class: "${buttonClass}"`);
                console.log(`  ID: "${buttonId}"`);
                console.log(`  Onclick: "${buttonOnclick}"`);
                console.log('  ---');
            } catch (error) {
                console.log(`Button ${i + 1}: Error reading button`);
            }
        }
        
        // Check for profile-related elements
        console.log('\n🔍 Checking for profile-related elements...');
        const profileElements = await page.$$('[class*="profile"], [id*="profile"], [class*="payment"], [id*="payment"]');
        console.log('Profile-related elements found:', profileElements.length);
        
        for (let i = 0; i < profileElements.length; i++) {
            try {
                const elementText = await page.evaluate(el => el.textContent, profileElements[i]);
                const elementClass = await page.evaluate(el => el.className, profileElements[i]);
                const elementId = await page.evaluate(el => el.id, profileElements[i]);
                
                console.log(`Profile Element ${i + 1}:`);
                console.log(`  Text: "${elementText}"`);
                console.log(`  Class: "${elementClass}"`);
                console.log(`  ID: "${elementId}"`);
                console.log('  ---');
            } catch (error) {
                console.log(`Profile Element ${i + 1}: Error reading element`);
            }
        }
        
        // Check for tabs or navigation
        console.log('\n🔍 Checking for tabs or navigation...');
        const tabElements = await page.$$('[class*="tab"], [class*="nav"], [role="tab"]');
        console.log('Tab/navigation elements found:', tabElements.length);
        
        for (let i = 0; i < tabElements.length; i++) {
            try {
                const elementText = await page.evaluate(el => el.textContent, tabElements[i]);
                const elementClass = await page.evaluate(el => el.className, tabElements[i]);
                const elementId = await page.evaluate(el => el.id, tabElements[i]);
                
                console.log(`Tab Element ${i + 1}:`);
                console.log(`  Text: "${elementText}"`);
                console.log(`  Class: "${elementClass}"`);
                console.log(`  ID: "${elementId}"`);
                console.log('  ---');
            } catch (error) {
                console.log(`Tab Element ${i + 1}: Error reading element`);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testCheckButtons().catch(console.error); 