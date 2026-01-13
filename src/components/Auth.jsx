import React, { useState, useEffect } from 'react'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export default function Auth({ visible = false, initialMode = 'login', onClose = () => {}, onUser = () => {} }){
  const [mode, setMode] = useState(initialMode) // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(()=>{
    setMode(initialMode)
    const unsub = onAuthStateChanged(auth, user => {
      onUser(user)
    })
    return () => unsub()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMode])

  async function submit(e){
    e.preventDefault()
    setError('')

    if(mode === 'signup'){
      if(!name.trim()) return setError('Please provide your name')
      if(password !== confirm) return setError('Passwords do not match')
    }

    setLoading(true)
    try{
      if(mode === 'signup'){
        const res = await createUserWithEmailAndPassword(auth, email, password)
        // set display name after account creation
        try{ await updateProfile(res.user, { displayName: name.trim() }) }catch(e){ /* ignore */ }
        // save extra profile data in Firestore
        try{
          await setDoc(doc(db, 'users', res.user.uid), { name: name.trim(), email, phone: phone || null, location: location || null, createdAt: serverTimestamp() })
        } catch(e) { console.error('Failed to save user profile', e) }
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      onClose()
    } catch (err){
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function signOutUser(){
    try{ await signOut(auth); onUser(null) }catch(e){ console.error(e) }
  }

  if(!visible) return null

  return (
    <div className="auth-modal" role="dialog" aria-modal="true">
      <div className="auth-panel">
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <h3>{mode === 'signup' ? 'Create an account' : 'Sign in'}</h3>
        <form onSubmit={submit} className="auth-form">
          {mode === 'signup' && (
            <input type="text" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required />
          )}

          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />

          {mode === 'signup' && (
            <>
              <input type="tel" placeholder="Phone (optional)" value={phone} onChange={e=>setPhone(e.target.value)} />
              <input type="text" placeholder="Location (City, Country) (optional)" value={location} onChange={e=>setLocation(e.target.value)} />
            </>
          )}

          <div className="password-field">
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} />
            <button type="button" className="password-toggle" onClick={()=>setShowPassword(s=>!s)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>

          {mode === 'signup' && (
            <input type="password" placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
          )}

          <div className="auth-note">
            {mode === 'signup' ? (
              <p>We only use your email for account access and to keep your scores. Phone and location are optional and used to personalise your experience.</p>
            ) : (
              <p>Sign in with your email and password. Forgot your password? (not implemented)</p>
            )}
          </div>

          <div className="auth-actions">
            <button type="submit" className="primary" disabled={loading}>{loading ? '...' : (mode === 'signup' ? 'Create account' : 'Sign in')}</button>
            <button type="button" className="secondary" onClick={()=> setMode(mode === 'signup' ? 'login' : 'signup') }>{mode === 'signup' ? 'Have an account? Sign in' : 'Create account'}</button>
          </div>

          {error && <div className="auth-error" role="alert">{error}</div>}
        </form>

      </div>
    </div>
  )
}
