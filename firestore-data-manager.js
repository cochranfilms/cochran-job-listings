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
        jobs: 'jobs' // job listings live here
    },

    // Initialize the data manager
    async init() {
        try {
            console.log('🔥 Initializing Firestore Data Manager...');
            
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
            
            // Listen for dropdown options changes
            // This listener is no longer needed as dropdown options are in users
            // this.db.collection(this.collections.dropdownOptions)
            //     .onSnapshot((snapshot) => {
            //         console.log('📋 Dropdown options updated:', snapshot.docChanges().length, 'changes');
            //         this.handleDropdownOptionsUpdate(snapshot);
            //     }, (error) => {
            //         console.error('❌ Dropdown options listener error:', error);
            //     });
            
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
    // This function is no longer needed as dropdown options are in users
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
            snapshot.forEach(doc => {
                // Map Firestore document to your expected structure
                const userData = doc.data();
                users[doc.id] = {
                    profile: userData.profile || {},
                    contract: userData.contract || {},
                    application: userData.application || {},
                    jobs: userData.jobs || {},
                    primaryJob: userData.primaryJob || '',
                    paymentMethod: userData.paymentMethod || '',
                    paymentStatus: userData.paymentStatus || ''
                };
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
            const snapshot = await this.db.collection(this.collections.users).get(); // Changed to users collection
            const options = {};
            snapshot.forEach(doc => {
                const userData = doc.data();
                if (userData.dropdownOptions) {
                    for (const category in userData.dropdownOptions) {
                        options[category] = userData.dropdownOptions[category];
                    }
                }
            });
            return options;
        } catch (error) {
            console.error('❌ Error getting dropdown options:', error);
            throw error;
        }
    },

    // Get specific dropdown option category
    async getDropdownOptionCategory(category) {
        try {
            const doc = await this.db.collection(this.collections.users).doc(category).get(); // Changed to users collection
            if (doc.exists) {
                const userData = doc.data();
                return userData.dropdownOptions ? userData.dropdownOptions[category] : null;
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting dropdown option category:', error);
            throw error;
        }
    },

    // Set dropdown option category
    async setDropdownOptionCategory(category, options) {
        try {
            const userRef = this.db.collection(this.collections.users).doc(category); // Changed to users collection
            await userRef.set({ [`dropdownOptions.${category}`]: options }, { merge: true });
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
                for (const [category, options] of Object.entries(window.dropdownOptions)) {
                    await this.setDropdownOptionCategory(category, options);
                }
                console.log('✅ Dropdown options migration complete');
            }
            
            console.log('🎉 Data migration to Firestore complete!');
            return true;
            
        } catch (error) {
            console.error('❌ Error during data migration:', error);
            throw error;
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
                        // Jobs are extracted from users collection
                        const users = await this.getUsers();
                        const jobs = [];
                        Object.values(users).forEach(user => {
                            if (user.jobs) {
                                Object.values(user.jobs).forEach(job => {
                                    jobs.push(job);
                                });
                            }
                        });
                        return jobs;
                    case 'dropdownOptions':
                        // Dropdown options are extracted from users collection
                        const allUsers = await this.getUsers();
                        const options = {};
                        Object.values(allUsers).forEach(user => {
                            if (user.dropdownOptions) {
                                Object.assign(options, user.dropdownOptions);
                            }
                        });
                        return options;
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
            // This check is no longer needed as dropdown options are in users
            // if (!(await this.hasData('dropdownOptions'))) {
            //     console.log('📋 Dropdown options collection empty, initializing...');
            //     // You can add default dropdown options here if needed
            // }
            
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
