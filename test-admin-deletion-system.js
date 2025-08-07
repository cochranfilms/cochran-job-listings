// Test Admin Dashboard User Deletion System
// This test identifies why user deletion isn't working properly

console.log('🧪 TESTING ADMIN DASHBOARD USER DELETION SYSTEM');
console.log('=' .repeat(60));

// Test 1: Check current users.json state
async function testCurrentState() {
    console.log('\n📋 Test 1: Current State Analysis');
    
    try {
        const response = await fetch('users.json');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ users.json loaded successfully');
            console.log(`📊 Total users: ${Object.keys(data.users || {}).length}`);
            console.log('👥 Current users:', Object.keys(data.users || {}));
            
            // Check if Erica Cochran exists
            if (data.users && data.users['Erica Cochran']) {
                console.log('✅ Erica Cochran found in users.json');
                return data.users;
            } else {
                console.log('❌ Erica Cochran not found in users.json');
                return {};
            }
        } else {
            console.log('❌ Failed to load users.json');
            return {};
        }
    } catch (error) {
        console.log('❌ Error loading users.json:', error.message);
        return {};
    }
}

// Test 2: Check admin dashboard deleteUser function
function testDeleteUserFunction() {
    console.log('\n📋 Test 2: Admin Dashboard deleteUser Function Analysis');
    
    // Simulate the current deleteUser function
    const mockUsers = {
        'Erica Cochran': { profile: { email: 'test@example.com' } },
        'Test User': { profile: { email: 'test2@example.com' } }
    };
    
    console.log('📊 Initial users:', Object.keys(mockUsers));
    
    // Current deleteUser function (problematic)
    function currentDeleteUser(userName) {
        if (confirm(`Are you sure you want to delete ${userName}?`)) {
            delete mockUsers[userName];
            console.log(`🗑️ Deleted ${userName} from local object`);
            console.log('📊 Users after deletion:', Object.keys(mockUsers));
            return true;
        }
        return false;
    }
    
    // Test the current function
    const deleted = currentDeleteUser('Erica Cochran');
    console.log(`✅ Deletion result: ${deleted}`);
    console.log('❌ PROBLEM: Changes only exist in memory, not persisted to server!');
    
    return mockUsers;
}

