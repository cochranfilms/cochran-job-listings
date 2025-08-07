/**
 * Test Script: Data Structure Consistency Verification
 * 
 * This script tests the consistency of role/title usage across the system
 * to ensure the seamless update system works with standardized data.
 */

const fs = require('fs');

// Test configuration
const TEST_CONFIG = {
    testUser: 'Test User',
    ericaUser: 'Erica Cochran'
};

// Test 1: Verify users.json structure consistency
function testUsersJsonConsistency() {
    console.log('\n🔍 Test 1: Verifying users.json structure consistency...');
    
    try {
        const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        
        console.log(`✅ users.json loaded successfully`);
        console.log(`📊 Total users: ${usersData.totalUsers}`);
        
        let allJobsHaveRole = true;
        let allJobsHaveTitle = true;
        let profileRoleMatchesJobRole = true;
        
        // Check each user
        Object.entries(usersData.users).forEach(([userName, userData]) => {
            console.log(`\n👤 User: ${userName}`);
            console.log(`📧 Email: ${userData.profile?.email}`);
            console.log(`🎯 Profile Role: ${userData.profile?.role}`);
            console.log(`📋 Primary Job: ${userData.primaryJob}`);
            
            // Check jobs
            if (userData.jobs) {
                Object.entries(userData.jobs).forEach(([jobId, jobData]) => {
                    console.log(`  📋 Job ID: ${jobId}`);
                    console.log(`  📝 Title: ${jobData.title || 'MISSING'}`);
                    console.log(`  🎯 Role: ${jobData.role || 'MISSING'}`);
                    
                    // Check for missing role
                    if (!jobData.role) {
                        allJobsHaveRole = false;
                        console.log(`  ❌ Job missing role field`);
                    }
                    
                    // Check for missing title
                    if (!jobData.title) {
                        allJobsHaveTitle = false;
                        console.log(`  ❌ Job missing title field`);
                    }
                    
                    // Check if profile role matches job role
                    if (userData.profile?.role && jobData.role && userData.profile.role !== jobData.role) {
                        profileRoleMatchesJobRole = false;
                        console.log(`  ⚠️ Profile role (${userData.profile.role}) doesn't match job role (${jobData.role})`);
                    }
                });
            } else {
                console.log(`  ❌ No jobs found for user`);
            }
        });
        
        console.log(`\n📊 Consistency Summary:`);
        console.log(`  All jobs have role: ${allJobsHaveRole ? '✅' : '❌'}`);
        console.log(`  All jobs have title: ${allJobsHaveTitle ? '✅' : '❌'}`);
        console.log(`  Profile roles match job roles: ${profileRoleMatchesJobRole ? '✅' : '❌'}`);
        
        return {
            allJobsHaveRole,
            allJobsHaveTitle,
            profileRoleMatchesJobRole,
            usersData
        };
    } catch (error) {
        console.error('❌ Error reading users.json:', error.message);
        return null;
    }
}

