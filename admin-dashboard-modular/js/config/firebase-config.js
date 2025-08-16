/**
 * Firebase Configuration for Admin Dashboard
 * Handles Firebase initialization and authentication methods
 */

const FirebaseConfig = {
    // Firebase configuration
    config: {
        apiKey: 'AIzaSyCkL31Phi7FxYCeB5zgHeYTb2iY2sTJJdw',
        authDomain: 'cochran-films.firebaseapp.com',
        projectId: 'cochran-films',
        storageBucket: 'cochran-films.appspot.com',
        messagingSenderId: '566448458094',
        appId: '1:566448458094:web:default'
    },

    // Firebase instances
    app: null,
    auth: null,

    // Admin users (emails that have admin access)
    adminUsers: [
        'cody@cochranfilms.com',
        'info@cochranfilms.com',
        // Add more admin emails as needed
    ],

    // Initialize Firebase
    init() {
        try {
            console.log('🔥 Initializing Firebase for Admin Dashboard...');
            
            // Check if Firebase is available
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded');
            }

            // Initialize Firebase app
            this.app = firebase.initializeApp(this.config);
            
            // Initialize Firebase Auth
            this.auth = firebase.auth();
            
            // Set persistence to LOCAL for better user experience
            this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .then(() => {
                    console.log('✅ Firebase persistence set to LOCAL');
                })
                .catch((error) => {
                    console.warn('⚠️ Could not set Firebase persistence:', error);
                });

            console.log('✅ Firebase initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            return false;
        }
    },

    // Check if user has admin privileges
    isAdminUser(email) {
        if (!email) return false;
        return this.adminUsers.includes(email.toLowerCase());
    },

    // Get current authenticated user
    getCurrentUser() {
        if (!this.auth) return null;
        return this.auth.currentUser;
    },

    // Sign out user
    async signOut() {
        try {
            if (this.auth) {
                await this.auth.signOut();
                console.log('✅ User signed out successfully');
            }
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            throw error;
        }
    },

    // Check if Firebase is available
    isAvailable() {
        return this.app !== null && this.auth !== null;
    }
};

// Make FirebaseConfig available globally
window.FirebaseConfig = FirebaseConfig;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    FirebaseConfig.init();
});

console.log('🔥 FirebaseConfig loaded and ready');