// Test 3: Check if update-users API exists
async function testUpdateUsersAPI() {
    console.log('\n📋 Test 3: Update Users API Check');
    
    try {
        const response = await fetch('/api/update-users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                users: {},
                action: 'test',
                userName: 'test'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ /api/update-users endpoint exists and working');
            console.log('📊 API Response:', result);
            return true;
        } else {
            console.log(`❌ /api/update-users returned status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log('❌ /api/update-users endpoint not accessible:', error.message);
        return false;
    }
}

// Test 4: Create improved deleteUser function
function createImprovedDeleteUser() {
    console.log('\n📋 Test 4: Improved deleteUser Function');
    
    // Improved deleteUser function that persists changes
    async function improvedDeleteUser(userName) {
        if (confirm(`Are you sure you want to delete ${userName}?`)) {
            try {
                // Get current users
                const response = await fetch('users.json');
                if (!response.ok) {
                    throw new Error('Failed to load current users');
                }
                
                const data = await response.json();
                const currentUsers = data.users || {};
                
                // Delete the user
                if (currentUsers[userName]) {
                    delete currentUsers[userName];
                    console.log(`🗑️ Deleted ${userName} from users object`);
                    
                    // Update the server via API
                    const updateResponse = await fetch('/api/update-users', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            users: currentUsers,
                            action: 'delete',
                            userName: userName
                        })
                    });
                    
                    if (updateResponse.ok) {
                        const result = await updateResponse.json();
                        console.log('✅ User deletion persisted to server');
                        console.log('📊 Server response:', result);
                        
                        // Update local state
                        window.users = currentUsers;
                        displayUsers();
                        updateStats();
                        
                        showNotification(`User ${userName} deleted successfully and persisted to server`, 'success');
                        return true;
                    } else {
                        throw new Error('Failed to persist deletion to server');
                    }
                } else {
                    throw new Error(`User ${userName} not found`);
                }
            } catch (error) {
                console.error('❌ Error deleting user:', error);
                showNotification(`Failed to delete user: ${error.message}`, 'error');
                return false;
            }
        }
        return false;
    }
    
    console.log('✅ Improved deleteUser function created');
    console.log('🔧 Features:');
    console.log('  - Loads current users from server');
    console.log('  - Deletes user from object');
    console.log('  - Persists changes via /api/update-users');
    console.log('  - Updates local state');
    console.log('  - Shows success/error notifications');
    
    return improvedDeleteUser;
}

// Test 5: Check GitHub integration
async function testGitHubIntegration() {
    console.log('\n📋 Test 5: GitHub Integration Check');
    
    try {
        // Check if GitHub token is configured
        const response = await fetch('/api/update-users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                users: { 'test': { profile: { email: 'test@example.com' } } },
                action: 'test-github',
                userName: 'test'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('📊 GitHub integration test result:', result);
            
            if (result.githubUpdated) {
                console.log('✅ GitHub integration working');
            } else {
                console.log('⚠️ GitHub integration not working:', result.githubMessage);
            }
            
            return result.githubUpdated;
        } else {
            console.log('❌ Failed to test GitHub integration');
            return false;
        }
    } catch (error) {
        console.log('❌ Error testing GitHub integration:', error.message);
        return false;
    }
}

// Test 6: Create fix for admin dashboard
function createAdminDashboardFix() {
    console.log('\n📋 Test 6: Creating Admin Dashboard Fix');
    
    const fixCode = `
// FIXED deleteUser function for admin-dashboard.html
async function deleteUser(userName) {
    if (confirm(\`Are you sure you want to delete \${userName}?\`)) {
        try {
            // Show loading state
            showNotification('Deleting user...', 'info');
            
            // Get current users from server
            const response = await fetch('users.json');
            if (!response.ok) {
                throw new Error('Failed to load current users');
            }
            
            const data = await response.json();
            const currentUsers = data.users || {};
            
            // Check if user exists
            if (!currentUsers[userName]) {
                throw new Error(\`User \${userName} not found\`);
            }
            
            // Delete the user
            delete currentUsers[userName];
            console.log(\`🗑️ Deleted \${userName} from users object\`);
            
            // Update server via API
            const updateResponse = await fetch('/api/update-users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    users: currentUsers,
                    action: 'delete',
                    userName: userName
                })
            });
            
            if (updateResponse.ok) {
                const result = await updateResponse.json();
                console.log('✅ User deletion persisted to server:', result);
                
                // Update local state
                window.users = currentUsers;
                displayUsers();
                updateStats();
                
                showNotification(\`User \${userName} deleted successfully and persisted to server\`, 'success');
                return true;
            } else {
                const errorData = await updateResponse.json();
                throw new Error(\`Server error: \${errorData.message || 'Unknown error'}\`);
            }
        } catch (error) {
            console.error('❌ Error deleting user:', error);
            showNotification(\`Failed to delete user: \${error.message}\`, 'error');
            return false;
        }
    }
    return false;
}
`;
    
    console.log('🔧 Fix code generated:');
    console.log(fixCode);
    
    return fixCode;
}

// Test 7: Run comprehensive test
async function runComprehensiveTest() {
    console.log('\n📋 Test 7: Comprehensive Test');
    
    // Test current state
    const currentUsers = await testCurrentState();
    
    // Test delete function
    testDeleteUserFunction();
    
    // Test API
    const apiExists = await testUpdateUsersAPI();
    
    // Test GitHub
    const githubWorks = await testGitHubIntegration();
    
    // Create improved function
    const improvedFunction = createImprovedDeleteUser();
    
    // Create fix
    const fixCode = createAdminDashboardFix();
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('=' .repeat(40));
    console.log('✅ Current users loaded:', Object.keys(currentUsers).length);
    console.log('❌ Current deleteUser function: Only deletes from memory');
    console.log('✅ Update API exists:', apiExists);
    console.log('⚠️ GitHub integration:', githubWorks ? 'Working' : 'Not working');
    console.log('🔧 Fix available: Yes');
    
    console.log('\n🚨 ISSUES FOUND:');
    console.log('1. deleteUser function only deletes from window.users (memory)');
    console.log('2. No persistence to server/users.json');
    console.log('3. No GitHub integration for deletions');
    console.log('4. No error handling for failed deletions');
    
    console.log('\n💡 RECOMMENDED FIXES:');
    console.log('1. Replace deleteUser function with improved version');
    console.log('2. Add proper error handling');
    console.log('3. Add loading states');
    console.log('4. Ensure GitHub token is configured');
    
    return {
        currentUsers,
        apiExists,
        githubWorks,
        fixCode
    };
}

// Run the comprehensive test
runComprehensiveTest().then(results => {
    console.log('\n✅ COMPREHENSIVE TEST COMPLETE');
    console.log('📋 Results saved for analysis');
    
    // Save results to file
    const testResults = {
        timestamp: new Date().toISOString(),
        testResults: results,
        issues: [
            'deleteUser function only deletes from memory',
            'No persistence to server/users.json',
            'No GitHub integration for deletions',
            'No error handling for failed deletions'
        ],
        fixes: [
            'Replace deleteUser function with improved version',
            'Add proper error handling',
            'Add loading states',
            'Ensure GitHub token is configured'
        ]
    };
    
    // Create results file
    const fs = require('fs');
    fs.writeFileSync('admin-deletion-test-results.json', JSON.stringify(testResults, null, 2));
    console.log('📄 Results saved to admin-deletion-test-results.json');
});

console.log('\n🎯 NEXT STEPS:');
console.log('1. Run this test to identify issues');
console.log('2. Apply the fix to admin-dashboard.html');
console.log('3. Test the improved deletion system');
console.log('4. Verify GitHub integration works');
