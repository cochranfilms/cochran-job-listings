# 🧪 Automated Testing System

## Overview

The Cochran Films Automated Testing System provides comprehensive testing for all workflow components including job management, user management, contract operations, performance reviews, notifications, and system integrations.

## Features

- **Comprehensive Test Coverage**: Tests all major system components
- **Real-time Results**: Live dashboard with detailed test results
- **Automated Recommendations**: Identifies issues and provides fix suggestions
- **Multiple Export Formats**: JSON, Markdown, and HTML reports
- **Command-line Interface**: Run tests directly from terminal
- **Beautiful Dashboard**: Modern web interface for test management

## Test Categories

### 1. System Health Tests
- **Server Health Check**: Verifies server is running and responding
- **File System Access**: Checks all required JSON files are accessible
- **API Endpoints**: Tests all API endpoints are working correctly

### 2. User Management Tests
- **User Creation**: Tests adding new users to the system
- **User Deletion**: Tests removing users from the system
- **Data Integrity**: Verifies user data is properly stored and retrieved

### 3. Job Management Tests
- **Job Creation**: Tests adding new job listings
- **Job Deletion**: Tests removing job listings
- **Job Data Validation**: Ensures job data is properly formatted

### 4. Contract Management Tests
- **Contract Addition**: Tests uploading and storing contracts
- **Contract Deletion**: Tests removing contracts from the system
- **Contract Metadata**: Verifies contract information is properly tracked

### 5. Performance Review Tests
- **Review Creation**: Tests creating performance reviews
- **Review Deletion**: Tests removing performance reviews
- **Review Data**: Validates review data structure and storage

### 6. Notification Tests
- **Notification Creation**: Tests creating system notifications
- **Notification Deletion**: Tests removing notifications
- **Notification Counts**: Verifies unread/read counts are accurate

### 7. Project Timeline Tests
- **Timeline Updates**: Tests updating project timelines
- **Progress Tracking**: Verifies project progress is properly tracked
- **Status Updates**: Ensures project status changes are recorded

### 8. PDF Deletion Tests
- **PDF Deletion API**: Tests the dedicated PDF deletion endpoint
- **Local File Cleanup**: Verifies PDF files are removed from local storage
- **JSON Record Updates**: Ensures contract records are updated in JSON files
- **GitHub Integration**: Tests GitHub file deletion when contractId is provided

## Getting Started

### Prerequisites

1. **Node.js**: Ensure Node.js is installed (version 14 or higher)
2. **Dependencies**: Install required packages:
   ```bash
   npm install node-fetch
   ```
3. **Server Running**: Make sure your server is running on port 8000

### Running Tests

#### Option 1: Web Dashboard (Recommended)

##### **For Local Development**:
1. Start your server:
   ```bash
   node server.js
   ```

2. Open the test dashboard:
   ```
   http://localhost:8000/test-dashboard.html
   ```

##### **For Live Server (Vercel)**:
1. Access the dashboard directly:
   ```
   https://collaborate.cochranfilms.com/test-dashboard.html
   ```

2. Select test categories and click "Run All Tests"

**Note**: The dashboard automatically detects the server URL and works with both local development and live Vercel deployment.

#### Option 2: Command Line

Run tests directly from terminal:

```bash
# Run all tests
node run-tests.js

# Show help
node run-tests.js --help

# Run with verbose output
node run-tests.js --verbose
```

#### Option 3: Direct API Call

##### **For Local Development**:
```bash
curl -X POST http://localhost:8000/api/run-tests \
  -H "Content-Type: application/json" \
  -d '{"categories": ["system-health", "user-management"]}'
```

##### **For Live Server (Vercel)**:
```bash
curl -X POST https://collaborate.cochranfilms.com/api/run-tests \
  -H "Content-Type: application/json" \
  -d '{"categories": ["system-health", "user-management"]}'
```

## Understanding Test Results

### Test Status

- **✅ PASS**: Test completed successfully
- **❌ FAIL**: Test failed - needs attention
- **⚠️ WARNING**: Test passed but with concerns

### Success Metrics

- **Total Tests**: Number of tests executed
- **Passed**: Tests that completed successfully
- **Failed**: Tests that encountered errors
- **Success Rate**: Percentage of tests that passed

### Recommendations

The system automatically generates recommendations based on test results:

- **🔴 HIGH Priority**: Critical issues that need immediate attention
- **🟡 MEDIUM Priority**: Performance or optimization issues
- **🟢 LOW Priority**: Minor improvements or suggestions

## Common Issues and Fixes

### 1. Server Not Running
**Issue**: "Cannot connect to server"
**Fix**: Ensure `node server.js` is running on port 8000

### 2. Missing JSON Files
**Issue**: "File System Access" test fails
**Fix**: Check that all required JSON files exist:
- `users.json`
- `jobs-data.json`
- `uploaded-contracts.json`
- `dropdown-options.json`
- `performance.json`
- `notifications.json`

### 3. API Endpoint Errors
**Issue**: API endpoints returning errors
**Fix**: Check server logs and ensure all API modules are properly imported

### 4. Permission Errors
**Issue**: Cannot write test results
**Fix**: Ensure write permissions in the project directory

