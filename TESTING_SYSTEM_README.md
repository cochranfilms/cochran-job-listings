## Firestore Single Source of Truth Integration (Apply + Contract)

- apply.html now initializes Firebase/Firestore via `firebase-config.js` and writes applications to the `users` collection using `FirestoreDataManager.setUser(name, {...})`. It still performs a best-effort backup to `/api/apply` to keep GitHub JSON in sync, but Firestore is primary.
- contract.html now loads users primarily from Firestore (`FirestoreDataManager.getUsers()`), falling back to `/api/users` only if Firestore is unavailable. When a contract is signed, it:
  - Updates the user's `contract` metadata in Firestore (`contractStatus`, `contractSignedDate`, optional `fileUrl` if uploaded), then updates users.json via the existing GitHub API as a backup.
  - Mirrors the signed contract into the `contracts` collection with `FirestoreDataManager.setContract(id, data)`.
  - Existing EmailJS flows are unchanged, but now assume Firestore holds the canonical user/job state.
  - Deletion flow: From `admin-dashboard.html` you can now delete a contract directly. This removes the Firestore `contracts/<id>` doc, clears the user's `contract` field, and calls `/api/delete-pdf` to remove the PDF (local/GitHub best-effort).
  - Auto-migration is disabled by default. To re-seed Firestore from backups intentionally, set `window.FIRESTORE_AUTO_MIGRATION = true;` before loading the dashboard, then refresh.

Smoke tests:
- Apply Flow: Open `/apply.html`, submit a new application, verify a new doc appears in Firestore `users` with `application.status=pending`, and the user appears in `admin-dashboard.html` pending list. Approve from admin; verify EmailJS fired and Firestore user updated to `application.status=approved` with `profile.approvedDate`.
- Contract Flow: In `/contract.html`, access with the approved user. Sign contract; verify Firestore `users/<name>.contract.contractStatus` updates to `signed` or `uploaded` and `contracts/<contractId>` exists. Verify backup JSON also updated.
Test/Debug Cleanup Policy

- The repository includes historical test and debug artifacts. Use the cleanup utility to keep production HTMLs clean (`admin-dashboard.html`, `user-portal.html`).

Commands

```bash
# dry-run
npm run cleanup-tests

# list
npm run cleanup-tests:list

# apply
npm run cleanup-tests:apply
```

After applying cleanup, re-test the main flows:
- Admin auth/login and stats load in `admin-dashboard.html`
- User portal auth and data load in `user-portal.html`
 - Contract deletion from Contracts list removes Firestore doc and attempts PDF cleanup
 - Sign-out race hardening in `user-portal.html` (2025-08-17): `loadUserData()` snapshots `currentUser.email` and re-validates after async awaits to prevent null dereference when the user signs out during refresh.
# 🧪 Testing System Documentation

## Overview
This document describes the comprehensive testing system for the Cochran Films admin dashboard and user management system.

## Landing Page Slideshow/Header Merge (2025-08-17)

- The standalone header in `index.html` has been merged into the first slide of the pitch slideshow to focus messaging on creators joining the team.
- The logo is preserved and displayed at the top of slide 1. The original header copy is adapted for creators.
- CTA buttons on slide 1 now include a primary in-page CTA that scrolls to the jobs grid via `#jobs`.
- The jobs section root is now `section id="jobs"` for anchor navigation.

### Quick Test
1. Open `index.html` locally (or `https://collaborate.cochranfilms.com`).
2. Verify slide 1 shows the Cochran Films logo, the creator-focused headline/subhead, and two CTAs.
3. Click “JOIN THE ROSTER” → page should smooth-scroll to the jobs list.
4. Use arrow keys or nav dots to move between slides; ensure the last slide no longer auto-advances.
5. Confirm mobile swipe left/right still changes slides; first slide content fits and remains centered.
6. Verify jobs still load from Firestore (or fallback) and the Refresh button still works.

## Admin Dashboard Redesign (2025-08-17)

