/**
 * Simple Admin Test
 * Tests if admin dashboard loads and can access bank data
 */

const puppeteer = require('puppeteer');

async function testAdminSimple() {
    console.log('🔍 Simple Admin Test...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // Go to admin dashboard
        console.log('🏢 Going to admin dashboard...');
        await page.goto('http://collaborate.cochranfilms.com/admin-dashboard');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if we need to login
        const loginForm = await page.$('#loginForm');
        if (loginForm) {
            console.log('🔐 Logging in to admin dashboard...');
            await page.type('#username', 'info@cochranfilms.com');
            await page.type('#password', 'Cochranfilms2@');
            await page.click('button[type="submit"]');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Check if admin dashboard loaded
        console.log('📋 Checking admin dashboard...');
        const dashboardContent = await page.evaluate(() => {
            return {
                hasUsers: !!document.querySelector('.user-card'),
                hasBankButtons: !!document.querySelector('button[onclick*="showUserBankDetails"]'),
                pageTitle: document.title,
                bodyText: document.body.textContent.substring(0, 200)
            };
        });
        
        console.log('Dashboard Status:');
        console.log('  Has Users:', dashboardContent.hasUsers ? '✅' : '❌');
        console.log('  Has Bank Buttons:', dashboardContent.hasBankButtons ? '✅' : '❌');
        console.log('  Page Title:', dashboardContent.pageTitle);
        console.log('  Body Preview:', dashboardContent.bodyText);
        
        // Try to call the bank details function directly
        console.log('\n🏦 Testing bank details function...');
        const bankResult = await page.evaluate(() => {
            try {
                if (typeof showUserBankDetails === 'function') {
                    showUserBankDetails('Cody Cochran');
                    return '✅ showUserBankDetails function called';
                } else {
                    return '❌ showUserBankDetails function not found';
                }
            } catch (error) {
                return '❌ Error calling showUserBankDetails: ' + error.message;
            }
        });
        
        console.log('Bank Function Test:', bankResult);
        
        // Wait a bit to see if modal appears
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if modal appeared
        const modal = await page.$('div[style*="position: fixed"][style*="z-index: 1000"]');
        if (modal) {
            const modalText = await page.evaluate(el => el.textContent, modal);
            console.log('✅ Modal appeared!');
            console.log('Modal content preview:', modalText.substring(0, 200) + '...');
            
            if (modalText.includes('NO BANK DATA')) {
                console.log('❌ Still shows "NO BANK DATA"');
            } else if (modalText.includes('Secure Bank Details')) {
                console.log('✅ Shows bank details modal!');
                console.log('🎉 SUCCESS: Admin can access bank data!');
            } else {
                console.log('❓ Unknown modal content');
            }
        } else {
            console.log('❌ No modal appeared');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAdminSimple().catch(console.error); 