/**
 * Messaging Service for Cochran Films Platform
 * Handles real-time messaging between users and admins
 */

class MessagingService {
    constructor() {
        this.firestore = null;
        this.auth = null;
        this.storage = null;
        this.currentUser = null;
        this.conversations = new Map();
        this.messageListeners = new Map();
        this.isAdmin = false;
        
        // Initialize when Firebase is ready
        this.initializeMessaging();
    }

    async initializeMessaging() {
        try {
            // Wait for Firebase to be initialized
            await window.FirebaseConfig.waitForInit();
            
            this.firestore = window.FirebaseConfig.getFirestore();
            this.auth = window.FirebaseConfig.auth;
            this.storage = firebase.storage();
            this.currentUser = this.auth.currentUser;
            
            // Check if user is admin
            this.isAdmin = window.FirebaseConfig.isAdminUser(this.currentUser?.email);
            
            console.log('💬 Messaging service initialized', {
                user: this.currentUser?.email,
                isAdmin: this.isAdmin
            });
            
            // Set up auth state listener
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.isAdmin = window.FirebaseConfig.isAdminUser(user?.email);
                if (user) {
                    this.loadUserConversations();
                } else {
                    this.cleanup();
                }
            });
            
        } catch (error) {
            console.error('❌ Failed to initialize messaging service:', error);
        }
    }

    /**
     * Create a new conversation between users
     */
    async createConversation(participants, jobId = null, initialMessage = null) {
        try {
            if (!this.currentUser) throw new Error('User not authenticated');
            
            // Ensure current user is in participants
            if (!participants.includes(this.currentUser.email)) {
                participants.push(this.currentUser.email);
            }
            
            // Sort participants to create consistent conversation IDs
            const sortedParticipants = participants.sort();
            const conversationId = sortedParticipants.join('_').replace(/[^a-zA-Z0-9_]/g, '_');
            
            const conversationData = {
                id: conversationId,
                participants: sortedParticipants,
                jobId: jobId,
                lastMessage: initialMessage || '',
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: this.currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                readStatus: this.createReadStatus(participants),
                isActive: true
            };
            
            // Create conversation document
            await this.firestore.collection('directMessages').doc(conversationId).set(conversationData);
            
            // Send initial message if provided
            if (initialMessage) {
                await this.sendMessage(conversationId, initialMessage);
            }
            
            console.log('✅ Conversation created:', conversationId);
            return conversationId;
            
        } catch (error) {
            console.error('❌ Failed to create conversation:', error);
            throw error;
        }
    }

    /**
     * Send a message to a conversation
     */
    async sendMessage(conversationId, content, attachments = []) {
        try {
            if (!this.currentUser) throw new Error('User not authenticated');
            
            const messagesRef = this.firestore
                .collection('directMessages')
                .doc(conversationId)
                .collection('messages');
            const messageRef = messagesRef.doc();
            const messageData = {
                id: messageRef.id,
                senderId: this.currentUser.email,
                content: content,
                attachments: attachments,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'sent',
                readBy: [this.currentUser.email]
            };
            
            // Add message to conversation
            await messageRef.set(messageData);
            
            // Update conversation last message
            await this.firestore.collection('directMessages').doc(conversationId).update({
                lastMessage: content,
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ Message sent to conversation:', conversationId);
            return messageData.id;
            
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            throw error;
        }
    }

    /**
     * Upload file attachment
     */
    async uploadAttachment(conversationId, messageId, file) {
        try {
            if (!this.currentUser) throw new Error('User not authenticated');
            
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = this.storage.ref(`messageAttachments/${conversationId}/${messageId}/${fileName}`);
            
            const uploadTask = storageRef.put(file);
            
            return new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Progress tracking
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('📤 Upload progress:', progress + '%');
                    },
                    (error) => {
                        console.error('❌ Upload failed:', error);
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                            console.log('✅ File uploaded:', downloadURL);
                            resolve({
                                name: file.name,
                                url: downloadURL,
                                size: file.size,
                                type: file.type
                            });
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });
            
        } catch (error) {
            console.error('❌ Failed to upload attachment:', error);
            throw error;
        }
    }

    /**
     * Load conversations for current user
     */
    async loadUserConversations() {
        try {
            if (!this.currentUser) return;
            
            // Query in two steps to avoid composite index requirement:
            // Fetch active conversations first, then filter by participant client-side.
            const activeQuery = this.firestore
                .collection('directMessages')
                .where('isActive', '==', true)
                .orderBy('lastMessageTime', 'desc');
            
            const snapshot = await activeQuery.get();
            this.conversations.clear();
            
            snapshot.forEach(doc => {
                const data = doc.data();
                if (Array.isArray(data.participants) && data.participants.includes(this.currentUser.email)) {
                    this.conversations.set(doc.id, {
                        id: doc.id,
                        ...data,
                        unreadCount: this.getUnreadCount(data.readStatus)
                    });
                }
            });
            
            console.log('✅ Loaded conversations:', this.conversations.size);
            return Array.from(this.conversations.values());
            
        } catch (error) {
            console.error('❌ Failed to load conversations:', error);
            return [];
        }
    }

    /**
     * Load messages for a conversation
     */
    async loadMessages(conversationId, limit = 50) {
        try {
            const query = this.firestore
                .collection('directMessages')
                .doc(conversationId)
                .collection('messages')
                .orderBy('timestamp', 'desc')
                .limit(limit);
            
            const snapshot = await query.get();
            const messages = [];
            
            snapshot.forEach(doc => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Mark messages as read
            await this.markMessagesAsRead(conversationId);
            
            return messages.reverse(); // Return in chronological order
            
        } catch (error) {
            console.error('❌ Failed to load messages:', error);
            return [];
        }
    }

    /**
     * Listen for real-time message updates
     */
    listenToMessages(conversationId, callback) {
        try {
            // Remove existing listener
            if (this.messageListeners.has(conversationId)) {
                this.messageListeners.get(conversationId)();
            }
            
            const unsubscribe = this.firestore
                .collection('directMessages')
                .doc(conversationId)
                .collection('messages')
                .orderBy('timestamp', 'desc')
                .onSnapshot((snapshot) => {
                    const messages = [];
                    snapshot.forEach(doc => {
                        messages.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    callback(messages.reverse());
                });
            
            this.messageListeners.set(conversationId, unsubscribe);
            return unsubscribe;
        } catch (error) {
            console.error('❌ Failed to set up message listener:', error);
        }
    }

    /**
     * Mark messages as read
     */
    async markMessagesAsRead(conversationId) {
        try {
            if (!this.currentUser) return;
            
            const conversationRef = this.firestore.collection('directMessages').doc(conversationId);
            const readStatus = {};
            readStatus[`readStatus.${this.currentUser.email}`] = firebase.firestore.FieldValue.serverTimestamp();
            
            await conversationRef.update(readStatus);
            
        } catch (error) {
            console.error('❌ Failed to mark messages as read:', error);
        }
    }

    /**
     * Search messages
     */
    async searchMessages(query, conversationId = null) {
        try {
            let messagesQuery = this.firestore.collectionGroup('messages');
            
            if (conversationId) {
                messagesQuery = this.firestore
                    .collection('directMessages')
                    .doc(conversationId)
                    .collection('messages');
            }
            
            // Note: Firestore doesn't support full-text search natively
            // This is a basic implementation - consider using Algolia for production
            const snapshot = await messagesQuery
                .where('content', '>=', query)
                .where('content', '<=', query + '\uf8ff')
                .limit(20)
                .get();
            
            const results = [];
            snapshot.forEach(doc => {
                results.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return results;
            
        } catch (error) {
            console.error('❌ Failed to search messages:', error);
            return [];
        }
    }

    /**
     * Get or create conversation with admin
     */
    async getOrCreateAdminConversation() {
        try {
            if (!this.currentUser) throw new Error('User not authenticated');
            
            const adminEmails = window.FirebaseConfig.getAdminUsers();
            const participants = [this.currentUser.email, adminEmails[0]]; // Use first admin
            
            const conversationId = participants.sort().join('_').replace(/[^a-zA-Z0-9_]/g, '_');
            
            // Check if conversation exists
            const conversationDoc = await this.firestore
                .collection('directMessages')
                .doc(conversationId)
                .get();
            
            if (conversationDoc.exists) {
                return conversationId;
            } else {
                // Create new conversation
                return await this.createConversation(participants);
            }
            
        } catch (error) {
            console.error('❌ Failed to get/create admin conversation:', error);
            throw error;
        }
    }

    /**
     * Get conversation with specific user
     */
    async getOrCreateUserConversation(userEmail) {
        try {
            if (!this.currentUser) throw new Error('User not authenticated');
            if (!this.isAdmin) throw new Error('Only admins can create user conversations');
            
            const participants = [this.currentUser.email, userEmail];
            const conversationId = participants.sort().join('_').replace(/[^a-zA-Z0-9_]/g, '_');
            
            // Check if conversation exists
            const conversationDoc = await this.firestore
                .collection('directMessages')
                .doc(conversationId)
                .get();
            
            if (conversationDoc.exists) {
                return conversationId;
            } else {
                // Create new conversation
                return await this.createConversation(participants);
            }
            
        } catch (error) {
            console.error('❌ Failed to get/create user conversation:', error);
            throw error;
        }
    }

    /**
     * Helper methods
     */
    createReadStatus(participants) {
        const readStatus = {};
        participants.forEach(email => {
            readStatus[email] = null; // null means unread
        });
        return readStatus;
    }

    getUnreadCount(readStatus) {
        if (!readStatus || !this.currentUser) return 0;
        return readStatus[this.currentUser.email] === null ? 1 : 0;
    }

    formatTimestamp(timestamp) {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        
        return date.toLocaleDateString();
    }

    cleanup() {
        // Remove all listeners
        this.messageListeners.forEach(unsubscribe => unsubscribe());
        this.messageListeners.clear();
        this.conversations.clear();
    }
}

// Initialize messaging service when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.MessagingService = new MessagingService();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessagingService;
}
