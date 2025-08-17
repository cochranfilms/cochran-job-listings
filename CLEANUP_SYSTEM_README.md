Cleanup Tests Utility

- Run inventory (no changes):

```bash
npm run cleanup-tests
```

- List only:

```bash
npm run cleanup-tests:list
```

- Apply (quarantines test/debug files and strips references):

```bash
npm run cleanup-tests:apply
```

Notes
- Quarantined files go to `backups/test-quarantine/<timestamp>/`.
- References removed include `<script src="test-*|debug-*">`, `runDashboardTests(`, `testMainDashboard*(`, and python servers `https_server.py`/`platform-analysis-server.py`.
- Review quarantined files as needed before deletion.
# Cleanup System Documentation

## Overview
This document outlines the cleanup procedures and systems used in the Cochran Films Landing project, including the revolutionary AI-powered Premiere Pro automation system.

## 🎨 User Portal Login Redesign Cleanup

### New Addition: Modern Apple Glass Login Design Cleanup
The user portal login redesign includes cleanup procedures to maintain the new glass-morphism design and remove old animated elements.

#### Removed Elements
- **Floating Elements**: Removed animated 3D floating icons (🎬📹🎥✨🌟)
- **Old Background**: Replaced with modern gradient background
- **Input Icons**: Removed old input field icons and lines
- **3D Animations**: Replaced with subtle glass effects and shadows

#### Design Cleanup
- **CSS Variables**: Updated to use modern design tokens
- **Glass Effects**: Implemented backdrop-filter blur effects
- **Responsive Design**: Added mobile-first responsive breakpoints
- **Accessibility**: Improved focus states and contrast

#### Cleanup Commands
```bash
# Clean up old login styles
npm run cleanup:login-styles

# Remove old floating elements
npm run cleanup:floating-elements

# Update design system
npm run cleanup:design-system
```

## 🔔 Enhanced Notification System Cleanup

### New Addition: Real-time Notification System Cleanup
The enhanced notification system includes cleanup procedures to maintain system performance and notification data integrity.

#### Notification Data Cleanup
- **Old Notifications**: Archive notifications older than 30 days
- **Read Notifications**: Clean up read notifications after 7 days
- **Duplicate Alerts**: Remove duplicate notification entries
- **Orphaned Data**: Clean up notifications for deleted users
- **Cache Cleanup**: Clear notification cache and temporary data

#### JSON Monitoring Cleanup
- **File Change Logs**: Archive file change detection logs
- **Monitoring Cache**: Clear monitoring system cache data
- **Update History**: Maintain update history for audit purposes
- **Performance Data**: Clean up monitoring performance metrics

#### Cleanup Commands
```bash
# Clean up notification system
npm run cleanup:notifications

# Clean monitoring cache
npm run cleanup:monitoring

# Archive old notifications
npm run cleanup:notification-archive

# Full notification cleanup
npm run cleanup:notification-system
```

#### Automated Cleanup Schedule
- **Daily**: Clean notifications older than 7 days
- **Weekly**: Archive notifications older than 30 days
- **Monthly**: Deep clean of monitoring cache and logs

## 🎬 AI Video Editor Cleanup

### New Addition: Automated Premiere Pro Editing System Cleanup
The AI Video Editor system includes comprehensive cleanup procedures to maintain system performance and data integrity.

## 🔧 Refactored Modules Cleanup

### New Addition: DropdownManager Module Refactoring Cleanup
The DropdownManager module refactoring includes cleanup procedures to maintain the new Component Library architecture and remove legacy code patterns.

#### Removed Elements
- **Inline Styles**: Removed all hardcoded inline CSS styles
- **HTML Strings**: Replaced HTML string concatenation with DOM element creation
- **Legacy Event Handling**: Updated to use modern event listener patterns
- **Hardcoded UI**: Replaced with modular component creation methods

#### Code Cleanup
- **Component Library Integration**: Added proper Component Library initialization waiting
- **Modular DOM Creation**: Implemented separate methods for creating UI sections
- **CSS Class Structure**: Replaced inline styles with proper CSS class-based styling
- **Event Handler Organization**: Centralized event listener setup and management
- **Responsive Design**: Added comprehensive mobile-first responsive CSS

#### Cleanup Commands
```bash
# Clean up old dropdown manager code
npm run cleanup:dropdown-manager

# Remove legacy inline styles
npm run cleanup:inline-styles

# Update component library integration
npm run cleanup:component-library

# Full module cleanup
npm run cleanup:refactored-modules
```

