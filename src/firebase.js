// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

/**
 * Firebase configuration
 * Note: For security, consider moving these values to environment variables
 */
const firebaseConfig = {
  apiKey: 'AIzaSyA2Om5bhZEb2X7C6KA8rFikZPEnIJdpv_M',
  authDomain: 'nyonnyola.firebaseapp.com',
  projectId: 'nyonnyola',
  storageBucket: 'nyonnyola.firebasestorage.app',
  messagingSenderId: '339621702416',
  appId: '1:339621702416:web:d2204931bba847e0909395',
  measurementId: 'G-N76MHME6ZP'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Analytics (browser-only)
let analytics
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app)
  }
} catch (e) {
  // Ignore analytics errors when not available (SSR or testing)
  // console.warn('Firebase analytics not available', e)
}

// Export Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export { analytics }
export default app
