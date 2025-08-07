/**
 * Test Contract Generation Script
 * 
 * This script generates a test contract PDF and connects it to "Test User"
 * for testing the delete PDF function
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
    testUser: 'Test User',
    contractId: 'CF-TEST-DELETE-001',
    fileName: 'Test User.pdf'
};

// Generate a simple test contract PDF content
function generateTestContractPDF() {
    console.log('📄 Generating test contract PDF...');
    
    // Create a simple HTML-based PDF content
    const contractHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Contract - ${TEST_CONFIG.testUser}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #FFB200; padding-bottom: 20px; }
        .section { margin: 20px 0; }
        .info-item { margin: 10px 0; }
        .label { font-weight: bold; }
        .signature { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>COCHRAN FILMS</h1>
        <h2>FREELANCE CONTRACT AGREEMENT</h2>
        <p>Contract ID: ${TEST_CONFIG.contractId}</p>
    </div>
    
    <div class="section">
        <h3>CONTRACTOR INFORMATION</h3>
        <div class="info-item">
            <span class="label">Name:</span> ${TEST_CONFIG.testUser}
        </div>
        <div class="info-item">
            <span class="label">Email:</span> test@example.com
        </div>
        <div class="info-item">
            <span class="label">Role:</span> Editor
        </div>
        <div class="info-item">
            <span class="label">Location:</span> Test City, GA
        </div>
        <div class="info-item">
            <span class="label">Rate:</span> $200
        </div>
        <div class="info-item">
            <span class="label">Effective Date:</span> ${new Date().toLocaleDateString()}
        </div>
    </div>
    
    <div class="section">
        <h3>CONTRACT TERMS</h3>
        <p>This is a test contract for the delete PDF function testing.</p>
        <p>Contractor agrees to provide professional services as specified.</p>
        <p>Payment will be made within 24 hours of completion.</p>
    </div>
    
    <div class="signature">
        <h3>SIGNATURES</h3>
        <div class="info-item">
            <span class="label">Company:</span> Cody Cochran (Cochran Films)
        </div>
        <div class="info-item">
            <span class="label">Contractor:</span> ${TEST_CONFIG.testUser}
        </div>
        <div class="info-item">
            <span class="label">Date:</span> ${new Date().toLocaleDateString()}
        </div>
    </div>
    
    <div style="margin-top: 40px; font-size: 12px; color: #666; text-align: center;">
        <p>This is a test contract generated for delete PDF function testing.</p>
        <p>Contract ID: ${TEST_CONFIG.contractId}</p>
    </div>
</body>
</html>
    `;
    
    return contractHTML;
}

// Create test contract file
function createTestContract() {
    try {
        console.log('📁 Creating test contract file...');
        
        // Ensure contracts directory exists
        const contractsDir = path.join(__dirname, 'contracts');
        if (!fs.existsSync(contractsDir)) {
            fs.mkdirSync(contractsDir, { recursive: true });
            console.log('✅ Created contracts directory');
        }
        
        // Create the test contract file
        const contractPath = path.join(contractsDir, TEST_CONFIG.fileName);
        const contractContent = generateTestContractPDF();
        
        fs.writeFileSync(contractPath, contractContent, 'utf8');
        console.log(`✅ Created test contract: ${contractPath}`);
        
        // Verify file was created
        if (fs.existsSync(contractPath)) {
            const stats = fs.statSync(contractPath);
            console.log(`📊 File size: ${stats.size} bytes`);
            console.log(`📅 Created: ${stats.birthtime}`);
        }
        
        return contractPath;
    } catch (error) {
        console.error('❌ Error creating test contract:', error.message);
        return null;
    }
}

// Update users.json to connect the contract to Test User
function updateUsersJsonWithContract() {
    try {
        console.log('📝 Updating users.json with test contract...');
        
        const usersPath = path.join(__dirname, 'users.json');
        const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        
        // Find Test User
        const testUser = usersData.users[TEST_CONFIG.testUser];
        if (!testUser) {
            console.error('❌ Test User not found in users.json');
            return false;
        }
        
        // Update Test User's contract information
        testUser.contract = {
            contractId: TEST_CONFIG.contractId,
            fileName: TEST_CONFIG.fileName,
            status: "signed",
            signedDate: new Date().toLocaleString(),
            uploadDate: new Date().toLocaleString(),
            githubUrl: `https://github.com/cochranfilms/cochran-job-listings/blob/main/contracts/${TEST_CONFIG.fileName}`
        };
        
        // Write updated users.json
        fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2), 'utf8');
        console.log('✅ Updated users.json with test contract');
        
        return true;
    } catch (error) {
        console.error('❌ Error updating users.json:', error.message);
        return false;
    }
}

// Test the delete PDF function
function testDeletePDFFunction() {
    console.log('🧪 Testing delete PDF function...');
    
    try {
        // Simulate the delete PDF API call
        const deleteUrl = `/api/delete-pdf?filename=${encodeURIComponent(TEST_CONFIG.fileName)}`;
        console.log(`📤 Delete URL: ${deleteUrl}`);
        
        // Check if the file exists before deletion
        const contractPath = path.join(__dirname, 'contracts', TEST_CONFIG.fileName);
        const fileExists = fs.existsSync(contractPath);
        console.log(`📁 File exists before deletion: ${fileExists ? '✅' : '❌'}`);
        
        if (fileExists) {
            console.log('✅ Test contract file is ready for deletion testing');
            console.log('💡 You can now test the delete PDF function in the admin dashboard');
        } else {
            console.log('❌ Test contract file not found');
        }
        
        return fileExists;
    } catch (error) {
        console.error('❌ Error testing delete PDF function:', error.message);
        return false;
    }
}

// Main execution
function runTestContractSetup() {
    console.log('🚀 Setting up test contract for delete PDF function...');
    console.log('=' .repeat(60));
    
    const results = {
        contractCreated: createTestContract() !== null,
        usersUpdated: updateUsersJsonWithContract(),
        deleteTestReady: testDeletePDFFunction()
    };
    
    console.log('\n📋 Test Setup Summary:');
    console.log('=' .repeat(60));
    console.log(`Contract Created: ${results.contractCreated ? '✅' : '❌'}`);
    console.log(`Users JSON Updated: ${results.usersUpdated ? '✅' : '❌'}`);
    console.log(`Delete Test Ready: ${results.deleteTestReady ? '✅' : '❌'}`);
    
    if (results.contractCreated && results.usersUpdated && results.deleteTestReady) {
        console.log('\n🎉 Test contract setup complete!');
        console.log('📋 Test Contract Details:');
        console.log(`   📄 File: contracts/${TEST_CONFIG.fileName}`);
        console.log(`   👤 User: ${TEST_CONFIG.testUser}`);
        console.log(`   🆔 Contract ID: ${TEST_CONFIG.contractId}`);
        console.log(`   📧 Email: test@example.com`);
        console.log(`   💰 Rate: $200`);
        
        console.log('\n🧪 Ready for Delete PDF Testing:');
        console.log('   1. Go to admin dashboard');
        console.log('   2. Navigate to contracts section');
        console.log('   3. Find "Test User" contract');
        console.log('   4. Test the delete PDF function');
    } else {
        console.log('\n❌ Test setup incomplete');
        console.log('   - Check the specific failed components above');
    }
    
    return results.contractCreated && results.usersUpdated && results.deleteTestReady;
}

// Run the test setup
runTestContractSetup(); 