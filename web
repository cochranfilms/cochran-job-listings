// Google Apps Script Integration Configuration
const APPS_SCRIPT_CONFIG = {
    endpoint: 'https://script.google.com/macros/s/AKfycbxVsmHH3Jv9NRVD6_CsrusY3rraQ9hyryoQuogt8p82esL2_Bi8vnbInJZO9OVMXdjbcg/exec',
    publicSalt: 'cochran-films-2024-salt-contract'
};

// HMAC utility function for integrity checks
async function computeHmac(data) {
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString + APPS_SCRIPT_CONFIG.publicSalt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Save contract data to Google Drive via Apps Script
async function saveContractToGoogleDrive(contractData) {
    try {
        console.log('🚀 Starting Google Apps Script integration...');
        console.log('📝 Contract data to save:', contractData);
        
        // Prepare payload with HMAC
        const payload = {
            contractId: contractData.contractId,
            freelancerName: contractData.freelancerName,
            freelancerEmail: contractData.freelancerEmail,
            role: contractData.role || 'Contractor',
            location: contractData.location || 'Atlanta Area',
            projectStart: contractData.projectStart || 'TBD',
            rate: contractData.rate || 'Not specified',
            effectiveDate: contractData.effectiveDate || new Date().toISOString().split('T')[0],
            signatureDate: contractData.signatureDate,
            signedTimestamp: contractData.signedTimestamp,
            signature: contractData.signature,
            status: 'SIGNED',
            signedDateTime: new Date().toLocaleString(),
            deviceInfo: {
                userAgent: navigator.userAgent.substring(0, 200),
                timestamp: new Date().toISOString(),
                url: window.location.href
            }
        };
        
        // Compute HMAC for integrity check
        const hmac = await computeHmac(payload);
        payload.hmac = hmac;
        
        console.log('🔐 HMAC computed for integrity check');
        console.log('📤 Sending payload to Google Apps Script...');
        
        // Send to Google Apps Script
        const response = await fetch(APPS_SCRIPT_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📥 Apps Script response:', result);
        
        if (result.ok) {
            console.log('✅ Contract successfully saved to Google Drive!');
            console.log('📁 File ID:', result.fileId);
            console.log('🔗 Web View Link:', result.webViewLink);
            return true;
        } else {
            console.error('❌ Apps Script error:', result.error, result.message);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Failed to save contract to Google Drive:', error);
        return false;
    }
}

// Updated saveSignedContractData function
async function saveSignedContractData() {
    try {
        // Generate unique contract ID for tracking
        const contractId = 'CF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        const signedContractData = {
            contractId: contractId,
            freelancerName: signatureData.freelancerName,
            freelancerEmail: signatureData.freelancerEmail,
            role: currentFreelancerData.role || 'Contractor',
            location: currentFreelancerData.location || 'Atlanta Area',
            projectStart: currentFreelancerData.projectStart || 'TBD',
            rate: currentFreelancerData.rate || 'Not specified',
            effectiveDate: currentFreelancerData.approvedDate || new Date().toISOString().split('T')[0],
            signatureDate: signatureData.date,
            signedTimestamp: signatureData.timestamp,
            signature: signatureData.signature,
            status: 'SIGNED',
            signedDateTime: new Date().toLocaleString(),
            deviceInfo: {
                userAgent: navigator.userAgent.substring(0, 200),
                timestamp: new Date().toISOString(),
                url: window.location.href
            }
        };
        
        console.log('✅ Signed contract data prepared:', signedContractData);
        
        // Save to localStorage (immediate backup)
        let existingContracts = JSON.parse(localStorage.getItem('signedContracts') || '[]');
        existingContracts.push(signedContractData);
        localStorage.setItem('signedContracts', JSON.stringify(existingContracts));
        console.log('📱 Contract saved to local storage as backup');
        
        // MAIN FEATURE: Push to Google Drive via Apps Script
        console.log('☁️ Pushing contract to Google Drive via Apps Script...');
        const success = await saveContractToGoogleDrive(signedContractData);
        
        if (success) {
            console.log('✅ Contract successfully pushed to Google Drive!');
            console.log('📊 Admin dashboard will now show this signed contract');
            
            // Add success indicator to UI
            setTimeout(() => {
                const signedMessage = document.getElementById('signed-message');
                if (signedMessage) {
                    const syncStatus = document.createElement('div');
                    syncStatus.style.cssText = 'margin-top: 15px; padding: 10px; background: #e8f5e8; border: 1px solid #4caf50; border-radius: 5px; color: #2e7d32;';
                    syncStatus.innerHTML = '✅ <strong>Contract synced to Google Drive</strong><br>Your signed contract has been securely saved to the centralized system.';
                    signedMessage.appendChild(syncStatus);
                }
            }, 1000);
            
        } else {
            console.log('⚠️ Google Drive upload failed - contract saved locally only');
            // Show partial success message
            setTimeout(() => {
                const signedMessage = document.getElementById('signed-message');
                if (signedMessage) {
                    const syncStatus = document.createElement('div');
                    syncStatus.style.cssText = 'margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; color: #856404;';
                    syncStatus.innerHTML = '⚠️ <strong>Contract signed but sync pending</strong><br>Your contract is saved locally. Admin will need to manually sync the system.';
                    signedMessage.appendChild(syncStatus);
                }
            }, 1000);
        }
        
        // Legacy notification for old system compatibility
        localStorage.setItem('contractSignedNotification', JSON.stringify({
            timestamp: new Date().toISOString(),
            contractId: contractId,
            action: 'NEW_CONTRACT_SIGNED',
            googleDriveSync: success
        }));
        
    } catch (error) {
        console.error('❌ Error saving signed contract data:', error);
        // Don't fail the signing process if saving fails
        alert('⚠️ Contract was signed but there was an issue saving the data. Please contact support with your contract ID and timestamp.');
    }
}

// Health check function for Apps Script endpoint
async function checkAppsScriptHealth() {
    try {
        const response = await fetch(APPS_SCRIPT_CONFIG.endpoint, {
            method: 'GET'
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Apps Script health check passed:', result);
            return true;
        } else {
            console.error('❌ Apps Script health check failed:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Apps Script health check error:', error);
        return false;
    }
}

// Initialize Apps Script integration
async function initializeAppsScriptIntegration() {
    console.log('🔧 Initializing Google Apps Script integration...');
    
    // Check if endpoint is configured
    if (!APPS_SCRIPT_CONFIG.endpoint || APPS_SCRIPT_CONFIG.endpoint.includes('{{APPS_SCRIPT_ENDPOINT}}')) {
        console.warn('⚠️ Apps Script endpoint not configured - using local storage only');
        return false;
    }
    
    // Check if public salt is configured
    if (!APPS_SCRIPT_CONFIG.publicSalt || APPS_SCRIPT_CONFIG.publicSalt.includes('{{PUBLIC_SALT}}')) {
        console.warn('⚠️ Public salt not configured - using local storage only');
        return false;
    }
    
    // Perform health check
    const isHealthy = await checkAppsScriptHealth();
    if (isHealthy) {
        console.log('✅ Google Apps Script integration ready');
        window.isAppsScriptInitialized = true;
        return true;
    } else {
        console.log('❌ Google Apps Script health check failed - using local storage only');
        return false;
    }
}

// Call initialization when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeAppsScriptIntegration();
}); 
