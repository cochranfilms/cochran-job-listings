/**
 * LoadUsers Debug Test
 * Debugs what the loadUsers function returns
 */

const puppeteer = require('puppeteer');

async function testLoadUsersDebug() {
    console.log('🔍 LoadUsers Debug Test...\n');
    
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
        
        // Debug loadUsers function
        console.log('🔍 Debugging loadUsers function...');
        const loadUsersResult = await page.evaluate(async () => {
            try {
                console.log('🔍 Testing loadUsers function...');
                
                if (typeof loadUsers === 'undefined') {
                    return { success: false, error: 'loadUsers function not found' };
                }
                
                const result = await loadUsers();
                console.log('🔍 loadUsers result:', result);
                
                // Check if users object exists
                if (typeof users !== 'undefined') {
                    console.log('🔍 Global users object:', users);
                    console.log('🔍 Users keys:', Object.keys(users));
                    
                    if (users['Cody Cochran']) {
                        console.log('🔍 Cody Cochran data:', users['Cody Cochran']);
                        console.log('🔍 Bank data:', users['Cody Cochran'].bankData);
                    } else {
                        console.log('❌ Cody Cochran not found in users');
                    }
                } else {
                    console.log('❌ Global users object not found');
                }
                
                return {
                    success: true,
                    loadUsersResult: result,
                    hasUsersObject: typeof users !== 'undefined',
                    usersKeys: typeof users !== 'undefined' ? Object.keys(users) : [],
                    hasCodyCochran: typeof users !== 'undefined' && users['Cody Cochran'] ? true : false,
                    hasBankData: typeof users !== 'undefined' && users['Cody Cochran'] && users['Cody Cochran'].bankData ? true : false
                };
                
            } catch (error) {
                console.error('❌ Error in loadUsers debug:', error);
                return { success: false, error: error.message };
            }
        });
        
        console.log('LoadUsers Debug Result:', loadUsersResult);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testLoadUsersDebug().catch(console.error); 