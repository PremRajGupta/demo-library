import { initializeApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBJWq6_3VamDO5VmFXv2PM2RB7rrh7GeEM',
  authDomain: 'fir-library-75f22.firebaseapp.com',
  projectId: 'fir-library-75f22',
  storageBucket: 'fir-library-75f22.firebasestorage.app',
  messagingSenderId: '594913579129',
  appId: '1:594913579129:web:c21f52b9afe51dba2844a8',
  measurementId: 'G-QX03C0L9W0',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let analytics: Analytics | null = null;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn('Firebase Analytics could not be initialized:', error);
}

export { app, analytics, auth };
export default firebaseConfig;
