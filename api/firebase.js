const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: In production, you'll need to set up Firebase Admin SDK credentials
// For now, we'll use a service account key or environment variables
let firebaseApp;
let firebaseInitialized = false;

try {
    // Try to initialize with service account if available
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: 'cochran-films'
        });
        firebaseInitialized = true;
        console.log('✅ Firebase Admin SDK initialized with service account');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Try with environment variable pointing to service account file
        firebaseApp = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: 'cochran-films'
        });
        firebaseInitialized = true;
        console.log('✅ Firebase Admin SDK initialized with application default credentials');
    } else {
        // For development/testing, we'll skip Firebase initialization
        // and handle user deletion through other means
        console.log('⚠️ Firebase Admin SDK not initialized - no credentials available');
        console.log('ℹ️ User deletion will be handled through local data cleanup only');
        console.log('ℹ️ To enable Firebase user deletion, set FIREBASE_SERVICE_ACCOUNT environment variable');
        firebaseInitialized = false;
    }
} catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    console.log('ℹ️ Firebase operations will be limited to local data cleanup');
    firebaseInitialized = false;
}

module.exports = async (req, res) => {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        // Only allow DELETE requests for user deletion
        if (req.method !== 'DELETE') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        const { email } = req.body;

        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }

        // Check if Firebase Admin SDK is properly initialized
        if (!firebaseInitialized || !firebaseApp) {
            console.log(`⚠️ Firebase Admin SDK not available for user deletion: ${email}`);
            console.log(`ℹ️ To enable Firebase user deletion, configure FIREBASE_SERVICE_ACCOUNT environment variable`);
            res.status(200).json({ 
                success: false, 
                error: 'Firebase Admin SDK not configured. User deletion limited to local data cleanup.',
                message: 'User will be removed from local data only. Firebase account may still exist.',
                instructions: 'To enable Firebase user deletion, set FIREBASE_SERVICE_ACCOUNT environment variable with your Firebase service account JSON'
            });
            return;
        }

        try {
            // Get user by email
            const userRecord = await admin.auth().getUserByEmail(email);
            
            // Delete the user
            await admin.auth().deleteUser(userRecord.uid);
            
            console.log(`✅ Firebase user deleted: ${email}`);
            res.status(200).json({ 
                success: true, 
                message: `User ${email} deleted successfully from Firebase` 
            });
            
        } catch (firebaseError) {
            console.error('❌ Firebase error:', firebaseError);
            
            // Handle specific Firebase errors
            if (firebaseError.code === 'auth/user-not-found') {
                res.status(200).json({ 
                    success: false, 
                    error: 'User not found in Firebase',
                    message: 'User was not found in Firebase, but will be removed from local data.'
                });
            } else if (firebaseError.code === 'auth/insufficient-permission') {
                res.status(200).json({ 
                    success: false, 
                    error: 'Insufficient permissions to delete Firebase user',
                    message: 'User will be removed from local data only due to permission restrictions.'
                });
            } else {
                res.status(200).json({ 
                    success: false, 
                    error: firebaseError.message,
                    message: 'Firebase deletion failed, but user will be removed from local data.'
                });
            }
        }

    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(200).json({ 
            success: false, 
            error: 'Internal server error',
            message: 'User will be removed from local data only due to server error.'
        });
    }
}; 