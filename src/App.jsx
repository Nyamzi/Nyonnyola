import React, { useState, useRef } from 'react'
import PlayerSetup from './components/PlayerSetup'
import Lobby from './components/Lobby'
import GameScreen from './components/GameScreen'
import Scoreboard from './components/Scoreboard'
import heroPhoto from './assets/hero-photo.jpg'
import Auth from './components/Auth'
import { auth } from './firebase'
import { signOut } from 'firebase/auth'

export default function App() {
  console.log('App render')
  const [players, setPlayers] = useState([])
  const [mode, setMode] = useState('landing') // landing, setup, lobby, game, results
  const [gameOptions, setGameOptions] = useState({ roundTime: 60, penalty: false })
  const [results, setResults] = useState(null)

  // Auth state
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
  const deckRef = useRef(null)

  function handleDeckMove(e){
    const el = deckRef.current
    if(!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    const rx = -y * 6
    const ry = x * 8
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
  }
  function resetDeck(){ if(deckRef.current) deckRef.current.style.transform = '' }

  function openAuth(mode = 'login'){
    setAuthMode(mode)
    setShowAuth(true)
  }

  async function handleSignOut(){
    try{ await signOut(auth); setUser(null); setMode('landing') }catch(e){ console.error('Sign out failed', e) }
  }

  return (
    <div className="app">
      <header className={`app-header ${mode === 'landing' ? 'hero-header' : 'solid-header'}`}>
        <div className="brand">Nyonnyola</div>
        <nav className="site-nav" aria-label="Main navigation">
          <button className="nav-link" onClick={() => setMode('landing')}>Home</button>
          <button className="nav-link" onClick={() => setMode('lobby')}>Demo</button>
        </nav>
        <div className="header-actions">
          {user ? (
            <div className="auth-actions-header">
              <span className="user-name">{user.displayName || user.email}</span>
              <button className="secondary" onClick={handleSignOut}>Sign out</button>
            </div>
          ) : (
            <div className="auth-actions-header">
              <button className="secondary" onClick={() => openAuth('login')}>Sign in</button>
              <button className="primary" onClick={() => openAuth('signup')}>Create account</button>
            </div>
          )}
        </div>
      </header>
      <main>
        {mode === 'landing' && (
          <div className="hero panel">
            <div className="hero-inner">
              <div className="hero-copy">
                <div className="hero-brand">Nyonnyola</div>
                <h1 className="hero-title">Quick, hilarious rounds with friends</h1>
                <p className="hero-sub">Explain it. Don’t say it. Guess fast.

                A fast, funny guessing game for all ages.
                Describe the word to your team without saying it —
                use clues, examples, and smart talking.
                Slip up, say the word, and you lose the round!</p>
                <div className="hero-cta">
                  <button className="primary" onClick={() => openAuth('signup')}>Create account</button>
                  <button className="primary" onClick={() => openAuth('login')}>Sign in</button>
                  <button className="primary" onClick={() => setMode('lobby')}>Try demo</button>
                </div>
              </div>

              <div className="hero-art">
                <div className="hero-photo-wrap" ref={deckRef} onMouseMove={handleDeckMove} onMouseLeave={resetDeck}>
                  <img src={heroPhoto} alt="Friends looking into camera" className="hero-photo" loading="lazy" />
                  <div className="hero-photo-overlay" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'setup' && (
          <PlayerSetup user={user} onNext={(p, opts) => { setPlayers(p); setGameOptions(opts); setMode('lobby')}} />
        )}

        {mode === 'lobby' && (
          <Lobby players={players} onStart={() => setMode('game')} onBack={() => setMode('setup')} />
        )}

        {mode === 'game' && (
          <GameScreen players={players} options={gameOptions} onEnd={(res) => { setResults(res); setMode('results')}} onUpdatePlayers={setPlayers} />
        )}

        {mode === 'results' && (
          <Scoreboard results={results} onRestart={() => { setMode('setup'); setPlayers([]) }} />
        )}

        <Auth visible={showAuth} initialMode={authMode} onClose={() => setShowAuth(false)} onUser={(u) => { setUser(u); setShowAuth(false); if(u) setMode('setup') }} />
      </main>
    </div>
  )
}
