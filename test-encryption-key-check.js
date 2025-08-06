/**
 * Encryption Key Check Test
 * Tests the encryption key and decryption process
 */

const puppeteer = require('puppeteer');

async function testEncryptionKeyCheck() {
    console.log('🔍 Encryption Key Check Test...\n');
    
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
        
        // Check the encryption key and decryption process
        console.log('🔐 Checking encryption key and decryption...');
        const encryptionCheck = await page.evaluate(async () => {
            try {
                // Check if we have the necessary components
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
                
                console.log('Bank data found:', userData.bankData);
                console.log('Encryption key:', userData.bankData.encryptionKey);
                
                // Try to decrypt with the stored encryption key
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
                console.error('Decryption error:', error);
                return { success: false, error: error.message };
            }
        });
        
        console.log('Encryption Check Result:', encryptionCheck);
        
        if (encryptionCheck.success) {
            console.log('🎉 SUCCESS: Decryption is working!');
            console.log('✅ Bank Name:', encryptionCheck.bankName);
            console.log('✅ Routing Number:', encryptionCheck.routingNumber);
            console.log('✅ Account Number:', encryptionCheck.accountNumber);
            console.log('✅ Account Type:', encryptionCheck.accountType);
            
            // Now test the admin viewer with the correct password
            console.log('\n🏦 Testing admin viewer with correct password...');
            const adminTest = await page.evaluate(async () => {
                try {
                    // Manually set the admin password to the correct one
                    const adminPasswordInput = document.getElementById('adminPassword');
                    if (adminPasswordInput) {
                        adminPasswordInput.value = 'Cochranfilms2@';
                        console.log('Admin password set:', adminPasswordInput.value);
                    }
                    
                    // Call the decryption function directly
                    if (window.adminBankViewer) {
                        await window.adminBankViewer.decryptBankDetails('Cody Cochran');
                        return '✅ Admin viewer decryption called';
                    } else {
                        return '❌ AdminBankViewer not available';
                    }
                } catch (error) {
                    return '❌ Error: ' + error.message;
                }
            });
            
            console.log('Admin Test Result:', adminTest);
            
        } else {
            console.log('❌ Decryption failed:', encryptionCheck.error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testEncryptionKeyCheck().catch(console.error); 