## 📧 EmailJS 422 Error Fix Cleanup

### New Addition: EmailJS Error Handling and Fallback System Cleanup
The EmailJS 422 error fix system includes cleanup procedures to maintain email functionality and prevent future template errors.

#### Enhanced Error Handling Cleanup
- **422 Error Handling**: Added specific handling for unprocessable entity errors
- **Parameter Validation**: Implemented comprehensive parameter validation and defaults
- **Fallback Templates**: Added automatic fallback to alternative templates
- **Error Categorization**: Improved error messages with troubleshooting guidance
- **User Feedback**: Enhanced notification system for email status

#### Template Variable Cleanup
- **Required Parameters**: Validated all required template variables
- **Default Values**: Implemented fallback values for missing parameters
- **Parameter Sanitization**: Added logging and validation before sending
- **Variable Matching**: Ensured template variables match EmailJS requirements exactly

#### Testing and Debug Tools Cleanup
- **Test Scripts**: Created comprehensive EmailJS testing tools
- **Debug Functions**: Added admin dashboard test button and functions
- **Diagnostic Pages**: Built interactive test pages for troubleshooting
- **Console Logging**: Enhanced logging for debugging and monitoring

#### Cleanup Commands
```bash
# Test EmailJS functionality
npm run test:emailjs

# Validate template variables
npm run validate:emailjs-templates

# Check EmailJS configuration
npm run check:emailjs-config

# Full EmailJS system cleanup
npm run cleanup:emailjs-system
```

#### Automated Cleanup Schedule
- **Before Sending**: Validate all email parameters
- **On Error**: Attempt fallback template automatically
- **Daily**: Check EmailJS service status and configuration
- **Weekly**: Validate template variable requirements

#### Refactoring Benefits
- **Maintainability**: Cleaner, more organized code structure
- **Consistency**: Matches architecture of other refactored modules
- **Performance**: Better DOM manipulation and event handling
- **Responsiveness**: Professional mobile-first design system
- **Extensibility**: Easier to add new features and modifications

#### Automated Cleanup Schedule
- **After Refactoring**: Clean up legacy code and inline styles
- **Component Updates**: Maintain consistency with Component Library
- **Style Updates**: Ensure CSS class structure remains clean
- **Code Reviews**: Regular cleanup of any new inline styles or legacy patterns

## 🔐 Modular Admin Dashboard Authentication System Cleanup

### New Addition: Admin Dashboard Loading Issue Fix and Cleanup
The admin dashboard loading issue fix system includes cleanup procedures to prevent infinite loading states and ensure proper module initialization.

## 🔥 Firestore Database Integration Cleanup

### New Addition: Firestore Database Integration and Data Management
The Firestore database integration system provides real-time data synchronization and cloud storage for all application data.

#### Firestore Configuration Cleanup
- **Centralized Configuration**: Single Firebase config file for all applications
- **Firestore SDK Integration**: Proper Firestore SDK loading and initialization
- **Authentication Integration**: Seamless Firebase Auth integration with existing systems
- **Error Handling**: Comprehensive error handling for Firebase operations
- **Fallback Systems**: Graceful fallback to JSON APIs when Firestore unavailable

#### Data Management Cleanup
- **Real-time Listeners**: Automatic data synchronization across all clients
- **Data Migration**: Tools to migrate existing JSON data to Firestore
- **Batch Operations**: Efficient batch write operations for multiple documents
- **Collection Management**: Organized collection structure for users, jobs, and options
- **Data Validation**: Input validation and data integrity checks

#### Application Integration Cleanup
- **Admin Dashboard**: Full Firestore integration with fallback to GitHub
- **User Portal**: Real-time data updates and cloud storage
- **Modular System**: Compatible with existing modular architecture
- **Performance Optimization**: Efficient data loading and caching strategies

#### Loading State Management Cleanup
- **Infinite Loading Prevention**: Added safety timeouts and emergency clear functions
- **Module Loading Failures**: Implemented graceful handling of failed module loads
- **Loading State Tracking**: Added timestamps and duration monitoring for all loading operations
- **Safety Mechanisms**: Implemented automatic cleanup of stuck loading states
- **Emergency Controls**: Added manual emergency clear functions for debugging