### 5. Dashboard 404 Errors
**Issue**: "Failed to load resource: the server responded with a status of 404"
**Fix**: 
1. **Check Server Status**: Ensure server is running: `node server.js` (local) or verify Vercel deployment (live)
2. **Verify API Endpoint**: Try accessing directly: 
   - Local: `curl -X POST http://localhost:8000/api/run-tests`
   - Live: `curl -X POST https://collaborate.cochranfilms.com/api/run-tests`
3. **Check Domain Mismatch**: If dashboard is on different domain than API, update server configuration
4. **Browser Console**: Check for detailed error messages and debugging information
5. **Alternative Endpoints**: Dashboard will try alternative API paths automatically
6. **Server Logs**: Check server console for routing or import errors

**Common Causes**:
- Dashboard served from different domain than API
- Server not running or crashed (local)
- Vercel deployment not updated (live)
- API routes not properly configured
- CORS issues between domains

## Export Options

### JSON Export
```bash
# Via dashboard
# Click "Export JSON" button

# Via API (Local)
curl -X POST http://localhost:8000/api/export-results \
  -H "Content-Type: application/json" \
  -d '{"results": {...}, "format": "json"}'

# Via API (Live Server)
curl -X POST https://collaborate.cochranfilms.com/api/export-results \
  -H "Content-Type: application/json" \
  -d '{"results": {...}, "format": "json"}'
```

### Markdown Export
```bash
# Via dashboard
# Click "Export Markdown" button

# Via API (Local)
curl -X POST http://localhost:8000/api/export-results \
  -H "Content-Type: application/json" \
  -d '{"results": {...}, "format": "markdown"}'

# Via API (Live Server)
curl -X POST https://collaborate.cochranfilms.com/api/export-results \
  -H "Content-Type: application/json" \
  -d '{"results": {...}, "format": "markdown"}'
```

### HTML Export
```bash
# Via dashboard
# Click "Export HTML" button

# Via API (Local)
curl -X POST http://localhost:8000/api/export-results \
  -H "Content-Type: application/json" \
  -d '{"results": {...}, "format": "html"}'

# Via API (Live Server)
curl -X POST https://collaborate.cochranfilms.com/api/export-results \
  -H "Content-Type: application/json" \
  -d '{"results": {...}, "format": "html"}'
```

## Test Data

The system uses test data that is automatically cleaned up:

- **Test User**: `test@cochranfilms.com`
- **Test Job**: "Test Photography Job"
- **Test Contract**: "test-contract.pdf"
- **Test Notification**: "Test Notification"

All test data is removed after tests complete to avoid cluttering your system.

## Vercel Deployment

### **Live Server Testing**
The automated testing system is fully compatible with Vercel serverless deployment:

- **Dashboard URL**: `https://collaborate.cochranfilms.com/test-dashboard.html`
- **API Endpoints**: All `/api/*` endpoints work on live server
- **Test Runner**: Uses Vercel-compatible `test-runner-vercel.js`
- **File Operations**: Handles serverless file system operations
- **CORS**: Configured for cross-origin requests

### **Deployment Process**
1. **Push to GitHub**: All changes automatically deploy to Vercel
2. **API Functions**: Serverless functions handle test execution
3. **File Storage**: JSON files and test results stored in Vercel environment
4. **Cleanup**: Automatic test data cleanup after each run

## Integration with Workflow

### Before Deployments
Run the full test suite before deploying changes:
```bash
# Local testing
node run-tests.js

# Live server testing
curl -X POST https://collaborate.cochranfilms.com/api/run-tests
```

### Continuous Monitoring
Set up automated testing to run periodically:
```bash
# Add to cron job or CI/CD pipeline
0 */6 * * * cd /path/to/project && node run-tests.js
```

### Development Workflow
1. Make changes to your code
2. Run tests: `node run-tests.js`
3. Fix any issues identified
4. Re-run tests to verify fixes
5. Deploy when all tests pass

## Customization

### Adding New Tests

1. Open `test-runner.js`
2. Add new test method following the pattern:
   ```javascript
   async testNewFeature() {
       const startTime = Date.now();
       
       try {
           // Your test logic here
           const duration = Date.now() - startTime;
           
           return {
               success: true,
               message: 'Test completed successfully',
               details: { /* test details */ },
               duration
           };
       } catch (error) {
           return {
               success: false,
               message: 'Test failed',
               details: { error: error.message }
           };
       }
   }
   ```

3. Add the test to `runAllTests()` method

### Custom Test Categories

1. Add new category to dashboard HTML
2. Update `getSelectedCategories()` method
3. Add category filtering logic in test runner

## Troubleshooting

### Tests Hanging
- Check server is responding
- Verify no infinite loops in test logic
- Check for network timeouts

### Inconsistent Results
- Ensure server is in a clean state
- Check for conflicting test data
- Verify JSON files are not corrupted

### Performance Issues
- Monitor test execution times
- Check for slow API responses
- Verify file system performance

## Support

For issues with the testing system:

1. Check the server logs for error messages
2. Verify all dependencies are installed
3. Ensure the server is running correctly
4. Review the test results for specific failure details

## Future Enhancements

- **Parallel Testing**: Run tests concurrently for faster execution
- **Database Testing**: Add database connectivity tests
- **Email Testing**: Test notification delivery systems
- **Performance Benchmarks**: Add performance measurement tests
- **Security Testing**: Add security vulnerability tests
- **Mobile Testing**: Add mobile device compatibility tests

---

**Last Updated**: August 2025  
**Version**: 1.0.0  
**Maintainer**: Cochran Films Development Team 