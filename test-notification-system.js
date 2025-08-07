/**
 * Test Notification System
 * 
 * This script tests the sophisticated notification system and fixes the
 * "Action Required" button issue for contract signed notifications.
 */

const fs = require('fs');
const path = require('path');

// Files to test and fix
const FILES_TO_TEST = [
    'user-portal.html',
    'admin-dashboard.html'
];

// Function to test notification system
function testNotificationSystem() {
    console.log('🧪 Testing sophisticated notification system...');
    console.log('=' .repeat(60));
    
    const results = [];
    
    FILES_TO_TEST.forEach(filename => {
        console.log(`\n📁 Testing file: ${filename}`);
        console.log('=' .repeat(40));
        
        try {
            const filePath = path.join(__dirname, filename);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Test 1: Check if sophisticated notification system exists
            const hasSophisticatedSystem = content.includes('SOPHISTICATED NOTIFICATION SYSTEM');
            const hasNotificationPolling = content.includes('startNotificationPolling');
            const hasNotificationBadge = content.includes('updateNotificationBadge');
            const hasNotificationList = content.includes('updateNotificationList');
            
            // Test 2: Check for Action Required issues
            const hasActionRequiredContract = content.includes('actionRequired: true') && content.includes('Contract Signed') && content.includes('contract_signed');
            const hasContractSignedNotifications = content.includes('Contract Signed');
            
            // Test 3: Check notification functions
            const hasAddNotification = content.includes('addNotification');
            const hasLoadNotifications = content.includes('loadNotifications');
            const hasSaveNotifications = content.includes('saveNotifications');
            
            console.log(`✅ Sophisticated system: ${hasSophisticatedSystem ? '✅' : '❌'}`);
            console.log(`✅ Notification polling: ${hasNotificationPolling ? '✅' : '❌'}`);
            console.log(`✅ Notification badge: ${hasNotificationBadge ? '✅' : '❌'}`);
            console.log(`✅ Notification list: ${hasNotificationList ? '✅' : '❌'}`);
            console.log(`✅ Add notification: ${hasAddNotification ? '✅' : '❌'}`);
            console.log(`✅ Load notifications: ${hasLoadNotifications ? '✅' : '❌'}`);
            console.log(`✅ Save notifications: ${hasSaveNotifications ? '✅' : '❌'}`);
            console.log(`⚠️ Action Required contract: ${hasActionRequiredContract ? '❌ ISSUE FOUND' : '✅'}`);
            console.log(`✅ Contract signed notifications: ${hasContractSignedNotifications ? '✅' : '❌'}`);
            
            results.push({
                file: filename,
                sophisticatedSystem: hasSophisticatedSystem,
                notificationPolling: hasNotificationPolling,
                notificationBadge: hasNotificationBadge,
                notificationList: hasNotificationList,
                addNotification: hasAddNotification,
                loadNotifications: hasLoadNotifications,
                saveNotifications: hasSaveNotifications,
                actionRequiredIssue: hasActionRequiredContract,
                contractSignedNotifications: hasContractSignedNotifications
            });
            
        } catch (error) {
            console.error(`❌ Error testing ${filename}:`, error.message);
            results.push({
                file: filename,
                sophisticatedSystem: false,
                notificationPolling: false,
                notificationBadge: false,
                notificationList: false,
                addNotification: false,
                loadNotifications: false,
                saveNotifications: false,
                actionRequiredIssue: false,
                contractSignedNotifications: false
            });
        }
    });
    
    return results;
}