- New shell with sidebar navigation and routed content area is built by `AdminDashboardApp.buildLayout()`.
- Primary routes: `dashboard`, `users`, `jobs`, `contracts`, `dropdowns`.
- Rendering:
  - Users → `UserList.renderUserManagement('userManagementRoot')` (includes `UserForm`).
  - Jobs → `JobForm.renderForm('jobFormContainer')` + `JobList.renderJobManagement('jobListContainer')`.
  - Contracts → `ContractManager.renderContractManagement('contractManagerContainer')`.
  - Dropdowns → `DropdownManager.renderDropdownManagement('dropdownManagerContainer')`.
- Firestore manager is loaded via `../firestore-data-manager.js` and used with JSON fallback.

### Firestore Single Source of Truth (2025-08-17)
- The admin dashboard now reads/writes Firestore first for all data (users, jobs, dropdownOptions, contracts).
- JSON files on GitHub are optional archival only. Toggle with `SYNC_TO_GITHUB` flag in `admin-dashboard.html` (default: false).
- Realtime listeners are enabled for `users`, `jobs`, and `dropdownOptions`; UI updates automatically on changes.

#### Dropdown Options Schema
- Collection: `dropdownOptions`
- Document: `default`
- Fields (arrays of strings): `roles`, `locations`, `rates`, `projectTypes`
- The manager auto-sanitizes legacy numeric-key fields by promoting them into `projectTypes` and persists the fix.

#### Quick Test: Dropdowns load from Firestore
1. Open the dashboard → Dropdown Management section should populate without refresh.
2. In Firestore console, edit `dropdownOptions/default.rates` (add a value); confirm it appears within a second in the UI.
3. Use the “Add” buttons; confirm values appear immediately and exist in Firestore `dropdownOptions/default`.

### Quick Test Steps
1. Open `admin-dashboard-modular/index.html`.
2. Login; verify the legacy test UI hides and the new shell shows.
3. Click each sidebar item; confirm the correct module renders and actions work (edit user jobs modal, job apply progress, etc.).
4. Verify no console errors; Firestore presence is optional.

## Test Scripts
### 10. Firestore Job Assignments Alignment
**Purpose**: Validate the Firestore-aligned model (global job listings + per-user assignments) and UI wiring.

**What changed**:
- Global job listings now live in Firestore `jobs` collection (plus existing JSON fallback via `/api/jobs-data`).
- Per-user job progression lives under `users/{userId}/assignments/{assignmentId}` (status, progress, paymentStatus, snapshots), with JSON fallback via `/api/update-users`.
- Admin UI updates both Firestore (when available) and JSON for reliability.

**Admin UI points**:
- Jobs → each job card shows “User Status” + “Progress” controls with an Apply button. Applies to all users assigned to that listing (by `jobRef` or title match), persists to Firestore assignments and `users.json`.
- Users → “🧭 Jobs” opens a modal to manage that user’s assignments (status/progress/primary/remove). Persists to Firestore and `users.json`.

**Testing Steps**:
1. Start local server: `node server.js` (ensure port 8000 is free).
2. Open `admin-dashboard.html` and sign in.
3. In Jobs, change “User Status” to `in-progress`, set Progress to `25`, click Apply.
4. Verify success toast; wait for 30s polling or refresh Users.
5. Open Users → “🧭 Jobs” for an assigned user; confirm status= `in-progress`, progress= `25`.
6. If Firestore is enabled, confirm the assignment exists/updates under `users/{userId}/assignments/*` and listing exists in `jobs`.
7. Toggle to `completed` with progress `100` and verify propagation to user portal.

**Expected Behavior**:
- UI changes persist immediately to JSON and Firestore (when available).
- User portal displays updated assignment status without breaking legacy flows.
- No errors when Firestore is unavailable (JSON fallback works).


### 1. Admin User Deletion System Test (`test-admin-user-deletion-system.js`)
**Purpose**: Comprehensive testing of the user deletion flow using browser automation
**Requirements**: Puppeteer (for browser automation)
**Features**:
- Login to admin dashboard
- Check current users in users.json
- Test user deletion functionality
- Verify changes are persisted to users.json
- Verify changes are pushed to GitHub
- Test PDF file deletion from /contracts directory

