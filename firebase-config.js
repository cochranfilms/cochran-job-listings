// Secure Firebase Configuration
// This file loads environment variables for Firebase configuration

// Function to get environment variables securely
function getFirebaseConfig() {
    // In production, these will be loaded from Vercel environment variables
    // In development, you can set these in your local environment
    return {
        apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyCkL31Phi7FxYCeB5zgHeYTb2iY2sTJJdw',
        authDomain: 'cochran-films.firebaseapp.com',
        projectId: 'cochran-films',
        storageBucket: 'cochran-films.appspot.com',
        messagingSenderId: '566448458094',
        appId: process.env.FIREBASE_APP_ID || '1:566448458094:web:default'
    };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getFirebaseConfig };
} 