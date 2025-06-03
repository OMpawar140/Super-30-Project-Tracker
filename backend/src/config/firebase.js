const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Get the service account key path from environment
    const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
    
    if (!serviceAccountKeyPath) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_JSON is not set in environment variables');
    }

    // Initialize Firebase Admin with service account
    const serviceAccount = require(path.resolve(serviceAccountKeyPath));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    console.log('Firebase Admin SDK initialized successfully');
    return admin;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    process.exit(1);
  }
};

// Verify Firebase ID Token
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid token: ' + error.message);
  }
};

// Get user by UID
const getUserByUid = async (uid) => {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    throw new Error('User not found: ' + error.message);
  }
};

// Create custom token (if needed)
const createCustomToken = async (uid, claims = {}) => {
  try {
    const customToken = await admin.auth().createCustomToken(uid, claims);
    return customToken;
  } catch (error) {
    throw new Error('Error creating custom token: ' + error.message);
  }
};

module.exports = {
  initializeFirebase,
  verifyIdToken,
  getUserByUid,
  createCustomToken,
  admin
};