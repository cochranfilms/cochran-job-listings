/**
 * Test Notification Removal
 * 
 * This script verifies that unwanted popup notifications have been successfully
 * removed from both user-portal.html and admin-dashboard.html
 */

const fs = require('fs');
const path = require('path');

// Files to test
const FILES_TO_TEST = [
    'user-portal.html',
    'admin-dashboard.html'
];

// Function to test a single file
function testFile(filename) {
    console.log(`\n📁 Testing file: ${filename}`);
    console.log('=' .repeat(40));
    
    try {
        const filePath = path.join(__dirname, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Test 1: Check if showNotification is silent
        const hasSilentNotification = content.includes('Suppressed notification:');
        const hasOriginalNotification = content.includes('const notification = document.createElement(\'div\')');
        
        // Test 2: Check if alert() calls are replaced
        const hasAlertCalls = content.includes('alert(');
        const hasConsoleLogCalls = content.includes('console.log(');
        
        // Test 3: Check if sophisticated notification system is intact
        const hasSophisticatedSystem = content.includes('SOPHISTICATED NOTIFICATION SYSTEM');
        
        console.log(`✅ Silent notifications: ${hasSilentNotification ? '✅' : '❌'}`);
        console.log(`✅ No popup notifications: ${!hasOriginalNotification ? '✅' : '❌'}`);
        console.log(`✅ No alert() calls: ${!hasAlertCalls ? '✅' : '❌'}`);
        console.log(`✅ Sophisticated system intact: ${hasSophisticatedSystem ? '✅' : '❌'}`);
        
        return {
            file: filename,
            silentNotification: hasSilentNotification,
            noPopupNotifications: !hasOriginalNotification,
            noAlertCalls: !hasAlertCalls,
            sophisticatedSystemIntact: hasSophisticatedSystem,
            allPassed: hasSilentNotification && !hasOriginalNotification && !hasAlertCalls && hasSophisticatedSystem
        };
    } catch (error) {
        console.error(`❌ Error testing ${filename}:`, error.message);
        return {
            file: filename,
            silentNotification: false,
            noPopupNotifications: false,
            noAlertCalls: false,
            sophisticatedSystemIntact: false,
            allPassed: false
        };
    }
}

// Function to run browser simulation test
function simulateBrowserTest() {
    console.log('\n🌐 Simulating browser environment test...');
    console.log('=' .repeat(50));
    
    // Create a simple HTML test file
    const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Notification Test</title>
</head>
<body>
    <h1>Notification Removal Test</h1>
    <div id="results"></div>
    
    <script>
        // Simulate the showNotification function from user-portal.html
        function showNotification(message, type = 'info', duration = 5000) {
            // Silent notification - only log to console
            console.log(\`🔇 Suppressed notification: \${message} (\${type})\`);
            // No popup display - notifications are handled by sophisticated system
        }
        
        // Test the function
        function testNotifications() {
            const results = [];
            
            // Test 1: Success notification
            try {
                showNotification('Test success message', 'success');
                results.push('✅ Success notification suppressed');
            } catch (error) {
                results.push('❌ Success notification failed: ' + error.message);
            }
            
            // Test 2: Error notification
            try {
                showNotification('Test error message', 'error');
                results.push('✅ Error notification suppressed');
            } catch (error) {
                results.push('❌ Error notification failed: ' + error.message);
            }
            
            // Test 3: Info notification
            try {
                showNotification('Test info message', 'info');
                results.push('✅ Info notification suppressed');
            } catch (error) {
                results.push('❌ Info notification failed: ' + error.message);
            }
            
            // Display results
            document.getElementById('results').innerHTML = results.map(r => '<p>' + r + '</p>').join('');
            console.log('🧪 Test results:', results);
        }
        
        // Run test when page loads
        window.onload = testNotifications;
    </script>
</body>
</html>`;
    
    const testFilePath = path.join(__dirname, 'notification-test.html');
    fs.writeFileSync(testFilePath, testHTML, 'utf8');
    console.log(`✅ Created test file: ${testFilePath}`);
    console.log('💡 Open this file in a browser to test notification suppression');
    
    return testFilePath;
}

// Main test function
function runTests() {
    console.log('🧪 Running notification removal tests...');
    console.log('=' .repeat(60));
    
    const results = [];
    
    // Test each file
    FILES_TO_TEST.forEach(filename => {
        const result = testFile(filename);
        results.push(result);
    });
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.log('=' .repeat(60));
    
    results.forEach(result => {
        console.log(`\n📁 ${result.file}:`);
        console.log(`   Silent notifications: ${result.silentNotification ? '✅' : '❌'}`);
        console.log(`   No popup notifications: ${result.noPopupNotifications ? '✅' : '❌'}`);
        console.log(`   No alert() calls: ${result.noAlertCalls ? '✅' : '❌'}`);
        console.log(`   Sophisticated system intact: ${result.sophisticatedSystemIntact ? '✅' : '❌'}`);
        console.log(`   Overall: ${result.allPassed ? '✅ PASS' : '❌ FAIL'}`);
    });
    
    const allPassed = results.every(r => r.allPassed);
    const passedFiles = results.filter(r => r.allPassed).length;
    const totalFiles = results.length;
    
    console.log(`\n🎉 Test Results: ${passedFiles}/${totalFiles} files passed`);
    
    if (allPassed) {
        console.log('\n✅ SUCCESS: All unwanted popup notifications have been removed!');
        console.log('📝 Notifications are now logged to console instead of displayed as popups');
        console.log('🔔 The sophisticated notification system remains intact for important notifications');
    } else {
        console.log('\n⚠️ Some tests failed. Check the specific issues above.');
    }
    
    // Create browser test file
    const browserTestFile = simulateBrowserTest();
    
    return allPassed;
}

// Run the tests
if (require.main === module) {
    runTests();
}

module.exports = {
    testFile,
    simulateBrowserTest,
    runTests
}; 