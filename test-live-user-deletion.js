/**
 * Test Script: Diagnose GitHub Update Issues
 * 
 * This script tests the complete flow from admin dashboard updates to GitHub
 * and verifies if the user portal can see the changes.
 */

const https = require('https');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
    baseUrl: 'https://cochranfilms.com',
    githubRepo: 'cochranfilms/cochran-job-listings',
    testUser: 'Test User'
};

// Utility function to make HTTPS requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Test 1: Check current users.json on GitHub
async function testGitHubUsersJson() {
    console.log('\n🔍 Test 1: Checking current users.json on GitHub...');
    
    try {
        const url = `https://api.github.com/repos/${TEST_CONFIG.githubRepo}/contents/users.json`;
        const response = await makeRequest(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Cochran-Films-Test-Script',
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 200) {
            console.log('✅ users.json found on GitHub');
            console.log(`📄 SHA: ${response.data.sha.substring(0, 7)}`);
            console.log(`📅 Last updated: ${response.data.last_modified}`);
            
            // Decode and parse the content
            const content = Buffer.from(response.data.content, 'base64').toString();
            const usersData = JSON.parse(content);
            
            console.log(`👥 Total users: ${usersData.totalUsers || Object.keys(usersData.users || {}).length}`);
            
            if (usersData.users && usersData.users[TEST_CONFIG.testUser]) {
                console.log(`✅ Test user "${TEST_CONFIG.testUser}" found in GitHub`);
                console.log(`📧 Email: ${usersData.users[TEST_CONFIG.testUser].profile?.email}`);
                console.log(`📋 Role: ${usersData.users[TEST_CONFIG.testUser].profile?.role}`);
            } else {
                console.log(`❌ Test user "${TEST_CONFIG.testUser}" NOT found in GitHub`);
            }
            
            return usersData;
        } else {
            console.log(`❌ Failed to get users.json from GitHub: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error('❌ Error checking GitHub users.json:', error.message);
        return null;
    }
}

// Test 2: Check local users.json
async function testLocalUsersJson() {
    console.log('\n🔍 Test 2: Checking local users.json...');
    
    try {
        const localData = fs.readFileSync('users.json', 'utf8');
        const usersData = JSON.parse(localData);
        
        console.log(`👥 Total users: ${usersData.totalUsers || Object.keys(usersData.users || {}).length}`);
        
        if (usersData.users && usersData.users[TEST_CONFIG.testUser]) {
            console.log(`✅ Test user "${TEST_CONFIG.testUser}" found locally`);
            console.log(`📧 Email: ${usersData.users[TEST_CONFIG.testUser].profile?.email}`);
            console.log(`📋 Role: ${usersData.users[TEST_CONFIG.testUser].profile?.role}`);
        } else {
            console.log(`❌ Test user "${TEST_CONFIG.testUser}" NOT found locally`);
        }
        
        return usersData;
    } catch (error) {
        console.error('❌ Error reading local users.json:', error.message);
        return null;
    }
}

// Test 3: Test the GitHub API endpoint
async function testGitHubAPIEndpoint() {
    console.log('\n🔍 Test 3: Testing GitHub API endpoint...');
    
    try {
        // Test GET request
        const getResponse = await makeRequest(`${TEST_CONFIG.baseUrl}/api/github/file/users.json`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📡 GET /api/github/file/users.json: ${getResponse.status}`);
        if (getResponse.status === 200) {
            console.log('✅ GitHub API endpoint working for GET requests');
        } else {
            console.log(`❌ GitHub API endpoint failed: ${getResponse.status}`);
            console.log('Response:', getResponse.data);
        }
        
        return getResponse.status === 200;
    } catch (error) {
        console.error('❌ Error testing GitHub API endpoint:', error.message);
        return false;
    }
}

// Test 4: Check if admin dashboard can update users
async function testAdminDashboardUpdate() {
    console.log('\n🔍 Test 4: Testing admin dashboard update capability...');
    
    try {
        // This would require authentication, so we'll just check if the endpoint exists
        const response = await makeRequest(`${TEST_CONFIG.baseUrl}/admin-dashboard.html`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Cochran-Films-Test-Script'
            }
        });
        
        console.log(`📡 Admin dashboard accessible: ${response.status === 200 ? '✅' : '❌'}`);
        return response.status === 200;
    } catch (error) {
        console.error('❌ Error accessing admin dashboard:', error.message);
        return false;
    }
}

