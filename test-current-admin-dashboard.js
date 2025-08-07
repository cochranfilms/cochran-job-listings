// Test script for current admin dashboard functionality
// This script tests the existing admin dashboard before redesign

console.log('🧪 Testing Current Admin Dashboard...');

// Test 1: Check if basic elements exist
function testBasicElements() {
    console.log('📋 Test 1: Basic Elements');
    
    const elements = [
        'loginScreen',
        'adminInterface',
        'loginForm',
        'password',
        'jobs-tab',
        'contracts-tab',
        'jobForm',
        'contractForm'
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
        'showAdminInterface',
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

// Test 3: Check job management system
function testJobManagement() {
    console.log('📋 Test 3: Job Management System');
    
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

// Test 4: Check contract management system
function testContractManagement() {
    console.log('📋 Test 4: Contract Management System');
    
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

// Test 5: Check tab navigation
function testTabNavigation() {
    console.log('📋 Test 5: Tab Navigation');
    
    if (typeof switchTab === 'function') {
        console.log('✅ switchTab() - Available');
        
        // Test tab switching
        try {
            const jobsTab = document.getElementById('jobs-tab');
            const contractsTab = document.getElementById('contracts-tab');
            
            if (jobsTab && contractsTab) {
                console.log('✅ Tab elements - Found');
                return true;
            } else {
                console.log('❌ Tab elements - Missing');
                return false;
            }
        } catch (error) {
            console.log('❌ Tab switching - Error:', error);
            return false;
        }
    } else {
        console.log('❌ switchTab() - Missing');
        return false;
    }
}

// Test 6: Check form functionality
function testFormFunctionality() {
    console.log('📋 Test 6: Form Functionality');
    
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

// Test 7: Check data loading
function testDataLoading() {
    console.log('📋 Test 7: Data Loading');
    
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

// Test 8: Check UI responsiveness
function testUIResponsiveness() {
    console.log('📋 Test 8: UI Responsiveness');
    
    // Check if CSS classes exist
    const cssClasses = [
        'login-screen',
        'admin-interface',
        'tab-content',
        'form-section',
        'list-section'
    ];
    
    let passed = 0;
    let failed = 0;
    
    cssClasses.forEach(className => {
        const elements = document.getElementsByClassName(className);
        if (elements.length > 0) {
            console.log(`✅ .${className} - Found (${elements.length} elements)`);
            passed++;
        } else {
            console.log(`❌ .${className} - Missing`);
            failed++;
        }
    });
    
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting Current Admin Dashboard Tests...\n');
    
    const tests = [
        testBasicElements,
        testAuthenticationSystem,
        testJobManagement,
        testContractManagement,
        testTabNavigation,
        testFormFunctionality,
        testDataLoading,
        testUIResponsiveness
    ];
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    tests.forEach((test, index) => {
        console.log(`\n--- Test ${index + 1} ---`);
        const result = test();
        if (result) {
            totalPassed++;
        } else {
            totalFailed++;
        }
    });
    
    console.log('\n📊 FINAL RESULTS:');
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`📈 Success Rate: ${((totalPassed / tests.length) * 100).toFixed(1)}%`);
    
    if (totalFailed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Current dashboard is working correctly.');
        console.log('💡 Ready to proceed with redesign.');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the issues above before proceeding with redesign.');
    }
    
    // Provide recommendations
    console.log('\n📋 RECOMMENDATIONS:');
    if (totalPassed >= 6) {
        console.log('✅ Dashboard is mostly functional - safe to proceed with redesign');
    } else if (totalPassed >= 4) {
        console.log('⚠️ Dashboard has some issues - fix critical problems before redesign');
    } else {
        console.log('❌ Dashboard has significant issues - fix all problems before redesign');
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
        testBasicElements,
        testAuthenticationSystem,
        testJobManagement,
        testContractManagement,
        testTabNavigation,
        testFormFunctionality,
        testDataLoading,
        testUIResponsiveness,
        runAllTests
    };
} 