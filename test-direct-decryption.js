/**
 * Direct Decryption Test
 * Tests decryption functionality directly without admin login
 */

const puppeteer = require('puppeteer');

async function testDirectDecryption() {
    console.log('🔍 Direct Decryption Test...\n');
    
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
        
        // Test decryption directly without login
        console.log('🔐 Testing decryption directly...');
        const decryptionResult = await page.evaluate(async () => {
            try {
                // Check if we have the necessary components
                if (typeof AdminBankViewer === 'undefined') {
                    return { success: false, error: 'AdminBankViewer not found' };
                }
                
                if (typeof SecureBankStorage === 'undefined') {
                    return { success: false, error: 'SecureBankStorage not found' };
                }
                
                // Get user data
                if (typeof users === 'undefined' || !users['Cody Cochran']) {
                    return { success: false, error: 'User data not found' };
                }
                
                const userData = users['Cody Cochran'];
                if (!userData.bankData || !userData.bankData.encrypted) {
                    return { success: false, error: 'Bank data not found' };
                }
                
                // Test decryption with stored encryption key
                const secureStorage = new SecureBankStorage();
                const decryptedData = await secureStorage.decryptBankData(
                    userData.bankData.encrypted,
                    userData.bankData.encryptionKey
                );
                
                return {
                    success: true,
                    decrypted: decryptedData,
                    bankName: decryptedData.bankName,
                    routingNumber: decryptedData.routingNumber,
                    accountNumber: decryptedData.accountNumber,
                    accountType: decryptedData.accountType
                };
                
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('Decryption Result:', decryptionResult);
        
        if (decryptionResult.success) {
            console.log('🎉 SUCCESS: Decryption is working!');
            console.log('✅ Bank Name:', decryptionResult.bankName);
            console.log('✅ Routing Number:', decryptionResult.routingNumber);
            console.log('✅ Account Number:', decryptionResult.accountNumber);
            console.log('✅ Account Type:', decryptionResult.accountType);
            
            // Now test the admin viewer
            console.log('\n👨‍💼 Testing admin viewer...');
            const viewerTest = await page.evaluate(() => {
                try {
                    const viewer = new AdminBankViewer();
                    viewer.showUserBankDetails('Cody Cochran', users['Cody Cochran']);
                    return '✅ Admin viewer called successfully';
                } catch (error) {
                    return '❌ Error calling admin viewer: ' + error.message;
                }
            });
            
            console.log('Viewer Test:', viewerTest);
            
        } else {
            console.log('❌ Decryption failed:', decryptionResult.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testDirectDecryption().catch(console.error); 