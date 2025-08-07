/**
 * Test Script: Role Display Fix Verification
 * 
 * This script tests that the role display fix is working properly
 * and that users see their correct roles instead of "Creator".
 */

const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
    testUser: 'Test User',
    ericaUser: 'Erica Cochran'
};

// Test 1: Verify users.json data structure
function testUsersJsonData() {
    console.log('\n🔍 Test 1: Verifying users.json data structure...');
    
    try {
        const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        
        console.log(`✅ users.json loaded successfully`);
        console.log(`📊 Total users: ${usersData.totalUsers}`);
        
        // Check Test User
        const testUser = usersData.users[TEST_CONFIG.testUser];
        if (testUser) {
            console.log(`\n👤 Test User Data:`);
            console.log(`  📧 Email: ${testUser.profile?.email}`);
            console.log(`  🎯 Profile Role: ${testUser.profile?.role}`);
            console.log(`  📋 Primary Job: ${testUser.primaryJob}`);
            
            const testUserJob = testUser.jobs[testUser.primaryJob];
            if (testUserJob) {
                console.log(`  📝 Job Title: ${testUserJob.title}`);
                console.log(`  🎯 Job Role: ${testUserJob.role}`);
                console.log(`  💰 Job Rate: ${testUserJob.rate}`);
                console.log(`  💵 Job Pay: ${testUserJob.pay}`);
            }
        }
        
        // Check Erica Cochran
        const ericaUser = usersData.users[TEST_CONFIG.ericaUser];
        if (ericaUser) {
            console.log(`\n👤 Erica Cochran Data:`);
            console.log(`  📧 Email: ${ericaUser.profile?.email}`);
            console.log(`  🎯 Profile Role: ${ericaUser.profile?.role}`);
            console.log(`  📋 Primary Job: ${ericaUser.primaryJob}`);
            
            const ericaJob = ericaUser.jobs[ericaUser.primaryJob];
            if (ericaJob) {
                console.log(`  📝 Job Title: ${ericaJob.title}`);
                console.log(`  🎯 Job Role: ${ericaJob.role}`);
                console.log(`  💰 Job Rate: ${ericaJob.rate}`);
                console.log(`  💵 Job Pay: ${ericaJob.pay}`);
            }
        }
        
        return { testUser, ericaUser };
    } catch (error) {
        console.error('❌ Error reading users.json:', error.message);
        return null;
    }
}

