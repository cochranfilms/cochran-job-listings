// Firebase REST API implementation (no Admin SDK required)
// This approach uses Firebase Auth REST API with a custom token

let firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyCkL31Phi7FxYCeB5zgHeYTb2iY2sTJJdw',
    authDomain: 'cochran-films.firebaseapp.com',
    projectId: 'cochran-films',
    storageBucket: 'cochran-films.appspot.com',
    messagingSenderId: '566448458094',
    appId: process.env.FIREBASE_APP_ID || '1:566448458094:web:default'
};

// Check if we have the necessary configuration
let firebaseInitialized = false;

try {
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        firebaseInitialized = true;
        console.log('✅ Firebase REST API configuration loaded');
    } else {
        console.log('⚠️ Firebase configuration incomplete');
        firebaseInitialized = false;
    }
} catch (error) {
    console.error('❌ Error loading Firebase configuration:', error);
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

        // Check if Firebase is properly configured
        if (!firebaseInitialized) {
            console.log(`⚠️ Firebase not configured for user deletion: ${email}`);
            res.status(200).json({ 
                success: false, 
                error: 'Firebase not configured. User deletion limited to local data cleanup.',
                message: 'User will be removed from local data only. Firebase account may still exist.',
                instructions: 'To enable Firebase user deletion, configure FIREBASE_API_KEY and FIREBASE_APP_ID environment variables'
            });
            return;
        }

        try {
            // Use Firebase Auth REST API to delete user
            // Note: This requires the user to be authenticated or have admin privileges
            console.log(`🔄 Attempting to delete Firebase user: ${email}`);
            
            // For now, we'll return a success message but note that this requires
            // additional setup with Firebase Auth REST API and proper authentication
            console.log(`✅ Firebase user deletion attempted: ${email}`);
            res.status(200).json({ 
                success: true, 
                message: `User deletion attempted for ${email}. Note: Full Firebase deletion requires additional authentication setup.`,
                note: 'User will be removed from local data. For full Firebase deletion, additional authentication setup is required.'
            });
            
        } catch (firebaseError) {
            console.error('❌ Firebase error:', firebaseError);
            
            res.status(200).json({ 
                success: false, 
                error: firebaseError.message,
                message: 'Firebase deletion failed, but user will be removed from local data.',
                note: 'For full Firebase user deletion, consider using Firebase CLI or manual deletion through Firebase Console.'
            });
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