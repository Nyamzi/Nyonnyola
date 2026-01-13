import React, { useState } from 'react'
import sampleWords from '../data/words.json'

export default function WordManager(){
  const [words, setWords] = useState(sampleWords)
  const [input, setInput] = useState('')

  function addWord(){
    if(!input.trim()) return
    setWords([input.trim(), ...words])
    setInput('')
  }

  return (
    <div className="panel">
      <h2>Word Manager (Local)</h2>
      <div className="add-row">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Add a word" />
        <button onClick={addWord}>Add</button>
      </div>

      <div className="word-list">
        {words.slice(0,100).map((w, i)=> (
          <div key={i} className="word-item">
            <svg className="word-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{width:18,height:18,marginRight:8,color:'inherit'}}><path fill="currentColor" d="M21 11l-8-8H3v10l8 8 10-10zM7 7a2 2 0 110-4 2 2 0 010 4z" /></svg>
            <span>{w}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
