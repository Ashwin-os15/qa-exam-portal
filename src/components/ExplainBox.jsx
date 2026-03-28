import React, { useState } from 'react'
import './ExplainBox.css'

export default function ExplainBox({ questionId, getExplanation }) {
  const [show, setShow] = useState(false)
  const text = getExplanation(questionId)

  if (!text) return null

  return (
    <div className="explain-box">
      {!show ? (
        <button className="explain-btn" onClick={() => setShow(true)}>
          <span className="explain-icon">✦</span>
          Show Explanation
        </button>
      ) : (
        <div className="explain-result animate-fadeIn">
          <div className="explain-header">
            <span className="explain-icon-label">✦ Explanation</span>
            <button className="explain-regen" onClick={() => setShow(false)}>Hide</button>
          </div>
          <p className="explain-text">{text}</p>
        </div>
      )}
    </div>
  )
}
