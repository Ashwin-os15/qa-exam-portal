import React from 'react'
import './ExplainBox.css'

export default function ExplainBox({ question, explain, explanations, loading, errors }) {
  const id = question?.id
  const text = explanations?.[id]
  const isLoading = loading?.[id]
  const error = errors?.[id]
  const hasExplanation = !!text

  return (
    <div className="explain-box">
      {!hasExplanation && !isLoading && !error && (
        <button className="explain-btn" onClick={() => explain(question)}>
          <span className="explain-icon">✦</span>
          Explain this answer
        </button>
      )}

      {isLoading && (
        <div className="explain-loading">
          <span className="explain-spinner" />
          Generating explanation…
        </div>
      )}

      {error && (
        <div className="explain-error">
          <span>{error}</span>
          <button className="explain-retry" onClick={() => explain(question)}>Retry</button>
        </div>
      )}

      {hasExplanation && (
        <div className="explain-result animate-fadeIn">
          <div className="explain-header">
            <span className="explain-icon-label">✦ Explanation</span>
            <button className="explain-regen" onClick={() => explain(question)} title="Regenerate">↻</button>
          </div>
          <p className="explain-text">{text}</p>
        </div>
      )}
    </div>
  )
}
