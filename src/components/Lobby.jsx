import React from 'react'

export default function Lobby({ players, onStart, onBack }){
  return (
    <div className="panel">
      <h2>Lobby</h2>
      <div className="player-grid">
        {players.map(p=> (
          <div className="player-card" key={p.id}>
            <div className="avatar">{p.name.charAt(0).toUpperCase()}</div>
            <div className="name">{p.name}</div>
          </div>
        ))}
      </div>

      <div className="actions">
        <button onClick={onBack}>Back</button>
        <button onClick={onStart} className="primary">Start Game</button>
      </div>
    </div>
  )
}
