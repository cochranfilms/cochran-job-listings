#!/usr/bin/env node

/**
 * Test API endpoint
 * Checks if /api/users is working and returns the expected data
 */

const fetch = require('node-fetch');

async function testAPI() {
    console.log('🔍 Testing API Endpoint...\n');
    
    try {
        // Test the API endpoint
        console.log('📡 Testing /api/users endpoint...');
        const response = await fetch('http://collaborate.cochranfilms.com/api/users');
        
        console.log(`📊 Response status: ${response.status}`);
        console.log(`📊 Response headers:`, response.headers.get('content-type'));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API call successful!');
            console.log(`📊 Total users: ${data.totalUsers || 0}`);
            console.log(`📊 Has users object: ${!!data.users}`);
            
            if (data.users) {
                console.log('👥 Users found:');
                Object.keys(data.users).forEach(name => {
                    const user = data.users[name];
                    console.log(`   - ${name}: ${user.profile?.email || 'No email'}`);
                });
                
                // Check for Cody Cochran specifically
                const codyUser = data.users['Cody Cochran'];
                if (codyUser) {
                    console.log('\n✅ Cody Cochran found in API data:');
                    console.log(`   - Email: ${codyUser.profile?.email}`);
                    console.log(`   - Password: ${codyUser.profile?.password}`);
                    console.log(`   - Contract Status: ${codyUser.contract?.contractStatus}`);
                    console.log(`   - Contract ID: ${codyUser.contract?.contractId}`);
                } else {
                    console.log('\n❌ Cody Cochran NOT found in API data');
                }
            } else {
                console.log('❌ No users object in API response');
            }
        } else {
            console.log('❌ API call failed');
            const errorText = await response.text();
            console.log(`Error: ${errorText}`);
        }
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

// Run the test
testAPI().catch(console.error); 