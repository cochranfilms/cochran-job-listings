/**
 * Direct PDF Deletion Test
 * Tests the PDF deletion API directly with an existing PDF file
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function testPdfDeletionDirect() {
    console.log('🔍 Direct PDF Deletion Test...\n');
    
    // First, let's check what files exist in contracts folder
    console.log('📁 Checking contracts folder...');
    try {
        const contractsDir = path.join(__dirname, 'contracts');
        const files = await fs.readdir(contractsDir);
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));
        console.log('PDF files found:', pdfFiles);
        
        // Check if Purple Spider.pdf exists (we'll test with this)
        const testFileName = 'Purple Spider.pdf';
        const fileExists = pdfFiles.includes(testFileName);
        console.log(`Test file "${testFileName}" exists: ${fileExists}`);
        
        if (!fileExists) {
            console.log('❌ Test file not found, cannot proceed with test');
            return;
        }
        
    } catch (error) {
        console.error('❌ Error reading contracts folder:', error);
        return;
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
        
        // Test the delete-pdf API directly
        console.log('🧪 Testing delete-pdf API directly...');
        const apiTestResult = await page.evaluate(async () => {
            try {
                const testFileName = 'Purple Spider.pdf';
                console.log('Testing API with filename:', testFileName);
                
                const response = await fetch('/api/delete-pdf', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fileName: testFileName,
                        contractId: 'CF-PURPLE-SPIDER-001',
                        userEmail: 'purple@example.com',
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
        
        if (apiTestResult.success) {
            console.log('✅ PDF deletion API test completed successfully');
            console.log('Result details:', apiTestResult.result);
            
            // Check if the file was actually deleted
            console.log('\n📁 Checking if file was deleted...');
            try {
                const contractsDir = path.join(__dirname, 'contracts');
                const files = await fs.readdir(contractsDir);
                const pdfFiles = files.filter(file => file.endsWith('.pdf'));
                console.log('PDF files after deletion:', pdfFiles);
                
                const testFileName = 'Purple Spider.pdf';
                const fileStillExists = pdfFiles.includes(testFileName);
                console.log(`Test file "${testFileName}" still exists: ${fileStillExists}`);
                
                if (!fileStillExists) {
                    console.log('✅ PDF file was successfully deleted from contracts folder!');
                } else {
                    console.log('❌ PDF file still exists in contracts folder');
                }
                
            } catch (error) {
                console.error('❌ Error checking contracts folder after deletion:', error);
            }
            
        } else {
            console.log('❌ PDF deletion API test failed:', apiTestResult.error);
        }
        
        // Test the deleteUser function logic directly
        console.log('\n🧪 Testing deleteUser function logic...');
        const deleteUserLogicTest = await page.evaluate(async () => {
            try {
                const testUserName = 'Purple Spider';
                const testFileName = 'Purple Spider.pdf';
                
                console.log('Testing deleteUser logic for:', testUserName);
                
                // Simulate the deleteUser function logic
                const safeFileName = testUserName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim() + '.pdf';
                console.log('Safe filename:', safeFileName);
                console.log('Expected filename:', testFileName);
                console.log('Filenames match:', safeFileName === testFileName);
                
                // Test the API call that deleteUser would make
                const deletePdfResponse = await fetch('/api/delete-pdf', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fileName: safeFileName,
                        contractId: 'CF-PURPLE-SPIDER-001',
                        userEmail: 'purple@example.com',
                        userName: testUserName
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
                    const errorText = await deletePdfResponse.text();
                    console.log('Delete PDF error:', errorText);
                    return {
                        success: false,
                        error: `HTTP ${deletePdfResponse.status}`,
                        message: errorText
                    };
                }
                
            } catch (error) {
                console.error('❌ Error in deleteUser logic test:', error);
                return {
                    success: false,
                    error: error.message,
                    message: 'Exception during deleteUser logic test'
                };
            }
        });
        
        console.log('DeleteUser Logic Test Result:', deleteUserLogicTest);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testPdfDeletionDirect().catch(console.error); 