import React, { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function PlayerSetup({ onNext, user }){
  const [names, setNames] = useState([''])
  const [roundTime, setRoundTime] = useState(60)
  const [penalty, setPenalty] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(()=>{
    // if there's a signed in user, fetch profile and prefill first player name
    async function fetchProfile(){
      if(!user) return
      setLoadingProfile(true)
      try{
        const d = await getDoc(doc(db, 'users', user.uid))
        const data = d.exists() ? d.data() : null
        const display = (user.displayName || (data && data.name) || '')
        if(display && (!names[0] || names[0].trim() === '')){
          setNames(prev => { const copy = [...prev]; copy[0] = display; return copy })
        }
      }catch(e){ console.error('Failed to load profile', e) }
      setLoadingProfile(false)
    }
    fetchProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function updateName(index, value){
    const copy = [...names]
    copy[index] = value
    setNames(copy)
  }

  function addPlayer(){ setNames([...names, '']) }
  function removePlayer(i){ setNames(names.filter((_, idx)=> idx !== i)) }

  function start(){
    const players = names.filter(n=>n.trim()).map((n, i)=>({ id: i+1, name: n.trim(), score:0 }))
    if(players.length < 2){ alert('Enter at least 2 player names') ; return }
    onNext(players, { roundTime: Number(roundTime), penalty })
  }

  const welcomeName = (user && (user.displayName || ''))

  const [suggestions, setSuggestions] = useState([])
  const [suggestionText, setSuggestionText] = useState('')
  const [suggestionSubmitting, setSuggestionSubmitting] = useState(false)
  const [suggestionMsg, setSuggestionMsg] = useState('')

  useEffect(()=>{
    async function loadSuggestions(){
      try{
        const q = query(collection(db, 'suggestions'), orderBy('createdAt','desc'), limit(8))
        const snap = await getDocs(q)
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setSuggestions(items)
      }catch(e){ console.error('Failed to load suggestions', e) }
    }
    loadSuggestions()
  }, [])

  async function submitSuggestion(){
    const text = suggestionText.trim()
    if(!text) return
    setSuggestionSubmitting(true)
    setSuggestionMsg('')
    try{
      if(user){
        await addDoc(collection(db, 'suggestions'), { text, userId: user.uid, name: user.displayName || null, createdAt: serverTimestamp() })
        setSuggestionMsg('Saved — thanks!')
      } else {
        setSuggestionMsg('Saved locally. Sign in to persist suggestions.')
      }
      setSuggestions(prev => [{ id: Date.now(), text }, ...prev])
      setSuggestionText('')
    }catch(e){
      console.error('Failed to submit suggestion', e)
      setSuggestionMsg('Failed to save suggestion')
    }finally{
      setSuggestionSubmitting(false)
      setTimeout(()=> setSuggestionMsg(''), 3000)
    }
  }

  return (
    <div className="panel player-setup-panel">
      <div className="setup-grid">
        <div className="setup-card main-card">
          <h2>Player Setup {welcomeName ? <span className="welcome">— Welcome, {welcomeName}</span> : null}</h2>
          <div className="player-list">
            {names.map((n, i)=> (
              <div className="player-row" key={i}>
                <input value={n} onChange={e=> updateName(i, e.target.value)} placeholder={`Player ${i+1} name`} />
                {names.length>1 && <button className="secondary" onClick={()=>removePlayer(i)}>Remove</button>}
              </div>
            ))}
          </div>
          <div className="controls">
            <button className="primary" onClick={addPlayer}>Add Player</button>
          </div>

          <div className="options">
            <label>Round time:
              <select value={roundTime} onChange={e=>setRoundTime(e.target.value)}>
                <option value={30}>30s</option>
                <option value={45}>45s</option>
                <option value={60}>60s</option>
              </select>
            </label>
            <label>
              <input type="checkbox" checked={penalty} onChange={e=>setPenalty(e.target.checked)} /> Penalty for skip
            </label>
          </div>

          <div className="actions">
            <button onClick={start} className="primary">Start Lobby</button>
          </div>
        </div>

        <div className="setup-card info-card">
          <h3>How to Play</h3>
          <p>Teams take turns. One player describes the word without saying it — the rest guess. Correct guesses score points; skips may incur a penalty.</p>
          <ul>
            <li>One describer per round</li>
            <li>Don't say the word or parts of it</li>
            <li>Use quick, specific clues</li>
          </ul>
          <p className="muted">Tip: Keep clues short to rack up points fast.</p>
        </div>

        <div className="setup-card creative-card">
          <h3>Share a word for future editions</h3>
          <p>Help shape the next editions by submitting words you'd like to see in the game.</p>

          <div className="suggestion-box">
            <label htmlFor="suggestion">Add a word you'd like to see</label>
            <div className="suggestion-input">
              <input id="suggestion" type="text" value={suggestionText} onChange={e=>setSuggestionText(e.target.value)} placeholder="e.g. 'Time Machine'" />
              <button className="primary" onClick={submitSuggestion} disabled={suggestionSubmitting || !suggestionText.trim()}>{suggestionSubmitting ? '...' : 'Add'}</button>
            </div>
            {suggestionMsg && <div className="suggestion-hint">{suggestionMsg}</div>}

            {suggestions.length>0 && (
              <ul className="suggestion-list">
                {suggestions.map((s, idx) => (
                  <li className="suggestion-item" key={s.id || idx}>{s.text}</li>
                ))}
              </ul>
            )}

            <p className="muted">Your suggestions help shape new editions — thanks for contributing!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
