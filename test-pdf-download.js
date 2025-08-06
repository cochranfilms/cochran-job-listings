#!/usr/bin/env node

/**
 * Test PDF Download Functionality
 * Tests if the PDF download is working correctly
 */

const puppeteer = require('puppeteer');

async function testPDFDownload() {
    console.log('🔍 Testing PDF Download Functionality...\n');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 }
    });

    try {
        const page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => {
            console.log(`📱 Browser: ${msg.type()}: ${msg.text()}`);
        });
        
        // Navigate to user portal
        console.log('📱 Loading user portal...');
        await page.goto('http://collaborate.cochranfilms.com/user-portal', { waitUntil: 'networkidle2' });
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Fill in credentials and login
        console.log('\n🔑 Logging in...');
        await page.type('input[type="email"]', 'codylcochran89@gmail.com');
        await page.type('input[type="password"]', 'youtube');
        
        // Submit the form
        await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true }));
            }
        });
        
        // Wait for the user portal to appear
        console.log('\n⏳ Waiting for user portal to appear...');
        await page.waitForFunction(() => {
            const userPortal = document.getElementById('userPortal');
            const loginScreen = document.getElementById('loginScreen');
            return userPortal && userPortal.style.display !== 'none' && 
                   loginScreen && loginScreen.style.display === 'none';
        }, { timeout: 10000 });
        
        console.log('✅ User portal appeared!');
        
        // Wait a moment for data to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Click on contracts tab
        console.log('\n📋 Clicking on contracts tab...');
        await page.evaluate(() => {
            const contractsLink = document.querySelector('a[onclick*="showSection(\'contracts\')"]');
            if (contractsLink) {
                contractsLink.click();
            }
        });
        
        // Wait for contracts content to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check contract details before download
        const contractDetails = await page.evaluate(() => {
            const container = document.getElementById('contractsContent');
            if (!container) return { error: 'Container not found' };
            
            // Extract contract information from the displayed content
            const allDivs = container.querySelectorAll('div');
            let contractId = 'Not found';
            let signedDate = 'Not found';
            let uploadedDate = 'Not found';
            
            for (const div of allDivs) {
                const text = div.textContent;
                if (text.includes('Contract ID:')) {
                    contractId = text.replace('Contract ID:', '').trim();
                }
                if (text.includes('Signed Date:')) {
                    signedDate = text.replace('Signed Date:', '').trim();
                }
                if (text.includes('Uploaded Date:')) {
                    uploadedDate = text.replace('Uploaded Date:', '').trim();
                }
            }
            
            return {
                contractId,
                signedDate,
                uploadedDate,
                fullContent: container.innerHTML.substring(0, 1000)
            };
        });
        
        console.log('\n📋 Contract Details:');
        console.log(JSON.stringify(contractDetails, null, 2));
        
        // Check if download button exists and click it
        console.log('\n📥 Testing PDF download...');
        const downloadResult = await page.evaluate(async () => {
            const button = document.querySelector('button[onclick*="downloadUserContract"]');
            if (!button) {
                return { success: false, error: 'Download button not found' };
            }
            
            // Store original onclick
            const originalOnclick = button.getAttribute('onclick');
            
            // Override onclick to capture any errors
            let downloadError = null;
            button.onclick = async (e) => {
                try {
                    e.preventDefault();
                    console.log('🔍 Download button clicked - testing function...');
                    
                    // Call the download function directly
                    if (typeof downloadUserContract === 'function') {
                        await downloadUserContract('job-editor-default');
                        console.log('✅ downloadUserContract function executed successfully');
                    } else {
                        throw new Error('downloadUserContract function not found');
                    }
                } catch (error) {
                    downloadError = error.message;
                    console.error('❌ Download error:', error);
                }
            };
            
            // Click the button
            button.click();
            
            // Wait a moment for the function to execute
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return {
                success: !downloadError,
                error: downloadError,
                buttonText: button.textContent.trim(),
                originalOnclick: originalOnclick
            };
        });
        
        console.log('\n📥 Download Test Result:');
        console.log(JSON.stringify(downloadResult, null, 2));
        
        // Check for any console errors during download
        console.log('\n🔍 Checking for console errors...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test the PDF generation function directly
        console.log('\n🔍 Testing PDF generation function...');
        const pdfTestResult = await page.evaluate(() => {
            try {
                // Check if PDF generation functions exist
                const functions = {
                    generateContractPDF: typeof generateContractPDF,
                    downloadUserContract: typeof downloadUserContract,
                    formatContractSignedDate: typeof formatContractSignedDate
                };
                
                // Test PDF generation with sample data
                if (typeof generateContractPDF === 'function') {
                    const sampleData = {
                        contractId: 'TEST-001',
                        freelancerName: 'Test User',
                        freelancerEmail: 'test@example.com',
                        role: 'Editor',
                        location: 'Atlanta Area',
                        projectStart: '2025-01-01',
                        rate: '$75/hour',
                        effectiveDate: '2025-01-01',
                        signatureDate: '2025-01-01',
                        signature: 'Digital Signature'
                    };
                    
                    try {
                        const doc = generateContractPDF(sampleData);
                        return {
                            success: true,
                            functions,
                            pdfGenerated: true,
                            error: null
                        };
                    } catch (error) {
                        return {
                            success: false,
                            functions,
                            pdfGenerated: false,
                            error: error.message
                        };
                    }
                } else {
                    return {
                        success: false,
                        functions,
                        pdfGenerated: false,
                        error: 'generateContractPDF function not found'
                    };
                }
            } catch (error) {
                return {
                    success: false,
                    functions: {},
                    pdfGenerated: false,
                    error: error.message
                };
            }
        });
        
        console.log('\n📄 PDF Generation Test:');
        console.log(JSON.stringify(pdfTestResult, null, 2));
        
        console.log('\n✅ PDF download test completed!');
        
    } catch (error) {
        console.error('❌ PDF download test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// Run the test
testPDFDownload().catch(console.error); 