**Usage**:
```bash
node test-admin-user-deletion-system.js
```

### Admin Dashboard Inline Test Helpers (maintenance)
- Named previously anonymous inline test helpers in `admin-dashboard.html` to resolve IDE "Identifier expected" errors and make invocation explicit:
  - `runAutomaticDashboardTests()`
  - `testMainDashboardLoginForm()`
  - `testMainDashboardAuthentication()`
- Scope: Dev/testing helpers only; no production behavior changed.
- Usage (open console on admin dashboard page):
  - `runAutomaticDashboardTests()` → runs a quick smoke test
  - `testMainDashboardLoginForm()` → validates form presence/wiring
  - `testMainDashboardAuthentication()` → exercises fallback auth path

### 2. Simple Admin Deletion Test (`test-admin-deletion-simple.js`)
**Purpose**: API-focused testing without browser automation
**Requirements**: Node.js only
**Features**:
- Test users API endpoint
- Test update-users API endpoint
- Test PDF deletion API
- Test Firebase API
- Verify data persistence

**Usage**:
```bash
node test-admin-deletion-simple.js
```

### 3. Live User Deletion Test (`test-live-user-deletion.js`)
**Purpose**: Testing the complete user deletion workflow
**Features**:
- Tests user creation and deletion
- Verifies PDF file cleanup
- Checks GitHub synchronization
- Validates Firebase account deletion

### 4. User Portal Login Redesign Test
**Purpose**: Testing the new modern Apple glass login design
**Features**:
- Verify glass-morphism effects render correctly
- Test responsive design on mobile devices
- Validate form functionality and error handling
- Check backdrop-filter compatibility across browsers
- Test hover and focus states for interactive elements

**Testing Steps**:
1. Open user-portal.html in various browsers
2. Test login form validation
3. Verify glass effects and shadows
4. Test responsive breakpoints
5. Check accessibility features

### 5. Enhanced Notification System Test
**Purpose**: Testing real-time notifications for JSON file updates
**Features**:
- Real-time monitoring of jobs-data.json and users.json changes
- Cross-portal notification synchronization
- Toast notification system with success/error styling
- Notification badge updates
- JSON file change detection (30-second intervals)

**Testing Steps**:
1. Open admin-dashboard.html and user-portal.html in separate tabs
2. Make changes to jobs-data.json or users.json via admin dashboard
3. Verify both portals show notification: "📄 [filename] has been updated. Found X items"
4. Check notification badge updates in both portals
5. Verify notification dropdown shows the update details
6. Test notification persistence and clearing

**Expected Behavior**:
- Notifications appear immediately when JSON files are updated
- Both portals show synchronized notification data
- Notification badges display unread count
- Toast notifications appear with success styling
- JSON monitoring runs every 30 seconds automatically

### 6. Modular Admin Dashboard Authentication Testing
**Purpose**: Comprehensive testing of the modular admin dashboard authentication system including Firebase and fallback authentication
**Features**:
- Tests Firebase authentication integration
- Tests fallback password-based authentication
- Validates admin privilege checking
- Tests authentication state management
- Verifies session persistence
- Tests error handling and fallback scenarios

**Test Files**:
- `admin-dashboard-modular/test-auth-fix.js` - Console-based authentication test script
- `admin-dashboard-modular/test-auth.html` - Interactive test page for manual testing

### 7. Admin Dashboard Loading Issue Test
**Purpose**: Testing and debugging the constant loading state issue in the admin dashboard
**Features**:
- Tests loading manager functionality and safety mechanisms
- Validates module loading without infinite loops
- Tests emergency clear functions for stuck loading states
- Monitors loading state health and performance
- Provides comprehensive debugging tools for loading issues

**Test Files**:
- `admin-dashboard-modular/test-loading-fix.html` - Interactive test page for loading state validation
- `admin-dashboard-modular/debug-loading-issue.js` - Console-based debugging script for loading issues

**Testing Steps**:
1. Open `test-loading-fix.html` in browser
2. Click "Test Loading Manager" to verify basic loading functionality
3. Click "Test Module Loading" to check for infinite loops
4. Use "Emergency Clear" if loading gets stuck
5. Check console output for detailed debugging information
6. Use browser console commands for advanced debugging

