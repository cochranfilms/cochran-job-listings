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
        jobs: 'jobs',
        dropdownOptions: 'dropdown-options',
        contracts: 'contracts',
        notifications: 'notifications'
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
            
            // Listen for jobs changes
            this.db.collection(this.collections.jobs)
                .onSnapshot((snapshot) => {
                    console.log('📋 Jobs collection updated:', snapshot.docChanges().length, 'changes');
                    this.handleJobsUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Jobs listener error:', error);
                });
            
            // Listen for dropdown options changes
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

    // Handle jobs collection updates
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

    // Get all users
    async getUsers() {
        try {
            const snapshot = await this.db.collection(this.collections.users).get();
            const users = {};
            snapshot.forEach(doc => {
                users[doc.id] = doc.data();
            });
            return users;
        } catch (error) {
            console.error('❌ Error getting users:', error);
            throw error;
        }
    },

    // Get user by ID
    async getUser(userId) {
        try {
            const doc = await this.db.collection(this.collections.users).doc(userId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting user:', error);
            throw error;
        }
    },

    // Create or update user
    async setUser(userId, userData) {
        try {
            await this.db.collection(this.collections.users).doc(userId).set(userData, { merge: true });
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

    // ==================== JOBS OPERATIONS ====================

    // Get all jobs
    async getJobs() {
        try {
            const snapshot = await this.db.collection(this.collections.jobs).get();
            const jobs = [];
            snapshot.forEach(doc => {
                jobs.push({ id: doc.id, ...doc.data() });
            });
            return jobs;
        } catch (error) {
            console.error('❌ Error getting jobs:', error);
            throw error;
        }
    },

    // Get job by ID
    async getJob(jobId) {
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

    // Create or update job
    async setJob(jobId, jobData) {
        try {
            await this.db.collection(this.collections.jobs).doc(jobId).set(jobData, { merge: true });
            console.log('✅ Job saved to Firestore:', jobId);
            return true;
        } catch (error) {
            console.error('❌ Error saving job:', error);
            throw error;
        }
    },

    // Delete job
    async deleteJob(jobId) {
        try {
            await this.db.collection(this.collections.jobs).doc(jobId).delete();
            console.log('✅ Job deleted from Firestore:', jobId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting job:', error);
            throw error;
        }
    },

    // ==================== DROPDOWN OPTIONS OPERATIONS ====================

    // Get all dropdown options
    async getDropdownOptions() {
        try {
            const snapshot = await this.db.collection(this.collections.dropdownOptions).get();
            const options = {};
            snapshot.forEach(doc => {
                options[doc.id] = doc.data();
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
            const doc = await this.db.collection(this.collections.dropdownOptions).doc(category).get();
            if (doc.exists) {
                return doc.data();
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
            await this.db.collection(this.collections.dropdownOptions).doc(category).set(options);
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
                    await this.setUser(userId, userData);
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
