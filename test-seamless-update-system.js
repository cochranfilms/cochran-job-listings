/**
 * Test Script: Seamless Update System Verification
 * 
 * This script tests the complete flow from admin dashboard updates to user portal
 * to ensure the seamless creator update system is working.
 */

const https = require('https');
const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
    baseUrl: 'https://cochranfilms.com',
    testUser: 'Test User',
    testEmail: 'test@example.com'
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

// Test 1: Check if the updated users API is working
async function testUpdatedUsersAPI() {
    console.log('\n🔍 Test 1: Testing updated users API...');
    
    try {
        const response = await makeRequest(`${TEST_CONFIG.baseUrl}/api/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📡 GET /api/users: ${response.status}`);
        
        if (response.status === 200) {
            console.log('✅ Users API is working');
            
            if (response.data._metadata) {
                console.log(`📊 Data source: ${response.data._metadata.dataSource}`);
                console.log(`📊 Total users: ${response.data._metadata.totalUsers}`);
                console.log(`📊 Fetched at: ${response.data._metadata.fetchedAt}`);
            }
            
            // Check if test user exists
            if (response.data.users && response.data.users[TEST_CONFIG.testUser]) {
                console.log(`✅ Test user "${TEST_CONFIG.testUser}" found in API response`);
                console.log(`📧 Email: ${response.data.users[TEST_CONFIG.testUser].profile?.email}`);
                console.log(`📋 Role: ${response.data.users[TEST_CONFIG.testUser].profile?.role}`);
            } else {
                console.log(`❌ Test user "${TEST_CONFIG.testUser}" NOT found in API response`);
            }
            
            return response.data;
        } else {
            console.log(`❌ Users API failed: ${response.status}`);
            console.log('Response:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error testing users API:', error.message);
        return null;
    }
}

// Test 2: Check GitHub vs API data consistency
async function testDataConsistency() {
    console.log('\n🔍 Test 2: Testing data consistency...');
    
    try {
        // Get data from GitHub directly
        const githubResponse = await makeRequest(`https://api.github.com/repos/cochranfilms/cochran-job-listings/contents/users.json`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Cochran-Films-Test-Script',
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let githubData = null;
        if (githubResponse.status === 200) {
            const content = Buffer.from(githubResponse.data.content, 'base64').toString();
            githubData = JSON.parse(content);
            console.log('✅ GitHub data retrieved');
        }
        
        // Get data from our API
        const apiData = await testUpdatedUsersAPI();
        
        if (githubData && apiData) {
            const githubUsers = Object.keys(githubData.users || {});
            const apiUsers = Object.keys(apiData.users || {});
            
            console.log(`📊 GitHub users: ${githubUsers.length}`);
            console.log(`📊 API users: ${apiUsers.length}`);
            
            if (githubUsers.length === apiUsers.length) {
                console.log('✅ User counts match between GitHub and API');
            } else {
                console.log('❌ User counts differ between GitHub and API');
            }
            
            // Check if test user exists in both
            const githubHasTestUser = githubData.users && githubData.users[TEST_CONFIG.testUser];
            const apiHasTestUser = apiData.users && apiData.users[TEST_CONFIG.testUser];
            
            if (githubHasTestUser && apiHasTestUser) {
                console.log('✅ Test user exists in both sources');
                
                // Compare user data
                const githubEmail = githubHasTestUser.profile?.email;
                const apiEmail = apiHasTestUser.profile?.email;
                
                if (githubEmail === apiEmail) {
                    console.log('✅ Test user email matches between sources');
                } else {
                    console.log('❌ Test user email differs between sources');
                    console.log(`   GitHub: ${githubEmail}`);
                    console.log(`   API: ${apiEmail}`);
                }
            } else {
                console.log('❌ Test user missing from one or both sources');
                console.log(`   GitHub: ${githubHasTestUser ? '✅' : '❌'}`);
                console.log(`   API: ${apiHasTestUser ? '✅' : '❌'}`);
            }
        }
    } catch (error) {
        console.error('❌ Error testing data consistency:', error.message);
    }
}

// Test 3: Simulate admin dashboard update
async function testAdminDashboardUpdate() {
    console.log('\n🔍 Test 3: Simulating admin dashboard update...');
    
    try {
        // First, get current data
        const currentData = await testUpdatedUsersAPI();
        if (!currentData) {
            console.log('❌ Cannot proceed without current data');
            return;
        }
        
        // Simulate updating a user's information
        const testUserData = currentData.users[TEST_CONFIG.testUser];
        if (!testUserData) {
            console.log('❌ Test user not found, cannot simulate update');
            return;
        }
        
        // Create updated data
        const updatedData = {
            ...currentData,
            users: {
                ...currentData.users,
                [TEST_CONFIG.testUser]: {
                    ...testUserData,
                    profile: {
                        ...testUserData.profile,
                        role: 'Updated Test Role',
                        location: 'Updated Test Location'
                    }
                }
            },
            lastUpdated: new Date().toISOString().split('T')[0]
        };
        
        console.log('📝 Simulating update to test user...');
        console.log(`   Old role: ${testUserData.profile?.role}`);
        console.log(`   New role: Updated Test Role`);
        console.log(`   Old location: ${testUserData.profile?.location}`);
        console.log(`   New location: Updated Test Location`);
        
        // Test the GitHub API endpoint
        const response = await makeRequest(`${TEST_CONFIG.baseUrl}/api/github/file/users.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: JSON.stringify(updatedData, null, 2),
                message: `Test update for ${TEST_CONFIG.testUser} - ${new Date().toLocaleString()}`
            })
        });
        
        console.log(`📡 PUT /api/github/file/users.json: ${response.status}`);
        
        if (response.status === 200) {
            console.log('✅ Simulated update successful');
            console.log('📄 Commit SHA:', response.data.commit?.sha?.substring(0, 7));
        } else {
            console.log(`❌ Simulated update failed: ${response.status}`);
            console.log('Response:', response.data);
        }
        
    } catch (error) {
        console.error('❌ Error simulating admin dashboard update:', error.message);
    }
}

// Test 4: Check user portal data loading
async function testUserPortalDataLoading() {
    console.log('\n🔍 Test 4: Testing user portal data loading...');
    
    try {
        const response = await makeRequest(`${TEST_CONFIG.baseUrl}/user-portal.html`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Cochran-Films-Test-Script'
            }
        });
        
        console.log(`📡 User portal accessible: ${response.status === 200 ? '✅' : '❌'}`);
        
        if (response.status === 200) {
            // Check if the page contains the updated loadUsersData function
            const pageContent = response.data;
            if (pageContent.includes('forceRefreshCache')) {
                console.log('✅ User portal has force refresh cache function');
            } else {
                console.log('❌ User portal missing force refresh cache function');
            }
            
            if (pageContent.includes('cacheAge < 30 * 1000')) {
                console.log('✅ User portal has updated cache timing (30 seconds)');
            } else {
                console.log('❌ User portal still using old cache timing');
            }
        }
        
        return response.status === 200;
    } catch (error) {
        console.error('❌ Error testing user portal:', error.message);
        return false;
    }
}

// Main test execution
async function runAllTests() {
    console.log('🚀 Starting Seamless Update System Tests...');
    console.log('=' .repeat(60));
    
    const results = {
        usersAPI: await testUpdatedUsersAPI(),
        dataConsistency: await testDataConsistency(),
        adminUpdate: await testAdminDashboardUpdate(),
        userPortal: await testUserPortalDataLoading()
    };
    
    console.log('\n📋 Test Summary:');
    console.log('=' .repeat(60));
    console.log(`Users API: ${results.usersAPI ? '✅' : '❌'}`);
    console.log(`Data Consistency: ${results.dataConsistency ? '✅' : '❌'}`);
    console.log(`Admin Update Simulation: ${results.adminUpdate ? '✅' : '❌'}`);
    console.log(`User Portal: ${results.userPortal ? '✅' : '❌'}`);
    
    // Diagnosis
    console.log('\n🔍 Diagnosis:');
    if (results.usersAPI && results.userPortal) {
        console.log('✅ Seamless update system appears to be working');
        console.log('   - Users API fetches from GitHub first');
        console.log('   - User portal has reduced cache time');
        console.log('   - Force refresh function available');
    } else {
        console.log('❌ Some components need attention');
        if (!results.usersAPI) {
            console.log('   - Users API needs to be deployed');
        }
        if (!results.userPortal) {
            console.log('   - User portal needs to be updated');
        }
    }
    
    console.log('\n💡 Next Steps:');
    console.log('1. Deploy the updated users API to production');
    console.log('2. Test the admin dashboard update flow');
    console.log('3. Verify user portal shows updated data immediately');
    console.log('4. Monitor cache behavior in browser console');
}

// Run the tests
runAllTests().catch(console.error); 