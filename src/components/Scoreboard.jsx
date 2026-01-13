import React from 'react'

export default function Scoreboard({ results, onRestart }){
  const players = results?.players || []
  const rounds = results?.rounds || []
  const sorted = [...players].sort((a,b)=> b.score - a.score)

  return (
    <div className="panel">
      <h2>Final Totals</h2>
      <div className="leaderboard">
        {sorted.map((p, idx)=> (
          <div className="leader-row" key={p.id}>
            <div className="pos">{idx+1}</div>
            <div className="name">{p.name}</div>
            <div className="score">{p.score}</div>
          </div>
        ))}
      </div>
      <div style={{overflowX:'auto'}}>
        <table className="score-table">
          <thead>
            <tr>
              <th>Round</th>
              {sorted.map(p => (
                <th key={p.id}>{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rounds.map(r => (
              <tr key={r.round}>
                <td className="round-label">R{r.round}</td>
                {sorted.map(p => {
                  const d = (r.deltas || []).find(d => d.id === p.id)
                  const val = d ? d.earned : 0
                  return <td key={p.id} className={val >= 0 ? 'pos-earn' : 'neg-earn'}>{val >= 0 ? `+${val}` : val}</td>
                })}
              </tr>
            ))}

            {/* Total row */}
            <tr className="total-row">
              <td className="round-label">Total</td>
              {sorted.map(p => (
                <td key={p.id} className="total-cell">{p.score}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div> 
      

      <div className="actions">
        <button onClick={onRestart} className="primary">Play Again</button>
      </div>
    </div>
  )
}
