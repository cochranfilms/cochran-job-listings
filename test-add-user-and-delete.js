/**
 * Add User and Delete Test
 * Tests adding a user and then deleting them to check PDF cleanup
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function testAddUserAndDelete() {
    console.log('🔍 Add User and Delete Test...\n');
    
    // First, let's check what files exist in contracts folder
    console.log('📁 Checking contracts folder before test...');
    try {
        const contractsDir = path.join(__dirname, 'contracts');
        const files = await fs.readdir(contractsDir);
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));
        console.log('PDF files before test:', pdfFiles);
    } catch (error) {
        console.error('❌ Error reading contracts folder:', error);
    }
    
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
        
        // Load users data
        console.log('📋 Loading users data...');
        await page.evaluate(async () => {
            if (typeof loadUsers !== 'undefined') {
                await loadUsers();
            }
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check current users
        const currentUsers = await page.evaluate(() => {
            return Object.keys(users);
        });
        console.log('Current users:', currentUsers);
        
        // Add a test user
        console.log('➕ Adding test user...');
        const addUserResult = await page.evaluate(async () => {
            try {
                // Add a test user to the users object
                users['Test User'] = {
                    profile: {
                        email: 'test@example.com',
                        password: 'test123',
                        role: 'Editor',
                        location: 'Test City, GA',
                        projectStart: '2025-08-06T10:00',
                        rate: '$50/hour',
                        approvedDate: '2025-08-06'
                    },
                    contract: {
                        contractId: 'CF-TEST-USER-001',
                        fileName: 'Test User.pdf',
                        status: 'signed',
                        signedDate: '8/6/2025, 10:00:00 AM',
                        uploadDate: '8/6/2025, 10:00:00 AM',
                        githubUrl: 'https://github.com/cochranfilms/cochran-job-listings/blob/main/contracts/Test%20User.pdf'
                    },
                    paymentMethod: 'paypal',
                    paymentStatus: 'configured'
                };
                
                // Update GitHub
                if (typeof updateUsersOnGitHub === 'function') {
                    await updateUsersOnGitHub();
                    return { success: true, message: 'Test user added and saved to GitHub' };
                } else {
                    return { success: false, error: 'updateUsersOnGitHub function not found' };
                }
                
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log('Add User Result:', addUserResult);
        
        if (addUserResult.success) {
            console.log('✅ Test user added successfully');
            
            // Wait a moment for the update to complete
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Refresh the page to see the new user
            console.log('🔄 Refreshing page...');
            await page.reload();
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Login again after refresh
            await page.type('#username', 'info@cochranfilms.com');
            await page.type('#password', 'Cochranfilms2@');
            await page.click('button[type="submit"]');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Load users data again
            await page.evaluate(async () => {
                if (typeof loadUsers !== 'undefined') {
                    await loadUsers();
                }
            });
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if the test user is now visible
            const updatedUsers = await page.evaluate(() => {
                return Object.keys(users);
            });
            console.log('Updated users:', updatedUsers);
            
            if (updatedUsers.includes('Test User')) {
                console.log('✅ Test user is now visible in admin dashboard');
                
                // Find the delete button for the test user
                console.log('🔍 Looking for delete button for Test User...');
                const deleteButtons = await page.$$('button[onclick*="deleteUser"]');
                console.log('Delete buttons found:', deleteButtons.length);
                
                // Look for the specific user's delete button
                let targetDeleteButton = null;
                for (let i = 0; i < deleteButtons.length; i++) {
                    const onclick = await page.evaluate(el => el.getAttribute('onclick'), deleteButtons[i]);
                    console.log(`Button ${i} onclick:`, onclick);
                    
                    if (onclick && onclick.includes('Test User')) {
                        targetDeleteButton = deleteButtons[i];
                        console.log('✅ Found delete button for Test User');
                        break;
                    }
                }
                
                if (targetDeleteButton) {
                    console.log('🧪 Testing deletion for Test User...');
                    
                    // Click the delete button
                    await targetDeleteButton.click();
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Handle the confirmation dialog
                    page.on('dialog', async dialog => {
                        console.log('Dialog message:', dialog.message());
                        await dialog.accept();
                    });
                    
                    // Wait for deletion to complete
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    console.log('✅ Deletion process completed');
                    
                    // Check if the user was removed
                    const finalUsers = await page.evaluate(() => {
                        return Object.keys(users);
                    });
                    console.log('Final users after deletion:', finalUsers);
                    
                    if (!finalUsers.includes('Test User')) {
                        console.log('✅ Test user successfully deleted from users data');
                    } else {
                        console.log('❌ Test user still exists in users data');
                    }
                    
                } else {
                    console.log('❌ Delete button not found for Test User');
                }
                
            } else {
                console.log('❌ Test user not visible in admin dashboard');
            }
            
        } else {
            console.log('❌ Failed to add test user:', addUserResult.error);
        }
        
        // Check contracts folder after test
        console.log('\n📁 Checking contracts folder after test...');
        try {
            const contractsDir = path.join(__dirname, 'contracts');
            const files = await fs.readdir(contractsDir);
            const pdfFiles = files.filter(file => file.endsWith('.pdf'));
            console.log('PDF files after test:', pdfFiles);
            
            // Check if Test User.pdf was created and then deleted
            const testUserPdfExists = pdfFiles.includes('Test User.pdf');
            console.log('Test User.pdf exists after test:', testUserPdfExists);
            
        } catch (error) {
            console.error('❌ Error reading contracts folder after test:', error);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testAddUserAndDelete().catch(console.error); 