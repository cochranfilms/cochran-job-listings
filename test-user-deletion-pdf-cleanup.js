/**
 * User Deletion PDF Cleanup Test
 * Tests the user deletion process and PDF file cleanup
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function testUserDeletionPdfCleanup() {
    console.log('🔍 User Deletion PDF Cleanup Test...\n');
    
    // First, let's check what files exist in contracts folder
    console.log('📁 Checking contracts folder...');
    try {
        const contractsDir = path.join(__dirname, 'contracts');
        const files = await fs.readdir(contractsDir);
        console.log('Files in contracts folder:', files);
        
        // Check for PDF files specifically
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));
        console.log('PDF files found:', pdfFiles);
        
        // Check if any PDF files match user names
        const users = ['Cody Cochran', 'Purple Spider'];
        for (const user of users) {
            const expectedFileName = user.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim() + '.pdf';
            const fileExists = pdfFiles.includes(expectedFileName);
            console.log(`User: ${user} -> Expected file: ${expectedFileName} -> Exists: ${fileExists}`);
        }
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
        
        // Get current users and their contract information
        console.log('🔍 Analyzing current users and contracts...');
        const userAnalysis = await page.evaluate(() => {
            const analysis = [];
            
            for (const [userName, userData] of Object.entries(users)) {
                const contractInfo = userData.contract || {};
                analysis.push({
                    userName: userName,
                    email: userData.profile?.email || 'N/A',
                    contractId: contractInfo.contractId || 'N/A',
                    fileName: contractInfo.fileName || 'N/A',
                    status: contractInfo.status || 'N/A',
                    expectedFileName: userName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim() + '.pdf'
                });
            }
            
            return analysis;
        });
        
        console.log('User Analysis:', userAnalysis);
        
        // Test the deleteUser function for a specific user
        const testUser = 'Purple Spider'; // Use a test user that has a PDF
        console.log(`🧪 Testing deletion for user: ${testUser}`);
        
        // First, let's check if the user exists and has contract data
        const userExists = userAnalysis.find(u => u.userName === testUser);
        if (userExists) {
            console.log('✅ Test user found:', userExists);
            
            // Find the delete button for this user
            console.log('🔍 Looking for delete button...');
            const deleteButtons = await page.$$('button[onclick*="deleteUser"]');
            console.log('Delete buttons found:', deleteButtons.length);
            
            // Look for the specific user's delete button
            let targetDeleteButton = null;
            for (let i = 0; i < deleteButtons.length; i++) {
                const buttonText = await page.evaluate(el => el.textContent, deleteButtons[i]);
                const onclick = await page.evaluate(el => el.getAttribute('onclick'), deleteButtons[i]);
                console.log(`Button ${i}: "${buttonText}" -> ${onclick}`);
                
                if (onclick && onclick.includes(testUser)) {
                    targetDeleteButton = deleteButtons[i];
                    console.log('✅ Found delete button for test user');
                    break;
                }
            }
            
            if (targetDeleteButton) {
                console.log('🔍 Testing deleteUser function...');
                
                // Test the deleteUser function directly
                const deleteResult = await page.evaluate(async (userName) => {
                    try {
                        console.log(`🧪 Testing deleteUser for: ${userName}`);
                        
                        // Get user data before deletion
                        const userData = users[userName];
                        const userEmail = userData?.profile?.email;
                        const contractId = userData?.contract?.contractId;
                        const contractFileName = userData?.contract?.fileName;
                        
                        console.log('User data before deletion:', {
                            userName: userName,
                            email: userEmail,
                            contractId: contractId,
                            contractFileName: contractFileName
                        });
                        
                        // Create safe filename
                        const safeFileName = userName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim() + '.pdf';
                        console.log('Safe filename:', safeFileName);
                        
                        // Test PDF deletion API call
                        console.log('🔍 Testing PDF deletion API...');
                        const deletePdfResponse = await fetch('/api/delete-pdf', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                fileName: safeFileName,
                                contractId: contractId,
                                userEmail: userEmail,
                                userName: userName
                            })
                        });
                        
                        console.log('Delete PDF response status:', deletePdfResponse.status);
                        
                        if (deletePdfResponse.ok) {
                            const deleteResult = await deletePdfResponse.json();
                            console.log('Delete PDF result:', deleteResult);
                            return {
                                success: true,
                                pdfDeleted: deleteResult.success,
                                details: deleteResult.details,
                                message: deleteResult.message
                            };
                        } else {
                            console.log('Delete PDF request failed');
                            return {
                                success: false,
                                error: `HTTP ${deletePdfResponse.status}`,
                                message: 'PDF deletion request failed'
                            };
                        }
                        
                    } catch (error) {
                        console.error('❌ Error in deleteUser test:', error);
                        return {
                            success: false,
                            error: error.message,
                            message: 'Exception during deletion test'
                        };
                    }
                }, testUser);
                
                console.log('Delete Test Result:', deleteResult);
                
                if (deleteResult.success) {
                    console.log('✅ PDF deletion API test completed');
                    console.log('PDF deleted:', deleteResult.pdfDeleted);
                    console.log('Details:', deleteResult.details);
                } else {
                    console.log('❌ PDF deletion test failed:', deleteResult.error);
                }
                
            } else {
                console.log('❌ Delete button not found for test user');
            }
            
        } else {
            console.log('❌ Test user not found in users data');
        }
        
        // Test the delete-pdf API directly
        console.log('\n🔍 Testing delete-pdf API directly...');
        const apiTestResult = await page.evaluate(async () => {
            try {
                const testFileName = 'Purple Spider.pdf';
                console.log('Testing API with filename:', testFileName);
                
                const response = await fetch('/api/delete-pdf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fileName: testFileName,
                        contractId: 'TEST-CONTRACT-ID',
                        userEmail: 'test@example.com',
                        userName: 'Purple Spider'
                    })
                });
                
                console.log('API response status:', response.status);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('API result:', result);
                    return {
                        success: true,
                        result: result
                    };
                } else {
                    const errorText = await response.text();
                    console.log('API error response:', errorText);
                    return {
                        success: false,
                        status: response.status,
                        error: errorText
                    };
                }
                
            } catch (error) {
                console.error('❌ API test error:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        });
        
        console.log('API Test Result:', apiTestResult);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testUserDeletionPdfCleanup().catch(console.error); 