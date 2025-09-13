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

        // Support GET (exists), POST (create), PUT (update password), DELETE (delete)

        const body = req.body || {};
        const queryEmail = (req.query && req.query.email) ? req.query.email : undefined;
        const { email: bodyEmail, password, newPassword, oldPassword } = body;
        const email = queryEmail || bodyEmail;

        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }

        const apiKey = firebaseConfig.apiKey;
        if (!apiKey) {
            return res.status(200).json({ success: false, error: 'Firebase API key not configured' });
        }

        // Check if user exists (by attempting sign-in to differentiate INVALID_PASSWORD vs EMAIL_NOT_FOUND)
        if (req.method === 'GET') {
            try {
                const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password: 'this_is_a_dummy_password', returnSecureToken: false })
                });
                const j = await r.json();
                if (r.ok) {
                    return res.status(200).json({ success: true, exists: true });
                }
                const code = j.error?.message || '';
                if (code === 'INVALID_PASSWORD' || code === 'USER_DISABLED') {
                    return res.status(200).json({ success: true, exists: true });
                }
                if (code === 'EMAIL_NOT_FOUND') {
                    return res.status(200).json({ success: true, exists: false });
                }
                return res.status(200).json({ success: false, exists: false, error: code || 'lookup failed' });
            } catch (e) {
                return res.status(200).json({ success: false, exists: false, error: e.message });
            }
        }

        // Create user
        if (req.method === 'POST') {
            try {
                if (!password) return res.status(400).json({ error: 'Password is required' });
                const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, returnSecureToken: true })
                });
                const j = await r.json();
                if (!r.ok) return res.status(200).json({ success: false, error: j.error?.message || 'signUp failed' });
                return res.status(200).json({ success: true, localId: j.localId });
            } catch (e) {
                return res.status(200).json({ success: false, error: e.message });
            }
        }

        // Update password
        if (req.method === 'PUT') {
            try {
                if (!oldPassword || !newPassword) return res.status(400).json({ error: 'oldPassword and newPassword are required' });
                const s = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password: oldPassword, returnSecureToken: true })
                });
                const sj = await s.json();
                if (!s.ok) return res.status(200).json({ success: false, error: sj.error?.message || 'signIn failed' });
                const idToken = sj.idToken;
                const u = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken, password: newPassword, returnSecureToken: false })
                });
                const uj = await u.json();
                if (!u.ok) return res.status(200).json({ success: false, error: uj.error?.message || 'update failed' });
                return res.status(200).json({ success: true });
            } catch (e) {
                return res.status(200).json({ success: false, error: e.message });
            }
        }

        // Delete (placeholder)
        if (req.method === 'DELETE') {
            console.log(`🔄 Attempting to delete Firebase user: ${email}`);
            return res.status(200).json({ success: true, message: `User deletion attempted for ${email}.` });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(200).json({ 
            success: false, 
            error: 'Internal server error',
            message: 'User will be removed from local data only due to server error.'
        });
    }
}; 