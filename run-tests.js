#!/usr/bin/env node

const AutomatedTestRunner = require('./test-runner');
const fs = require('fs').promises;

async function main() {
    console.log('🧪 Cochran Films Automated Test Suite');
    console.log('=====================================\n');
    
    try {
        // Create test runner instance
        const testRunner = new AutomatedTestRunner();
        
        // Run all tests
        const results = await testRunner.runAllTests();
        
        // Save results
        const filename = await testRunner.saveTestResults();
        
        // Generate summary report
        await generateSummaryReport(results, filename);
        
        // Cleanup if requested
        if (args.includes('--cleanup')) {
            console.log('\n🧹 Cleaning up test data...');
            await testRunner.cleanupTestData();
        }
        
        // Exit with appropriate code
        process.exit(results.summary.failed > 0 ? 1 : 0);
        
    } catch (error) {
        console.error('❌ Test suite execution failed:', error);
        process.exit(1);
    }
}

async function generateSummaryReport(results, filename) {
    const { summary, tests, recommendations } = results;
    const successRate = ((summary.passed / summary.total) * 100).toFixed(1);
    
    console.log('\n📊 FINAL SUMMARY');
    console.log('================');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${successRate}%`);
    
    if (recommendations && recommendations.length > 0) {
        console.log('\n📋 RECOMMENDATIONS');
        console.log('==================');
        recommendations.forEach((rec, index) => {
            const priorityIcon = {
                'high': '🔴',
                'medium': '🟡',
                'low': '🟢'
            }[rec.priority] || '⚪';
            
            console.log(`${index + 1}. ${priorityIcon} ${rec.title} (${rec.priority.toUpperCase()})`);
            console.log(`   ${rec.description}`);
            if (rec.tests && rec.tests.length > 0) {
                console.log(`   Affected tests: ${rec.tests.join(', ')}`);
            }
            console.log('');
        });
    }
    
    console.log(`\n💾 Detailed results saved to: ${filename}`);
    console.log(`🌐 View dashboard at: http://localhost:8000/test-dashboard.html`);
    
    if (summary.failed > 0) {
        console.log('\n⚠️  Some tests failed. Please review the results and fix the issues.');
    } else {
        console.log('\n✅ All tests passed! Your system is working correctly.');
    }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧪 Cochran Films Automated Test Suite

Usage: node run-tests.js [options]

Options:
  --help, -h     Show this help message
  --quick, -q    Run only critical tests
  --verbose, -v  Show detailed output
  --save-md      Save results as Markdown report
  --save-html    Save results as HTML report
  --cleanup      Clean up all test data
  --cleanup-only Only clean up test data (don't run tests)

Examples:
  node run-tests.js                    # Run all tests
  node run-tests.js --quick           # Run only critical tests
  node run-tests.js --verbose         # Show detailed output
  node run-tests.js --save-md         # Save as Markdown report
  node run-tests.js --cleanup         # Run tests and clean up
  node run-tests.js --cleanup-only    # Only clean up test data
`);
    process.exit(0);
}

// Handle cleanup-only mode
if (args.includes('--cleanup-only')) {
    const testRunner = new AutomatedTestRunner();
    testRunner.cleanupTestData().then(() => {
        console.log('✅ Test data cleanup completed');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    });
}

// Run the main function
main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
}); 