#### Module Initialization Cleanup
- **Timeout Handling**: Added configurable timeouts for module loading operations
- **Error Recovery**: Implemented graceful fallback when modules fail to load
- **Circular Dependency Prevention**: Added checks to prevent infinite waiting loops
- **Module Availability Checks**: Enhanced validation of required module dependencies
- **Initialization Logging**: Improved logging for debugging module loading issues

#### Safety Mechanism Cleanup
- **Global Safety Timeout**: Force clear all loading states after 60 seconds
- **Stuck State Detection**: Automatically detect and clear loading states stuck for 30+ seconds
- **Periodic Health Checks**: Run health checks every 10 seconds to prevent stuck states
- **Emergency Clear Functions**: Provide manual emergency clear for stuck loading states
- **Loading State Reset**: Complete reset of all loading state tracking

#### Debug and Testing Cleanup
- **Loading Debug Script**: Created comprehensive debugging tools for loading issues
- **Test Pages**: Built interactive test pages for loading state validation
- **Console Monitoring**: Enhanced console logging for loading state tracking
- **Performance Metrics**: Track loading duration and identify bottlenecks
- **Error Reporting**: Improved error reporting for loading-related issues

#### Cleanup Commands
```bash
# Test loading manager functionality
open admin-dashboard-modular/test-loading-fix.html

# Emergency clear loading states (browser console)
LoadingManager.emergencyClear()

# Check loading state health (browser console)
LoadingManager.checkForStuckLoadingStates()

# Clear all loading states (browser console)
LoadingManager.clearAllLoadingStates()

# Debug loading issues (browser console)
DebugLoading.runDebug()
```

#### Automated Cleanup Schedule
- **Every 10 seconds**: Check for stuck loading states
- **Every 30 seconds**: Clear loading states stuck for too long
- **After 60 seconds**: Force clear all loading states globally
- **On initialization**: Set safety timeout to prevent infinite loading
- **On errors**: Automatically clear loading states and continue

#### Refactoring Benefits
- **Reliability**: Prevents infinite loading states that block user interaction
- **Performance**: Faster initialization with graceful fallbacks for failed modules
- **Debugging**: Comprehensive tools for identifying and resolving loading issues
- **User Experience**: Users can always access the dashboard, even with module failures
- **Maintainability**: Cleaner error handling and module initialization logic

### New Addition: Dual Authentication System Cleanup
The modular admin dashboard authentication system includes cleanup procedures to maintain both Firebase and fallback authentication systems.

#### Authentication Data Cleanup
- **Firebase Sessions**: Clean up expired Firebase authentication sessions
- **Fallback Sessions**: Remove old fallback authentication data
- **Admin User Cache**: Clear cached admin user information
- **Session Storage**: Clean up session storage data older than 24 hours
- **Authentication Logs**: Archive authentication attempt logs

#### System Integration Cleanup
- **Firebase Events**: Clean up Firebase initialization event listeners
- **Module Dependencies**: Remove unused authentication module dependencies
- **Test Files**: Archive old authentication test files
- **Configuration Cache**: Clear Firebase configuration cache
- **Error Logs**: Clean up authentication error logs

#### Security Cleanup
- **Password Reset**: Rotate fallback admin password regularly
- **Admin List**: Update admin email list and remove old entries
- **Access Logs**: Archive access logs for security auditing
- **Session Validation**: Clean up invalid session data
- **Privilege Cache**: Clear cached privilege information

#### Cleanup Commands
```bash
# Clean up authentication system
npm run cleanup:auth-system

# Clean Firebase sessions
npm run cleanup:firebase-sessions

# Clean fallback auth data
npm run cleanup:fallback-auth

# Clean authentication logs
npm run cleanup:auth-logs

# Full authentication cleanup
npm run cleanup:auth-full
```

#### Automated Cleanup Schedule
- **Hourly**: Clean expired sessions and invalid data
- **Daily**: Clean authentication logs and cache
- **Weekly**: Rotate fallback passwords and update admin lists
- **Monthly**: Deep clean of authentication system data

### New Addition: DashboardManager Module Creation Cleanup
The DashboardManager module creation includes cleanup procedures to maintain the new centralized dashboard architecture and ensure proper integration with other modules.

#### Removed Elements
- **Scattered Dashboard Logic**: Consolidated dashboard functionality from multiple files
- **Inline Scripts**: Replaced with proper module structure and Component Library integration
- **Hardcoded Stats**: Replaced with dynamic stats calculation from real data
- **Legacy Authentication**: Updated to use proper session management and Firebase integration

