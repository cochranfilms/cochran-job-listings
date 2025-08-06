/**
 * Direct Decryption Bypass Test
 * Bypasses password check to directly test decryption
 */

const puppeteer = require('puppeteer');

async function testDirectDecryptionBypass() {
    console.log('🔍 Direct Decryption Bypass Test...\n');
    
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
        
        // Go to admin dashboard
        console.log('🏢 Going to admin dashboard...');
        await page.goto('http://collaborate.cochranfilms.com/admin-dashboard');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Login to admin dashboard
        console.log('🔐 Logging in to admin dashboard...');
        await page.type('#username', 'info@cochranfilms.com');
        await page.type('#password', 'Cochranfilms2@');
        await page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Load user data and test direct decryption
        console.log('🔍 Testing direct decryption...');
        const decryptionTest = await page.evaluate(async () => {
            try {
                // Load users data
                if (typeof loadUsers !== 'undefined') {
                    await loadUsers();
                }
                
                // Get user data
                const userData = users['Cody Cochran'];
                if (!userData || !userData.bankData) {
                    return { success: false, error: 'No bank data found' };
                }
                
                console.log('User data found:', userData);
                console.log('Bank data:', userData.bankData);
                
                // Check if AdminBankViewer is available
                if (typeof window.adminBankViewer === 'undefined') {
                    return { success: false, error: 'AdminBankViewer not available' };
                }
                
                // Check if secureStorage is available
                if (!window.adminBankViewer.secureStorage) {
                    return { success: false, error: 'SecureStorage not available' };
                }
                
                // Test decryption directly
                const encryptedData = userData.bankData.encrypted;
                const encryptionKey = userData.bankData.encryptionKey;
                
                console.log('Encrypted data length:', encryptedData.length);
                console.log('Encryption key:', encryptionKey);
                
                // Try to decrypt
                const decryptedData = await window.adminBankViewer.secureStorage.decryptBankData(
                    encryptedData,
                    encryptionKey
                );
                
                return {
                    success: true,
                    decryptedData: decryptedData,
                    bankName: decryptedData.bankName,
                    routingNumber: decryptedData.routingNumber,
                    accountNumber: decryptedData.accountNumber,
                    accountType: decryptedData.accountType
                };
                
            } catch (error) {
                console.error('Decryption error:', error);
                return {
                    success: false,
                    error: error.message,
                    stack: error.stack
                };
            }
        });
        
        console.log('Decryption Test Result:', decryptionTest);
        
        if (decryptionTest.success) {
            console.log('🎉 SUCCESS: Direct decryption worked!');
            console.log('✅ Bank Name:', decryptionTest.bankName);
            console.log('✅ Routing Number:', decryptionTest.routingNumber);
            console.log('✅ Account Number:', decryptionTest.accountNumber);
            console.log('✅ Account Type:', decryptionTest.accountType);
        } else {
            console.log('❌ Direct decryption failed:', decryptionTest.error);
            if (decryptionTest.stack) {
                console.log('Stack trace:', decryptionTest.stack);
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testDirectDecryptionBypass().catch(console.error); 