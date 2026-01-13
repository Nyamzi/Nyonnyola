import React, { useEffect, useState, useRef } from 'react'
import sampleWords from '../data/words.json'

function shuffle(a){
  return a.sort(()=> Math.random() - 0.5)
}

function playTone(type = 'correct'){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = type === 'correct' ? 880 : 220
    g.gain.value = 0.05
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    setTimeout(()=>{
      o.stop()
      ctx.close()
    }, type === 'correct' ? 120 : 180)
  } catch (e) {
    // ignore if WebAudio unavailable
  }
}

export default function GameScreen({ players: initialPlayers, options, onEnd, onUpdatePlayers }){
  const [players, setPlayers] = useState(initialPlayers.map(p=> ({...p})))
  const [currentExplainerIndex, setCurrentExplainerIndex] = useState(0)
  const [deck, setDeck] = useState([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const [wordStates, setWordStates] = useState([]) // 'pending' | 'correct' | 'skipped'
  const [timeLeft, setTimeLeft] = useState(options.roundTime)
  const [flip, setFlip] = useState(false)
  const [confetti, setConfetti] = useState([])
  const [roundsPlayed, setRoundsPlayed] = useState(0)
  const [toast, setToast] = useState(null)
  const [roundsHistory, setRoundsHistory] = useState([])
  const [startScores, setStartScores] = useState(() => initialPlayers.map(p=> ({ id: p.id, score: p.score })))
  const [turnState, setTurnState] = useState('idle') // 'idle' | 'playing' | 'review'
  const [turnSummary, setTurnSummary] = useState(null)
  const timerRef = useRef(null)

  function buildDeck(){
    const shuffled = shuffle([...sampleWords])
    const cards = []
    const perCard = 7
    for(let i=0;i<shuffled.length;i+=perCard){
      const slice = shuffled.slice(i, i+perCard)
      cards.push(slice)
    }
    setDeck(cards)
    setCurrentCardIndex(0)
    setWordIndex(0)
    setWordStates([])
  }

  useEffect(()=>{
    buildDeck()
  }, [])

  // when the current card changes, reset word states
  useEffect(()=>{
    const currentCard = deck[currentCardIndex] || []
    if(currentCard.length){
      setWordStates(Array(currentCard.length).fill('pending'))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCardIndex, deck])

  useEffect(()=>{
    if(typeof onUpdatePlayers === 'function'){
      try{ onUpdatePlayers(players) } catch(e){ console.error('onUpdatePlayers failed', e) }
    }
  }, [players, onUpdatePlayers])

  function computeTurnSummary(){
    const card = deck[currentCardIndex] || []
    const correct = wordStates.filter(s => s === 'correct').length
    const skipped = wordStates.filter(s => s === 'skipped').length
    const total = card.length
    const start = startScores.find(s => s.id === players[currentExplainerIndex]?.id)
    const earned = (players[currentExplainerIndex]?.score || 0) - (start ? start.score : 0)
    return { correct, skipped, total, earned }
  }

  function startTimer(){
    clearInterval(timerRef.current)
    setTimeLeft(options.roundTime)
    timerRef.current = setInterval(()=>{
      setTimeLeft(t => {
        if(t <= 1){
          clearInterval(timerRef.current)
          // when timer ends, move to review state and show summary
          setTurnState('review')
          setTurnSummary(computeTurnSummary())
          return 0
        }
        return t-1
      })
    }, 1000)
  }

  useEffect(()=>{
    // start the timer once the deck is ready
    if(deck.length) startTimer()
    return ()=> clearInterval(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck])

  function triggerFlip(){
    setFlip(true)
    setTimeout(()=> setFlip(false), 600)
  }

  function spawnConfetti(){
    const pieces = Array.from({length: 18}).map((_, i)=>({ id: Date.now() + i, left: Math.random()*80 + 10, color: ['#ff7a59','#ffd166','#06d6a0','#118ab2','#8338ec'][Math.floor(Math.random()*5)] }))
    setConfetti(pieces)
    setTimeout(()=> setConfetti([]), 1500)
  }

  function toggleWord(i, forceState){
    // only allow toggling while playing
    if(turnState !== 'playing') return
    const card = deck[currentCardIndex] || []
    if(!card.length || i == null || i < 0 || i >= card.length) return

    setWordStates(prev => {
      const next = prev.length ? [...prev] : Array(card.length).fill('pending')
      const prevState = next[i] || 'pending'
      const newState = forceState ? forceState : (prevState === 'pending' ? 'correct' : 'pending')

      // update explainer score
      const explainer = players[currentExplainerIndex]
      const updatedPlayers = players.map(p => {
        if(p.id !== explainer.id) return p
        let delta = 0
        if(prevState !== 'correct' && newState === 'correct') delta = 1
        if(prevState === 'correct' && newState !== 'correct') delta = -1
        // penalty for skip
        if(prevState !== 'skipped' && newState === 'skipped' && options.penalty) delta -= 1
        if(prevState === 'skipped' && newState !== 'skipped' && options.penalty) delta += 1
        return {...p, score: p.score + delta}
      })
      setPlayers(updatedPlayers)

      // effects
      if(newState === 'correct'){
        playTone('correct')
        spawnConfetti()
      } else if(newState === 'skipped'){
        playTone('wrong')
      }

      next[i] = newState
      return next
    })
  }
  // Called when player taps Done (or time expires) to show review summary
  function doneTurn(){
    clearInterval(timerRef.current)
    setTurnState('review')
    setTurnSummary(computeTurnSummary())
  }

  // Move to next player after review; does NOT auto-start the next turn
  function nextPlayer(){
    const played = roundsPlayed + 1
    setRoundsPlayed(played)

    // record round deltas
    const earnedPerPlayer = players.map(p => {
      const start = startScores.find(s => s.id === p.id)
      const earned = (p.score || 0) - (start ? start.score : 0)
      return { id: p.id, earned }
    })
    const roundRecord = { round: roundsHistory.length + 1, explainerId: players[currentExplainerIndex]?.id, deltas: earnedPerPlayer }
    setRoundsHistory(prev => [...prev, roundRecord])

    const next = (currentExplainerIndex + 1) % players.length
    const nextName = players[next]?.name || 'Player'
    setToast(`Next: ${nextName}`)

    // show toast then rotate and prepare the next turn (idle - requires Start)
    setTimeout(()=>{
      setToast(null)
      setCurrentExplainerIndex(next)
      setStartScores(players.map(p=> ({ id: p.id, score: p.score })))
      buildDeck()
      setTurnState('idle')
      setTurnSummary(null)
      setTimeLeft(options.roundTime)
    }, 800)
  }

  function endRound(){
    clearInterval(timerRef.current)
    // End the match and show results: record this turn and include rounds history
    const earnedPerPlayer = players.map(p => {
      const start = startScores.find(s => s.id === p.id)
      const earned = (p.score || 0) - (start ? start.score : 0)
      return { id: p.id, earned }
    })
    const roundRecord = { round: roundsHistory.length + 1, explainerId: players[currentExplainerIndex]?.id, deltas: earnedPerPlayer }
    const allRounds = [...roundsHistory, roundRecord]

    // ensure parent persisting
    if(typeof onUpdatePlayers === 'function'){
      try{ onUpdatePlayers(players) } catch(e){ console.error('onUpdatePlayers failed', e) }
    }

    const results = { players: players.map(p=> ({ ...p })), rounds: allRounds }
    onEnd(results)
  }

  function correct(){
    // mark current focused word as correct and advance
    const idx = wordIndex || 0
    toggleWord(idx, 'correct')
    playTone('correct')
    spawnConfetti()
    triggerFlip()
    setTimeout(()=> setWordIndex(i => {
      const next = (typeof i === 'number' ? i : idx) + 1
      return next % (deck[currentCardIndex] ? deck[currentCardIndex].length : 1)
    }), 220)
  }

  function skip(){
    const idx = wordIndex || 0
    toggleWord(idx, 'skipped')
    if(options.penalty){
      // penalty handled in toggleWord
    }
    playTone('wrong')
    triggerFlip()
    setTimeout(()=> setWordIndex(i => {
      const next = (typeof i === 'number' ? i : idx) + 1
      return next % (deck[currentCardIndex] ? deck[currentCardIndex].length : 1)
    }), 220)
  }

  // Deprecated: use nextPlayer for explicit control
  function nextWord(){
    nextPlayer()
  }

  // current helper values for rendering
  const explainer = players[currentExplainerIndex] || { name: 'Player' }
  const currentCard = deck[currentCardIndex] || []

  function startTurn(){
    setStartScores(players.map(p=> ({ id: p.id, score: p.score })))
    setTurnState('playing')
    setTurnSummary(null)
    setTimeLeft(options.roundTime)
    // ensure a fresh card/state
    setWordStates(Array(currentCard.length).fill('pending'))
    setWordIndex(0)
    startTimer()
  }

  return (
    <div className="panel">
      <h2>Round — Explainer: {explainer.name} {turnState === 'idle' ? ' — Ready' : turnState === 'playing' ? ' — Playing' : ' — Review'}</h2>
      <div className="game-area" style={{position:'relative'}}>
        <div className={`card ${flip ? 'flip' : ''}`} aria-live="polite">
          {turnState === 'playing' ? (
            <>
              <div className="card-words" style={{display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center'}}>
                {currentCard.map((w, i) => {
                  const state = wordStates[i] || 'pending'
                  return (
                    <button key={i} onClick={() => { setWordIndex(i); toggleWord(i) }} className={`word-chip ${state} ${i === wordIndex ? 'focused' : ''}`}>
                      <svg className="word-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21 11l-8-8H3v10l8 8 10-10zM7 7a2 2 0 110-4 2 2 0 010 4z" /></svg>
                      <span className="word-label">{w}</span>
                      <span style={{marginLeft:8, opacity:0.9}}>{state === 'correct' ? '✓' : state === 'skipped' ? '—' : ''}</span>
                    </button>
                  )
                })}
              </div>
              <div className="card-foot">{wordStates.filter(s => s === 'correct').length} guessed • {currentCard.length} words</div>
            </>
          ) : (
            turnState === 'idle' ? (
              <div style={{padding:40, textAlign:'center', color:'rgba(7,18,44,0.6)'}}>Card hidden — press <strong>Start</strong> to reveal</div>
            ) : (
              <div style={{padding:20, textAlign:'center'}}>
                <h4>Turn summary</h4>
                <div>{turnSummary ? `${turnSummary.correct} correct • ${turnSummary.skipped} skipped • ${turnSummary.total} total` : 'No activity'}</div>
                <div style={{marginTop:8, fontSize:13, color:'var(--muted)'}}>Earned this turn: {turnSummary ? turnSummary.earned : 0}</div>
              </div>
            )
          )}
        </div>

        <div className={`timer ${timeLeft <= 10 ? 'warn' : ''}`}>{turnState === 'playing' ? `${timeLeft}s` : '--'}</div>

        <div className="buttons">
          {turnState === 'idle' && <button className="primary" onClick={startTurn}>Start</button>}
          {turnState === 'playing' && (
            <>
              <button onClick={doneTurn} className="primary">Done</button>
            </>
          )}
          {turnState === 'review' && <button onClick={nextPlayer} className="primary">Next Player</button>}

          <button onClick={endRound} className="danger">End Game</button>
        </div>

        <div className="score-list">
          {players.map(p=> (
            <div key={p.id} className="score-row">{p.name}: {p.score}</div>
          ))}
        </div>

        {confetti.map(c => (
          <div key={c.id} className="confetti-piece" style={{left: `${c.left}%`, background:c.color}} />
        ))}
      </div>
    </div>
  )
}