**Console Commands**:
```javascript
// Emergency clear all loading states
LoadingManager.emergencyClear()

// Check for stuck loading states
LoadingManager.checkForStuckLoadingStates()

// Clear all loading states
LoadingManager.clearAllLoadingStates()

// Run comprehensive debug
DebugLoading.runDebug()

// Check specific loading states
DebugLoading.checkLoadingStates()
```

**Expected Behavior**:
- Loading states should clear automatically after operations complete
- No infinite loading states should occur
- Emergency clear functions should work immediately
- Safety timeouts should prevent stuck loading states
- Debug tools should provide comprehensive loading state information

### 7. EmailJS 422 Error Fix Testing
**Purpose**: Comprehensive testing and diagnosis of EmailJS 422 (Unprocessable Entity) errors in the admin dashboard
**Features**:
- Tests EmailJS library loading and initialization
- Validates EmailJS configuration and service status
- Tests template variable matching and validation
- Provides fallback template mechanism for failed emails
- Comprehensive error handling and user feedback
- Domain restriction checking and troubleshooting

**Test Files**:
- `test-emailjs-fix.js` - Comprehensive EmailJS test script with console-based diagnostics
- `test-emailjs-fix.html` - Interactive test page with visual diagnostics and troubleshooting
- `EMAILJS_422_FIX_SUMMARY.md` - Complete documentation of fixes and troubleshooting steps

**Testing Steps**:
1. **Admin Dashboard Test Button**: Click "📧 Test EmailJS" button in admin dashboard
2. **Test Page**: Open `test-emailjs-fix.html` and run comprehensive diagnostics
3. **Console Testing**: Use `testEmailJS()` function in admin dashboard console
4. **Parameter Validation**: Check that all required template variables are present
5. **Fallback Testing**: Verify alternative template works when main template fails

**Expected Behavior**:
- EmailJS library loads and initializes correctly
- Template variables match exactly with EmailJS requirements
- Automatic fallback to alternative templates on 422 errors
- Comprehensive error reporting with troubleshooting guidance
- Parameter validation prevents missing or empty values
- Better user feedback and error categorization

**Troubleshooting**:
- 422 errors indicate template variable mismatches or configuration issues
- Check EmailJS dashboard for template status and service configuration
- Verify domain restrictions include `collaborate.cochranfilms.com`
- Ensure all required template variables are provided with valid values

### 7. Job Status Toggle Testing
**Purpose**: Testing the new job status toggle functionality in the admin dashboard
**Features**:
- Tests job status changes between Active and Inactive
- Validates API endpoint `/api/update-job-status`
- Tests real-time UI updates after status changes
- Verifies data persistence to jobs-data.json
- Tests error handling and validation
- Validates notification system integration

**Test Files**:
- `test-job-status-toggle.html` - Interactive test page for manual testing
- Admin dashboard job list with toggle buttons

**Testing Steps**:
1. Open `test-job-status-toggle.html` in a browser
2. Verify jobs load from `/api/jobs-data`

### 8. Firestore Database Integration Test
**Purpose**: Testing the Firestore database integration and data management system
**Features**:
- Tests Firebase configuration and initialization
- Tests Firestore connectivity and data operations
- Tests data migration from existing JSON data
- Tests real-time listeners and data synchronization
- Tests fallback systems when Firestore unavailable

**Test Files**:
- `test-firestore-setup.html` - Comprehensive Firestore integration test page
- `firebase-config.js` - Firebase configuration and initialization
- `firestore-data-manager.js` - Firestore data management and operations

**Testing Steps**:
1. Open `test-firestore-setup.html` in browser
2. Click "Test Firebase Config" to verify Firebase initialization
3. Click "Test Firestore Data Manager" to check Firestore connectivity
4. Click "Test Data Migration" to migrate existing data to Firestore
5. Click "Test Real-time Listeners" to verify real-time updates
6. Check console output for detailed logs and error information

