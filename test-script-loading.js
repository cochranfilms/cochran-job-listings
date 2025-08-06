/**
 * Script Loading Test
 * Tests if the bank storage scripts are loading properly
 */

const puppeteer = require('puppeteer');

async function testScriptLoading() {
    console.log('🔍 Testing Script Loading...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    try {
        const page = await browser.newPage();
        
        // Test user portal scripts
        console.log('🏠 Testing User Portal Scripts...');
        await page.goto('http://collaborate.cochranfilms.com/user-portal');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const userPortalScripts = await page.evaluate(() => {
            const results = {};
            
            // Check if scripts are loaded
            results.SecureBankStorage = typeof SecureBankStorage !== 'undefined';
            results.BankDataCollector = typeof BankDataCollector !== 'undefined';
            results.SecureBankModal = typeof SecureBankModal !== 'undefined';
            
            // Check if payment options are defined
            results.PAYMENT_OPTIONS = typeof PAYMENT_OPTIONS !== 'undefined';
            
            // Check if setPaymentMethod function exists
            results.setPaymentMethod = typeof setPaymentMethod !== 'undefined';
            
            return results;
        });
        
        console.log('User Portal Script Status:');
        console.log('  SecureBankStorage:', userPortalScripts.SecureBankStorage ? '✅' : '❌');
        console.log('  BankDataCollector:', userPortalScripts.BankDataCollector ? '✅' : '❌');
        console.log('  SecureBankModal:', userPortalScripts.SecureBankModal ? '✅' : '❌');
        console.log('  PAYMENT_OPTIONS:', userPortalScripts.PAYMENT_OPTIONS ? '✅' : '❌');
        console.log('  setPaymentMethod:', userPortalScripts.setPaymentMethod ? '✅' : '❌');
        
        // Test admin dashboard scripts
        console.log('\n🏢 Testing Admin Dashboard Scripts...');
        await page.goto('http://collaborate.cochranfilms.com/admin-dashboard');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const adminScripts = await page.evaluate(() => {
            const results = {};
            
            results.AdminBankViewer = typeof AdminBankViewer !== 'undefined';
            results.showUserBankDetails = typeof showUserBankDetails !== 'undefined';
            results.closeAdminBankModal = typeof closeAdminBankModal !== 'undefined';
            results.decryptBankDetails = typeof decryptBankDetails !== 'undefined';
            
            return results;
        });
        
        console.log('Admin Dashboard Script Status:');
        console.log('  AdminBankViewer:', adminScripts.AdminBankViewer ? '✅' : '❌');
        console.log('  showUserBankDetails:', adminScripts.showUserBankDetails ? '✅' : '❌');
        console.log('  closeAdminBankModal:', adminScripts.closeAdminBankModal ? '✅' : '❌');
        console.log('  decryptBankDetails:', adminScripts.decryptBankDetails ? '✅' : '❌');
        
        // Check if script files are accessible
        console.log('\n📁 Testing Script File Accessibility...');
        
        const scriptTests = await Promise.all([
            page.goto('http://collaborate.cochranfilms.com/secure-bank-storage.js').then(() => '✅').catch(() => '❌'),
            page.goto('http://collaborate.cochranfilms.com/bank-details-modal.js').then(() => '✅').catch(() => '❌'),
            page.goto('http://collaborate.cochranfilms.com/admin-bank-viewer.js').then(() => '✅').catch(() => '❌')
        ]);
        
        console.log('Script File Status:');
        console.log('  secure-bank-storage.js:', scriptTests[0]);
        console.log('  bank-details-modal.js:', scriptTests[1]);
        console.log('  admin-bank-viewer.js:', scriptTests[2]);
        
        // Test if we can access the payment modal
        console.log('\n💳 Testing Payment Modal Access...');
        await page.goto('http://collaborate.cochranfilms.com/user-portal');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const modalTest = await page.evaluate(() => {
            // Try to call showPaymentModal directly
            if (typeof showPaymentModal === 'function') {
                try {
                    showPaymentModal();
                    return '✅ showPaymentModal function exists and can be called';
                } catch (error) {
                    return '❌ showPaymentModal exists but failed: ' + error.message;
                }
            } else {
                return '❌ showPaymentModal function not found';
            }
        });
        
        console.log('Payment Modal Test:', modalTest);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testScriptLoading().catch(console.error); 