// Test script for redesigned admin dashboard
// This script tests the new card-based dashboard layout

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
        'creatorCount',
        'jobCount',
        'contractCount',
        'reviewCount'
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

// Test 2: Check if card sections exist
function testCardSections() {
    console.log('📋 Test 2: Card Sections');
    
    const cards = [
        'creatorPreview',
        'jobPreview',
        'contractPreview',
        'reviewPreview'
    ];
    
    let passed = 0;
    let failed = 0;
    
    cards.forEach(cardId => {
        const card = document.getElementById(cardId);
        if (card) {
            console.log(`✅ ${cardId} - Found`);
            passed++;
        } else {
            console.log(`❌ ${cardId} - Missing`);
            failed++;
        }
    });
    
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// Test 3: Check if functions are accessible
function testGlobalFunctions() {
    console.log('📋 Test 3: Global Functions');
    
    const functions = [
        'showCreatorModal',
        'showJobModal',
        'showCreatorList',
        'showJobList',
        'showContractList',
        'showReviewManager',
        'showReviewList',
        'downloadContracts',
        'refreshData',
        'showSystemInfo',
        'showSettings',
        'showActivityLog',
        'logout'
    ];
    
    let passed = 0;
    let failed = 0;
    
    functions.forEach(funcName => {
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

// Test 4: Check authentication flow
function testAuthenticationFlow() {
    console.log('📋 Test 4: Authentication Flow');
    
    // Check if Firebase is available
    if (typeof firebase !== 'undefined') {
        console.log('✅ Firebase SDK - Available');
    } else {
        console.log('❌ Firebase SDK - Missing');
        return false;
    }
    
    // Check if auth object exists
    if (typeof auth !== 'undefined') {
        console.log('✅ Firebase Auth - Available');
    } else {
        console.log('❌ Firebase Auth - Missing');
        return false;
    }
    
    // Check admin emails
    if (typeof ADMIN_EMAILS !== 'undefined' && ADMIN_EMAILS.length > 0) {
        console.log('✅ Admin Emails - Configured');
    } else {
        console.log('❌ Admin Emails - Missing');
        return false;
    }
    
    return true;
}

// Test 5: Check notification system
function testNotificationSystem() {
    console.log('📋 Test 5: Notification System');
    
    if (typeof showNotification === 'function') {
        console.log('✅ showNotification() - Available');
        
        // Test notification display
        try {
            showNotification('Test notification', 'info');
            console.log('✅ Notification display - Working');
            return true;
        } catch (error) {
            console.log('❌ Notification display - Failed:', error);
            return false;
        }
    } else {
        console.log('❌ showNotification() - Missing');
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting Admin Dashboard Redesign Tests...\n');
    
    const tests = [
        testDashboardElements,
        testCardSections,
        testGlobalFunctions,
        testAuthenticationFlow,
        testNotificationSystem
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
        console.log('\n🎉 ALL TESTS PASSED! Redesigned dashboard is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the issues above.');
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
        testCardSections,
        testGlobalFunctions,
        testAuthenticationFlow,
        testNotificationSystem,
        runAllTests
    };
} 