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
                console.log('🔍 Checking Firebase SDK availability...');
                
                // Check if Firebase is available
                if (typeof firebase === 'undefined') {
                    console.error('❌ Firebase SDK is undefined');
                    throw new Error('Firebase SDK not loaded');
                }

                console.log('✅ Firebase SDK found:', typeof firebase);
                console.log('🔍 Firebase SDK properties:', Object.keys(firebase));
                
                // Check if firebase.initializeApp exists
                if (typeof firebase.initializeApp !== 'function') {
                    console.error('❌ firebase.initializeApp is not a function');
                    throw new Error('Firebase initializeApp method not available');
                }

                console.log('✅ firebase.initializeApp method found');
                
                // Initialize Firebase app
                console.log('🔧 Creating Firebase app...');
                this.app = firebase.initializeApp(this.config);
                console.log('✅ Firebase app created:', this.app);
                
                // Initialize Firebase Auth
                console.log('🔧 Initializing Firebase Auth...');
                if (typeof firebase.auth !== 'function') {
                    console.error('❌ firebase.auth is not a function');
                    throw new Error('Firebase auth method not available');
                }
                
                this.auth = firebase.auth();
                console.log('✅ Firebase Auth initialized:', this.auth);
                
                // Set persistence to LOCAL for better user experience
                console.log('🔧 Setting Firebase persistence...');
                await this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                console.log('✅ Firebase persistence set to LOCAL');

                this.isInitialized = true;
                console.log('✅ Firebase initialized successfully');
                
                // Trigger a custom event to notify other components
                window.dispatchEvent(new CustomEvent('firebase:initialized'));
                
                resolve(true);
                
            } catch (error) {
                console.error('❌ Firebase initialization failed:', error);
                console.error('❌ Error details:', {
                    message: error.message,
                    stack: error.stack,
                    firebaseType: typeof firebase,
                    firebaseKeys: firebase ? Object.keys(firebase) : 'firebase is null'
                });
                this.isInitialized = false;
                reject(error);
            }
        });

        return this.initPromise;
    },

    // Wait for Firebase to be initialized
    async waitForInit() {
        console.log('⏳ waitForInit called, checking initialization status...');
        console.log('🔍 Current state:', {
            isInitialized: this.isInitialized,
            hasInitPromise: !!this.initPromise,
            hasApp: !!this.app,
            hasAuth: !!this.auth
        });
        
        if (this.isInitialized) {
            console.log('✅ Firebase already initialized, returning immediately');
            return true;
        }
        
        if (this.initPromise) {
            console.log('⏳ Firebase initialization in progress, waiting for promise...');
            return this.initPromise;
        }
        
        console.log('🚀 Starting Firebase initialization...');
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