#### Added Elements
- **Centralized Dashboard Management**: Single module for all dashboard functionality
- **Component Library Integration**: Full integration with Component Library architecture
- **Professional UI Design**: Modern, responsive dashboard interface with proper CSS classes
- **Real-time Stats**: Dynamic calculation of creators, jobs, reviews, and contracts
- **Authentication System**: Proper session management and admin privilege checking
- **Event System**: Comprehensive event system for dashboard interactions
- **Testing Suite**: Complete testing integration with test-refactored-modules.html

#### Maintenance Procedures
- **Regular Testing**: Run test-refactored-modules.html to verify functionality
- **CSS Updates**: Update components.css for any styling changes
- **Stats Monitoring**: Monitor real-time stats calculation and display
- **Authentication Checks**: Verify admin privileges and session management
- **Event Monitoring**: Monitor custom events for proper integration
- **Status Indicators**: Check status indicators for real-time monitoring

#### Cleanup Commands
```bash
# Clean up old dashboard code
npm run cleanup:dashboard-manager

# Verify dashboard integration
npm run test:dashboard-manager

# Clean dashboard styles
npm run cleanup:dashboard-styles
```

#### Temporary File Cleanup
- **ExtendScript Files**: Clean up temporary ExtendScript execution files
- **Configuration Files**: Remove temporary config files after processing
- **Media Cache**: Clear Premiere Pro media cache files
- **Export Logs**: Archive and clean export log files
- **Project Files**: Clean up temporary Premiere Pro project files

#### Cleanup Commands
```bash
# Clean up AI Video Editor temporary files
npm run cleanup:ai-editor

# Clean specific components
npm run cleanup:styles
npm run cleanup:media
npm run cleanup:premiere
npm run cleanup:bridge

# Full system cleanup
npm run cleanup:all
```

#### Automated Cleanup Schedule
- **Daily**: Clean temporary files older than 24 hours
- **Weekly**: Archive and compress log files
- **Monthly**: Deep clean of media cache and project files

## 🔌 API Infrastructure Cleanup

### New Addition: API Endpoint System Cleanup
The API infrastructure includes cleanup procedures to maintain system performance and ensure proper endpoint functionality.

#### API Endpoint Cleanup
- **Missing Endpoints**: Added missing API endpoints for local development
- **Environment Detection**: Implemented automatic environment detection system
- **API Base URL**: Added dynamic API base URL configuration
- **Response Validation**: Ensured all endpoints return proper JSON responses
- **Error Handling**: Improved error handling and logging for all endpoints

#### Server Configuration Cleanup
- **Port Conflicts**: Resolved port 8000 conflicts and server restart issues
- **Route Configuration**: Fixed API route definitions and middleware setup
- **CORS Handling**: Ensured proper CORS configuration for all endpoints
- **File Paths**: Fixed file path resolution for JSON data files
- **GitHub Integration**: Added mock GitHub API responses for local testing

#### Cleanup Commands
```bash
# Clean up server configuration
npm run cleanup:server-config

# Clean API endpoints
npm run cleanup:api-endpoints

# Clean server logs
npm run cleanup:server-logs

# Full API cleanup
npm run cleanup:api-system
```

#### Automated Cleanup Schedule
- **Daily**: Clean server logs and temporary files
- **Weekly**: Verify all API endpoints are functioning
- **Monthly**: Deep clean of server configuration and logs

#### API Endpoints Maintained
- ✅ `/api/health` - Server health check
- ✅ `/api/users` - User data retrieval  
- ✅ `/api/jobs-data` - Job listings data
- ✅ `/api/update-job-status` - Job status toggle (Active/Inactive)
- ✅ `/api/notifications` - User notifications
- ✅ `/api/uploaded-contracts` - Contract file data
- ✅ `/api/github/info` - GitHub repository info
- ✅ `/api/github/file/:filename` - GitHub file operations
- ✅ `/api/dropdown-options` - Form dropdown data

## 🧹 General Cleanup Procedures

### Core Cleanup Functions

#### User Data Cleanup
- **User Deletion**: Complete removal of user data and associated files
- **PDF Cleanup**: Automatic deletion of user-specific PDF contracts
- **Profile Cleanup**: Removal of user profile data and preferences
- **Session Cleanup**: Clear expired user sessions and authentication data

