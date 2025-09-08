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
        contracts: 'contracts',
        messages: 'messages', // team messaging board
        showcases: 'showcases', // project showcases
        portfolios: 'portfolios', // user-owned portfolio profiles and galleries
        events: 'events', // company events and calendar
        successStories: 'successStories', // success stories and achievements
        // Equipment & Resource Center
        equipment: 'equipment', // inventory of gear
        resources: 'resources', // brand guidelines, templates, style guides
        equipmentRequests: 'equipmentRequests', // user requests for gear
        maintenance: 'maintenance' // maintenance schedule & repairs
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

            // Purge deprecated user fields to simplify schema
            try { await this.purgeDeprecatedUserFields(); } catch (e) { console.warn('⚠️ User schema purge skipped:', e?.message || e); }
            
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
            
            // Listen for messages changes
            this.db.collection(this.collections.messages)
                .orderBy('timestamp', 'desc')
                .onSnapshot((snapshot) => {
                    console.log('💬 Messages collection updated:', snapshot.docChanges().length, 'changes');
                    this.handleMessagesUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Messages listener error:', error);
                });

            // Listen for portfolios changes
            this.db.collection(this.collections.portfolios)
                .onSnapshot((snapshot) => {
                    console.log('🗂️ Portfolios collection updated:', snapshot.docChanges().length, 'changes');
                    this.handlePortfoliosUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Portfolios listener error:', error);
                });
            
            // Listen for showcases changes
            this.db.collection(this.collections.showcases)
                .orderBy('createdAt', 'desc')
                .onSnapshot((snapshot) => {
                    console.log('🖼️ Showcases collection updated:', snapshot.docChanges().length, 'changes');
                    this.handleShowcasesUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Showcases listener error:', error);
                });
            
            // Listen for events changes
            this.db.collection(this.collections.events)
                .orderBy('date', 'asc')
                .onSnapshot((snapshot) => {
                    console.log('📅 Events collection updated:', snapshot.docChanges().length, 'changes');
                    this.handleEventsUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Events listener error:', error);
                });
            
            // Listen for success stories changes
            this.db.collection(this.collections.successStories)
                .orderBy('timestamp', 'desc')
                .onSnapshot((snapshot) => {
                    console.log('🏆 Success stories collection updated:', snapshot.docChanges().length, 'changes');
                    this.handleSuccessStoriesUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Success stories listener error:', error);
                });

            // Listen for equipment inventory changes
            this.db.collection(this.collections.equipment)
                .onSnapshot((snapshot) => {
                    console.log('🎒 Equipment collection updated:', snapshot.docChanges().length, 'changes');
                    this.handleEquipmentUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Equipment listener error:', error);
                });

            // Listen for resources changes
            this.db.collection(this.collections.resources)
                .onSnapshot((snapshot) => {
                    console.log('📚 Resources collection updated:', snapshot.docChanges().length, 'changes');
                    this.handleResourcesUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Resources listener error:', error);
                });

            // Listen for equipment requests changes
            this.db.collection(this.collections.equipmentRequests)
                .orderBy('createdAt', 'desc')
                .onSnapshot((snapshot) => {
                    console.log('📝 Equipment requests updated:', snapshot.docChanges().length, 'changes');
                    this.handleEquipmentRequestsUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Equipment requests listener error:', error);
                });

            // Listen for maintenance schedule changes
            this.db.collection(this.collections.maintenance)
                .orderBy('scheduledDate', 'asc')
                .onSnapshot((snapshot) => {
                    console.log('🛠️ Maintenance collection updated:', snapshot.docChanges().length, 'changes');
                    this.handleMaintenanceUpdate(snapshot);
                }, (error) => {
                    console.error('❌ Maintenance listener error:', error);
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

    // Handle messages collection updates
    handleMessagesUpdate(snapshot) {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
            if (change.type === 'added') {
                console.log('💬 New message added:', change.doc.id);
                this.notifyDataChange('messages', 'added', change.doc.id, change.doc.data());
            } else if (change.type === 'modified') {
                console.log('💬 Message modified:', change.doc.id);
                this.notifyDataChange('messages', 'modified', change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                console.log('💬 Message removed:', change.doc.id);
                this.notifyDataChange('messages', 'removed', change.doc.id, change.doc.data());
            }
        });
    },

    // Handle portfolios collection updates
    handlePortfoliosUpdate(snapshot) {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
            if (change.type === 'added') {
                console.log('🗂️ New portfolio added:', change.doc.id);
                this.notifyDataChange('portfolios', 'added', change.doc.id, change.doc.data());
            } else if (change.type === 'modified') {
                console.log('🗂️ Portfolio modified:', change.doc.id);
                this.notifyDataChange('portfolios', 'modified', change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                console.log('🗂️ Portfolio removed:', change.doc.id);
                this.notifyDataChange('portfolios', 'removed', change.doc.id, change.doc.data());
            }
        });
    },

    // Handle showcases collection updates
    handleShowcasesUpdate(snapshot) {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
            if (change.type === 'added') {
                console.log('🖼️ New showcase added:', change.doc.id);
                this.notifyDataChange('showcases', 'added', change.doc.id, change.doc.data());
            } else if (change.type === 'modified') {
                console.log('🖼️ Showcase modified:', change.doc.id);
                this.notifyDataChange('showcases', 'modified', change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                console.log('🖼️ Showcase removed:', change.doc.id);
                this.notifyDataChange('showcases', 'removed', change.doc.id, change.doc.data());
            }
        });
    },

    // Handle events collection updates
    handleEventsUpdate(snapshot) {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
            if (change.type === 'added') {
                console.log('📅 New event added:', change.doc.id);
                this.notifyDataChange('events', 'added', change.doc.id, change.doc.data());
            } else if (change.type === 'modified') {
                console.log('📅 Event modified:', change.doc.id);
                this.notifyDataChange('events', 'modified', change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                console.log('📅 Event removed:', change.doc.id);
                this.notifyDataChange('events', 'removed', change.doc.id, change.doc.data());
            }
        });
    },

    // Handle success stories collection updates
    handleSuccessStoriesUpdate(snapshot) {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
            if (change.type === 'added') {
                console.log('🏆 New success story added:', change.doc.id);
                this.notifyDataChange('successStories', 'added', change.doc.id, change.doc.data());
            } else if (change.type === 'modified') {
                console.log('🏆 Success story modified:', change.doc.id);
                this.notifyDataChange('successStories', 'modified', change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                console.log('🏆 Success story removed:', change.doc.id);
                this.notifyDataChange('successStories', 'removed', change.doc.id, change.doc.data());
            }
        });
    },

    // Handle equipment collection updates
    handleEquipmentUpdate(snapshot) {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
            if (change.type === 'added') {
                console.log('🎒 New equipment added:', change.doc.id);
                this.notifyDataChange('equipment', 'added', change.doc.id, change.doc.data());
            } else if (change.type === 'modified') {
                console.log('🎒 Equipment modified:', change.doc.id);
                this.notifyDataChange('equipment', 'modified', change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                console.log('🎒 Equipment removed:', change.doc.id);
                this.notifyDataChange('equipment', 'removed', change.doc.id, change.doc.data());
            }
        });
    },

    // Handle resources collection updates
    handleResourcesUpdate(snapshot) {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
            if (change.type === 'added') {
                console.log('📚 New resource added:', change.doc.id);
                this.notifyDataChange('resources', 'added', change.doc.id, change.doc.data());
            } else if (change.type === 'modified') {
                console.log('📚 Resource modified:', change.doc.id);
                this.notifyDataChange('resources', 'modified', change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                console.log('📚 Resource removed:', change.doc.id);
                this.notifyDataChange('resources', 'removed', change.doc.id, change.doc.data());
            }
        });
    },

    // Handle equipment requests updates
    handleEquipmentRequestsUpdate(snapshot) {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
            if (change.type === 'added') {
                console.log('📝 New equipment request added:', change.doc.id);
                this.notifyDataChange('equipmentRequests', 'added', change.doc.id, change.doc.data());
            } else if (change.type === 'modified') {
                console.log('📝 Equipment request modified:', change.doc.id);
                this.notifyDataChange('equipmentRequests', 'modified', change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                console.log('📝 Equipment request removed:', change.doc.id);
                this.notifyDataChange('equipmentRequests', 'removed', change.doc.id, change.doc.data());
            }
        });
    },

    // Handle maintenance updates
    handleMaintenanceUpdate(snapshot) {
        const changes = snapshot.docChanges();
        changes.forEach((change) => {
            if (change.type === 'added') {
                console.log('🛠️ New maintenance added:', change.doc.id);
                this.notifyDataChange('maintenance', 'added', change.doc.id, change.doc.data());
            } else if (change.type === 'modified') {
                console.log('🛠️ Maintenance modified:', change.doc.id);
                this.notifyDataChange('maintenance', 'modified', change.doc.id, change.doc.data());
            } else if (change.type === 'removed') {
                console.log('🛠️ Maintenance removed:', change.doc.id);
                this.notifyDataChange('maintenance', 'removed', change.doc.id, change.doc.data());
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

                // Remove deprecated fields from profile view
                const profileClean = { ...(userData.profile || {}) };
                if (profileClean && Object.prototype.hasOwnProperty.call(profileClean, 'projectType')) {
                    delete profileClean.projectType;
                }

                const normalized = {
                    profile: profileClean,
                    contract: userData.contract || {},
                    application: userData.application || {},
                    jobs: userData.jobs || {},
                    paymentMethod: userData.paymentMethod || '',
                    paymentStatus: userData.paymentStatus || '',
                    // Surface profile picture for UI consumers
                    profilePicture: (userData.profilePicture !== undefined && userData.profilePicture !== null)
                        ? userData.profilePicture
                        : (userData.profile && userData.profile.profilePicture) ? userData.profile.profilePicture : null,
                    // Include performance reviews so admin and user portal can read them
                    performance: userData.performance || null,
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
                            paymentMethod: current.paymentMethod || normalized.paymentMethod,
                            paymentStatus: current.paymentStatus || normalized.paymentStatus,
                            // Preserve performance review if present on either doc
                            performance: current.performance || normalized.performance || null,
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

    // Find a user document id by any stored email field (case-insensitive)
    async findUserIdByEmail(email) {
        try {
            if (!email) return null;
            const target = String(email).toLowerCase();
            // First, try canonical field (profile.email) stored in lowercase
            try {
                const snap = await this.db
                    .collection(this.collections.users)
                    .where('profile.email', '==', target)
                    .get();
                if (!snap.empty) {
                    return snap.docs[0].id;
                }
            } catch (_) {}

            // Also try legacy top-level `email`
            try {
                const snap2 = await this.db
                    .collection(this.collections.users)
                    .where('email', '==', target)
                    .get();
                if (!snap2.empty) {
                    return snap2.docs[0].id;
                }
            } catch (_) {}

            // Fallback: scan all docs and check multiple shapes
            const all = await this.db.collection(this.collections.users).get();
            let found = null;
            all.forEach(d => {
                if (found) return;
                const data = d.data() || {};
                const candidates = [
                    (data.profile && data.profile.email) || '',
                    data.email || '',
                    (data.application && data.application.email) || '',
                    (data.application && data.application.contactEmail) || ''
                ];
                for (const c of candidates) {
                    if (c && String(c).toLowerCase() === target) {
                        found = d.id;
                        break;
                    }
                }
            });
            if (found) return found;
            return null;
        } catch (err) {
            console.warn('⚠️ findUserIdByEmail failed:', err?.message || err);
            return null;
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
                    paymentStatus: userData.paymentStatus || '',
                    profilePicture: (userData.profilePicture !== undefined && userData.profilePicture !== null)
                        ? userData.profilePicture
                        : (userData.profile && userData.profile.profilePicture) ? userData.profile.profilePicture : null,
                    performance: userData.performance || null
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
            // Normalize the target doc id: prefer existing doc by email to avoid duplicates
            try {
                const emailLower = (userData && userData.profile && userData.profile.email)
                    ? String(userData.profile.email).toLowerCase() : '';
                // Also look for a top-level email, which some callers provide
                const topLevelEmailLower = (!emailLower && userData && userData.email)
                    ? String(userData.email).toLowerCase() : '';
                if (emailLower) {
                    const existingId = await this.findUserIdByEmail(emailLower);
                    if (existingId && existingId !== userId) {
                        console.log(`🔁 Remapping userId '${userId}' → existing '${existingId}' by email ${emailLower}`);
                        userId = existingId;
                    }
                    // Always store email in lowercase for deterministic queries
                    userData = { ...(userData||{}), profile: { ...(userData?.profile||{}), email: emailLower } };
                } else if (topLevelEmailLower) {
                    const existingId = await this.findUserIdByEmail(topLevelEmailLower);
                    if (existingId && existingId !== userId) {
                        console.log(`🔁 Remapping userId '${userId}' → existing '${existingId}' by top-level email ${topLevelEmailLower}`);
                        userId = existingId;
                    }
                    userData = { ...(userData||{}), profile: { ...(userData?.profile||{}), email: topLevelEmailLower } };
                } else if (userId && userId.includes('@')) {
                    // If caller passed email as id, map to existing id if found
                    const existingId = await this.findUserIdByEmail(userId);
                    if (existingId && existingId !== userId) {
                        console.log(`🔁 Remapping email-id '${userId}' → existing '${existingId}'`);
                        userId = existingId;
                    }
                }
            } catch (mapErr) { console.warn('⚠️ setUser email normalization warning:', mapErr?.message || mapErr); }

            // Ensure the user data has the proper structure
            // Strip deprecated fields before save
            const profileClean = { ...(userData.profile || {}) };
            if (Object.prototype.hasOwnProperty.call(profileClean, 'projectType')) {
                delete profileClean.projectType;
            }
            // Accept top-level name/email if provided by callers and not already set
            if (!profileClean.email && userData && userData.email) {
                profileClean.email = String(userData.email).toLowerCase();
            }
            if (!profileClean.name && userData && userData.name) {
                profileClean.name = userData.name;
            }

            const structuredUserData = {
                profile: profileClean,
                contract: userData.contract || {},
                application: userData.application || {},
                jobs: userData.jobs || {},
                paymentMethod: userData.paymentMethod || '',
                paymentStatus: userData.paymentStatus || '',
                // Persist performance reviews if provided
                performance: userData.performance || null,
                lastUpdated: new Date().toISOString()
            };
            // Keep a legacy top-level email field for easier querying and backwards compatibility
            if (structuredUserData.profile && structuredUserData.profile.email) {
                structuredUserData.email = structuredUserData.profile.email;
            }
            // Only include profilePicture when explicitly provided to avoid writing undefined
            if (Object.prototype.hasOwnProperty.call(userData, 'profilePicture')) {
                structuredUserData.profilePicture = userData.profilePicture;
            }
            
            await this.db.collection(this.collections.users).doc(userId).set(structuredUserData, { merge: true });
            console.log('✅ User saved to Firestore:', userId);
            return true;
        } catch (error) {
            console.error('❌ Error saving user:', error);
            throw error;
        }
    },

    // Remove deprecated fields from all user docs in Firestore
    async purgeDeprecatedUserFields() {
        try {
            if (!this.db) return false;
            const snap = await this.db.collection(this.collections.users).get();
            const batch = this.db.batch();
            const FieldValue = (window.firebase && window.firebase.firestore && window.firebase.firestore.FieldValue) ? window.firebase.firestore.FieldValue : null;
            if (!FieldValue || typeof FieldValue.delete !== 'function') {
                console.warn('⚠️ FieldValue.delete unavailable; skip purge');
                return false;
            }
            snap.forEach(doc => {
                const ref = this.db.collection(this.collections.users).doc(doc.id);
                const payload = {
                    primaryJob: FieldValue.delete(),
                    'profile.projectType': FieldValue.delete()
                };
                batch.set(ref, payload, { merge: true });
            });
            await batch.commit();
            console.log('✅ Purged deprecated user fields (primaryJob, profile.projectType)');
            return true;
        } catch (e) {
            console.warn('⚠️ purgeDeprecatedUserFields failed:', e?.message || e);
            return false;
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
                const defaults = {
                    roles: [
                        'Backdrop Photographer',
                        'Photographer',
                        'Videographer',
                        'Editor',
                        'On-Site Print Tech'
                    ],
                    rates: [
                        '$400.00 USD (Flat)',
                        '$450.00 USD (Flat)',
                        '$500.00 USD (Flat)',
                        '$750.00 USD (Flat)'
                    ],
                    locations: [
                        'Atlanta, GA',
                        'Douglasville, GA',
                        'Sandy Springs, GA',
                        'Atlanta Area'
                    ],
                    projectTypes: [
                        'Photography',
                        'Video',
                        'Event Coverage',
                        'Commercial'
                    ]
                };
                await this.db.collection(this.collections.dropdownOptions).doc('default').set(defaults, { merge: true });
            }

            // Portfolios collection (no defaults required)
            if (!(await this.hasData(this.collections.portfolios))) {
                console.log('🗂️ Portfolios collection empty (ok)');
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

    // ==================== PORTFOLIOS OPERATIONS ====================

    // List portfolios; optionally filter by owner email
    async getPortfolios(options = {}) {
        try {
            let ref = this.db.collection(this.collections.portfolios).orderBy('updatedAt', 'desc');
            if (options.ownerEmail) {
                ref = this.db.collection(this.collections.portfolios).where('owner.email', '==', String(options.ownerEmail).toLowerCase());
            }
            const snapshot = await ref.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('❌ Error getting portfolios:', error);
            return [];
        }
    },

    // Read single portfolio by id
    async getPortfolio(portfolioId) {
        try {
            const doc = await this.db.collection(this.collections.portfolios).doc(portfolioId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error('❌ Error getting portfolio:', error);
            throw error;
        }
    },

    // Create or update portfolio
    async setPortfolio(portfolioId, data) {
        try {
            const ref = this.db.collection(this.collections.portfolios).doc(portfolioId);
            const payload = {
                owner: {
                    email: (data.owner?.email || '').toLowerCase(),
                    name: data.owner?.name || ''
                },
                slug: data.slug || portfolioId,
                profile: data.profile || { bio: '', avatarUrl: null, links: {} },
                theme: data.theme || { tokens: {}, cssVariables: {}, layout: {}, components: {} },
                gallery: Array.isArray(data.gallery) ? data.gallery : [],
                visibility: data.visibility || 'private', // private | unlisted | public
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await ref.set(payload, { merge: true });
            console.log('✅ Portfolio saved:', portfolioId);
            return true;
        } catch (error) {
            console.error('❌ Error saving portfolio:', error);
            throw error;
        }
    },

    // Delete portfolio
    async deletePortfolio(portfolioId) {
        try {
            await this.db.collection(this.collections.portfolios).doc(portfolioId).delete();
            console.log('✅ Portfolio deleted:', portfolioId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting portfolio:', error);
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

// Initialize Firestore Data Manager
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

// Add community operations to FirestoreDataManager
Object.assign(FirestoreDataManager, {
    // ==================== COMMUNITY OPERATIONS ====================

    // Messages Operations
    async getMessages() {
        try {
            const snapshot = await this.db.collection(this.collections.messages)
                .orderBy('timestamp', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('❌ Error getting messages:', error);
            return [];
        }
    },

    async addMessage(messageData) {
        try {
            const payload = {
                author: messageData.author || 'Unknown',
                authorEmail: (messageData.authorEmail || '').toLowerCase(),
                authorAvatar: messageData.authorAvatar || null,
                text: messageData.text || '',
                likes: Number(messageData.likes || 0),
                replies: Array.isArray(messageData.replies) ? messageData.replies : [],
                timestamp: new Date().toISOString(),
                createdAt: new Date()
            };
            const docRef = await this.db.collection(this.collections.messages).add(payload);
            console.log('✅ Message added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error adding message:', error);
            throw error;
        }
    },

    async updateMessage(messageId, updateData) {
        try {
            await this.db.collection(this.collections.messages).doc(messageId).update({
                ...updateData,
                updatedAt: new Date()
            });
            console.log('✅ Message updated:', messageId);
            return true;
        } catch (error) {
            console.error('❌ Error updating message:', error);
            throw error;
        }
    },

    async deleteMessage(messageId) {
        try {
            await this.db.collection(this.collections.messages).doc(messageId).delete();
            console.log('✅ Message deleted:', messageId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting message:', error);
            throw error;
        }
    },

    // Showcases Operations
    async getShowcases() {
        try {
            const snapshot = await this.db.collection(this.collections.showcases)
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('❌ Error getting showcases:', error);
            return [];
        }
    },

    async addShowcase(showcaseData) {
        try {
            const docRef = await this.db.collection(this.collections.showcases).add({
                ...showcaseData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date()
            });
            console.log('✅ Showcase added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error adding showcase:', error);
            throw error;
        }
    },

    async updateShowcase(showcaseId, updateData) {
        try {
            await this.db.collection(this.collections.showcases).doc(showcaseId).update({
                ...updateData,
                updatedAt: new Date()
            });
            console.log('✅ Showcase updated:', showcaseId);
            return true;
        } catch (error) {
            console.error('❌ Error updating showcase:', error);
            throw error;
        }
    },

    async deleteShowcase(showcaseId) {
        try {
            await this.db.collection(this.collections.showcases).doc(showcaseId).delete();
            console.log('✅ Showcase deleted:', showcaseId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting showcase:', error);
            throw error;
        }
    },

    // Events Operations
    async getEvents() {
        try {
            const snapshot = await this.db.collection(this.collections.events)
                .orderBy('date', 'asc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('❌ Error getting events:', error);
            return [];
        }
    },

    async addEvent(eventData) {
        try {
            const docRef = await this.db.collection(this.collections.events).add({
                ...eventData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date()
            });
            console.log('✅ Event added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error adding event:', error);
            throw error;
        }
    },

    async updateEvent(eventId, updateData) {
        try {
            await this.db.collection(this.collections.events).doc(eventId).update({
                ...updateData,
                updatedAt: new Date()
            });
            console.log('✅ Event updated:', eventId);
            return true;
        } catch (error) {
            console.error('❌ Error updating event:', error);
            throw error;
        }
    },

    async deleteEvent(eventId) {
        try {
            await this.db.collection(this.collections.events).doc(eventId).delete();
            console.log('✅ Event deleted:', eventId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting event:', error);
            throw error;
        }
    },

    // Success Stories Operations
    async getSuccessStories() {
        try {
            const snapshot = await this.db.collection(this.collections.successStories)
                .orderBy('timestamp', 'desc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('❌ Error getting success stories:', error);
            return [];
        }
    },

    async addSuccessStory(storyData) {
        try {
            const docRef = await this.db.collection(this.collections.successStories).add({
                ...storyData,
                timestamp: new Date().toISOString(),
                createdAt: new Date()
            });
            console.log('✅ Success story added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error adding success story:', error);
            throw error;
        }
    },

    async updateSuccessStory(storyId, updateData) {
        try {
            await this.db.collection(this.collections.successStories).doc(storyId).update({
                ...updateData,
                updatedAt: new Date()
            });
            console.log('✅ Success story updated:', storyId);
            return true;
        } catch (error) {
            console.error('❌ Error updating success story:', error);
            throw error;
        }
    },

    async deleteSuccessStory(storyId) {
        try {
            await this.db.collection(this.collections.successStories).doc(storyId).delete();
            console.log('✅ Success story deleted:', storyId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting success story:', error);
            throw error;
        }
    },

    // ==================== EQUIPMENT & RESOURCE CENTER ====================

    // Equipment Inventory
    async getEquipment() {
        try {
            const snapshot = await this.db.collection(this.collections.equipment).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('❌ Error getting equipment:', error);
            return [];
        }
    },

    async addEquipment(equipmentData) {
        try {
            const payload = {
                name: equipmentData.name || 'Unnamed Item',
                category: equipmentData.category || 'General',
                status: equipmentData.status || 'available', // available | checked_out | maintenance | retired
                condition: equipmentData.condition || 'good',
                location: equipmentData.location || 'warehouse',
                tags: Array.isArray(equipmentData.tags) ? equipmentData.tags : [],
                serialNumber: equipmentData.serialNumber || null,
                notes: equipmentData.notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const ref = await this.db.collection(this.collections.equipment).add(payload);
            console.log('✅ Equipment added with ID:', ref.id);
            return ref.id;
        } catch (error) {
            console.error('❌ Error adding equipment:', error);
            throw error;
        }
    },

    async updateEquipment(equipmentId, updateData) {
        try {
            await this.db.collection(this.collections.equipment).doc(equipmentId).set({
                ...updateData,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log('✅ Equipment updated:', equipmentId);
            return true;
        } catch (error) {
            console.error('❌ Error updating equipment:', error);
            throw error;
        }
    },

    async deleteEquipment(equipmentId) {
        try {
            await this.db.collection(this.collections.equipment).doc(equipmentId).delete();
            console.log('✅ Equipment deleted:', equipmentId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting equipment:', error);
            throw error;
        }
    },

    // Resource Downloads
    async getResources() {
        try {
            const snapshot = await this.db.collection(this.collections.resources).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('❌ Error getting resources:', error);
            return [];
        }
    },

    async addResource(resourceData) {
        try {
            const payload = {
                title: resourceData.title || 'Untitled',
                type: resourceData.type || 'document', // document | template | style_guide | other
                url: resourceData.url || '',
                description: resourceData.description || '',
                tags: Array.isArray(resourceData.tags) ? resourceData.tags : [],
                version: resourceData.version || '1.0.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const ref = await this.db.collection(this.collections.resources).add(payload);
            console.log('✅ Resource added with ID:', ref.id);
            return ref.id;
        } catch (error) {
            console.error('❌ Error adding resource:', error);
            throw error;
        }
    },

    async updateResource(resourceId, updateData) {
        try {
            await this.db.collection(this.collections.resources).doc(resourceId).set({
                ...updateData,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log('✅ Resource updated:', resourceId);
            return true;
        } catch (error) {
            console.error('❌ Error updating resource:', error);
            throw error;
        }
    },

    async deleteResource(resourceId) {
        try {
            await this.db.collection(this.collections.resources).doc(resourceId).delete();
            console.log('✅ Resource deleted:', resourceId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting resource:', error);
            throw error;
        }
    },

    // Equipment Requests
    async getEquipmentRequests(options = {}) {
        try {
            console.log('🔄 FirestoreDataManager.getEquipmentRequests called with options:', options);
            let ref = this.db.collection(this.collections.equipmentRequests).orderBy('createdAt', 'desc');
            if (options.userEmail) {
                console.log('🔍 Filtering by userEmail:', options.userEmail);
                ref = this.db.collection(this.collections.equipmentRequests).where('userEmail', '==', String(options.userEmail).toLowerCase());
            } else {
                console.log('🔍 Loading all equipment requests (admin view)');
            }
            const snapshot = await ref.get();
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('✅ FirestoreDataManager.getEquipmentRequests returning:', requests);
            return requests;
        } catch (error) {
            console.error('❌ Error getting equipment requests:', error);
            return [];
        }
    },

    async createEquipmentRequest(requestData) {
        try {
            const payload = {
                userEmail: (requestData.userEmail || '').toLowerCase(),
                userName: requestData.userName || '',
                items: Array.isArray(requestData.items) ? requestData.items : [], // array of equipment ids or names
                jobId: requestData.jobId || null,
                jobTitle: requestData.jobTitle || '',
                neededFrom: requestData.neededFrom || null,
                neededTo: requestData.neededTo || null,
                notes: requestData.notes || '',
                status: requestData.status || 'pending', // pending | approved | denied | fulfilled
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const ref = await this.db.collection(this.collections.equipmentRequests).add(payload);
            console.log('✅ Equipment request created with ID:', ref.id);
            return ref.id;
        } catch (error) {
            console.error('❌ Error creating equipment request:', error);
            throw error;
        }
    },

    async updateEquipmentRequest(requestId, updateData) {
        try {
            await this.db.collection(this.collections.equipmentRequests).doc(requestId).set({
                ...updateData,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log('✅ Equipment request updated:', requestId);
            return true;
        } catch (error) {
            console.error('❌ Error updating equipment request:', error);
            throw error;
        }
    },

    async deleteEquipmentRequest(requestId) {
        try {
            await this.db.collection(this.collections.equipmentRequests).doc(requestId).delete();
            console.log('✅ Equipment request deleted:', requestId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting equipment request:', error);
            throw error;
        }
    },

    // Maintenance
    async getMaintenance() {
        try {
            const snapshot = await this.db.collection(this.collections.maintenance)
                .orderBy('scheduledDate', 'asc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('❌ Error getting maintenance:', error);
            return [];
        }
    },

    async scheduleMaintenance(maintenanceData) {
        try {
            const payload = {
                equipmentId: maintenanceData.equipmentId || null,
                title: maintenanceData.title || 'Maintenance',
                scheduledDate: maintenanceData.scheduledDate || null, // ISO date string
                assignee: (maintenanceData.assignee || '').toLowerCase() || null,
                status: maintenanceData.status || 'scheduled', // scheduled | in_progress | completed | cancelled
                notes: maintenanceData.notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const ref = await this.db.collection(this.collections.maintenance).add(payload);
            console.log('✅ Maintenance scheduled with ID:', ref.id);
            return ref.id;
        } catch (error) {
            console.error('❌ Error scheduling maintenance:', error);
            throw error;
        }
    },

    async updateMaintenance(maintenanceId, updateData) {
        try {
            await this.db.collection(this.collections.maintenance).doc(maintenanceId).set({
                ...updateData,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log('✅ Maintenance updated:', maintenanceId);
            return true;
        } catch (error) {
            console.error('❌ Error updating maintenance:', error);
            throw error;
        }
    },

    async deleteMaintenance(maintenanceId) {
        try {
            await this.db.collection(this.collections.maintenance).doc(maintenanceId).delete();
            console.log('✅ Maintenance deleted:', maintenanceId);
            return true;
        } catch (error) {
            console.error('❌ Error deleting maintenance:', error);
            throw error;
        }
    }
});

// Start initialization
initializeFirestoreDataManager();

// Export for use in other modules
window.FirestoreDataManager = FirestoreDataManager;
