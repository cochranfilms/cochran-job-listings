/**
 * Main Application Module
 * Initializes and manages the admin dashboard application
 */

const AdminDashboardApp = {
    // Application state
    state: {
        isAuthenticated: false,
        currentUser: null,
        isLoading: false,
        modules: new Map()
    },

    // Initialize the application
    async init() {
        try {
            console.log('🚀 Initializing Admin Dashboard Application...');
            
            // Show loading state
            this.showLoading();
            
            // Initialize core modules
            await this.initializeCoreModules();
            
            // Setup authentication
            await this.setupAuthentication();
            
                    // Initialize dashboard components
        await this.initializeDashboardComponents();
        
        // Initialize user management modules
        await this.initializeUserManagementModules();
        
        // Initialize job management modules
        await this.initializeJobManagementModules();
        
        // Initialize contract management modules
        await this.initializeContractManagementModules();
        
        // Initialize dropdown management module
        await this.initializeDropdownManagementModule();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Check authentication status
            this.checkAuthenticationStatus();
            
            console.log('✅ Admin Dashboard Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.showError('Failed to initialize application', error);
        } finally {
            this.hideLoading();
        }
    },

    // Initialize core modules
    async initializeCoreModules() {
        console.log('🔧 Initializing core modules...');
        
        // Wait for utility modules to be ready
        await this.waitForModules(['ErrorHandler', 'LoadingManager', 'NotificationManager']);
        
        // Initialize Firebase if not already done
        if (window.FirebaseConfig && !window.FirebaseConfig.auth) {
            window.FirebaseConfig.init();
        }
        
        // Initialize EmailJS if not already done
        if (window.EmailJSConfig && !window.EmailJSConfig.isAvailable()) {
            window.EmailJSConfig.init();
        }
        
        console.log('✅ Core modules initialized');
    },

    // Wait for required modules to be available
    async waitForModules(moduleNames, timeout = 10000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const missingModules = moduleNames.filter(name => !window[name]);
            
            if (missingModules.length === 0) {
                return true;
            }
            
            console.log(`⏳ Waiting for modules: ${missingModules.join(', ')}`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error(`Timeout waiting for modules: ${moduleNames.join(', ')}`);
    },

    // Setup authentication
    async setupAuthentication() {
        console.log('🔐 Setting up authentication...');
        
        // Check if Firebase is available
        if (window.FirebaseConfig && window.FirebaseConfig.auth) {
            console.log('🔥 Firebase authentication available - using Firebase');
            
            // Setup auth state observer
            window.FirebaseConfig.auth.onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });
            
            console.log('✅ Firebase authentication setup complete');
        } else {
            console.log('⚠️ Firebase not available - using fallback authentication');
            
            // Use fallback authentication (admin password)
            this.setupFallbackAuthentication();
        }
    },

    // Setup fallback authentication for testing/development
    setupFallbackAuthentication() {
        console.log('🔑 Setting up fallback authentication...');
        
        // Check if admin password is configured
        if (window.ADMIN_PASSWORD) {
            console.log('✅ Admin password configured - using password-based auth');
            this.state.isAuthenticated = true;
            this.state.currentUser = { email: 'admin@cochranfilms.com', isAdmin: true };
            this.showDashboard();
            this.loadDashboardData();
        } else {
            console.log('⚠️ No authentication configured - showing login screen');
            this.showLoginScreen();
        }
        
        console.log('✅ Fallback authentication setup complete');
    },

    // Handle authentication state changes
    handleAuthStateChange(user) {
        if (user && user.email) {
            console.log('✅ User authenticated:', user.email);
            
            // Check if user has admin privileges
            if (window.FirebaseConfig.isAdminUser(user.email)) {
                this.state.isAuthenticated = true;
                this.state.currentUser = user;
                this.showDashboard();
                this.loadDashboardData();
            } else {
                console.log('❌ User does not have admin privileges');
                this.showAccessDenied();
            }
        } else {
            console.log('❌ User signed out');
            this.state.isAuthenticated = false;
            this.state.currentUser = null;
            this.showLoginScreen();
        }
    },

    // Check current authentication status
    checkAuthenticationStatus() {
        const currentUser = window.FirebaseConfig.getCurrentUser();
        if (currentUser && window.FirebaseConfig.isAdminUser(currentUser.email)) {
            this.state.isAuthenticated = true;
            this.state.currentUser = currentUser;
            this.showDashboard();
            this.loadDashboardData();
        } else {
            this.showLoginScreen();
        }
    },

    // Initialize dashboard components
    async initializeDashboardComponents() {
        console.log('🎯 Initializing dashboard components...');
        
        // Initialize login component
        if (window.LoginComponent) {
            window.LoginComponent.init();
        }
        
        // Initialize dashboard manager
        if (window.DashboardManager) {
            window.DashboardManager.init();
        }
        
        // Initialize other components as they become available
        const componentModules = [
            'UserManager',
            'JobManager', 
            'ContractManager',
            'DropdownManager'
        ];
        
        for (const moduleName of componentModules) {
            if (window[moduleName]) {
                try {
                    window[moduleName].init();
                    console.log(`✅ ${moduleName} initialized`);
                } catch (error) {
                    console.warn(`⚠️ Failed to initialize ${moduleName}:`, error);
                }
            }
        }
        
        console.log('✅ Dashboard components initialized');
    },

    // Initialize user management modules
    async initializeUserManagementModules() {
        console.log('👥 Initializing user management modules...');
        
        // Wait for user management modules to be ready
        await this.waitForModules(['UserManager', 'UserForm', 'UserList']);
        
        // Initialize user manager
        if (window.UserManager) {
            await window.UserManager.init();
        }
        
        // Initialize user form
        if (window.UserForm) {
            await window.UserForm.init();
        }
        
        // Initialize user list
        if (window.UserList) {
            await window.UserList.init();
        }
        
        console.log('✅ User management modules initialized');
    },

    // Initialize job management modules
    async initializeJobManagementModules() {
        console.log('📋 Initializing job management modules...');
        
        // Wait for job management modules to be ready
        await this.waitForModules(['JobManager']);
        
        // Initialize job manager
        if (window.JobManager) {
            await window.JobManager.init();
        }
        
                console.log('✅ Job management modules initialized');
    },
    
    // Initialize contract management modules
    async initializeContractManagementModules() {
        console.log('📄 Initializing contract management modules...');
        
        // Wait for contract management modules to be ready
        await this.waitForModules(['ContractManager', 'ContractGenerator']);
        
        // Initialize contract manager
        if (window.ContractManager) {
            await window.ContractManager.init();
        }
        
        // Initialize contract generator
        if (window.ContractGenerator) {
            await window.ContractGenerator.init();
        }
        
        console.log('✅ Contract management modules initialized');
    },
    
    // Initialize dropdown management module
    async initializeDropdownManagementModule() {
        console.log('⚙️ Initializing dropdown management module...');
        
        // Wait for dropdown management module to be ready
        await this.waitForModules(['DropdownManager']);
        
        // Initialize dropdown manager
        if (window.DropdownManager) {
            await window.DropdownManager.init();
        }
        
        console.log('✅ Dropdown management module initialized');
    },
  
    // Setup event listeners
    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        // Global error handling
        window.addEventListener('error', (event) => {
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError(event.error, 'global-error');
            }
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError(event.reason, 'unhandled-promise');
            }
        });
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        console.log('✅ Event listeners setup complete');
    },

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + K: Focus search
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                this.focusSearch();
            }
            
            // Ctrl/Cmd + L: Logout
            if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
                event.preventDefault();
                this.logout();
            }
            
            // Escape: Close modals/panels
            if (event.key === 'Escape') {
                this.closeModals();
            }
        });
    },

    // Show login screen
    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const dashboard = document.getElementById('dashboard');
        
        if (loginScreen) loginScreen.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
        
        // Update page title
        document.title = 'Login | Admin Dashboard | Cochran Films';
    },

    // Show dashboard
    showDashboard() {
        const loginScreen = document.getElementById('loginScreen');
        const dashboard = document.getElementById('dashboard');
        
        if (loginScreen) loginScreen.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        
        // Update page title
        document.title = 'Admin Dashboard | Cochran Films';
        
        // Show welcome notification
        if (window.NotificationManager && this.state.currentUser) {
            window.NotificationManager.success(
                `Welcome back, ${this.state.currentUser.email}!`,
                { title: 'Authentication Successful' }
            );
        }
    },

    // Show access denied
    showAccessDenied() {
        if (window.NotificationManager) {
            window.NotificationManager.error(
                'Access denied. Admin privileges required.',
                { title: 'Access Denied', duration: 10000 }
            );
        }
        
        // Sign out the user
        this.logout();
    },

    // Load dashboard data
    async loadDashboardData() {
        try {
            console.log('📊 Loading dashboard data...');
            
            // Load users data
            if (window.UserManager) {
                await window.UserManager.loadUsers();
            }
            
            // Load jobs data
            if (window.JobManager) {
                await window.JobManager.loadJobs();
            }
            
            // Load dropdown options
            if (window.DropdownManager) {
                await window.DropdownManager.loadDropdownOptions();
            }
            
            // Update stats
            if (window.StatsManager) {
                window.StatsManager.updateStats();
            }
            
            console.log('✅ Dashboard data loaded');
            
        } catch (error) {
            console.error('❌ Failed to load dashboard data:', error);
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError(error, 'dashboard-data-loading');
            }
        }
    },

    // Logout user
    async logout() {
        try {
            if (window.FirebaseConfig) {
                await window.FirebaseConfig.signOut();
            }
            
            this.state.isAuthenticated = false;
            this.state.currentUser = null;
            
            // Clear any stored data
            sessionStorage.removeItem('adminDashboardAuthenticated');
            sessionStorage.removeItem('adminUser');
            
            // Show logout notification
            if (window.NotificationManager) {
                window.NotificationManager.info('You have been logged out successfully');
            }
            
            this.showLoginScreen();
            
        } catch (error) {
            console.error('❌ Logout failed:', error);
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError(error, 'logout');
            }
        }
    },

    // Focus search functionality
    focusSearch() {
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search"], .search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    },

    // Close modals and panels
    closeModals() {
        // Close any open modals
        const modals = document.querySelectorAll('.modal, .notification-panel');
        modals.forEach(modal => {
            if (modal.style.display !== 'none') {
                modal.style.display = 'none';
            }
        });
        
        // Close notification panel
        const notificationPanel = document.getElementById('notificationPanel');
        if (notificationPanel) {
            notificationPanel.remove();
        }
    },

    // Show loading state
    showLoading() {
        this.state.isLoading = true;
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
    },

    // Hide loading state
    hideLoading() {
        this.state.isLoading = false;
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    },

    // Show error
    showError(message, error) {
        console.error('Application Error:', error);
        
        // Show error notification if available
        if (window.NotificationManager && typeof window.NotificationManager.error === 'function') {
            try {
                window.NotificationManager.error(message);
            } catch (notifError) {
                console.warn('⚠️ Could not show notification:', notifError);
            }
        }
        
        // Show error boundary if available
        const errorBoundary = document.getElementById('errorBoundary');
        if (errorBoundary) {
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = error?.message || message;
            }
            errorBoundary.style.display = 'flex';
        }
    },

    // Get application state
    getState() {
        return { ...this.state };
    },

    // Get module by name
    getModule(moduleName) {
        return window[moduleName] || null;
    },

    // Check if module is available
    isModuleAvailable(moduleName) {
        return !!window[moduleName];
    },

    // Reload application
    async reload() {
        console.log('🔄 Reloading application...');
        location.reload();
    }
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AdminDashboardApp.init();
});

// Export for global access
window.AdminDashboardApp = AdminDashboardApp;