#### Authentication Cleanup (2025-01-10)
- User authentication is handled by Firebase; do not persist plaintext `profile.password` in `users.json`.
- Contract signing should only update contract status fields in `users.json` and ensure the Firebase account exists/updated via `/api/firebase`.
- The user portal validates the user by email against `/api/users` after Firebase login; if missing, onboard via admin flows rather than writing a password field.

#### File System Cleanup
- **Backup Management**: Rotate and compress backup files
- **Log Cleanup**: Archive and remove old log files
- **Cache Cleanup**: Clear browser and application cache files
- **Temporary Files**: Remove temporary files and downloads

#### Database Cleanup
- **Orphaned Records**: Remove records without associated users
- **Duplicate Data**: Clean up duplicate entries
- **Expired Data**: Remove expired contracts and notifications
- **Performance Optimization**: Reindex and optimize database

### Cleanup Procedures

#### Automatic Cleanup
```javascript
// Daily cleanup routine
function dailyCleanup() {
    cleanupTemporaryFiles();
    cleanupExpiredSessions();
    cleanupOldLogs();
    cleanupOrphanedRecords();
}

// Weekly cleanup routine
function weeklyCleanup() {
    archiveLogFiles();
    compressBackups();
    optimizeDatabase();
    cleanupMediaCache();
}

// Monthly cleanup routine
function monthlyCleanup() {
    deepCleanup();
    performanceOptimization();
    securityAudit();
    systemHealthCheck();
}
```

#### Manual Cleanup
```bash
# Run cleanup procedures
npm run cleanup

# Clean specific areas
npm run cleanup:users
npm run cleanup:files
npm run cleanup:database
npm run cleanup:logs

# Force cleanup (ignore warnings)
npm run cleanup:force
```

### Cleanup Categories

#### User Management Cleanup
- **User Deletion**: Complete removal of user accounts
- **Profile Cleanup**: Remove user profile data
- **Session Cleanup**: Clear expired sessions
- **Authentication Cleanup**: Remove old auth tokens

#### File Management Cleanup
- **PDF Cleanup**: Remove generated PDF contracts
- **Backup Cleanup**: Rotate and compress backups
- **Media Cleanup**: Remove unused media files
- **Cache Cleanup**: Clear application cache

#### Database Cleanup
- **Orphaned Records**: Remove unlinked data
- **Duplicate Cleanup**: Remove duplicate entries
- **Performance Cleanup**: Optimize database performance
- **Integrity Cleanup**: Fix data integrity issues

#### System Cleanup
- **Log Cleanup**: Archive and remove old logs
- **Temporary Cleanup**: Remove temp files
- **Session Cleanup**: Clear expired sessions
- **Cache Cleanup**: Clear system cache

### Cleanup Verification

#### Verification Procedures
```javascript
// Verify cleanup completion
function verifyCleanup() {
    checkFileRemoval();
    checkDatabaseIntegrity();
    checkSystemPerformance();
    checkSecurityStatus();
}

// Generate cleanup report
function generateCleanupReport() {
    const report = {
        filesRemoved: countRemovedFiles(),
        databaseOptimized: checkDatabaseStatus(),
        performanceImproved: measurePerformance(),
        securityEnhanced: auditSecurity()
    };
    return report;
}
```

#### Cleanup Monitoring
- **Real-time Monitoring**: Track cleanup progress
- **Error Reporting**: Log cleanup errors and issues
- **Performance Tracking**: Monitor system performance impact
- **Security Auditing**: Verify security after cleanup

### Cleanup Safety Measures

#### Data Protection
- **Backup Before Cleanup**: Create backups before major cleanup
- **Verification Steps**: Verify data integrity after cleanup
- **Rollback Capability**: Ability to restore if cleanup fails
- **Audit Trail**: Log all cleanup activities

#### Safety Checks
```javascript
// Safety checks before cleanup
function safetyChecks() {
    checkBackupStatus();
    verifyDataIntegrity();
    checkSystemHealth();
    validatePermissions();
}

// Emergency rollback
function emergencyRollback() {
    restoreFromBackup();
    notifyAdministrators();
    logEmergencyAction();
    suspendCleanup();
}
```

### Cleanup Scheduling

#### Automated Scheduling
```javascript
// Schedule cleanup tasks
const cleanupSchedule = {
    daily: {
        time: '02:00',
        tasks: ['tempFiles', 'sessions', 'logs']
    },
    weekly: {
        day: 'Sunday',
        time: '03:00',
        tasks: ['backups', 'database', 'media']
    },
    monthly: {
        day: 1,
        time: '04:00',
        tasks: ['deepCleanup', 'optimization', 'audit']
    }
};
```

