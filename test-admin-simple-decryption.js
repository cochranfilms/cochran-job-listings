/**
 * Simple Admin Decryption Test
 * Tests admin access to bank data without login complications
 */

const puppeteer = require('puppeteer');

async function testAdminSimpleDecryption() {
    console.log('🔍 Simple Admin Decryption Test...\n');
    
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
        
        // Check if admin dashboard loaded properly
        console.log('📋 Checking admin dashboard status...');
        const dashboardStatus = await page.evaluate(() => {
            return {
                hasUsers: !!document.querySelector('.user-card'),
                hasBankButtons: !!document.querySelector('button[onclick*="showUserBankDetails"]'),
                pageTitle: document.title,
                bodyText: document.body.textContent.substring(0, 300)
            };
        });
        
        console.log('Dashboard Status:');
        console.log('  Has Users:', dashboardStatus.hasUsers ? '✅' : '❌');
        console.log('  Has Bank Buttons:', dashboardStatus.hasBankButtons ? '✅' : '❌');
        console.log('  Page Title:', dashboardStatus.pageTitle);
        console.log('  Body Preview:', dashboardStatus.bodyText);
        
        // Try to call the bank details function directly
        console.log('\n🏦 Testing bank details access...');
        const bankAccessResult = await page.evaluate(() => {
            try {
                // Check if we can access user data
                if (typeof users !== 'undefined' && users['Cody Cochran']) {
                    const userData = users['Cody Cochran'];
                    if (userData.bankData) {
                        return {
                            success: true,
                            hasBankData: true,
                            bankName: userData.bankData.bankName,
                            lastFour: userData.bankData.lastFour,
                            hasEncryptionKey: !!userData.bankData.encryptionKey
                        };
                    } else {
                        return { success: true, hasBankData: false };
                    }
                } else {
                    return { success: false, error: 'No user data found' };
                }
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('Bank Data Access:', bankAccessResult);
        
        if (bankAccessResult.success && bankAccessResult.hasBankData) {
            console.log('✅ Bank data is accessible');
            console.log('   Bank Name:', bankAccessResult.bankName);
            console.log('   Last Four:', bankAccessResult.lastFour);
            console.log('   Has Encryption Key:', bankAccessResult.hasEncryptionKey ? '✅' : '❌');
            
            // Test decryption function
            console.log('\n🔐 Testing decryption function...');
            const decryptionTest = await page.evaluate(() => {
                try {
                    if (typeof AdminBankViewer !== 'undefined') {
                        const viewer = new AdminBankViewer();
                        return '✅ AdminBankViewer available';
                    } else {
                        return '❌ AdminBankViewer not found';
                    }
                } catch (error) {
                    return '❌ Error: ' + error.message;
                }
            });
            
            console.log('Decryption Test:', decryptionTest);
            
        } else {
            console.log('❌ Bank data not accessible');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAdminSimpleDecryption().catch(console.error); 