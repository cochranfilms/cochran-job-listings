const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: In production, you'll need to set up Firebase Admin SDK credentials
// For now, we'll use a service account key or environment variables
let firebaseApp;

try {
    // Try to initialize with service account if available
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: 'cochran-films'
        });
    } else {
        // Fallback to default credentials (for local development)
        firebaseApp = admin.initializeApp({
            projectId: 'cochran-films'
        });
    }
    console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
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

        // Check if Firebase Admin SDK is initialized
        if (!firebaseApp) {
            res.status(500).json({ error: 'Firebase Admin SDK not initialized' });
            return;
        }

        const { email } = req.body;

        if (!email) {
            res.status(400).json({ error: 'Email is required' });
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
                res.status(404).json({ 
                    success: false, 
                    error: 'User not found in Firebase' 
                });
            } else {
                res.status(500).json({ 
                    success: false, 
                    error: firebaseError.message 
                });
            }
        }

    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
}; 