#### Manual Scheduling
```bash
# Schedule cleanup tasks
npm run schedule:cleanup

# View cleanup schedule
npm run schedule:view

# Modify cleanup schedule
npm run schedule:modify
```

### Cleanup Performance

#### Performance Monitoring
- **Execution Time**: Track cleanup duration
- **Resource Usage**: Monitor CPU and memory usage
- **Impact Assessment**: Measure system performance impact
- **Optimization**: Continuously improve cleanup efficiency

#### Performance Metrics
```javascript
// Performance tracking
const performanceMetrics = {
    executionTime: measureExecutionTime(),
    resourceUsage: monitorResourceUsage(),
    systemImpact: assessSystemImpact(),
    efficiencyScore: calculateEfficiency()
};
```

### Cleanup Reporting

#### Report Generation
```javascript
// Generate cleanup reports
function generateCleanupReport() {
    return {
        summary: {
            totalFilesRemoved: countRemovedFiles(),
            databaseOptimizations: countOptimizations(),
            performanceImprovements: measureImprovements(),
            securityEnhancements: countEnhancements()
        },
        details: {
            fileCleanup: getFileCleanupDetails(),
            databaseCleanup: getDatabaseCleanupDetails(),
            systemCleanup: getSystemCleanupDetails(),
            aiEditorCleanup: getAIEditorCleanupDetails()
        },
        recommendations: {
            nextSteps: generateRecommendations(),
            optimizations: suggestOptimizations(),
            maintenance: scheduleMaintenance()
        }
    };
}
```

#### Report Distribution
- **Email Reports**: Send cleanup reports via email
- **Dashboard Integration**: Display reports in admin dashboard
- **Log Archiving**: Archive reports for historical tracking
- **Alert System**: Notify administrators of issues

## 🎬 AI Video Editor Integration

The AI Video Editor system integrates with the existing cleanup framework:

### New Cleanup Categories
1. **Style Cleanup** - Remove unused style configurations
2. **Media Cleanup** - Clean up temporary media files
3. **Premiere Pro Cleanup** - Clean ExtendScript and project files
4. **Bridge Cleanup** - Clean Node.js bridge temporary files
5. **Export Cleanup** - Clean up exported video files

### AI Editor Cleanup Commands
```bash
# Clean AI Video Editor components
npm run cleanup:ai-editor

# Clean specific AI components
npm run cleanup:styles
npm run cleanup:media
npm run cleanup:premiere
npm run cleanup:bridge
npm run cleanup:exports

# Full AI Editor cleanup
npm run cleanup:ai-full
```

### Integration Points
- Uses existing backup and verification systems
- Integrates with current logging infrastructure
- Leverages existing notification system
- Utilizes current performance monitoring

This comprehensive cleanup system ensures both the original Cochran Films Landing functionality and the revolutionary AI Video Editor system maintain optimal performance and data integrity. 

## Recent Cleanup Notes (2025-01-09)

### CSS Overflow and Absolute Normalization (Login)
- Context: Some decorative/absolute elements were escaping the viewport on the login route, causing right-edge clipping and horizontal scroll.
- Action: Added a scoped normalization block at the end of `styles/user-portal-theme.css` titled "LAYOUT FIXES: LOGIN + OVERFLOW/ABSOLUTE NORMALIZATION".
- Effect: Neutralizes absolute/fixed and transform-based elements inside `#loginScreen`, prevents overflow, and disables portal-only effects on the login route without impacting `#userPortal`.
- Cleanup Impact: Reduces visual noise and layout drift; no removal of assets required.

---

## Data Hygiene: Archived Users Exclusion (2025-08-10)

- Dashboard metrics now intentionally exclude users in the `_archived` bucket and any underscore-prefixed keys in `users`.
- When cleaning datasets, ensure archived users remain under `users._archived` to keep counts accurate.
- If restoring a user, move their record from `users._archived` back to the root and remove any leading-underscore keys.

## UI Consistency: Card Contrast (2025-08-10)

- To prevent readability regressions, the user portal now enforces a dark background on the `profile-card`, `project-card`, and `payment-card` containers.
- If adding new dashboard cards that display white text, apply the same pattern or reuse these classes to maintain contrast.

