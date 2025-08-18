/**
 * Firestore Data Manager for Cochran Films
 * Handles all Firestore operations for users, jobs, and dropdown options
 */

const FirestoreDataManager = {
    // Firestore instance
    db: null,
    
    // Collections
    collections: {
        users: 'users',
        jobs: 'jobs', // job listings live here
        dropdownOptions: 'dropdownOptions', // centralized dropdowns
        contracts: 'contracts'
    },

    // Initialize the data manager
    async init() {
        try {
            console.log('🔥 Initializing Firestore Data Manager...');
            if (this.db) {
                console.log('✅ Firestore Data Manager already initialized');
                return;
            }
            
            // Wait for Firebase to be initialized
            if (!window.FirebaseConfig || !window.FirebaseConfig.isInitialized) {
                await new Promise((resolve) => {
                    window.addEventListener('firebase:initialized', resolve, { once: true });
                });
            }
            
            // Get Firestore instance
            this.db = window.FirebaseConfig.getFirestore();
            console.log('✅ Firestore Data Manager initialized');
            
            // Initialize collections if empty
            await this.initializeCollectionsIfEmpty();
            // Repair misplaced docs (jobs/options under users)
            await this.repairCollections();
            // One-time migration from API JSON if Firestore empty
            await this.runAutoMigrationIfNeeded();
            
            // Set up real-time listeners
            this.setupRealtimeListeners();
            
        } catch (error) {
            console.error('❌ Firestore Data Manager initialization failed:', error);
            throw error;
        }
    },

    // Set up real-time listeners for data changes
    setupRealtimeListeners() {
        try {
            console.log('🔔 Setting up real-time listeners...');
            
            // Listen for users changes
            this.db.collection(this.collections.users)
                .onSnapshot((snapshot) => {
                    console.log('👥 Users collection updated:', snapshot.docChanges().length, 'changes');
                    this.handleUsersUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Users listener error:', error);
                });
            
            // Listen for job listings changes
            this.db.collection(this.collections.jobs)
                .onSnapshot((snapshot) => {
                    console.log('📋 Jobs collection updated:', snapshot.docChanges().length, 'changes');
                    this.handleJobsUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Jobs listener error:', error);
                });
            
            // Listen for dropdown options changes (single source of truth)
            this.db.collection(this.collections.dropdownOptions)
                .onSnapshot((snapshot) => {
                    console.log('📋 Dropdown options updated:', snapshot.docChanges().length, 'changes');
                    this.handleDropdownOptionsUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Dropdown options listener error:', error);
                });
            
            console.log('✅ Real-time listeners set up successfully');
            
        } catch (error) {
            console.error('❌ Error setting up real-time listeners:', error);
        }
    },

    // Handle users collection updates
    handleUsersUpdate(snapshot) {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
            if (change.type === 'added') {
                console.log('👤 New user added:', change.doc.id);
                this.notifyDataChange('users', 'added', change.doc.id, change.doc.data());
            } else if (change.type === 'modified') {
                console.log('👤 User modified:', change.doc.id);
                this.notifyDataChange('users', 'modified', change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                console.log('👤 User removed:', change.doc.id);
                this.notifyDataChange('users', 'removed', change.doc.id, change.doc.data());
            }
        });
    },

    handleJobsUpdate(snapshot) {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
            if (change.type === 'added') {
                console.log('📋 New job added:', change.doc.id);
                this.notifyDataChange('jobs', 'added', change.doc.id, change.doc.data());
            } else if (change.type === 'modified') {
                console.log('📋 Job modified:', change.doc.id);
                this.notifyDataChange('jobs', 'modified', change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                console.log('📋 Job removed:', change.doc.id);
                this.notifyDataChange('jobs', 'removed', change.doc.id, change.doc.data());
            }
        });
    },

    // Handle dropdown options updates
    handleDropdownOptionsUpdate(snapshot) {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
            if (change.type === 'added') {
                console.log('📋 New dropdown option added:', change.doc.id);
                this.notifyDataChange('dropdownOptions', 'added', change.doc.id, change.doc.data());
            } else if (change.type === 'modified') {
                console.log('📋 Dropdown option modified:', change.doc.id);
                this.notifyDataChange('dropdownOptions', 'modified', change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                console.log('📋 Dropdown option removed:', change.doc.id);
                this.notifyDataChange('dropdownOptions', 'removed', change.doc.id, change.doc.data());
            }
        });
    },

    // Notify other components of data changes
    notifyDataChange(collection, changeType, docId, data) {
        const event = new CustomEvent('firestore:dataChange', {
            detail: {
                collection,
                changeType,
                docId,
                data,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(event);
    },

    // ==================== USERS OPERATIONS ====================

    // Get all users with proper structure mapping
    async getUsers() {
        try {
            const snapshot = await this.db.collection(this.collections.users).get();
            const users = {};
            const seenByEmail = new Map();
            const adminEmails = (window.FirebaseConfig && typeof window.FirebaseConfig.getAdminUsers === 'function')
                ? (window.FirebaseConfig.getAdminUsers() || [])
                : [];

            snapshot.forEach(doc => {
                const userData = doc.data() || {};
                const email = (userData.profile && typeof userData.profile.email === 'string')
                    ? userData.profile.email.toLowerCase()
                    : '';

                // Exclude admin accounts from general users list
                if (email && adminEmails.includes(email)) {
                    return;
                }
                // Also exclude obvious admin placeholder docs by id
                if (!email && doc.id && doc.id.toLowerCase() === 'info') {
                    return;
                }

                const normalized = {
                    profile: userData.profile || {},
                    contract: userData.contract || {},
                    application: userData.application || {},
                    jobs: userData.jobs || {},
                    primaryJob: userData.primaryJob || '',
                    paymentMethod: userData.paymentMethod || '',
                    paymentStatus: userData.paymentStatus || '',
                    // Include secure payment/bank fields so admin can view them
                    bankData: userData.bankData || null,
                    bankDetails: userData.bankDetails || null,
                    paymentUpdatedAt: userData.paymentUpdatedAt || userData.paymentUpdatedAt || null,
                    paymentHistory: Array.isArray(userData.paymentHistory) ? userData.paymentHistory : []
                };

                // Deduplicate by profile.email across different doc ids
                if (email) {
                    const existingKey = seenByEmail.get(email);
                    if (existingKey) {
                        // Merge with preference for existing non-empty values while preserving any fields from the new doc
                        const current = users[existingKey] || {};
                        const mergePref = (base, incoming) => {
                            const out = { ...(base || {}) };
                            Object.entries(incoming || {}).forEach(([k, v]) => {
                                const hasCurrent = out[k] !== undefined && out[k] !== null && out[k] !== '';
                                const hasIncoming = v !== undefined && v !== null && v !== '' && !(typeof v === 'object' && Object.keys(v).length === 0);
                                if (!hasCurrent && hasIncoming) out[k] = v;
                            });
                            return out;
                        };
                        // Merge profile/contract/application shallowly but preserve values
                        const mergedProfile = mergePref(current.profile, normalized.profile);
                        const mergedContract = mergePref(current.contract, normalized.contract);
                        const mergedApplication = mergePref(current.application, normalized.application);
                        // Merge jobs by key
                        const mergedJobs = { ...(normalized.jobs || {}), ...(current.jobs || {}) };
                        users[existingKey] = {
                            profile: mergedProfile,
                            contract: mergedContract,
                            application: mergedApplication,
                            jobs: mergedJobs,
                            primaryJob: current.primaryJob || normalized.primaryJob,
                            paymentMethod: current.paymentMethod || normalized.paymentMethod,
                            paymentStatus: current.paymentStatus || normalized.paymentStatus,
                            bankData: current.bankData || normalized.bankData,
                            bankDetails: current.bankDetails || normalized.bankDetails,
                            paymentUpdatedAt: current.paymentUpdatedAt || normalized.paymentUpdatedAt,
                            paymentHistory: (Array.isArray(current.paymentHistory) && current.paymentHistory.length)
                                ? current.paymentHistory
                                : normalized.paymentHistory
                        };
                        return;
                    }
                    seenByEmail.set(email, doc.id);
                }

                users[doc.id] = normalized;
            });
            console.log('✅ Retrieved users from Firestore:', Object.keys(users).length);
            return users;
        } catch (error) {
            console.error('❌ Error getting users:', error);
            throw error;
        }
    },

    // Get user by ID with proper structure
    async getUser(userId) {
        try {
            const doc = await this.db.collection(this.collections.users).doc(userId).get();
            if (doc.exists) {
                const userData = doc.data();
                return {
                    id: doc.id,
                    profile: userData.profile || {},
                    contract: userData.contract || {},
                    application: userData.application || {},
                    jobs: userData.jobs || {},
                    primaryJob: userData.primaryJob || '',
                    paymentMethod: userData.paymentMethod || '',
                    paymentStatus: userData.paymentStatus || ''
                };
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting user:', error);
            throw error;
        }
    },

    // Create or update user with proper structure validation
    async setUser(userId, userData) {
        try {
            // Ensure the user data has the proper structure
            const structuredUserData = {
                profile: userData.profile || {},
                contract: userData.contract || {},
                application: userData.application || {},
                jobs: userData.jobs || {},
                primaryJob: userData.primaryJob || '',
                paymentMethod: userData.paymentMethod || '',
                paymentStatus: userData.paymentStatus || '',
                lastUpdated: new Date().toISOString()
            };
            
            await this.db.collection(this.collections.users).doc(userId).set(structuredUserData, { merge: true });
            console.log('✅ User saved to Firestore:', userId);
            return true;
        } catch (error) {
            console.error('❌ Error saving user:', error);
            throw error;
        }
    },

    // Delete user
    async deleteUser(userId) {
        try {
            await this.db.collection(this.collections.users).doc(userId).delete();
            console.log('✅ User deleted from Firestore:', userId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting user:', error);
            throw error;
        }
    },

    // ==================== JOB LISTINGS (GLOBAL) ====================

    // Get all job listings
    async getJobListings() {
        try {
            const snapshot = await this.db.collection(this.collections.jobs).get();
            const jobs = [];
            snapshot.forEach(doc => jobs.push({ id: doc.id, ...doc.data() }));
            return jobs;
        } catch (error) {
            console.error('❌ Error getting jobs:', error);
            throw error;
        }
    },

    // Get job listing by ID
    async getJobListing(jobId) {
        try {
            const doc = await this.db.collection(this.collections.jobs).doc(jobId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting job:', error);
            throw error;
        }
    },

    // Create or update job listing
    async setJobListing(jobId, jobData) {
        try {
            const jobRef = this.db.collection(this.collections.jobs).doc(jobId);
            await jobRef.set({ ...jobData, updatedAt: new Date().toISOString() }, { merge: true });
            console.log('✅ Job listing saved to Firestore:', jobId);
            return true;
        } catch (error) {
            console.error('❌ Error saving job:', error);
            throw error;
        }
    },

    // Delete job listing
    async deleteJobListing(jobId) {
        try {
            await this.db.collection(this.collections.jobs).doc(jobId).delete();
            console.log('✅ Job listing deleted from Firestore:', jobId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting job:', error);
            throw error;
        }
    },

    // Backward-compat wrappers (deprecated)
    async getJobs() {
        console.warn('⚠️ FirestoreDataManager.getJobs is deprecated. Use getJobListings().');
        return this.getJobListings();
    },
    async getJob(jobId) {
        console.warn('⚠️ FirestoreDataManager.getJob is deprecated. Use getJobListing(jobId).');
        return this.getJobListing(jobId);
    },
    async setJob(jobId, jobData) {
        console.warn('⚠️ FirestoreDataManager.setJob is deprecated. Use setJobListing(jobId, data).');
        return this.setJobListing(jobId, jobData);
    },
    async deleteJob(jobId) {
        console.warn('⚠️ FirestoreDataManager.deleteJob is deprecated. Use deleteJobListing(jobId).');
        return this.deleteJobListing(jobId);
    },

    // ==================== ASSIGNMENTS (PER-USER JOBS) ====================

    // Get all assignments for a user
    async getUserAssignments(userId) {
        try {
            const ref = this.db.collection(this.collections.users).doc(userId).collection('assignments');
            const snapshot = await ref.get();
            const assignments = {};
            snapshot.forEach(doc => {
                assignments[doc.id] = { id: doc.id, ...doc.data() };
            });
            return assignments;
        } catch (error) {
            console.error('❌ Error getting user assignments:', error);
            throw error;
        }
    },

    // Create or update an assignment for a user
    async setAssignment(userId, assignmentId, data) {
        try {
            const ref = this.db.collection(this.collections.users).doc(userId).collection('assignments').doc(assignmentId);
            await ref.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
            console.log('✅ Assignment saved:', userId, assignmentId);
            return true;
        } catch (error) {
            console.error('❌ Error saving assignment:', error);
            throw error;
        }
    },

    // Update assignment status/progress
    async updateAssignmentStatus(userId, assignmentId, status, progress = null) {
        try {
            const ref = this.db.collection(this.collections.users).doc(userId).collection('assignments').doc(assignmentId);
            const payload = { status, projectStatus: status, updatedAt: new Date().toISOString() };
            if (progress !== null && progress !== undefined) {
                payload.progress = Math.max(0, Math.min(100, Number(progress)));
            }
            await ref.set(payload, { merge: true });
            console.log('✅ Assignment status updated:', userId, assignmentId, status, progress);
            return true;
        } catch (error) {
            console.error('❌ Error updating assignment status:', error);
            throw error;
        }
    },

    // Delete an assignment
    async deleteAssignment(userId, assignmentId) {
        try {
            const ref = this.db.collection(this.collections.users).doc(userId).collection('assignments').doc(assignmentId);
            await ref.delete();
            console.log('✅ Assignment deleted:', userId, assignmentId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting assignment:', error);
            throw error;
        }
    },

    // ==================== DROPDOWN OPTIONS OPERATIONS ====================

    // Get all dropdown options
    async getDropdownOptions() {
        try {
            const doc = await this.db.collection(this.collections.dropdownOptions).doc('default').get();
            const raw = doc.exists ? (doc.data() || {}) : {};
            const sanitized = this.sanitizeDropdownOptions(raw);
            // If sanitization changed the structure, persist the fix silently
            if (JSON.stringify(raw) !== JSON.stringify(sanitized)) {
                try { await this.setDropdownOptions(sanitized); } catch (_) {}
            }
            return sanitized;
        } catch (error) {
            console.error('❌ Error getting dropdown options:', error);
            throw error;
        }
    },

    async setDropdownOptions(allOptions) {
        try {
            const ref = this.db.collection(this.collections.dropdownOptions).doc('default');
            await ref.set(this.sanitizeDropdownOptions(allOptions || {}), { merge: true });
            console.log('✅ Dropdown options (bulk) saved');
            return true;
        } catch (error) {
            console.error('❌ Error saving dropdown options bulk:', error);
            throw error;
        }
    },

    // Get specific dropdown option category
    async getDropdownOptionCategory(category) {
        try {
            const doc = await this.db.collection(this.collections.dropdownOptions).doc('default').get();
            return doc.exists ? (doc.data() || {})[category] || null : null;
        } catch (error) {
            console.error('❌ Error getting dropdown option category:', error);
            throw error;
        }
    },

    // Set dropdown option category
    async setDropdownOptionCategory(category, options) {
        try {
            const ref = this.db.collection(this.collections.dropdownOptions).doc('default');
            await ref.set({ [category]: Array.isArray(options) ? options : [] }, { merge: true });
            console.log('✅ Dropdown options saved to Firestore:', category);
            return true;
        } catch (error) {
            console.error('❌ Error saving dropdown options:', error);
            throw error;
        }
    },

    // ==================== DATA MIGRATION ====================

    // Migrate existing JSON data to Firestore
    async migrateDataToFirestore() {
        try {
            console.log('🔄 Starting data migration to Firestore...');
            
            // Migrate users
            if (window.users && Object.keys(window.users).length > 0) {
                console.log('👥 Migrating users to Firestore...');
                for (const [userId, userData] of Object.entries(window.users)) {
                    if (userId !== '_archived' && !userId.startsWith('_')) {
                        await this.setUser(userId, userData);
                    }
                }
                console.log('✅ Users migration complete');
            }
            
            // Migrate jobs
            if (window.jobs && window.jobs.length > 0) {
                console.log('📋 Migrating jobs to Firestore...');
                for (const job of window.jobs) {
                    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    await this.setJob(jobId, job);
                }
                console.log('✅ Jobs migration complete');
            }
            
            // Migrate dropdown options
            if (window.dropdownOptions) {
                console.log('📋 Migrating dropdown options to Firestore...');
                await this.setDropdownOptions(window.dropdownOptions);
                console.log('✅ Dropdown options migration complete');
            }
            
            console.log('🎉 Data migration to Firestore complete!');
            return true;
            
        } catch (error) {
            console.error('❌ Error during data migration:', error);
            throw error;
        }
    },

    // Contracts collection helpers
    async setContract(contractId, contractData) {
        try {
            const ref = this.db.collection(this.collections.contracts).doc(contractId);
            await ref.set({ ...contractData, updatedAt: new Date().toISOString() }, { merge: true });
            return true;
        } catch (e) { throw e; }
    },
    async getContracts() {
        try {
            const snap = await this.db.collection(this.collections.contracts).get();
            const list = [];
            snap.forEach(d => list.push({ id: d.id, ...d.data() }));
            return list;
        } catch (e) { throw e; }
    },
    async deleteContract(contractId) {
        try {
            await this.db.collection(this.collections.contracts).doc(contractId).delete();
            console.log('✅ Contract deleted from Firestore:', contractId);
            return true;
        } catch (e) {
            console.error('❌ Error deleting contract from Firestore:', e);
            throw e;
        }
    },

    async runAutoMigrationIfNeeded() {
        try {
            // Guardrail: disabled by default; require explicit opt-in
            if (!window || window.FIRESTORE_AUTO_MIGRATION !== true) {
                console.log('⏭️ Skipping auto-migration (disabled)');
                return;
            }
            // Only allow auto-migration from the admin dashboard to prevent re-seeding from public portals
            if (!window || window.IS_ADMIN_DASHBOARD !== true) {
                console.log('⏭️ Skipping auto-migration (non-admin context)');
                return;
            }
            const needUsers = !(await this.hasData(this.collections.users));
            const needJobs = !(await this.hasData(this.collections.jobs));
            const needOpts = !(await this.hasData(this.collections.dropdownOptions));
            const needContracts = !(await this.hasData(this.collections.contracts));

            if (!needUsers && !needJobs && !needOpts && !needContracts) return;

            console.log('🚀 Auto-migration starting (from API JSON)...');

            if (needUsers) {
                try {
                    const res = await fetch('/api/users');
                    if (res.ok) {
                        const data = await res.json();
                        const users = data.users || {};
                        for (const [id, u] of Object.entries(users)) {
                            if (id.startsWith('_')) continue;
                            await this.setUser(id, u);
                        }
                        console.log('✅ Auto-migrated users');
                    }
                } catch (e) { console.warn('Users auto-migration skipped:', e?.message || e); }
            }

            if (needJobs) {
                try {
                    const res = await fetch('/api/jobs-data');
                    if (res.ok) {
                        const data = await res.json();
                        const jobs = data.jobs || [];
                        for (const job of jobs) {
                            const slug = (job.title || 'job').toLowerCase().replace(/\s+/g, '-');
                            const jobId = `job-${slug}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
                            await this.setJobListing(jobId, job);
                        }
                        console.log('✅ Auto-migrated jobs');
                    }
                } catch (e) { console.warn('Jobs auto-migration skipped:', e?.message || e); }
            }

            if (needOpts) {
                try {
                    const res = await fetch('/api/dropdown-options');
                    if (res.ok) {
                        const data = await res.json();
                        await this.setDropdownOptions(data);
                        console.log('✅ Auto-migrated dropdown options');
                    }
                } catch (e) { console.warn('Options auto-migration skipped:', e?.message || e); }
            }

            if (needContracts) {
                try {
                    const res = await fetch('/api/contracts');
                    if (res.ok) {
                        const data = await res.json();
                        const list = data.uploadedContracts || data.contracts || [];
                        for (const c of list) {
                            const id = c.contractId || c.fileName || `CF-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
                            await this.setContract(id, c);
                        }
                        console.log('✅ Auto-migrated contracts');
                    }
                } catch (e) { console.warn('Contracts auto-migration skipped:', e?.message || e); }
            }

            console.log('🎉 Auto-migration complete');
        } catch (error) {
            console.warn('⚠️ Auto-migration encountered an issue:', error?.message || error);
        }
    },

    // Sync specific user data to Firestore
    async syncUserToFirestore(userId, userData) {
        try {
            console.log(`🔄 Syncing user ${userId} to Firestore...`);
            await this.setUser(userId, userData);
            console.log(`✅ User ${userId} synced to Firestore`);
            return true;
        } catch (error) {
            console.error(`❌ Error syncing user ${userId} to Firestore:`, error);
            throw error;
        }
    },

    // Sync all current data to Firestore
    async syncAllDataToFirestore() {
        try {
            console.log('🔄 Syncing all current data to Firestore...');
            
            // Sync users
            if (window.users) {
                for (const [userId, userData] of Object.entries(window.users)) {
                    if (userId !== '_archived' && !userId.startsWith('_')) {
                        await this.syncUserToFirestore(userId, userData);
                    }
                }
            }
            
            // Sync jobs
            if (window.jobs) {
                for (const job of window.jobs) {
                    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    await this.setJob(jobId, job);
                }
            }
            
            console.log('✅ All data synced to Firestore');
            return true;
        } catch (error) {
            console.error('❌ Error syncing all data to Firestore:', error);
            throw error;
        }
    },

    // Sync Firestore data back to local state
    async syncFromFirestore() {
        try {
            console.log('🔄 Syncing data from Firestore...');
            
            // Sync users
            const users = await this.getUsers();
            if (users && Object.keys(users).length > 0) {
                window.users = users;
                console.log('✅ Users synced from Firestore:', Object.keys(users).length);
            }
            
            // Sync jobs
            const jobs = await this.getJobs();
            if (jobs && jobs.length > 0) {
                window.jobs = jobs;
                console.log('✅ Jobs synced from Firestore:', jobs.length);
            }
            
            // Sync dropdown options
            const dropdownOptions = await this.getDropdownOptions();
            if (dropdownOptions && Object.keys(dropdownOptions).length > 0) {
                window.dropdownOptions = dropdownOptions;
                console.log('✅ Dropdown options synced from Firestore');
            }
            
            console.log('✅ Data sync from Firestore complete');
            return true;
            
        } catch (error) {
            console.error('❌ Error syncing from Firestore:', error);
            throw error;
        }
    },

    // ==================== UTILITY FUNCTIONS ====================

    // Check if Firestore is available
    isAvailable() {
        return this.db !== null;
    },

    // Check if collection has data
    async hasData(collectionName) {
        try {
            if (!this.db) return false;
            const snapshot = await this.db.collection(collectionName).limit(1).get();
            return !snapshot.empty;
        } catch (error) {
            console.error(`❌ Error checking ${collectionName} data:`, error);
            return false;
        }
    },

    // Get data with automatic fallback
    async getDataWithFallback(collectionName, fallbackFunction) {
        try {
            // Try Firestore first
            if (this.isAvailable() && await this.hasData(collectionName)) {
                console.log(`🔥 Getting ${collectionName} from Firestore...`);
                switch (collectionName) {
                    case 'users':
                        return await this.getUsers();
                    case 'jobs':
                        return await this.getJobListings();
                    case 'dropdownOptions':
                        return await this.getDropdownOptions();
                    default:
                        throw new Error(`Unknown collection: ${collectionName}`);
                }
            } else {
                // Fallback to JSON API
                console.log(`📁 Firestore ${collectionName} empty, using JSON API fallback...`);
                if (typeof fallbackFunction === 'function') {
                    return await fallbackFunction();
                }
                return null;
            }
        } catch (error) {
            console.error(`❌ Error getting ${collectionName} data:`, error);
            // Fallback to JSON API on error
            console.log(`📁 Falling back to JSON API for ${collectionName}...`);
            if (typeof fallbackFunction === 'function') {
                return await fallbackFunction();
            }
            return null;
        }
    },

    // Initialize collections with default data if empty
    async initializeCollectionsIfEmpty() {
        try {
            console.log('🔄 Checking if collections need initialization...');
            
            // Check users collection
            if (!(await this.hasData('users'))) {
                console.log('👥 Users collection empty, initializing...');
                // You can add default user data here if needed
            }
            
            // Check jobs collection
            if (!(await this.hasData(this.collections.jobs))) {
                console.log('📋 Jobs collection empty (ok)');
            }
            
            // Check dropdown options collection
            if (!(await this.hasData(this.collections.dropdownOptions))) {
                console.log('📋 Dropdown options collection empty (initializing defaults)');
                const defaults = { roles: [], rates: [], locations: [], projectTypes: [] };
                await this.db.collection(this.collections.dropdownOptions).doc('default').set(defaults, { merge: true });
            }
            
            console.log('✅ Collections initialization check complete');
        } catch (error) {
            console.error('❌ Error initializing collections:', error);
        }
    },

    // Get collection reference
    getCollection(collectionName) {
        if (!this.db) {
            throw new Error('Firestore not initialized');
        }
        return this.db.collection(collectionName);
    },

    // Get document reference
    getDocument(collectionName, docId) {
        if (!this.db) {
            throw new Error('Firestore not initialized');
        }
        return this.db.collection(collectionName).doc(docId);
    },

    // Batch write operations
    async batchWrite(operations) {
        try {
            const batch = this.db.batch();
            
            operations.forEach(op => {
                if (op.type === 'set') {
                    batch.set(this.getDocument(op.collection, op.docId), op.data, { merge: true });
                } else if (op.type === 'delete') {
                    batch.delete(this.getDocument(op.collection, op.docId));
                }
            });
            
            await batch.commit();
            console.log('✅ Batch write completed:', operations.length, 'operations');
            return true;
        } catch (error) {
            console.error('❌ Error in batch write:', error);
            throw error;
        }
    },

    // Repair misplaced docs: move job-* docs and option docs out of users
    async repairCollections() {
        try {
            console.log('🛠️ Repairing Firestore collections (misfiled docs)...');
            const usersSnap = await this.db.collection(this.collections.users).get();
            const ops = [];
            const optionsAggregate = { roles: [], rates: [], locations: [], projectTypes: [] };

            usersSnap.forEach(doc => {
                const id = doc.id;
                const data = doc.data() || {};
                if (id.startsWith('job-')) {
                    ops.push({ type: 'set', collection: this.collections.jobs, docId: id, data });
                    ops.push({ type: 'delete', collection: this.collections.users, docId: id });
                }
                if (['roles','rates','locations','projectTypes','system-dropdown-options'].includes(id)) {
                    Object.keys(data).forEach(k => {
                        const val = data[k];
                        if (Array.isArray(val) && optionsAggregate[k]) {
                            optionsAggregate[k] = Array.from(new Set([...optionsAggregate[k], ...val]));
                        }
                    });
                    if (Array.isArray(data.values) && optionsAggregate[id]) {
                        optionsAggregate[id] = Array.from(new Set([...optionsAggregate[id], ...data.values]));
                    }
                    ops.push({ type: 'delete', collection: this.collections.users, docId: id });
                }
            });

            if (ops.length) {
                await this.batchWrite(ops);
            }

            const hasAny = Object.values(optionsAggregate).some(arr => (arr || []).length > 0);
            if (hasAny) {
                await this.db.collection(this.collections.dropdownOptions).doc('default').set(optionsAggregate, { merge: true });
                console.log('✅ Migrated dropdown options to dropdownOptions/default');
            }
            console.log('✅ Repair pass complete');
        } catch (err) {
            console.warn('⚠️ repairCollections skipped:', err?.message || err);
        }
    },

    // Ensure dropdown options doc is in canonical shape
    sanitizeDropdownOptions(data) {
        const out = {
            roles: Array.isArray(data.roles) ? data.roles.slice() : [],
            rates: Array.isArray(data.rates) ? data.rates.slice() : [],
            locations: Array.isArray(data.locations) ? data.locations.slice() : [],
            projectTypes: Array.isArray(data.projectTypes) ? data.projectTypes.slice() : []
        };
        // Promote any numeric-keyed string values into projectTypes (common bad write)
        Object.entries(data || {}).forEach(([k, v]) => {
            const isNumericKey = /^\d+$/.test(k);
            if (isNumericKey && typeof v === 'string' && v.trim()) {
                if (!out.projectTypes.includes(v)) out.projectTypes.push(v);
            }
            // Also support legacy { values: [...] }
            if (k === 'values' && Array.isArray(v)) {
                v.forEach(val => {
                    if (typeof val === 'string' && !out.projectTypes.includes(val)) out.projectTypes.push(val);
                });
            }
        });
        // Deduplicate
        out.roles = Array.from(new Set(out.roles));
        out.rates = Array.from(new Set(out.rates));
        out.locations = Array.from(new Set(out.locations));
        out.projectTypes = Array.from(new Set(out.projectTypes));
        return out;
    }
};

// Auto-initialize when DOM is ready
function initializeFirestoreDataManager() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            FirestoreDataManager.init().catch(error => {
                console.error('❌ Firestore Data Manager auto-initialization failed:', error);
            });
        });
    } else {
        // DOM is already ready, but wait a bit for other elements
        setTimeout(() => {
            FirestoreDataManager.init().catch(error => {
                console.error('❌ Firestore Data Manager auto-initialization failed:', error);
            });
        }, 100);
    }
}

// Start initialization
initializeFirestoreDataManager();

// Export for use in other modules
window.FirestoreDataManager = FirestoreDataManager;
