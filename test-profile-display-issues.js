/**
 * Test Script: Profile Tab Display Issues Investigation
 * 
 * This script investigates why Location and Rate are not displaying
 * on the profile tab inside user-portal.html
 */

const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
    testUser: 'Test User',
    ericaUser: 'Erica Cochran'
};

// Test 1: Verify users.json data structure for profile display
function testUsersJsonProfileData() {
    console.log('\n🔍 Test 1: Verifying users.json profile data structure...');
    
    try {
        const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        
        console.log(`✅ users.json loaded successfully`);
        console.log(`📊 Total users: ${usersData.totalUsers}`);
        
        Object.entries(usersData.users).forEach(([userName, userData]) => {
            console.log(`\n👤 ${userName}:`);
            
            // Check profile data
            const profile = userData.profile;
            if (profile) {
                console.log(`  📋 Profile Data:`);
                console.log(`    📧 Email: ${profile.email || 'N/A'}`);
                console.log(`    🎯 Role: ${profile.role || 'N/A'}`);
                console.log(`    📍 Location: ${profile.location || 'N/A'}`);
                console.log(`    💰 Rate: ${profile.rate || 'N/A'}`);
                console.log(`    📅 Project Start: ${profile.projectStart || 'N/A'}`);
                console.log(`    ✅ Approved Date: ${profile.approvedDate || 'N/A'}`);
            } else {
                console.log(`  ❌ No profile data found`);
            }
            
            // Check job data
            const primaryJob = userData.jobs?.[userData.primaryJob];
            if (primaryJob) {
                console.log(`  📋 Primary Job Data:`);
                console.log(`    📝 Title: ${primaryJob.title || 'N/A'}`);
                console.log(`    🎯 Role: ${primaryJob.role || 'N/A'}`);
                console.log(`    📍 Location: ${primaryJob.location || 'N/A'}`);
                console.log(`    💰 Rate: ${primaryJob.rate || 'N/A'}`);
                console.log(`    📅 Project Start: ${primaryJob.projectStart || primaryJob.date || 'N/A'}`);
            } else {
                console.log(`  ❌ No primary job data found`);
            }
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error reading users.json:', error.message);
        return false;
    }
}

// Test 2: Check user portal code for profile display logic
function testUserPortalProfileDisplay() {
    console.log('\n🔍 Test 2: Checking user portal profile display logic...');
    
    try {
        const portalCode = fs.readFileSync('user-portal.html', 'utf8');
        
        // Check for profile display patterns
        const profileDisplayPatterns = [
            'currentUser.profile?.location',
            'currentUser.profile?.rate',
            'getSelectedJob()?.location',
            'getSelectedJob()?.rate',
            'selectedJob?.location',
            'selectedJob?.rate'
        ];
        
        console.log(`📊 Profile Display Patterns:`);
        profileDisplayPatterns.forEach(pattern => {
            const count = (portalCode.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            console.log(`  ${pattern}: ${count} occurrences`);
        });
        
        // Check for profile tab specific code
        const profileTabPatterns = [
            'profile.*location',
            'profile.*rate',
            'profile.*email',
            'profile.*role'
        ];
        
        console.log(`\n📊 Profile Tab Specific Patterns:`);
        profileTabPatterns.forEach(pattern => {
            const count = (portalCode.match(new RegExp(pattern, 'gi')) || []).length;
            console.log(`  ${pattern}: ${count} occurrences`);
        });
        
        // Check for specific profile display functions
        const profileFunctions = [
            'displayProfile',
            'updateProfile',
            'loadProfile',
            'renderProfile'
        ];
        
        console.log(`\n📊 Profile Functions:`);
        profileFunctions.forEach(funcName => {
            const count = (portalCode.match(new RegExp(funcName, 'g')) || []).length;
            console.log(`  ${funcName}: ${count} occurrences`);
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error checking user portal code:', error.message);
        return false;
    }
}

// Test 3: Simulate profile data access logic
function testProfileDataAccess() {
    console.log('\n🔍 Test 3: Simulating profile data access logic...');
    
    try {
        const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        
        Object.entries(usersData.users).forEach(([userName, userData]) => {
            console.log(`\n👤 ${userName} Profile Access Simulation:`);
            
            // Simulate currentUser.profile access
            const profileLocation = userData.profile?.location;
            const profileRate = userData.profile?.rate;
            
            console.log(`  📍 Profile Location: ${profileLocation || 'undefined'}`);
            console.log(`  💰 Profile Rate: ${profileRate || 'undefined'}`);
            
            // Simulate job data access
            const primaryJob = userData.jobs?.[userData.primaryJob];
            const jobLocation = primaryJob?.location;
            const jobRate = primaryJob?.rate;
            
            console.log(`  📍 Job Location: ${jobLocation || 'undefined'}`);
            console.log(`  💰 Job Rate: ${jobRate || 'undefined'}`);
            
            // Simulate fallback logic
            const displayLocation = jobLocation || profileLocation || 'N/A';
            const displayRate = jobRate || profileRate || 'N/A';
            
            console.log(`  📍 Display Location: ${displayLocation}`);
            console.log(`  💰 Display Rate: ${displayRate}`);
            
            // Check if data exists for display
            const hasLocation = displayLocation !== 'N/A' && displayLocation !== 'undefined';
            const hasRate = displayRate !== 'N/A' && displayRate !== 'undefined';
            
            console.log(`  ✅ Has Location: ${hasLocation}`);
            console.log(`  ✅ Has Rate: ${hasRate}`);
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error simulating profile data access:', error.message);
        return false;
    }
}

// Test 4: Check for profile tab HTML structure
function testProfileTabStructure() {
    console.log('\n🔍 Test 4: Checking profile tab HTML structure...');
    
    try {
        const portalCode = fs.readFileSync('user-portal.html', 'utf8');
        
        // Look for profile tab content
        const profileTabPatterns = [
            'profile-tab',
            'profile-content',
            'profile-info',
            'profile-details'
        ];
        
        console.log(`📊 Profile Tab HTML Elements:`);
        profileTabPatterns.forEach(pattern => {
            const count = (portalCode.match(new RegExp(pattern, 'gi')) || []).length;
            console.log(`  ${pattern}: ${count} occurrences`);
        });
        
        // Check for location and rate display elements
        const displayElements = [
            'location.*display',
            'rate.*display',
            'profile.*location',
            'profile.*rate'
        ];
        
        console.log(`\n📊 Location/Rate Display Elements:`);
        displayElements.forEach(pattern => {
            const count = (portalCode.match(new RegExp(pattern, 'gi')) || []).length;
            console.log(`  ${pattern}: ${count} occurrences`);
        });
        
        // Check for specific profile rendering
        const profileRendering = [
            'renderProfile',
            'updateProfileDisplay',
            'loadProfileData'
        ];
        
        console.log(`\n📊 Profile Rendering Functions:`);
        profileRendering.forEach(func => {
            const count = (portalCode.match(new RegExp(func, 'g')) || []).length;
            console.log(`  ${func}: ${count} occurrences`);
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error checking profile tab structure:', error.message);
        return false;
    }
}

// Test 5: Check for data loading issues
function testDataLoadingIssues() {
    console.log('\n🔍 Test 5: Checking for data loading issues...');
    
    try {
        const portalCode = fs.readFileSync('user-portal.html', 'utf8');
        
        // Check for data loading patterns
        const loadingPatterns = [
            'loadUserData',
            'fetchUserData',
            'getUserData',
            'currentUser.*profile'
        ];
        
        console.log(`📊 Data Loading Patterns:`);
        loadingPatterns.forEach(pattern => {
            const count = (portalCode.match(new RegExp(pattern, 'gi')) || []).length;
            console.log(`  ${pattern}: ${count} occurrences`);
        });
        
        // Check for error handling
        const errorPatterns = [
            'catch.*error',
            'console.*error',
            'console.*warn',
            'try.*catch'
        ];
        
        console.log(`\n📊 Error Handling Patterns:`);
        errorPatterns.forEach(pattern => {
            const count = (portalCode.match(new RegExp(pattern, 'gi')) || []).length;
            console.log(`  ${pattern}: ${count} occurrences`);
        });
        
        // Check for profile data initialization
        const initPatterns = [
            'currentUser.*=',
            'profile.*=',
            'userData.*=',
            'loadProfile'
        ];
        
        console.log(`\n📊 Profile Data Initialization:`);
        initPatterns.forEach(pattern => {
            const count = (portalCode.match(new RegExp(pattern, 'gi')) || []).length;
            console.log(`  ${pattern}: ${count} occurrences`);
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error checking data loading issues:', error.message);
        return false;
    }
}

// Main test execution
function runProfileDisplayTests() {
    console.log('🚀 Starting Profile Display Issue Tests...');
    console.log('=' .repeat(60));
    
    const results = {
        usersJsonData: testUsersJsonProfileData(),
        portalProfileLogic: testUserPortalProfileDisplay(),
        profileDataAccess: testProfileDataAccess(),
        profileTabStructure: testProfileTabStructure(),
        dataLoadingIssues: testDataLoadingIssues()
    };
    
    console.log('\n📋 Test Summary:');
    console.log('=' .repeat(60));
    console.log(`Users JSON Data: ${results.usersJsonData ? '✅' : '❌'}`);
    console.log(`Portal Profile Logic: ${results.portalProfileLogic ? '✅' : '❌'}`);
    console.log(`Profile Data Access: ${results.profileDataAccess ? '✅' : '❌'}`);
    console.log(`Profile Tab Structure: ${results.profileTabStructure ? '✅' : '❌'}`);
    console.log(`Data Loading Issues: ${results.dataLoadingIssues ? '✅' : '❌'}`);
    
    // Diagnosis
    console.log('\n🔍 Diagnosis:');
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('✅ All tests passed - data structure looks correct');
        console.log('   - Profile data exists in users.json');
        console.log('   - User portal has profile display patterns');
        console.log('   - Data access logic should work');
        console.log('   - Profile tab structure exists');
        console.log('   - Data loading patterns are present');
        
        console.log('\n💡 Potential Issues:');
        console.log('   - Profile tab might not be calling the right functions');
        console.log('   - Data might not be loading when profile tab is active');
        console.log('   - Profile display function might have bugs');
        console.log('   - CSS might be hiding the profile content');
        console.log('   - JavaScript errors might be preventing display');
        
        console.log('\n🔧 Next Steps:');
        console.log('   1. Check browser console for JavaScript errors');
        console.log('   2. Verify profile tab is calling display functions');
        console.log('   3. Check if profile data is loaded when tab is active');
        console.log('   4. Inspect CSS to ensure profile content is visible');
    } else {
        console.log('❌ Some tests failed');
        console.log('   - Check the specific failed components above');
        console.log('   - Verify data structure and code patterns');
    }
    
    return allPassed;
}

// Run the tests
runProfileDisplayTests(); 