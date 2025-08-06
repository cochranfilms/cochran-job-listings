/**
 * Secure Bank Details Modal
 * Collects and encrypts bank account information securely
 */

class SecureBankModal {
    constructor() {
        this.bankCollector = new BankDataCollector();
    }

    // Show bank details collection modal
    showBankDetailsModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(10px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        `;
        
        modal.innerHTML = `
            <div style="
                background: #1a1a2e;
                border-radius: 20px;
                padding: 2rem;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid rgba(255,255,255,0.1);
                position: relative;
            ">
                <button onclick="closeBankDetailsModal()" style="
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.7);
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
                    ×
                </button>
                
                <h2 style="color: #FFB200; margin-bottom: 1.5rem; font-family: 'Cinzel', serif;">
                    <i class="fas fa-shield-alt"></i> Secure Bank Details
                </h2>
                
                <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 0.9rem;">
                        <i class="fas fa-lock"></i>
                        <strong>Security Notice:</strong> Your bank information will be encrypted before transmission and stored securely. 
                        We use industry-standard AES-256 encryption to protect your data.
                    </p>
                </div>
                
                <form id="bankDetailsForm" style="display: grid; gap: 1.5rem;">
                    <div>
                        <label style="color: #FFB200; display: block; margin-bottom: 0.5rem; font-weight: bold;">
                            Bank Name *
                        </label>
                        <input type="text" id="bankName" required style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid rgba(255,255,255,0.2);
                            border-radius: 8px;
                            background: rgba(255,255,255,0.1);
                            color: white;
                            font-size: 16px;
                            transition: all 0.3s ease;
                        " placeholder="Enter your bank name" onfocus="this.style.borderColor='#FFB200'" onblur="this.style.borderColor='rgba(255,255,255,0.2)'">
                    </div>
                    
                    <div>
                        <label style="color: #FFB200; display: block; margin-bottom: 0.5rem; font-weight: bold;">
                            Routing Number *
                        </label>
                        <input type="text" id="routingNumber" required maxlength="9" style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid rgba(255,255,255,0.2);
                            border-radius: 8px;
                            background: rgba(255,255,255,0.1);
                            color: white;
                            font-size: 16px;
                            transition: all 0.3s ease;
                        " placeholder="Enter 9-digit routing number" onfocus="this.style.borderColor='#FFB200'" onblur="this.style.borderColor='rgba(255,255,255,0.2)'">
                        <small style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">
                            Found on your checks or bank statement
                        </small>
                    </div>
                    
                    <div>
                        <label style="color: #FFB200; display: block; margin-bottom: 0.5rem; font-weight: bold;">
                            Account Number *
                        </label>
                        <input type="password" id="accountNumber" required style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid rgba(255,255,255,0.2);
                            border-radius: 8px;
                            background: rgba(255,255,255,0.1);
                            color: white;
                            font-size: 16px;
                            transition: all 0.3s ease;
                        " placeholder="Enter your account number" onfocus="this.style.borderColor='#FFB200'" onblur="this.style.borderColor='rgba(255,255,255,0.2)'">
                        <small style="color: rgba(255,255,255,0.6); font-size: 0.8rem;">
                            Your account number will be encrypted and stored securely
                        </small>
                    </div>
                    
                    <div>
                        <label style="color: #FFB200; display: block; margin-bottom: 0.5rem; font-weight: bold;">
                            Account Type *
                        </label>
                        <select id="accountType" required style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid rgba(255,255,255,0.2);
                            border-radius: 8px;
                            background: rgba(255,255,255,0.1);
                            color: white;
                            font-size: 16px;
                            transition: all 0.3s ease;
                        " onfocus="this.style.borderColor='#FFB200'" onblur="this.style.borderColor='rgba(255,255,255,0.2)'">
                            <option value="">Select account type</option>
                            <option value="checking">Checking Account</option>
                            <option value="savings">Savings Account</option>
                            <option value="business">Business Account</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button type="button" onclick="closeBankDetailsModal()" style="
                            flex: 1;
                            padding: 12px;
                            border: 2px solid rgba(255,255,255,0.3);
                            border-radius: 8px;
                            background: transparent;
                            color: rgba(255,255,255,0.8);
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
                            Cancel
                        </button>
                        
                        <button type="submit" style="
                            flex: 1;
                            padding: 12px;
                            border: none;
                            border-radius: 8px;
                            background: linear-gradient(135deg, #22c55e, #16a34a);
                            color: white;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s ease;
                        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                            <i class="fas fa-shield-alt"></i>
                            Save Securely
                        </button>
                    </div>
                </form>
                
                <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-top: 1.5rem;">
                    <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin: 0;">
                        <i class="fas fa-info-circle"></i>
                        <strong>Security Features:</strong> AES-256 encryption, client-side processing, 
                        secure transmission, and encrypted storage. Your data is protected at every step.
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        const form = modal.querySelector('#bankDetailsForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleBankDetailsSubmission();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeBankDetailsModal();
            }
        });
    }

    // Handle bank details form submission
    async handleBankDetailsSubmission() {
        try {
            const bankName = document.getElementById('bankName').value.trim();
            const routingNumber = document.getElementById('routingNumber').value.trim();
            const accountNumber = document.getElementById('accountNumber').value.trim();
            const accountType = document.getElementById('accountType').value;

            // Validate required fields
            if (!bankName || !routingNumber || !accountNumber || !accountType) {
                showNotification('Please fill in all required fields', 'warning');
                return;
            }

            // Show loading state
            const submitButton = document.querySelector('#bankDetailsForm button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Encrypting...';
            submitButton.disabled = true;

            // Collect and encrypt bank data
            const encryptedBankData = await this.bankCollector.collectBankData(
                bankName, routingNumber, accountNumber, accountType
            );

            // Save encrypted data to user profile
            await this.saveEncryptedBankData(encryptedBankData);

            // Close modal
            closeBankDetailsModal();

            // Show success notification
            showNotification('✅ Bank details saved securely!', 'success');

            // Update payment method display
            displayUserInfo();

        } catch (error) {
            console.error('Bank details submission failed:', error);
            showNotification(`❌ ${error.message}`, 'error');
            
            // Reset button
            const submitButton = document.querySelector('#bankDetailsForm button[type="submit"]');
            submitButton.innerHTML = '<i class="fas fa-shield-alt"></i> Save Securely';
            submitButton.disabled = false;
        }
    }

    // Save encrypted bank data to user profile
    async saveEncryptedBankData(encryptedData) {
        if (!currentUser) return;

        // Add bank data to current user
        currentUser.bankData = {
            encrypted: encryptedData.encrypted,
            lastFour: encryptedData.lastFour,
            bankName: encryptedData.bankName,
            accountType: encryptedData.accountType,
            hash: encryptedData.hash,
            savedAt: new Date().toISOString()
        };

        // Save to backend
        await updateUserPaymentMethod(currentUser.email, 'bank', encryptedData);
    }
}

// Global functions for modal
function closeBankDetailsModal() {
    const modal = document.querySelector('div[style*="position: fixed"][style*="z-index: 1000"]');
    if (modal) {
        modal.remove();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecureBankModal };
} else {
    window.SecureBankModal = SecureBankModal;
    window.closeBankDetailsModal = closeBankDetailsModal;
} 