**Expected Behavior**:
- Firebase initializes successfully with proper configuration
- Firestore connects and allows data operations
- Data migration works without data loss
- Real-time listeners provide immediate updates
- Fallback to JSON APIs works when Firestore unavailable
- All operations provide clear success/error feedback

**Console Commands**:
```javascript
// Test Firebase configuration
testFirebaseConfig()

// Test Firestore data manager
testFirestoreDataManager()

// Test data migration
testDataMigration()

// Test real-time listeners
testRealtimeListeners()

// Check Firestore availability
window.FirestoreDataManager.isAvailable()

// Manually migrate data
window.FirestoreDataManager.migrateDataToFirestore()
```

### 9. Modular System Fixes Testing
**Purpose**: Testing the fixes for critical modular system issues including safetyTimeout, EmailJS, and Firebase authentication conflicts
**Features**:
- Tests safetyTimeout variable scope fix in AdminDashboardApp
- Tests EmailJS test function parameter definitions
- Tests Firebase configuration and waitForInit method
- Tests AuthManager authentication handling coordination
- Tests for duplicate auth state listeners

**Test Files**:
- `test-modular-system-complete.html` - Complete modular system test page (recommended)
- `test-modular-system-fixes.html` - Dynamic loading test page for troubleshooting
- `admin-dashboard-modular/js/app.js` - Fixed AdminDashboardApp with proper safetyTimeout handling
- `admin-dashboard-modular/js/auth/auth-manager.js` - Enhanced AuthManager with conflict prevention

**Testing Steps**:
1. Open `test-modular-system-complete.html` in browser (recommended)
2. Wait for page to load and check module status cards
3. Click "Run All Tests" button or individual test buttons
4. Check test results and console output for all test results
5. Verify modular system loads without safetyTimeout errors
6. Test EmailJS functionality in admin dashboard
7. Monitor console for duplicate auth setup messages

**Expected Behavior**:
- All tests pass without errors
- Modular system initializes successfully
- No "ReferenceError: safetyTimeout is not defined" errors
- EmailJS test function works correctly
- Single auth state listener setup per component
- No unexpected user sign-outs due to auth conflicts

**Console Commands**:
```javascript
// Run comprehensive test
// Use test-modular-system-complete.html page

// Check AdminDashboardApp safetyTimeout
AdminDashboardApp.safetyTimeout

// Test EmailJS function
testEmailJS()

// Check Firebase configuration
window.FirebaseConfig.waitForInit()

// Verify AuthManager coordination
window.AuthManager.isHandlingAuth
```

**Troubleshooting**:
- If safetyTimeout errors persist, check AdminDashboardApp.safetyTimeout property
- If EmailJS fails, verify testParams variable scope in testEmailJS function
- If duplicate auth listeners detected, check isHandlingAuth flag usage
- Monitor console for "Firebase auth state observer setup complete" messages

3. Click toggle buttons to change job status
4. Verify API calls to `/api/update-job-status` succeed
5. Check that jobs-data.json is updated
6. Verify UI reflects status changes immediately
7. Test error handling with invalid requests

**Expected Behavior**:
- Jobs display with current Active/Inactive status
- Toggle buttons show appropriate text (Activate/Deactivate)
- Status changes are saved to jobs-data.json
- UI updates immediately after successful status change
- Success notifications appear after status updates
- Error handling for invalid requests or server errors

### 7. Real-Time Data System Testing
**Purpose**: Testing the new real-time data synchronization system between JSON and Firebase Firestore
**Features**:
- Tests Firebase Firestore connection and configuration
- Tests real-time data listeners and synchronization
- Validates hybrid data fetching (Firestore → Cache → JSON)
- Tests data migration utility from JSON to Firestore
- Verifies real-time UI updates without page refresh
- Tests fallback systems when Firestore is unavailable

**Test Files**:
- `admin-dashboard-modular/test-realtime-system.html` - Comprehensive real-time system test page
- `admin-dashboard-modular/js/utils/realtime-data-manager.js` - Real-time data manager module
- `admin-dashboard-modular/js/utils/data-migration.js` - Data migration utility