// Test 5: Check user portal data loading
async function testUserPortalDataLoading() {
    console.log('\n🔍 Test 5: Testing user portal data loading...');
    
    try {
        const response = await makeRequest(`${TEST_CONFIG.baseUrl}/user-portal.html`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Cochran-Films-Test-Script'
            }
        });
        
        console.log(`📡 User portal accessible: ${response.status === 200 ? '✅' : '❌'}`);
        return response.status === 200;
    } catch (error) {
        console.error('❌ Error accessing user portal:', error.message);
        return false;
    }
}

// Test 6: Compare local vs GitHub data
async function compareDataSources() {
    console.log('\n🔍 Test 6: Comparing data sources...');
    
    const localData = await testLocalUsersJson();
    const githubData = await testGitHubUsersJson();
    
    if (localData && githubData) {
        const localUsers = localData.users || {};
        const githubUsers = githubData.users || {};
        
        const localUserCount = Object.keys(localUsers).length;
        const githubUserCount = Object.keys(githubUsers).length;
        
        console.log(`📊 Local users: ${localUserCount}`);
        console.log(`📊 GitHub users: ${githubUserCount}`);
        
        if (localUserCount === githubUserCount) {
            console.log('✅ User counts match between local and GitHub');
        } else {
            console.log('❌ User counts differ between local and GitHub');
        }
        
        // Check if test user exists in both
        const localHasTestUser = localUsers[TEST_CONFIG.testUser];
        const githubHasTestUser = githubUsers[TEST_CONFIG.testUser];
        
        if (localHasTestUser && githubHasTestUser) {
            console.log('✅ Test user exists in both sources');
            
            // Compare user data
            const localEmail = localHasTestUser.profile?.email;
            const githubEmail = githubHasTestUser.profile?.email;
            
            if (localEmail === githubEmail) {
                console.log('✅ Test user email matches between sources');
            } else {
                console.log('❌ Test user email differs between sources');
                console.log(`   Local: ${localEmail}`);
                console.log(`   GitHub: ${githubEmail}`);
            }
        } else {
            console.log('❌ Test user missing from one or both sources');
            console.log(`   Local: ${localHasTestUser ? '✅' : '❌'}`);
            console.log(`   GitHub: ${githubHasTestUser ? '✅' : '❌'}`);
        }
    }
}

// Main test execution
async function runAllTests() {
    console.log('🚀 Starting GitHub Update Diagnosis Tests...');
    console.log('=' .repeat(60));
    
    const results = {
        githubUsersJson: await testGitHubUsersJson(),
        localUsersJson: await testLocalUsersJson(),
        githubAPIEndpoint: await testGitHubAPIEndpoint(),
        adminDashboard: await testAdminDashboardUpdate(),
        userPortal: await testUserPortalDataLoading()
    };
    
    await compareDataSources();
    
    console.log('\n📋 Test Summary:');
    console.log('=' .repeat(60));
    console.log(`GitHub users.json: ${results.githubUsersJson ? '✅' : '❌'}`);
    console.log(`Local users.json: ${results.localUsersJson ? '✅' : '❌'}`);
    console.log(`GitHub API endpoint: ${results.githubAPIEndpoint ? '✅' : '❌'}`);
    console.log(`Admin dashboard: ${results.adminDashboard ? '✅' : '❌'}`);
    console.log(`User portal: ${results.userPortal ? '✅' : '❌'}`);
    
    // Diagnosis
    console.log('\n🔍 Diagnosis:');
    if (!results.githubAPIEndpoint) {
        console.log('❌ GitHub API endpoint is not working - this is likely the main issue');
        console.log('   Check: Environment variables, API permissions, token validity');
    }
    
    if (results.githubUsersJson && results.localUsersJson) {
        console.log('✅ Both data sources are accessible');
        console.log('   Next: Check if admin dashboard is actually calling updateUsersOnGitHub()');
    }
    
    console.log('\n💡 Recommendations:');
    console.log('1. Check GitHub token permissions in environment variables');
    console.log('2. Verify admin dashboard is calling updateUsersOnGitHub() after edits');
    console.log('3. Check browser console for any JavaScript errors during updates');
    console.log('4. Verify the GitHub API endpoint is deployed and accessible');
}

// Run the tests
runAllTests().catch(console.error); 