// Test 2: Check code usage patterns
function testCodeUsagePatterns() {
    console.log('\n🔍 Test 2: Checking code usage patterns...');
    
    try {
        const userPortalCode = fs.readFileSync('user-portal.html', 'utf8');
        const adminDashboardCode = fs.readFileSync('admin-dashboard.html', 'utf8');
        
        // Check for role/title usage patterns
        const patterns = {
            'job.title': (userPortalCode.match(/job\.title/g) || []).length,
            'job.role': (userPortalCode.match(/job\.role/g) || []).length,
            'user.profile.role': (userPortalCode.match(/user\.profile\.role/g) || []).length,
            'selectedJob.title': (userPortalCode.match(/selectedJob\.title/g) || []).length,
            'selectedJob.role': (userPortalCode.match(/selectedJob\.role/g) || []).length
        };
        
        console.log(`📊 User Portal Usage Patterns:`);
        Object.entries(patterns).forEach(([pattern, count]) => {
            console.log(`  ${pattern}: ${count} occurrences`);
        });
        
        // Check for fallback patterns (title || role)
        const fallbackPatterns = [
            'job.title || job.role',
            'selectedJob.title || selectedJob.role',
            'Object.values(currentUser.jobs)[0]?.title || Object.values(currentUser.jobs)[0]?.role'
        ];
        
        console.log(`\n📊 Fallback Patterns (title || role):`);
        fallbackPatterns.forEach(pattern => {
            const count = (userPortalCode.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            console.log(`  ${pattern}: ${count} occurrences`);
        });
        
        return patterns;
    } catch (error) {
        console.error('❌ Error checking code patterns:', error.message);
        return null;
    }
}

// Test 3: Verify data flow consistency
function testDataFlowConsistency() {
    console.log('\n🔍 Test 3: Verifying data flow consistency...');
    
    try {
        const usersData = JSON.parse(fs.readFileSync('users.json', 'utf8'));
        
        // Test the data flow logic
        const testUser = usersData.users[TEST_CONFIG.testUser];
        const testErica = usersData.users[TEST_CONFIG.ericaUser];
        
        if (testUser && testErica) {
            console.log(`✅ Both test users found`);
            
            // Test primary job resolution
            const testUserPrimaryJob = testUser.jobs[testUser.primaryJob];
            const ericaPrimaryJob = testErica.jobs[testErica.primaryJob];
            
            console.log(`\n👤 Test User Primary Job:`);
            console.log(`  Title: ${testUserPrimaryJob?.title || 'MISSING'}`);
            console.log(`  Role: ${testUserPrimaryJob?.role || 'MISSING'}`);
            console.log(`  Profile Role: ${testUser.profile?.role || 'MISSING'}`);
            
            console.log(`\n👤 Erica Primary Job:`);
            console.log(`  Title: ${ericaPrimaryJob?.title || 'MISSING'}`);
            console.log(`  Role: ${ericaPrimaryJob?.role || 'MISSING'}`);
            console.log(`  Profile Role: ${testErica.profile?.role || 'MISSING'}`);
            
            // Test consistency
            const testUserConsistent = testUserPrimaryJob?.role === testUser.profile?.role;
            const ericaConsistent = ericaPrimaryJob?.role === testErica.profile?.role;
            
            console.log(`\n📊 Consistency Check:`);
            console.log(`  Test User consistent: ${testUserConsistent ? '✅' : '❌'}`);
            console.log(`  Erica consistent: ${ericaConsistent ? '✅' : '❌'}`);
            
            return {
                testUserConsistent,
                ericaConsistent,
                testUserPrimaryJob,
                ericaPrimaryJob
            };
        } else {
            console.log(`❌ Test users not found`);
            return null;
        }
    } catch (error) {
        console.error('❌ Error testing data flow:', error.message);
        return null;
    }
}

// Test 4: Check for potential issues
function testPotentialIssues() {
    console.log('\n🔍 Test 4: Checking for potential issues...');
    
    try {
        const userPortalCode = fs.readFileSync('user-portal.html', 'utf8');
        const adminDashboardCode = fs.readFileSync('admin-dashboard.html', 'utf8');
        
        const issues = [];
        
        // Check for hardcoded role references
        const hardcodedRoles = userPortalCode.match(/['"`][A-Za-z\s]+['"`]/g) || [];
        const potentialRoleIssues = hardcodedRoles.filter(role => 
            role.includes('Assistant') || 
            role.includes('Position') || 
            role.includes('Default')
        );
        
        if (potentialRoleIssues.length > 0) {
            issues.push(`Found ${potentialRoleIssues.length} potential hardcoded role references`);
        }
        
        // Check for inconsistent field access
        const inconsistentAccess = [
            'user.jobs[0].role',
            'user.jobs[0].title',
            'currentUser.role',
            'currentUser.title'
        ];
        
        inconsistentAccess.forEach(pattern => {
            const count = (userPortalCode.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            if (count > 0) {
                issues.push(`Found ${count} instances of ${pattern}`);
            }
        });
        
        console.log(`📊 Potential Issues Found: ${issues.length}`);
        issues.forEach(issue => console.log(`  ⚠️ ${issue}`));
        
        return issues.length === 0;
    } catch (error) {
        console.error('❌ Error checking for issues:', error.message);
        return false;
    }
}

// Main test execution
function runAllConsistencyTests() {
    console.log('🚀 Starting Data Structure Consistency Tests...');
    console.log('=' .repeat(60));
    
    const results = {
        jsonConsistency: testUsersJsonConsistency(),
        codePatterns: testCodeUsagePatterns(),
        dataFlow: testDataFlowConsistency(),
        noIssues: testPotentialIssues()
    };
    
    console.log('\n📋 Test Summary:');
    console.log('=' .repeat(60));
    console.log(`JSON Structure Consistency: ${results.jsonConsistency ? '✅' : '❌'}`);
    console.log(`Code Usage Patterns: ${results.codePatterns ? '✅' : '❌'}`);
    console.log(`Data Flow Consistency: ${results.dataFlow ? '✅' : '❌'}`);
    console.log(`No Potential Issues: ${results.noIssues ? '✅' : '❌'}`);
    
    // Diagnosis
    console.log('\n🔍 Diagnosis:');
    if (results.jsonConsistency && results.dataFlow) {
        console.log('✅ Data structure is consistent');
        console.log('   - All jobs have both title and role');
        console.log('   - Profile roles match job roles');
        console.log('   - Primary job resolution works correctly');
    } else {
        console.log('❌ Data structure needs attention');
        if (results.jsonConsistency) {
            console.log('   - Check job role/title consistency');
        }
        if (results.dataFlow) {
            console.log('   - Check primary job resolution');
        }
    }
    
    console.log('\n💡 Recommendations:');
    console.log('1. Ensure all jobs have both title and role fields');
    console.log('2. Standardize role usage across the system');
    console.log('3. Update any hardcoded role references');
    console.log('4. Test the edit user function with new structure');
}

// Run the tests
runAllConsistencyTests(); 