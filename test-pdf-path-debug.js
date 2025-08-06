/**
 * PDF Path Debug Test
 * Debugs the exact file path that the delete-pdf API is using
 */

const fs = require('fs').promises;
const path = require('path');

async function testPdfPathDebug() {
    console.log('🔍 PDF Path Debug Test...\n');
    
    // Check the current directory structure
    console.log('📁 Current directory:', __dirname);
    
    // Check if contracts folder exists
    const contractsDir = path.join(__dirname, 'contracts');
    console.log('📁 Contracts directory path:', contractsDir);
    
    try {
        const contractsExists = await fs.access(contractsDir).then(() => true).catch(() => false);
        console.log('📁 Contracts directory exists:', contractsExists);
        
        if (contractsExists) {
            const files = await fs.readdir(contractsDir);
            console.log('📁 Files in contracts directory:', files);
            
            const pdfFiles = files.filter(file => file.endsWith('.pdf'));
            console.log('📄 PDF files in contracts directory:', pdfFiles);
        }
    } catch (error) {
        console.error('❌ Error accessing contracts directory:', error);
    }
    
    // Test the exact path that the API would use
    console.log('\n🧪 Testing API path logic...');
    const testFileName = 'Purple Spider.pdf';
    const apiFilePath = path.join(__dirname, '../contracts', testFileName);
    console.log('🔍 API would look for file at:', apiFilePath);
    
    try {
        const apiFileExists = await fs.access(apiFilePath).then(() => true).catch(() => false);
        console.log('🔍 File exists at API path:', apiFileExists);
        
        if (apiFileExists) {
            const stats = await fs.stat(apiFilePath);
            console.log('📄 File stats:', {
                size: stats.size,
                modified: stats.mtime
            });
        }
    } catch (error) {
        console.error('❌ Error checking API file path:', error);
    }
    
    // Test the path from the API directory
    console.log('\n🧪 Testing path from API directory...');
    const apiDir = path.join(__dirname, 'api');
    console.log('📁 API directory:', apiDir);
    
    const apiContractsDir = path.join(apiDir, '../contracts');
    console.log('📁 API contracts directory:', apiContractsDir);
    
    try {
        const apiContractsExists = await fs.access(apiContractsDir).then(() => true).catch(() => false);
        console.log('📁 API contracts directory exists:', apiContractsExists);
        
        if (apiContractsExists) {
            const files = await fs.readdir(apiContractsDir);
            console.log('📁 Files in API contracts directory:', files);
            
            const pdfFiles = files.filter(file => file.endsWith('.pdf'));
            console.log('📄 PDF files in API contracts directory:', pdfFiles);
            
            // Test specific file
            const testFile = path.join(apiContractsDir, testFileName);
            const testFileExists = await fs.access(testFile).then(() => true).catch(() => false);
            console.log(`🔍 Test file "${testFileName}" exists at API path:`, testFileExists);
        }
    } catch (error) {
        console.error('❌ Error checking API contracts directory:', error);
    }
    
    // Test the exact path from delete-pdf.js
    console.log('\n🧪 Testing exact delete-pdf.js path...');
    const deletePdfPath = path.join(__dirname, 'api', '../contracts', testFileName);
    console.log('🔍 delete-pdf.js would look for file at:', deletePdfPath);
    
    try {
        const deletePdfFileExists = await fs.access(deletePdfPath).then(() => true).catch(() => false);
        console.log('🔍 File exists at delete-pdf.js path:', deletePdfFileExists);
        
        if (deletePdfFileExists) {
            const stats = await fs.stat(deletePdfPath);
            console.log('📄 File stats at delete-pdf.js path:', {
                size: stats.size,
                modified: stats.mtime
            });
        }
    } catch (error) {
        console.error('❌ Error checking delete-pdf.js file path:', error);
    }
}

// Run the test
testPdfPathDebug().catch(console.error); 