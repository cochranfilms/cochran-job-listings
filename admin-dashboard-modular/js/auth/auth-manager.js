/**
 * Authentication Manager Module
 * Handles user authentication and session management
 */

const AuthManager = {
    // Authentication state
    state: {
        isAuthenticated: false,
        currentUser: null,
        isLoading: false
    },

    // Initialize authentication manager
    async init() {
        try {
            console.log('🔐 Initializing Authentication Manager...');
            
            // Setup authentication state observer (async)
            await this.setupAuthStateObserver();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('✅ Authentication Manager initialized');
            
        } catch (error) {
            console.error('❌ Authentication Manager initialization failed:', error);
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError(error, 'auth-manager-init');
            }
        }
    },

    // Setup Firebase auth state observer
    async setupAuthStateObserver() {
        try {
            if (!window.FirebaseConfig) {
                console.warn('⚠️ Firebase configuration not available, waiting for initialization...');
                return;
            }

            // Wait for Firebase to be initialized
            await window.FirebaseConfig.waitForInit();
            
            if (!window.FirebaseConfig.auth) {
                console.warn('⚠️ Firebase auth not available after initialization');
                return;
            }

            window.FirebaseConfig.auth.onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });
            
            console.log('✅ Firebase auth state observer setup complete');
        } catch (error) {
            console.error('❌ Failed to setup Firebase auth state observer:', error);
        }
    },

    // Handle authentication state changes
    handleAuthStateChange(user) {
        if (user && user.email) {
            console.log('✅ User authenticated:', user.email);
            
            // Check if user has admin privileges
            if (window.FirebaseConfig.isAdminUser(user.email)) {
                this.state.isAuthenticated = true;
                this.state.currentUser = user;
                this.onSuccessfulAuth(user);
            } else {
                console.log('❌ User does not have admin privileges');
                this.onAccessDenied(user);
            }
        } else {
            console.log('❌ User signed out');
            this.state.isAuthenticated = false;
            this.state.currentUser = null;
            this.onSignOut();
        }
    },

    // Handle successful authentication
    onSuccessfulAuth(user) {
        // Store authentication state
        sessionStorage.setItem('adminDashboardAuthenticated', 'true');
        sessionStorage.setItem('adminUser', JSON.stringify(user));
        
        // Show dashboard
        this.showDashboard();
        
        // Show welcome notification
        if (window.NotificationManager) {
            window.NotificationManager.success(
                `Welcome back, ${user.email}!`,
                { title: 'Authentication Successful' }
            );
        }
        
        // Trigger auth success event
        this.triggerEvent('auth:success', { user });
    },

    // Handle access denied
    onAccessDenied(user) {
        if (window.NotificationManager) {
            window.NotificationManager.error(
                'Access denied. Admin privileges required.',
                { title: 'Access Denied', duration: 10000 }
            );
        }
        
        // Sign out the user
        this.signOut();
        
        // Trigger access denied event
        this.triggerEvent('auth:access-denied', { user });
    },

    // Handle sign out
    onSignOut() {
        // Clear stored authentication state
        sessionStorage.removeItem('adminDashboardAuthenticated');
        sessionStorage.removeItem('adminUser');
        
        // Show login screen
        this.showLoginScreen();
        
        // Trigger sign out event
        this.triggerEvent('auth:signout');
    },

    // Sign in with email and password
    async signIn(email, password) {
        try {
            // Wait for Firebase to be initialized
            if (!window.FirebaseConfig) {
                throw new Error('Firebase configuration not available');
            }

            // Ensure Firebase is initialized before proceeding
            await window.FirebaseConfig.waitForInit();
            
            if (!window.FirebaseConfig.auth) {
                throw new Error('Firebase authentication not available');
            }

            this.state.isLoading = true;
            
            // Show loading notification
            if (window.NotificationManager) {
                window.NotificationManager.info('Signing in...', { duration: 2000 });
            }

            const userCredential = await window.FirebaseConfig.auth.signInWithEmailAndPassword(email, password);
            
            console.log('✅ Sign in successful:', userCredential.user.email);
            return { success: true, user: userCredential.user };
            
        } catch (error) {
            console.error('❌ Sign in failed:', error);
            
            let userMessage = 'Sign in failed. Please try again.';
            
            // Handle specific Firebase auth errors
            if (error.code === 'auth/user-not-found') {
                userMessage = 'User not found. Please check your email.';
            } else if (error.code === 'auth/wrong-password') {
                userMessage = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                userMessage = 'Invalid email format.';
            } else if (error.code === 'auth/too-many-requests') {
                userMessage = 'Too many failed attempts. Please try again later.';
            } else if (error.code === 'auth/network-request-failed') {
                userMessage = 'Network error. Please check your connection.';
            }
            
            if (window.NotificationManager) {
                window.NotificationManager.error(userMessage, { title: 'Sign In Failed' });
            }
            
            return { success: false, error: userMessage };
            
        } finally {
            this.state.isLoading = false;
        }
    },

    // Sign out user
    async signOut() {
        try {
            if (window.FirebaseConfig) {
                await window.FirebaseConfig.signOut();
            }
            
            this.state.isAuthenticated = false;
            this.state.currentUser = null;
            
            console.log('✅ Sign out successful');
            
        } catch (error) {
            console.error('❌ Sign out failed:', error);
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError(error, 'auth-signout');
            }
        }
    },

    // Check if user is authenticated
    isAuthenticated() {
        return this.state.isAuthenticated;
    },

    // Get current user
    getCurrentUser() {
        return this.state.currentUser;
    },

    // Check if user has admin privileges
    hasAdminPrivileges() {
        if (!this.state.currentUser || !this.state.currentUser.email) {
            return false;
        }
        
        return window.FirebaseConfig.isAdminUser(this.state.currentUser.email);
    },

    // Show login screen
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const dashboard = document.getElementById('dashboard');
        
        if (loginScreen) loginScreen.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
        
        // Update page title
        document.title = 'Login | Admin Dashboard | Cochran Films';
        
        // Trigger login screen shown event
        this.triggerEvent('auth:login-screen-shown');
    },

    // Show dashboard
    showDashboard() {
        const loginScreen = document.getElementById('loginScreen');
        const dashboard = document.getElementById('dashboard');
        
        if (loginScreen) loginScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        
        // Update page title
        document.title = 'Admin Dashboard | Cochran Films';
        
        // Trigger dashboard shown event
        this.triggerEvent('auth:dashboard-shown');
    },

    // Setup event listeners
    setupEventListeners() {
        // Listen for Firebase initialization
        document.addEventListener('firebase:ready', () => {
            this.setupAuthStateObserver();
        });
    },

    // Trigger custom events
    triggerEvent(eventName, data = {}) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    },

    // Get authentication state
    getAuthState() {
        return { ...this.state };
    },

    // Check stored authentication
    checkStoredAuth() {
        const stored = sessionStorage.getItem('adminDashboardAuthenticated');
        const storedUser = sessionStorage.getItem('adminUser');
        
        if (stored === 'true' && storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user && user.email) {
                    this.state.isAuthenticated = true;
                    this.state.currentUser = user;
                    return true;
                }
            } catch (error) {
                console.warn('Failed to parse stored user data:', error);
            }
        }
        
        return false;
    }
};

// Export for global access
window.AuthManager = AuthManager;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.init().catch(error => {
        console.error('❌ AuthManager auto-initialization failed:', error);
    });
});

// Also listen for Firebase initialization event
document.addEventListener('firebase:initialized', () => {
    if (AuthManager.state.isAuthenticated === false) {
        AuthManager.setupAuthStateObserver().catch(error => {
            console.error('❌ Failed to setup auth state observer after Firebase init:', error);
        });
    }
});