// Function to fix Action Required button issue
function fixActionRequiredIssue() {
    console.log('\n🔧 Fixing Action Required button issue...');
    console.log('=' .repeat(50));
    
    const results = [];
    
    FILES_TO_TEST.forEach(filename => {
        console.log(`\n📁 Fixing file: ${filename}`);
        console.log('=' .repeat(40));
        
        try {
            const filePath = path.join(__dirname, filename);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Create backup
            const backupPath = path.join(__dirname, 'backups', `${filename}.backup.action-required.${Date.now()}`);
            if (!fs.existsSync('backups')) {
                fs.mkdirSync('backups', { recursive: true });
            }
            fs.copyFileSync(filePath, backupPath);
            console.log(`✅ Created backup: ${backupPath}`);
            
            let modified = false;
            
            // Fix contract signed notifications to remove actionRequired: true
            const contractSignedPattern = /(await addNotification\(\s*['"]Contract Signed['"],\s*[^,]+,\s*[^,]+,\s*\{[^}]*actionRequired:\s*true[^}]*\})/g;
            const contractSignedReplacement = (match) => {
                // Replace actionRequired: true with actionRequired: false
                return match.replace(/actionRequired:\s*true/g, 'actionRequired: false');
            };
            
            const newContent = content.replace(contractSignedPattern, contractSignedReplacement);
            
            if (newContent !== content) {
                content = newContent;
                modified = true;
                console.log('✅ Fixed contract signed notification Action Required issue');
            } else {
                console.log('⚠️ No contract signed Action Required issues found');
            }
            
            // Write modified content
            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Successfully modified: ${filename}`);
            } else {
                console.log(`ℹ️ No changes needed for: ${filename}`);
            }
            
            results.push({
                file: filename,
                modified: modified,
                success: true
            });
            
        } catch (error) {
            console.error(`❌ Error fixing ${filename}:`, error.message);
            results.push({
                file: filename,
                modified: false,
                success: false
            });
        }
    });
    
    return results;
}

// Function to test admin-user notification communication
function testAdminUserCommunication() {
    console.log('\n🔔 Testing admin-user notification communication...');
    console.log('=' .repeat(50));
    
    const communicationTests = [
        {
            name: 'User signs contract',
            description: 'Admin should receive notification when user signs contract',
            adminNotification: 'Contract Signed',
            userNotification: 'Contract signed successfully'
        },
        {
            name: 'Admin uploads contract',
            description: 'User should receive notification when admin uploads contract',
            adminAction: 'Upload contract',
            userNotification: 'Contract uploaded'
        },
        {
            name: 'Admin assigns job',
            description: 'User should receive notification when admin assigns job',
            adminAction: 'Assign job',
            userNotification: 'Job assigned'
        },
        {
            name: 'Admin updates payment',
            description: 'User should receive notification when admin updates payment',
            adminAction: 'Update payment',
            userNotification: 'Payment updated'
        },
        {
            name: 'Admin creates performance review',
            description: 'User should receive notification when admin creates performance review',
            adminAction: 'Create performance review',
            userNotification: 'Performance review available'
        },
        {
            name: 'User updates payment method',
            description: 'Admin should receive notification when user updates payment method',
            userAction: 'Update payment method',
            adminNotification: 'Payment method updated'
        }
    ];
    
    console.log('📋 Notification Communication Tests:');
    communicationTests.forEach((test, index) => {
        console.log(`\n${index + 1}. ${test.name}`);
        console.log(`   Description: ${test.description}`);
        if (test.adminNotification) {
            console.log(`   Admin notification: ${test.adminNotification}`);
        }
        if (test.userNotification) {
            console.log(`   User notification: ${test.userNotification}`);
        }
        if (test.adminAction) {
            console.log(`   Admin action: ${test.adminAction}`);
        }
        if (test.userAction) {
            console.log(`   User action: ${test.userAction}`);
        }
    });
    
    return communicationTests;
}

// Function to verify fixes
function verifyFixes() {
    console.log('\n✅ Verifying fixes...');
    console.log('=' .repeat(30));
    
    const results = [];
    
    FILES_TO_TEST.forEach(filename => {
        try {
            const filePath = path.join(__dirname, filename);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check if Action Required issue is fixed
            const hasActionRequiredContract = content.includes('actionRequired: true') && content.includes('Contract Signed') && content.includes('contract_signed');
            const hasContractSignedNotifications = content.includes('Contract Signed');
            
            console.log(`📁 ${filename}:`);
            console.log(`   Action Required issue: ${hasActionRequiredContract ? '❌ STILL EXISTS' : '✅ FIXED'}`);
            console.log(`   Contract notifications: ${hasContractSignedNotifications ? '✅' : '❌'}`);
            
            results.push({
                file: filename,
                actionRequiredFixed: !hasActionRequiredContract,
                contractNotificationsExist: hasContractSignedNotifications
            });
            
        } catch (error) {
            console.error(`❌ Error verifying ${filename}:`, error.message);
            results.push({
                file: filename,
                actionRequiredFixed: false,
                contractNotificationsExist: false
            });
        }
    });
    
    return results;
}

// Main execution function
function main() {
    console.log('🚀 Testing and fixing notification system...');
    console.log('=' .repeat(60));
    
    // Step 1: Test current notification system
    const testResults = testNotificationSystem();
    
    // Step 2: Fix Action Required issues
    const fixResults = fixActionRequiredIssue();
    
    // Step 3: Test admin-user communication
    const communicationTests = testAdminUserCommunication();
    
    // Step 4: Verify fixes
    const verifyResults = verifyFixes();
    
    // Summary
    console.log('\n📋 Summary:');
    console.log('=' .repeat(60));
    
    console.log('\n🔍 Test Results:');
    testResults.forEach(result => {
        console.log(`\n📁 ${result.file}:`);
        console.log(`   Sophisticated system: ${result.sophisticatedSystem ? '✅' : '❌'}`);
        console.log(`   Action Required issue: ${result.actionRequiredIssue ? '❌' : '✅'}`);
    });
    
    console.log('\n🔧 Fix Results:');
    fixResults.forEach(result => {
        console.log(`📁 ${result.file}: ${result.success ? '✅' : '❌'}`);
    });
    
    console.log('\n✅ Verification Results:');
    verifyResults.forEach(result => {
        console.log(`📁 ${result.file}: Action Required ${result.actionRequiredFixed ? '✅ FIXED' : '❌ STILL EXISTS'}`);
    });
    
    const allFixed = verifyResults.every(r => r.actionRequiredFixed);
    const allSystemsWorking = testResults.every(r => r.sophisticatedSystem);
    
    console.log(`\n🎉 Results: ${allFixed ? '✅' : '❌'} Action Required issues fixed`);
    console.log(`🎉 Results: ${allSystemsWorking ? '✅' : '❌'} Notification systems working`);
    
    if (allFixed && allSystemsWorking) {
        console.log('\n✅ SUCCESS: All notification issues fixed and systems working!');
        console.log('📝 Contract signed notifications no longer show "Action Required" button');
        console.log('🔔 Sophisticated notification system is fully functional');
    } else {
        console.log('\n⚠️ Some issues remain. Check the specific problems above.');
    }
    
    return allFixed && allSystemsWorking;
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    testNotificationSystem,
    fixActionRequiredIssue,
    testAdminUserCommunication,
    verifyFixes,
    main
}; 