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
    isInitialized: false,
    initPromise: null,

    // Admin users (emails that have admin access)
    adminUsers: [
        'cody@cochranfilms.com',
        'info@cochranfilms.com'
        // Add more admin emails as needed
    ],

    // Initialize Firebase
    async init() {
        // If already initialized, return the existing promise
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise(async (resolve, reject) => {
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
                await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                console.log('✅ Firebase persistence set to LOCAL');

                this.isInitialized = true;
                console.log('✅ Firebase initialized successfully');
                
                // Trigger a custom event to notify other components
                window.dispatchEvent(new CustomEvent('firebase:initialized'));
                
                resolve(true);
                
            } catch (error) {
                console.error('❌ Firebase initialization failed:', error);
                this.isInitialized = false;
                reject(error);
            }
        });

        return this.initPromise;
    },

    // Wait for Firebase to be initialized
    async waitForInit() {
        if (this.isInitialized) {
            return true;
        }
        
        if (this.initPromise) {
            return this.initPromise;
        }
        
        // If not started, start initialization
        return this.init();
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
        return this.isInitialized && this.app !== null && this.auth !== null;
    }
};

// Make FirebaseConfig available globally
window.FirebaseConfig = FirebaseConfig;

// Try to initialize immediately if Firebase is already available
if (typeof firebase !== 'undefined') {
    console.log('🔥 Firebase SDK already available, initializing immediately...');
    FirebaseConfig.init().catch(error => {
        console.warn('⚠️ Immediate Firebase initialization failed, will retry on DOM ready:', error);
    });
}

// Also initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!FirebaseConfig.isInitialized) {
        console.log('🔥 DOM ready, initializing Firebase...');
        FirebaseConfig.init().catch(error => {
            console.error('❌ Firebase initialization failed on DOM ready:', error);
        });
    }
});

console.log('🔥 FirebaseConfig loaded and ready');
