import admin from 'firebase-admin';
import 'dotenv/config';

// check if the GOOGLE_APPLICATION_CREDENTIALS environment variable is set
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn('WARNING: GOOGLE_APPLICATION_CREDENTIALS is not set');
  //   throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set');
}

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  console.log('Firebase Admin SDK Initialized Successfully.');
} catch (error) {
  console.error('Firebase Admin SDK Initialization Failed:', error);
  process.exit(1);
}

export default admin;