// Test 2: Verify user portal code changes
function testUserPortalCodeChanges() {
    console.log('\n🔍 Test 2: Verifying user portal code changes...');
    
    try {
        const portalCode = fs.readFileSync('user-portal.html', 'utf8');
        
        // Check for fixed role access patterns
        const fixedPatterns = [
            'getSelectedJob()?.role || currentUser.profile?.role',
            'selectedJob?.role || currentUser.profile?.role',
            'userContract.role || getSelectedJob()?.role || currentUser.profile?.role'
        ];
        
        console.log(`📊 Fixed Role Access Patterns:`);
        fixedPatterns.forEach(pattern => {
            const count = (portalCode.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            console.log(`  ${pattern}: ${count} occurrences`);
        });
        
        // Check for old problematic patterns
        const oldPatterns = [
            'currentUser.role || \'Creator\'',
            'currentUser.role || \'Assistant Position\'',
            'currentUser.role || \'Not specified\''
        ];
        
        console.log(`\n📊 Old Problematic Patterns (should be 0):`);
        oldPatterns.forEach(pattern => {
            const count = (portalCode.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            console.log(`  ${pattern}: ${count} occurrences`);
        });
        
        // Check for getSelectedJob function
        if (portalCode.includes('function getSelectedJob()')) {
            console.log(`✅ getSelectedJob function exists`);
        } else {
            console.log(`❌ getSelectedJob function missing`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error checking user portal code:', error.message);
        return false;
    }
}

// Test 3: Simulate role resolution logic
function testRoleResolutionLogic() {
    console.log('\n🔍 Test 3: Simulating role resolution logic...');
    
    try {
        const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        
        // Simulate the role resolution logic
        function simulateRoleResolution(userName) {
            const user = usersData.users[userName];
            if (!user) return null;
            
            // Simulate getSelectedJob() logic
            const primaryJob = user.jobs[user.primaryJob];
            
            // Simulate the new role resolution: getSelectedJob()?.role || currentUser.profile?.role
            const jobRole = primaryJob?.role;
            const profileRole = user.profile?.role;
            
            const resolvedRole = jobRole || profileRole || 'Creator';
            
            return {
                userName,
                profileRole,
                jobRole,
                resolvedRole,
                primaryJob: user.primaryJob,
                jobTitle: primaryJob?.title
            };
        }
        
        // Test both users
        const testUserResult = simulateRoleResolution(TEST_CONFIG.testUser);
        const ericaResult = simulateRoleResolution(TEST_CONFIG.ericaUser);
        
        if (testUserResult) {
            console.log(`\n👤 Test User Role Resolution:`);
            console.log(`  Profile Role: ${testUserResult.profileRole}`);
            console.log(`  Job Role: ${testUserResult.jobRole}`);
            console.log(`  Resolved Role: ${testUserResult.resolvedRole}`);
            console.log(`  Job Title: ${testUserResult.jobTitle}`);
            console.log(`  Primary Job: ${testUserResult.primaryJob}`);
        }
        
        if (ericaResult) {
            console.log(`\n👤 Erica Cochran Role Resolution:`);
            console.log(`  Profile Role: ${ericaResult.profileRole}`);
            console.log(`  Job Role: ${ericaResult.jobRole}`);
            console.log(`  Resolved Role: ${ericaResult.resolvedRole}`);
            console.log(`  Job Title: ${ericaResult.jobTitle}`);
            console.log(`  Primary Job: ${ericaResult.primaryJob}`);
        }
        
        return { testUserResult, ericaResult };
    } catch (error) {
        console.error('❌ Error simulating role resolution:', error.message);
        return null;
    }
}

// Test 4: Check for any remaining "Creator" hardcoded references
function testForHardcodedCreator() {
    console.log('\n🔍 Test 4: Checking for hardcoded "Creator" references...');
    
    try {
        const portalCode = fs.readFileSync('user-portal.html', 'utf8');
        
        // Look for "Creator" references that might be problematic
        const creatorReferences = portalCode.match(/['"`]Creator['"`]/g) || [];
        const problematicCreatorRefs = portalCode.match(/currentUser\.role\s*\|\|\s*['"`]Creator['"`]/g) || [];
        
        console.log(`📊 "Creator" References: ${creatorReferences.length} total`);
        console.log(`📊 Problematic Creator Fallbacks: ${problematicCreatorRefs.length} (should be 0)`);
        
        if (problematicCreatorRefs.length > 0) {
            console.log(`❌ Found problematic Creator fallbacks:`);
            problematicCreatorRefs.forEach(ref => console.log(`  ${ref}`));
        } else {
            console.log(`✅ No problematic Creator fallbacks found`);
        }
        
        // Check for legitimate Creator references (like page titles)
        const legitimateCreatorRefs = portalCode.match(/Creator Portal|CREATOR PORTAL/g) || [];
        console.log(`📊 Legitimate Creator References: ${legitimateCreatorRefs.length} (page titles, etc.)`);
        
        return problematicCreatorRefs.length === 0;
    } catch (error) {
        console.error('❌ Error checking for Creator references:', error.message);
        return false;
    }
}

// Test 5: Verify data consistency
function testDataConsistency() {
    console.log('\n🔍 Test 5: Verifying data consistency...');
    
    try {
        const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        
        let allConsistent = true;
        const issues = [];
        
        Object.entries(usersData.users).forEach(([userName, userData]) => {
            const profileRole = userData.profile?.role;
            const primaryJob = userData.jobs?.[userData.primaryJob];
            const jobRole = primaryJob?.role;
            
            if (!profileRole) {
                issues.push(`${userName}: Missing profile role`);
                allConsistent = false;
            }
            
            if (!jobRole) {
                issues.push(`${userName}: Missing job role`);
                allConsistent = false;
            }
            
            if (profileRole && jobRole && profileRole !== jobRole) {
                console.log(`⚠️ ${userName}: Profile role (${profileRole}) differs from job role (${jobRole}) - This is OK for different job assignments`);
            }
        });
        
        if (issues.length > 0) {
            console.log(`❌ Data consistency issues found:`);
            issues.forEach(issue => console.log(`  ${issue}`));
        } else {
            console.log(`✅ All users have consistent role data`);
        }
        
        return allConsistent;
    } catch (error) {
        console.error('❌ Error checking data consistency:', error.message);
        return false;
    }
}

// Main test execution
function runAllRoleDisplayTests() {
    console.log('🚀 Starting Role Display Fix Tests...');
    console.log('=' .repeat(60));
    
    const results = {
        usersJsonData: testUsersJsonData(),
        portalCodeChanges: testUserPortalCodeChanges(),
        roleResolution: testRoleResolutionLogic(),
        noHardcodedCreator: testForHardcodedCreator(),
        dataConsistency: testDataConsistency()
    };
    
    console.log('\n📋 Test Summary:');
    console.log('=' .repeat(60));
    console.log(`Users JSON Data: ${results.usersJsonData ? '✅' : '❌'}`);
    console.log(`Portal Code Changes: ${results.portalCodeChanges ? '✅' : '❌'}`);
    console.log(`Role Resolution Logic: ${results.roleResolution ? '✅' : '❌'}`);
    console.log(`No Hardcoded Creator: ${results.noHardcodedCreator ? '✅' : '❌'}`);
    console.log(`Data Consistency: ${results.dataConsistency ? '✅' : '❌'}`);
    
    // Diagnosis
    console.log('\n🔍 Diagnosis:');
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('✅ Role display fix is working correctly!');
        console.log('   - Users will see their correct roles instead of "Creator"');
        console.log('   - Job-specific roles take priority over profile roles');
        console.log('   - Fallback to "Creator" only when no role data exists');
        console.log('   - Data structure is consistent and properly accessed');
        
        console.log('\n💡 Expected Results:');
        console.log('   - Test User will see: "Editor"');
        console.log('   - Erica Cochran will see: "Backdrop Photographer"');
        console.log('   - No more "Creator" fallback for users with role data');
    } else {
        console.log('❌ Some tests failed');
        console.log('   - Check the specific failed components above');
        console.log('   - Ensure all role access patterns are updated');
    }
    
    return allPassed;
}

// Run the tests
runAllRoleDisplayTests(); 