## Login Overlay Centering Hardening (2025-08-13)

- Files: `styles/user-portal-theme.css`
- Change: Added a final override to enforce `#loginScreen { position: fixed; inset: 0; display: grid; place-items: center; }` and constrain `.login-container` width.
- Purpose: Prevent late-arriving styles/JS from shifting the login panel left.
- Cleanup guidance: If future layout systems add grids/rows at the root, ensure `#loginScreen` remains isolated and loaded last. Remove any duplicated `.login-screen` rules in inline `<style>` blocks when consolidating.

---

## Modular System Fixes (2025-01-09)

### Critical Issues Resolved
1. **Safety Timeout Scope Error**: Fixed `safetyTimeout` variable scope issue in `AdminDashboardApp.init()` that was causing "ReferenceError: safetyTimeout is not defined"
2. **EmailJS Test Function**: Fixed `testParams` undefined error in `testEmailJS()` function
3. **Firebase Authentication Conflicts**: Resolved duplicate auth state listeners causing unexpected user sign-outs

### Code Changes Made

#### 1. Safety Timeout Fix (`admin-dashboard-modular/js/app.js`)
- **Problem**: `safetyTimeout` was declared as local variable but referenced in `finally` block
- **Solution**: Moved `safetyTimeout` to class-level property and added proper null checking
- **Impact**: Prevents modular system initialization failure

#### 2. EmailJS Test Function Fix (`admin-dashboard.html`)
- **Problem**: `testParams` variable was undefined in error handling
- **Solution**: Fixed variable scope and corrected error message for 403 status
- **Impact**: EmailJS testing now works correctly

#### 3. Firebase Authentication Coordination (`admin-dashboard-modular/js/app.js` & `admin-dashboard-modular/js/auth/auth-manager.js`)
- **Problem**: Multiple auth state listeners causing conflicts and unexpected sign-outs
- **Solution**: Added `isHandlingAuth` flag to prevent duplicate listener setup
- **Impact**: Eliminates authentication conflicts between modular and main dashboard systems

#### 4. Firebase Configuration Enhancement (`firebase-config.js`)
- **Problem**: Missing `waitForInit()` method required by auth-manager
- **Solution**: Added `waitForInit()` method for proper initialization coordination
- **Impact**: Improves Firebase initialization reliability

### Testing and Verification
- **Test Pages**: Created comprehensive test pages to verify all fixes in browser
  - `test-modular-system-fixes.html` - Dynamic loading test page
  - `test-modular-system-complete.html` - Complete modular system test page
- **Manual Testing**: Modular system now loads without errors
- **Authentication**: Single auth state listener prevents conflicts

### Maintenance Notes
- **Future Development**: When adding new auth components, check `isHandlingAuth` flag first
- **Firebase Integration**: Use `waitForInit()` method for proper initialization coordination
- **Error Handling**: Always check for existing listeners before setting up new ones

### Cleanup Commands
```bash
# Test modular system fixes
# Open test-modular-system-complete.html in browser for comprehensive testing
# Or use test-modular-system-fixes.html for dynamic loading tests

# Verify Firebase configuration
curl http://localhost:8000/api/health

# Check for duplicate auth listeners in console
# Look for multiple "Firebase auth state observer setup complete" messages
```

---

## Contracts API Endpoint Enhancement (2025-01-09)

### API Behavior Cleanup
- **Dual-Purpose Handling**: Enhanced GET endpoint to handle both contract listing and PDF serving
- **Error Handling**: Added proper error handling for missing contract data files
- **Backward Compatibility**: Maintained existing PDF download functionality
- **Data Validation**: Integrated with uploaded-contracts.json for consistent data structure

### Code Cleanup
- **Enhanced GET Handler**: Modified to gracefully handle both parameter scenarios
- **File System Integration**: Seamless integration with existing contract data
- **Logging Enhancement**: Added comprehensive logging for debugging and monitoring
- **Response Format**: Standardized response format for contract listings

### Maintenance Procedures
- **Daily**: Verify API endpoint availability and response times
- **Weekly**: Check contract data integrity and file consistency  
- **Monthly**: Review API logs and performance metrics

### Cleanup Commands
```bash
# Test contracts API functionality
curl http://localhost:8000/api/contracts

# Validate PDF serving
curl "http://localhost:8000/api/contracts?filename=test.pdf"

# Check API health
curl http://localhost:8000/api/health
```
