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

    // Safety timeout reference
    safetyTimeout: null,

    // Initialize the application
    async init() {
        console.log('🚀 Initializing Admin Dashboard Application...');
        
        try {
            // Show loading state
            this.showLoading('Initializing Admin Dashboard...');
            
            // Set safety timeout for initialization
            this.safetyTimeout = setTimeout(() => {
                console.warn('⚠️ Application initialization timeout - forcing completion');
                this.hideLoading();
            }, 30000); // 30 second timeout
            
            // Initialize core modules
            await this.initializeCoreModules();
            
            // Build redesigned layout shell (sidebar + header + routed content)
            this.buildLayout();

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
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Set up authentication
            this.setupAuthentication();
            
            console.log('✅ Admin Dashboard Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.showError('Failed to initialize application', error);
        } finally {
            // Clear safety timeout
            if (this.safetyTimeout) {
                clearTimeout(this.safetyTimeout);
                this.safetyTimeout = null;
            }
            // Always hide loading state
            this.hideLoading();
        }
    },

    // Build redesigned layout shell if not present
    buildLayout() {
        try {
            // If layout already exists, wire route handlers and return
            if (document.getElementById('dashboard') && document.getElementById('appContent')) {
                this.setupRouteHandlers();
                return;
            }

            // Create login screen container (hidden by default)
            if (!document.getElementById('loginScreen')) {
                const login = document.createElement('div');
                login.id = 'loginScreen';
                login.style.display = 'none';
                login.style.minHeight = '100vh';
                login.style.display = 'flex';
                login.style.alignItems = 'center';
                login.style.justifyContent = 'center';
                const loginInner = document.createElement('div');
                loginInner.style.maxWidth = '420px';
                loginInner.style.width = '100%';
                loginInner.style.padding = '1.25rem';
                login.appendChild(loginInner);
                document.body.appendChild(login);
            }

            // Create dashboard shell
            if (!document.getElementById('dashboard')) {
                const dash = document.createElement('div');
                dash.id = 'dashboard';
                dash.style.display = 'none';
                dash.style.minHeight = '100vh';

                const grid = document.createElement('div');
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = '260px 1fr';
                grid.style.minHeight = '100vh';

                // Sidebar
                const aside = document.createElement('aside');
                aside.style.background = '#111';
                aside.style.borderRight = '1px solid rgba(255,255,255,0.08)';
                aside.style.padding = '1rem';
                aside.innerHTML = `
                    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">
                        <img src="../Logo.png" alt="Cochran Films" style="height:28px;" />
                        <strong style="color:#fff;letter-spacing:0.3px;">Admin</strong>
                    </div>
                    <nav id="appNav" style="display:flex;flex-direction:column;gap:6px;">
                        <button class="btn" data-route="dashboard">🏠 Dashboard</button>
                        <button class="btn" data-route="users">👥 Users</button>
                        <button class="btn" data-route="jobs">💼 Jobs</button>
                        <button class="btn" data-route="contracts">📄 Contracts</button>
                        <button class="btn" data-route="dropdowns">🔽 Dropdowns</button>
                    </nav>
                `;

                // Main column
                const mainCol = document.createElement('div');
                mainCol.style.display = 'flex';
                mainCol.style.flexDirection = 'column';

                // Topbar
                const header = document.createElement('header');
                header.style.display = 'flex';
                header.style.alignItems = 'center';
                header.style.justifyContent = 'space-between';
                header.style.gap = '1rem';
                header.style.padding = '0.75rem 1rem';
                header.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
                header.style.background = 'rgba(0,0,0,0.35)';
                header.style.backdropFilter = 'blur(8px)';
                header.innerHTML = `
                    <div style="display:flex;gap:0.5rem;align-items:center;">
                        <input type="search" placeholder="Search…" class="search-input" style="padding:0.5rem 0.75rem;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;" />
                    </div>
                    <div style="display:flex;gap:0.5rem;align-items:center;">
                        <button class="btn btn-secondary" data-route="dashboard">Refresh</button>
                        <button class="btn btn-danger" id="logoutBtn">Logout</button>
                    </div>
                `;

                // Routed content container
                const main = document.createElement('main');
                main.id = 'appContent';
                main.style.padding = '1rem';
                main.style.minHeight = '0';

                mainCol.appendChild(header);
                mainCol.appendChild(main);

                grid.appendChild(aside);
                grid.appendChild(mainCol);
                dash.appendChild(grid);

                document.body.appendChild(dash);
            }

            // Basic utility styles for buttons if not present
            const styleId = 'adminShellStyles';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
                  .btn{cursor:pointer;background:rgba(255,255,255,0.08);color:#fff;border:1px solid rgba(255,255,255,0.12);padding:0.5rem 0.75rem;border-radius:8px;text-align:left}
                  .btn:hover{background:rgba(255,255,255,0.14)}
                  .btn-secondary{background:rgba(59,130,246,0.15);border-color:rgba(59,130,246,0.35)}
                  .btn-danger{background:rgba(220,38,38,0.2);border-color:rgba(220,38,38,0.35)}
                `;
                document.head.appendChild(style);
            }

            // Wire route handlers and logout
            this.setupRouteHandlers();
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }

            // Default route
            this.navigate('dashboard');
        } catch (e) {
            console.warn('⚠️ Failed to build layout shell:', e);
        }
    },

    // Route handler setup
    setupRouteHandlers() {
        const nav = document.getElementById('appNav') || document;
        nav.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.getAttribute && target.hasAttribute('data-route')) {
                const route = target.getAttribute('data-route');
                this.navigate(route);
            }
        });
    },

    // Navigate to a view and mount appropriate module(s)
    navigate(route) {
        try {
            const container = document.getElementById('appContent');
            if (!container) return;
            container.innerHTML = '';

            const createSection = (id) => {
                const sec = document.createElement('div');
                sec.id = id;
                container.appendChild(sec);
                return sec.id;
            };

            switch ((route || 'dashboard').toLowerCase()) {
                case 'users': {
                    const id = createSection('userManagementRoot');
                    if (window.UserList) {
                        window.UserList.renderUserManagement(id);
                    }
                    break;
                }
                case 'jobs': {
                    const formId = createSection('jobFormContainer');
                    const listId = createSection('jobListContainer');
                    if (window.JobForm) window.JobForm.renderForm(formId);
                    if (window.JobList) window.JobList.renderJobManagement(listId);
                    break;
                }
                case 'contracts': {
                    const id = createSection('contractManagerContainer');
                    if (window.ContractManager) window.ContractManager.renderContractManagement(id);
                    break;
                }
                case 'dropdowns': {
                    const id = createSection('dropdownManagerContainer');
                    if (window.DropdownManager) window.DropdownManager.renderDropdownManagement(id);
                    break;
                }
                case 'dashboard':
                default: {
                    // Minimal stats panel
                    const statsWrap = document.createElement('div');
                    statsWrap.className = 'content-card';
                    statsWrap.innerHTML = `
                        <div class="card-header"><h2>📊 Overview</h2></div>
                        <div class="card-content">
                            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;">
                                <div class="status-card"><div class="status-content"><h3>Total Creators</h3><div id="totalCreators">0</div></div></div>
                                <div class="status-card"><div class="status-content"><h3>Active Jobs</h3><div id="activeJobs">0</div></div></div>
                                <div class="status-card"><div class="status-content"><h3>Pending Reviews</h3><div id="pendingReviews">0</div></div></div>
                                <div class="status-card"><div class="status-content"><h3>Total Contracts</h3><div id="totalContracts">0</div></div></div>
                            </div>
                        </div>`;
                    container.appendChild(statsWrap);
                    if (window.DashboardManager && typeof window.DashboardManager.updateDashboardStats === 'function') {
                        window.DashboardManager.updateDashboardStats();
                    }
                    break;
                }
            }
        } catch (e) {
            console.error('❌ Navigation failed:', e);
        }
    },

    // Initialize core modules
    async initializeCoreModules() {
        console.log('🔧 Initializing core modules...');
        
        try {
            // Wait for utility modules to be ready
            const coreModulesLoaded = await this.waitForModules(['ErrorHandler', 'LoadingManager', 'NotificationManager']);
            
            if (!coreModulesLoaded) {
                console.warn('⚠️ Some core modules failed to load, continuing with available modules');
            }
            
            // Initialize Firebase if not already done
            if (window.FirebaseConfig && !window.FirebaseConfig.auth) {
                try {
                    await window.FirebaseConfig.init();
                } catch (error) {
                    console.warn('⚠️ Firebase initialization failed:', error);
                }
            }
            
            // Initialize EmailJS if not already done
            if (window.EmailJSConfig && !window.EmailJSConfig.isAvailable()) {
                try {
                    window.EmailJSConfig.init();
                } catch (error) {
                    console.warn('⚠️ EmailJS initialization failed:', error);
                }
            }
            
            // Initialize real-time components
            await this.initializeRealtimeComponents();
            
            console.log('✅ Core modules initialized');
            
        } catch (error) {
            console.warn('⚠️ Core module initialization had issues, continuing:', error);
        }
    },

    // Initialize real-time components
    async initializeRealtimeComponents() {
        console.log('🔧 Initializing real-time components...');
        
        try {
            // Wait for Firestore configuration
            await this.waitForModules(['FirestoreConfig'], 5000);
            
            // Initialize real-time data manager
            if (window.RealtimeDataManager) {
                window.RealtimeDataManager.init();
                console.log('✅ Real-time data manager initialized');
            }
            
            // Initialize data migration utility
            if (window.DataMigration) {
                window.DataMigration.init();
                console.log('✅ Data migration utility initialized');
            }
            
            console.log('✅ Real-time components initialized');
            
        } catch (error) {
            console.warn('⚠️ Real-time components not available, continuing with JSON fallback:', error);
        }
    },

    // Wait for required modules to be available
    async waitForModules(moduleNames, timeout = 10000) {
        const startTime = Date.now();
        const maxWaitTime = timeout || 10000;
        
        console.log(`⏳ Waiting for modules: ${moduleNames.join(', ')} (timeout: ${maxWaitTime}ms)`);
        
        while (Date.now() - startTime < maxWaitTime) {
            const missingModules = moduleNames.filter(name => !window[name]);
            
            if (missingModules.length === 0) {
                console.log(`✅ All required modules loaded: ${moduleNames.join(', ')}`);
                return true;
            }
            
            // Log progress every 2 seconds
            if ((Date.now() - startTime) % 2000 < 100) {
                console.log(`⏳ Still waiting for modules: ${missingModules.join(', ')}`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Timeout reached - log which modules are still missing
        const stillMissing = moduleNames.filter(name => !window[name]);
        console.warn(`⚠️ Timeout waiting for modules: ${stillMissing.join(', ')}`);
        
        // Don't throw error, just return false to indicate timeout
        // This allows the app to continue with available modules
        return false;
    },

    // Setup authentication
    async setupAuthentication() {
        console.log('🔐 Setting up authentication...');
        console.log('🔍 window.FirebaseConfig:', window.FirebaseConfig);
        console.log('🔍 window.ADMIN_PASSWORD:', window.ADMIN_PASSWORD);
        
        if (window.FirebaseConfig && window.FirebaseConfig.auth) {
            console.log('🔥 Firebase authentication available - using Firebase');
            
            // Check if auth-manager is already handling auth state
            if (window.AuthManager && window.AuthManager.isHandlingAuth) {
                console.log('✅ AuthManager already handling authentication, skipping duplicate setup');
            } else {
                // Setup auth state observer only if not already handled
                window.FirebaseConfig.auth.onAuthStateChanged((user) => {
                    this.handleAuthStateChange(user);
                });
                console.log('✅ Firebase authentication setup complete');
            }
        } else {
            console.log('⚠️ Firebase not available - using fallback authentication');
            
            // Use fallback authentication (admin password)
            this.setupFallbackAuthentication();
        }
    },

    // Setup fallback authentication for testing/development
    setupFallbackAuthentication() {
        console.log('🔑 Setting up fallback authentication...');
        console.log('🔍 window.ADMIN_PASSWORD value:', window.ADMIN_PASSWORD);
        console.log('🔍 window.ADMIN_PASSWORD type:', typeof window.ADMIN_PASSWORD);
        
        // Check if admin password is configured
        if (window.ADMIN_PASSWORD) {
            console.log('✅ Admin password configured - using password-based auth');
            // Don't auto-authenticate, just show login screen with fallback option
            this.state.isAuthenticated = false;
            this.state.currentUser = null;
            // Don't call showLoginScreen() here - let the main dashboard handle authentication
            console.log('✅ Fallback auth configured but not overriding main dashboard');
        } else {
            console.log('⚠️ No authentication configured - showing login screen');
            // Don't call showLoginScreen() here - let the main dashboard handle authentication
            console.log('✅ No auth configured but not overriding main dashboard');
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
            // Don't call showLoginScreen() here - let the main dashboard handle authentication
            console.log('✅ User signed out but not overriding main dashboard');
        }
    },

    // Check current authentication status
    checkAuthenticationStatus() {
        if (window.FirebaseConfig && typeof window.FirebaseConfig.getCurrentUser === 'function') {
            const currentUser = window.FirebaseConfig.getCurrentUser();
            if (currentUser && window.FirebaseConfig.isAdminUser(currentUser.email)) {
                this.state.isAuthenticated = true;
                this.state.currentUser = currentUser;
                this.showDashboard();
                this.loadDashboardData();
            } else {
                // Don't call showLoginScreen() here - let the main dashboard handle authentication
                console.log('✅ Firebase user not authenticated but not overriding main dashboard');
            }
        } else {
            console.log('⚠️ FirebaseConfig not available, checking fallback auth...');
            // Check if we have stored fallback authentication
            if (this.state.isAuthenticated && this.state.currentUser) {
                this.showDashboard();
                this.loadDashboardData();
            } else {
                // Don't call showLoginScreen() here - let the main dashboard handle authentication
                console.log('✅ Fallback auth not authenticated but not overriding main dashboard');
            }
        }
    },

    // Initialize dashboard components
    async initializeDashboardComponents() {
        console.log('🎯 Initializing dashboard components...');
        
        // Check if main dashboard should handle authentication and display
        if (window.MAIN_DASHBOARD_AUTH_OVERRIDE === false) {
            console.log('✅ Main dashboard auth override disabled - skipping login component');
        } else {
            // Initialize login component
            if (window.LoginComponent) {
                window.LoginComponent.init();
            }
        }
        
        // Check if main dashboard should handle display states
        if (window.MAIN_DASHBOARD_USER_DISPLAY_OVERRIDE === false) {
            console.log('✅ Main dashboard display override disabled - skipping dashboard manager');
        } else {
            // Initialize dashboard manager
            if (window.DashboardManager) {
                window.DashboardManager.init();
            }
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
        
        try {
            // Wait for user management modules to be ready
            const userModulesLoaded = await this.waitForModules(['UserManager', 'UserForm', 'UserList']);
            
            if (!userModulesLoaded) {
                console.warn('⚠️ Some user management modules failed to load, continuing with available modules');
            }
            
            // Initialize user manager
            if (window.UserManager) {
                try {
                    await window.UserManager.init();
                } catch (error) {
                    console.warn('⚠️ UserManager initialization failed:', error);
                }
            }
            
            // Initialize user form
            if (window.UserForm) {
                try {
                    await window.UserForm.init();
                } catch (error) {
                    console.warn('⚠️ UserForm initialization failed:', error);
                }
            }
            
            // Initialize user list
            if (window.UserList) {
                try {
                    await window.UserList.init();
                } catch (error) {
                    console.warn('⚠️ UserList initialization failed:', error);
                }
            }
            
            console.log('✅ User management modules initialized');
            
        } catch (error) {
            console.warn('⚠️ User management module initialization had issues, continuing:', error);
        }
    },

    // Initialize job management modules
    async initializeJobManagementModules() {
        console.log('📋 Initializing job management modules...');
        
        try {
            // Wait for job management modules to be ready
            const jobModulesLoaded = await this.waitForModules(['JobManager']);
            
            if (!jobModulesLoaded) {
                console.warn('⚠️ Job management modules failed to load, continuing with available modules');
            }
            
            // Initialize job manager
            if (window.JobManager) {
                try {
                    await window.JobManager.init();
                } catch (error) {
                    console.warn('⚠️ JobManager initialization failed:', error);
                }
            }
            
            console.log('✅ Job management modules initialized');
            
        } catch (error) {
            console.warn('⚠️ Job management module initialization had issues, continuing:', error);
        }
    },
    
    // Initialize contract management modules
    async initializeContractManagementModules() {
        console.log('📄 Initializing contract management modules...');
        
        try {
            // Wait for contract management modules to be ready
            const contractModulesLoaded = await this.waitForModules(['ContractManager', 'ContractGenerator']);
            
            if (!contractModulesLoaded) {
                console.warn('⚠️ Some contract management modules failed to load, continuing with available modules');
            }
            
            // Initialize contract manager
            if (window.ContractManager) {
                try {
                    await window.ContractManager.init();
                } catch (error) {
                    console.warn('⚠️ ContractManager initialization failed:', error);
                }
            }
            
            // Initialize contract generator
            if (window.ContractGenerator) {
                try {
                    await window.ContractGenerator.init();
                } catch (error) {
                    console.warn('⚠️ ContractGenerator initialization failed:', error);
                }
            }
            
            console.log('✅ Contract management modules initialized');
            
        } catch (error) {
            console.warn('⚠️ Contract management module initialization had issues, continuing:', error);
        }
    },
    
    // Initialize dropdown management module
    async initializeDropdownManagementModule() {
        console.log('📋 Initializing dropdown management module...');
        
        try {
            // Wait for dropdown management module to be ready
            const dropdownModuleLoaded = await this.waitForModules(['DropdownManager']);
            
            if (!dropdownModuleLoaded) {
                console.warn('⚠️ Dropdown management module failed to load, continuing with available modules');
            }
            
            // Initialize dropdown manager
            if (window.DropdownManager) {
                try {
                    await window.DropdownManager.init();
                } catch (error) {
                    console.warn('⚠️ DropdownManager initialization failed:', error);
                }
            }
            
            console.log('✅ Dropdown management module initialized');
            
        } catch (error) {
            console.warn('⚠️ Dropdown management module initialization had issues, continuing:', error);
        }
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

        // Hide legacy test UI blocks if present
        try {
            const legacySelectors = [
                '.test-header',
                '.production-banner',
                '.test-welcome',
                '.test-status-dashboard',
                '.test-results'
            ];
            legacySelectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => { el.style.display = 'none'; });
            });
        } catch (_) {}
        
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
                // expose for legacy stats/UI that read from window
                if (window.UserManager.state && window.UserManager.state.users) {
                    window.users = window.UserManager.state.users;
                }
            }
            
            // Load jobs data
            if (window.JobManager) {
                await window.JobManager.loadJobs();
                if (window.JobManager.state && window.JobManager.state.jobs) {
                    window.jobs = window.JobManager.state.jobs;
                }
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
    showLoading(message = 'Loading...') {
        this.state.isLoading = true;
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
            loadingIndicator.textContent = message; // Update message
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
