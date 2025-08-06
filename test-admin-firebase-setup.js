/**
 * Admin Firebase Setup Test
 * Tests and sets up admin Firebase account
 */

const puppeteer = require('puppeteer');

async function testAdminFirebaseSetup() {
    console.log('🔍 Admin Firebase Setup Test...\n');
    
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
        
        // Check if admin account exists by trying to login
        console.log('🔐 Testing admin login...');
        const loginResult = await page.evaluate(async () => {
            try {
                // Check if Firebase auth is available
                if (typeof firebase === 'undefined' || !firebase.auth) {
                    return { success: false, error: 'Firebase not available' };
                }
                
                const auth = firebase.auth();
                
                // Try to sign in with admin credentials
                const userCredential = await auth.signInWithEmailAndPassword('info@cochranfilms.com', 'Cochranfilms2@');
                
                // If successful, sign out and return success
                await auth.signOut();
                return { success: true, message: 'Admin account exists and login works' };
                
            } catch (error) {
                console.log('Login error:', error.code, error.message);
                
                if (error.code === 'auth/user-not-found') {
                    return { success: false, error: 'Admin account does not exist in Firebase', code: error.code };
                } else if (error.code === 'auth/wrong-password') {
                    return { success: false, error: 'Admin account exists but password is wrong', code: error.code };
                } else {
                    return { success: false, error: error.message, code: error.code };
                }
            }
        });
        
        console.log('Login Test Result:', loginResult);
        
        if (!loginResult.success && loginResult.code === 'auth/user-not-found') {
            console.log('❌ Admin account does not exist in Firebase');
            console.log('🔄 Creating admin Firebase account...');
            
            // Create admin account
            const createResult = await page.evaluate(async () => {
                try {
                    if (typeof createFirebaseAccount === 'undefined') {
                        return { success: false, error: 'createFirebaseAccount function not found' };
                    }
                    
                    const result = await createFirebaseAccount('info@cochranfilms.com', 'Cochranfilms2@');
                    return result;
                    
                } catch (error) {
                    return { success: false, error: error.message };
                }
            });
            
            console.log('Create Account Result:', createResult);
            
            if (createResult.success) {
                console.log('✅ Admin Firebase account created successfully!');
                
                // Test login again
                console.log('🔐 Testing login with new account...');
                const loginTest2 = await page.evaluate(async () => {
                    try {
                        const auth = firebase.auth();
                        const userCredential = await auth.signInWithEmailAndPassword('info@cochranfilms.com', 'Cochranfilms2@');
                        await auth.signOut();
                        return { success: true, message: 'Login successful with new account' };
                    } catch (error) {
                        return { success: false, error: error.message };
                    }
                });
                
                console.log('Login Test 2:', loginTest2);
                
            } else {
                console.log('❌ Failed to create admin account:', createResult.error);
            }
            
        } else if (!loginResult.success && loginResult.code === 'auth/wrong-password') {
            console.log('❌ Admin account exists but password is wrong');
            console.log('💡 The admin password might be different than expected');
            
        } else if (loginResult.success) {
            console.log('✅ Admin account exists and login works!');
            console.log('🎉 Admin Firebase setup is correct!');
        }
        
        // Test the bank decryption after login
        console.log('\n🏦 Testing bank decryption after Firebase setup...');
        const decryptionTest = await page.evaluate(async () => {
            try {
                // First login
                const auth = firebase.auth();
                await auth.signInWithEmailAndPassword('info@cochranfilms.com', 'Cochranfilms2@');
                
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
                    }
                }
                
                await auth.signOut();
                return { success: false, error: 'No bank data found' };
                
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('Decryption Test Result:', decryptionTest);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAdminFirebaseSetup().catch(console.error); 