import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

// Firebase config (inlined per request)
const firebaseConfig = {
  apiKey: 'AIzaSyA2Om5bhZEb2X7C6KA8rFikZPEnIJdpv_M',
  authDomain: 'nyonnyola.firebaseapp.com',
  projectId: 'nyonnyola',
  storageBucket: 'nyonnyola.firebasestorage.app',
  messagingSenderId: '339621702416',
  appId: '1:339621702416:web:d2204931bba847e0909395',
  measurementId: 'G-N76MHME6ZP'
}

const app = initializeApp(firebaseConfig)

// Analytics is browser-only; guard to avoid SSR/test errors
let analytics
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app)
  }
} catch (e) {
  // ignore analytics init errors when not available
  // console.warn('Firebase analytics not available', e)
}

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
export { analytics }