**Testing Steps**:
1. Open `admin-dashboard-modular/test-realtime-system.html` in browser
2. Check system status indicators for all components
3. Test Firebase connection using "🔥 Test Firebase" button
4. Test Firestore connection using "📊 Test Firestore" button
5. Test Real-Time Manager using "🔄 Test Real-Time" button
6. Test data migration using "🚀 Start Migration" button
7. Monitor system logs for real-time updates
8. Verify data display shows live information

**Expected Behavior**:
- All system components show ✅ status when properly configured
- Real-time data updates appear immediately without page refresh
- Data migration progresses with visual progress bar
- System logs show detailed operation information
- Fallback to JSON system when Firestore unavailable
- Professional caching system prevents data loss

**Real-Time Features Tested**:
- **Instant Updates**: Data changes appear immediately
- **Firebase Integration**: Full Firestore real-time database
- **Hybrid System**: Automatic fallback between systems
- **Data Migration**: One-click migration with progress tracking
- **Professional Caching**: Enhanced caching with session storage
- **Error Handling**: Graceful fallbacks and error recovery

**Test Credentials**:
- **Fallback Password**: `admin123` (for development/testing)
- **Firebase Users**: Any email from admin list (info@cochranfilms.com, admin@cochranfilms.com, cody@cochranfilms.com)

**Testing Steps**:
1. Open `admin-dashboard-modular/test-auth.html` in browser
2. Run "Check System Status" to verify components are loaded
3. Test sign in with fallback password (any email + admin123)
4. Verify authentication state and admin privileges
5. Test sign out functionality
6. Open main admin dashboard and test login flow

**Expected Behavior**:
- Firebase configuration loads successfully
- Fallback authentication works with admin123 password
- Admin privileges are properly checked
- Authentication state persists across page reloads
- Error handling works gracefully for invalid credentials

### 7. API Endpoint Testing
**Purpose**: Comprehensive testing of all API endpoints for local development and production compatibility
**Features**:
- Tests all API endpoints for proper response codes
- Validates JSON response format
- Checks local development server functionality
- Verifies production environment fallbacks
- Tests environment detection system

**API Endpoints Tested**:
- `/api/health` - Server health check
- `/api/users` - User data retrieval
- `/api/jobs-data` - Job listings data
- `/api/notifications` - User notifications
- `/api/contracts` - Contract management and PDF serving

### 7. Contracts API Fix Testing
**Purpose**: Testing the fixed contracts API endpoint that now properly handles both contract listing and PDF serving
**Features**:
- Tests contract listing when no filename parameter is provided
- Tests PDF file serving when filename parameter is provided
- Validates proper error handling for missing files
- Ensures backward compatibility with existing PDF download functionality

**API Behavior**:
- **GET `/api/contracts`** (no parameters): Returns list of all contracts from uploaded-contracts.json
- **GET `/api/contracts?filename=name.pdf`**: Serves individual PDF file for download
- **POST `/api/contracts`**: Uploads new contracts to GitHub repository

**Testing Steps**:
1. Test contract listing: `curl http://localhost:8000/api/contracts`
2. Test PDF download: `curl "http://localhost:8000/api/contracts?filename=test.pdf"`
3. Verify admin dashboard loads contracts without 400 errors
4. Check that contract manager displays all contracts properly

**Expected Results**:
- Contract listing returns JSON with all contracts (no more 400 errors)
- PDF downloads work for existing files
- Admin dashboard loads contracts successfully
- Contract manager displays contract list without errors
- Contract count shows correct number (16 contracts) instead of 0

### 7. Refactored Modules Testing (`test-refactored-modules.html`)
**Purpose**: Comprehensive testing of all refactored modules using the Component Library architecture
**Features**:
- Tests Component Library integration and readiness
- Validates all refactored modules (UserForm, UserList, JobForm, JobList, ContractManager, ContractGenerator, DropdownManager)
- Interactive test interface with individual module testing
- Real-time status indicators for each module
- Comprehensive logging and error reporting
- Test automation capabilities

