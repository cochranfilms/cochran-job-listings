/**
 * Admin Viewer Check Test
 * Tests if AdminBankViewer is properly loaded and initialized
 */

const puppeteer = require('puppeteer');

async function testAdminViewerCheck() {
    console.log('🔍 Admin Viewer Check Test...\n');
    
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
        
        // Check if AdminBankViewer is available
        console.log('🔍 Checking AdminBankViewer availability...');
        const viewerCheck = await page.evaluate(() => {
            return {
                AdminBankViewerAvailable: typeof AdminBankViewer !== 'undefined',
                adminBankViewerAvailable: typeof window.adminBankViewer !== 'undefined',
                usersAvailable: typeof users !== 'undefined',
                showUserBankDetailsAvailable: typeof showUserBankDetails !== 'undefined'
            };
        });
        
        console.log('Viewer Check:', viewerCheck);
        
        if (viewerCheck.AdminBankViewerAvailable) {
            console.log('✅ AdminBankViewer class is available');
            
            // Try to create an instance
            const instanceCheck = await page.evaluate(() => {
                try {
                    const viewer = new AdminBankViewer();
                    return { success: true, message: 'AdminBankViewer instance created successfully' };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            });
            
            console.log('Instance Check:', instanceCheck);
            
            if (instanceCheck.success) {
                console.log('✅ AdminBankViewer instance can be created');
                
                // Test the showUserBankDetails method
                const methodCheck = await page.evaluate(() => {
                    try {
                        const viewer = new AdminBankViewer();
                        if (typeof viewer.showUserBankDetails === 'function') {
                            return { success: true, message: 'showUserBankDetails method is available' };
                        } else {
                            return { success: false, error: 'showUserBankDetails method not found' };
                        }
                    } catch (error) {
                        return { success: false, error: error.message };
                    }
                });
                
                console.log('Method Check:', methodCheck);
                
            } else {
                console.log('❌ AdminBankViewer instance creation failed');
            }
            
        } else {
            console.log('❌ AdminBankViewer class not available');
        }
        
        // Check if users data is available
        if (viewerCheck.usersAvailable) {
            console.log('✅ Users data is available');
            
            // Check if Cody Cochran data exists
            const userDataCheck = await page.evaluate(() => {
                if (users && users['Cody Cochran']) {
                    const userData = users['Cody Cochran'];
                    return {
                        success: true,
                        hasBankData: !!userData.bankData,
                        bankName: userData.bankData ? userData.bankData.bankName : null,
                        hasEncryptionKey: userData.bankData ? !!userData.bankData.encryptionKey : false
                    };
                } else {
                    return { success: false, error: 'Cody Cochran data not found' };
                }
            });
            
            console.log('User Data Check:', userDataCheck);
            
        } else {
            console.log('❌ Users data not available');
        }
        
        // Test the complete flow
        console.log('\n🏦 Testing complete bank details flow...');
        const completeFlowTest = await page.evaluate(() => {
            try {
                // Check if all components are available
                if (typeof AdminBankViewer === 'undefined') {
                    return { success: false, error: 'AdminBankViewer not available' };
                }
                
                if (typeof users === 'undefined' || !users['Cody Cochran']) {
                    return { success: false, error: 'User data not available' };
                }
                
                if (typeof showUserBankDetails === 'undefined') {
                    return { success: false, error: 'showUserBankDetails function not available' };
                }
                
                // Try to call the function
                showUserBankDetails('Cody Cochran');
                return { success: true, message: 'showUserBankDetails called successfully' };
                
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('Complete Flow Test:', completeFlowTest);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAdminViewerCheck().catch(console.error); 