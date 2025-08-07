// Test script for redesigned admin dashboard functionality
// This script will test all functions and identify issues

console.log('🧪 Testing Redesigned Admin Dashboard...');

// Test 1: Check if dashboard elements exist
function testDashboardElements() {
    console.log('📋 Test 1: Dashboard Elements');
    
    const elements = [
        'loginScreen',
        'dashboard',
        'totalCreators',
        'activeJobs',
        'pendingReviews',
        'totalContracts',
        'jobForm',
        'contractForm',
        'jobsList',
        'contractsList'
    ];
    
    let passed = 0;
    let failed = 0;
    
    elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`✅ ${elementId} - Found`);
            passed++;
        } else {
            console.log(`❌ ${elementId} - Missing`);
            failed++;
        }
    });
    
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// Test 2: Check authentication system
function testAuthenticationSystem() {
    console.log('📋 Test 2: Authentication System');
    
    // Check if password is set
    if (typeof ADMIN_PASSWORD !== 'undefined') {
        console.log('✅ ADMIN_PASSWORD - Configured');
    } else {
        console.log('❌ ADMIN_PASSWORD - Missing');
        return false;
    }
    
    // Check if authentication functions exist
    const authFunctions = [
        'checkAuth',
        'showLoginScreen',
        'showDashboard',
        'logout'
    ];
    
    let passed = 0;
    let failed = 0;
    
    authFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName}() - Available`);
            passed++;
        } else {
            console.log(`❌ ${funcName}() - Missing`);
            failed++;
        }
    });
    
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// Test 3: Check job management functions
function testJobManagement() {
    console.log('📋 Test 3: Job Management Functions');
    
    const jobFunctions = [
        'loadJobs',
        'displayJobs',
        'editJob',
        'deleteJob',
        'clearJobForm',
        'exportJobData',
        'downloadJobJSON'
    ];
    
    let passed = 0;
    let failed = 0;
    
    jobFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName}() - Available`);
            passed++;
        } else {
            console.log(`❌ ${funcName}() - Missing`);
            failed++;
        }
    });
    
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// Test 4: Check contract management functions
function testContractManagement() {
    console.log('📋 Test 4: Contract Management Functions');
    
    const contractFunctions = [
        'loadFreelancers',
        'displayFreelancers',
        'editFreelancer',
        'deleteFreelancer',
        'clearContractForm',
        'exportContractData',
        'downloadContractJSON',
        'generateAllContracts',
        'downloadContractFiles'
    ];
    
    let passed = 0;
    let failed = 0;
    
    contractFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName}() - Available`);
            passed++;
        } else {
            console.log(`❌ ${funcName}() - Missing`);
            failed++;
        }
    });
    
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// Test 5: Check data loading
function testDataLoading() {
    console.log('📋 Test 5: Data Loading');
    
    // Check if global variables exist
    const globalVars = ['jobs', 'approvedFreelancers', 'isAuthenticated'];
    
    let passed = 0;
    let failed = 0;
    
    globalVars.forEach(varName => {
        if (typeof window[varName] !== 'undefined') {
            console.log(`✅ ${varName} - Available`);
            passed++;
        } else {
            console.log(`❌ ${varName} - Missing`);
            failed++;
        }
    });
    
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// Test 6: Check API endpoints
async function testAPIEndpoints() {
    console.log('📋 Test 6: API Endpoints');
    
    let passed = 0;
    let failed = 0;
    
    // Test jobs-data endpoint
    try {
        const response = await fetch('/api/jobs-data');
        if (response.ok) {
            console.log('✅ /api/jobs-data - Working');
            passed++;
        } else {
            console.log(`❌ /api/jobs-data - Status: ${response.status}`);
            failed++;
        }
    } catch (error) {
        console.log('❌ /api/jobs-data - Error:', error.message);
        failed++;
    }
    
    // Test freelancers.json
    try {
        const response = await fetch('freelancers.json');
        if (response.ok) {
            console.log('✅ freelancers.json - Working');
            passed++;
        } else {
            console.log(`❌ freelancers.json - Status: ${response.status}`);
            failed++;
        }
    } catch (error) {
        console.log('❌ freelancers.json - Error:', error.message);
        failed++;
    }
    
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// Test 7: Check form functionality
function testFormFunctionality() {
    console.log('📋 Test 7: Form Functionality');
    
    const jobForm = document.getElementById('jobForm');
    const contractForm = document.getElementById('contractForm');
    
    if (jobForm && contractForm) {
        console.log('✅ Forms - Found');
        
        // Check if forms have event listeners
        if (jobForm.onsubmit || jobForm._listeners) {
            console.log('✅ Job form - Has event listeners');
        } else {
            console.log('⚠️ Job form - No event listeners detected');
        }
        
        if (contractForm.onsubmit || contractForm._listeners) {
            console.log('✅ Contract form - Has event listeners');
        } else {
            console.log('⚠️ Contract form - No event listeners detected');
        }
        
        return true;
    } else {
        console.log('❌ Forms - Missing');
        return false;
    }
}

// Test 8: Check stats update function
function testStatsUpdate() {
    console.log('📋 Test 8: Stats Update Function');
    
    if (typeof updateStats === 'function') {
        console.log('✅ updateStats() - Available');
        
        // Test if stats elements exist
        const statsElements = ['totalCreators', 'activeJobs', 'pendingReviews', 'totalContracts'];
        let statsPassed = 0;
        let statsFailed = 0;
        
        statsElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                console.log(`✅ ${elementId} - Found`);
                statsPassed++;
            } else {
                console.log(`❌ ${elementId} - Missing`);
                statsFailed++;
            }
        });
        
        console.log(`📊 Stats Elements: ${statsPassed} passed, ${statsFailed} failed`);
        return statsFailed === 0;
    } else {
        console.log('❌ updateStats() - Missing');
        return false;
    }
}

// Test 9: Check login status
function testLoginStatus() {
    console.log('📋 Test 9: Login Status');
    
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');
    
    if (loginScreen && dashboard) {
        const loginDisplay = loginScreen.style.display;
        const dashboardDisplay = dashboard.style.display;
        
        console.log(`Login screen display: ${loginDisplay}`);
        console.log(`Dashboard display: ${dashboardDisplay}`);
        
        if (loginDisplay === 'flex' && dashboardDisplay === 'none') {
            console.log('✅ Login screen is visible (expected)');
            return true;
        } else if (loginDisplay === 'none' && dashboardDisplay === 'block') {
            console.log('✅ Dashboard is visible (user is logged in)');
            return true;
        } else {
            console.log('⚠️ Unexpected display states');
            return false;
        }
    } else {
        console.log('❌ Cannot determine login status');
        return false;
    }
}

// Test 10: Check for console errors
function testConsoleErrors() {
    console.log('📋 Test 10: Console Errors');
    
    // This will be checked manually by looking at the console
    console.log('⚠️ Check browser console for any JavaScript errors');
    console.log('⚠️ Look for 404 errors, undefined functions, or other issues');
    
    return true; // This is a manual check
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Redesigned Dashboard Tests...\n');
    
    const tests = [
        testDashboardElements,
        testAuthenticationSystem,
        testJobManagement,
        testContractManagement,
        testDataLoading,
        testAPIEndpoints,
        testFormFunctionality,
        testStatsUpdate,
        testLoginStatus,
        testConsoleErrors
    ];
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    for (let i = 0; i < tests.length; i++) {
        console.log(`\n--- Test ${i + 1} ---`);
        const result = await tests[i]();
        if (result) {
            totalPassed++;
        } else {
            totalFailed++;
        }
    }
    
    console.log('\n📊 FINAL RESULTS:');
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`📈 Success Rate: ${((totalPassed / tests.length) * 100).toFixed(1)}%`);
    
    if (totalFailed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Redesigned dashboard is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Check the issues above.');
        console.log('\n🔧 RECOMMENDED FIXES:');
        console.log('1. Check if /api/jobs-data endpoint exists');
        console.log('2. Verify all JavaScript functions are properly defined');
        console.log('3. Check for any console errors');
        console.log('4. Ensure all form event listeners are attached');
    }
}

// Auto-run tests when script is loaded
if (typeof document !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllTests);
    } else {
        runAllTests();
    }
} else {
    console.log('📝 Test script loaded (Node.js environment)');
    console.log('💡 Run this script in a browser environment to test the dashboard');
}

// Export functions for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testDashboardElements,
        testAuthenticationSystem,
        testJobManagement,
        testContractManagement,
        testDataLoading,
        testAPIEndpoints,
        testFormFunctionality,
        testStatsUpdate,
        testLoginStatus,
        testConsoleErrors,
        runAllTests
    };
} 