**Modules Tested**:
- **UserForm**: Form rendering, validation, reset functionality
- **UserList**: User management, actions, filters, refresh
- **JobForm**: Job form rendering, validation, reset
- **JobList**: Job management, actions, filters, refresh
- **ContractManager**: Contract management, actions, filters
- **ContractGenerator**: PDF generation, templates, contract creation
- **DropdownManager**: Dropdown options management, CRUD operations, import/export

**Testing Features**:
- Individual module testing with dedicated test areas
- Action testing (CRUD operations, filters, refresh)
- Component Library integration validation
- Real-time status monitoring
- Comprehensive test logging
- Export/import test results
- Responsive test interface

**Usage**:
1. Open `admin-dashboard-modular/test-refactored-modules.html` in browser
2. Wait for Component Library to initialize
3. Use individual test buttons for each module
4. Monitor status indicators for real-time feedback
5. Review test logs for detailed results
6. Use "Test All" button for comprehensive testing

**Expected Results**:
- All modules initialize successfully
- Component Library integration works properly
- Each module renders correctly in test areas
- All CRUD operations function as expected
- Status indicators show success for all modules
- Test logs provide detailed execution information
- `/api/uploaded-contracts` - Contract file data
- `/api/github/info` - GitHub repository info
- `/api/github/file/:filename` - GitHub file operations
- `/api/dropdown-options` - Form dropdown data

**Testing Steps**:
1. Start local development server: `node server.js`
2. Verify server is running on port 8000
3. Test each API endpoint individually
4. Check response status codes and JSON format
5. Verify environment detection in user portal
6. Test local vs production API base URL handling

**Expected Behavior**:
- All endpoints return 200 status codes
- JSON responses are properly formatted
- Local development uses `http://localhost:8000` as API base
- Production environment uses relative paths
- Environment detection works automatically

**Manual Testing Commands**:
```bash
# Start server
node server.js

# Test health endpoint
curl http://localhost:8000/api/health

# Test users endpoint
curl http://localhost:8000/api/users

# Test notifications endpoint
curl http://localhost:8000/api/notifications

# Test uploaded contracts endpoint
curl http://localhost:8000/api/uploaded-contracts
```

## Test Configuration

### Admin Dashboard Access
- **URL**: https://collaborate.cochranfilms.com/admin-dashboard
- **Email**: info@cochranfilms.com
- **Password**: Cochranfilms2@

### Test User Configuration
- **Test User**: "Test User Deletion"
- **Email**: test-deletion@cochranfilms.com
- **Role**: Test Role
- **Location**: Test Location

## API Endpoints Tested

### 1. Users API (`/api/users`)
- **Method**: GET
- **Purpose**: Retrieve current users data
- **Response**: JSON with users and metadata

### 2. Update Users API (`/api/update-users`)
- **Method**: POST
- **Purpose**: Update users.json and push to GitHub
- **Body**: `{ users, action, userName }`
- **Response**: Success status and GitHub update info

### 3. Delete PDF API (`/api/delete-pdf`)
- **Method**: DELETE
- **Purpose**: Delete PDF files from contracts directory
- **Body**: `{ filename }`
- **Response**: Deletion status

### 4. Firebase API (`/api/firebase`)
- **Method**: DELETE
- **Purpose**: Delete Firebase user accounts
- **Body**: `{ email }`
- **Response**: Firebase deletion status

## Test Flow

### Complete User Deletion Flow
1. **Login**: Authenticate to admin dashboard
2. **Check Users**: Verify current user count and list
3. **Create Test User**: Add a test user for deletion testing
4. **Delete User**: Execute user deletion from admin interface
5. **Verify Local Update**: Check that users.json is updated
6. **Verify GitHub Update**: Confirm changes are pushed to GitHub
7. **Verify PDF Deletion**: Check that associated PDF files are deleted
8. **Verify Firebase**: Confirm Firebase account deletion (if applicable)

### API Testing Flow
1. **Backup**: Save current users.json state
2. **Test APIs**: Verify all API endpoints are working
3. **Add Test Data**: Create test user via API
4. **Verify Persistence**: Check data is saved correctly
5. **Cleanup**: Restore original state

## Issues Identified and Fixed

### 1. User Deletion Not Persisting
**Problem**: The `deleteUser`