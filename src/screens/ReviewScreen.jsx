import React, { useState, useMemo } from 'react'
import './ReviewScreen.css'

const ALPHA = ['a','b','c','d']

export default function ReviewScreen({ result, setScreen, startExam, toggleBookmark, progress }) {
  const [filter, setFilter] = useState('all') // all | wrong | correct | skipped
  const [expandedId, setExpandedId] = useState(null)

  const { answers, questions, mode } = result

  const stats = useMemo(() => {
    const correct = answers.filter(a => a.correct).length
    const wrong = answers.filter(a => !a.correct && !a.skipped).length
    const skipped = answers.filter(a => a.skipped).length
    const score = Math.round((correct / answers.length) * 100)
    return { correct, wrong, skipped, total: answers.length, score }
  }, [answers])

  const filtered = useMemo(() => {
    return answers.filter(a => {
      if (filter === 'wrong') return !a.correct && !a.skipped
      if (filter === 'correct') return a.correct
      if (filter === 'skipped') return a.skipped
      return true
    })
  }, [answers, filter])

  const retryWrong = () => {
    const wrongQs = answers.filter(a => !a.correct).map(a => a.question)
    if (!wrongQs.length) return alert('No wrong answers to retry!')
    startExam({ questions: wrongQs, mode: 'practice', timed: false })
  }

  const grade = stats.score >= 80 ? { label: 'Excellent', color: 'var(--green)' }
    : stats.score >= 60 ? { label: 'Good', color: 'var(--yellow)' }
    : stats.score >= 40 ? { label: 'Average', color: 'var(--yellow)' }
    : { label: 'Needs Work', color: 'var(--red)' }

  return (
    <div className="review-wrap">
      <header className="review-header">
        <button className="btn btn-ghost" onClick={() => setScreen('home')}>← Home</button>
        <h2 className="review-title">Session Review</h2>
        <button className="btn btn-ghost" onClick={() => setScreen('stats')}>Stats 📈</button>
      </header>

      <div className="review-body">
        {/* Score card */}
        <div className="score-card card animate-fadeIn">
          <div className="score-circle" style={{ '--color': grade.color }}>
            <span className="score-num">{stats.score}%</span>
            <span className="score-label">{grade.label}</span>
          </div>
          <div className="score-stats">
            <div className="ss-item green">
              <span className="ss-num">{stats.correct}</span>
              <span className="ss-label">✓ Correct</span>
            </div>
            <div className="ss-item red">
              <span className="ss-num">{stats.wrong}</span>
              <span className="ss-label">✗ Wrong</span>
            </div>
            <div className="ss-item dim">
              <span className="ss-num">{stats.skipped}</span>
              <span className="ss-label">— Skipped</span>
            </div>
            <div className="ss-item">
              <span className="ss-num">{stats.total}</span>
              <span className="ss-label">Total</span>
            </div>
          </div>
          <div className="score-actions">
            {stats.wrong > 0 && (
              <button className="btn btn-danger" onClick={retryWrong}>
                🔁 Retry Wrong ({stats.wrong})
              </button>
            )}
            <button className="btn btn-primary" onClick={() => setScreen('home')}>
              New Session
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          {[
            { id: 'all',     label: `All (${answers.length})` },
            { id: 'wrong',   label: `Wrong (${stats.wrong})` },
            { id: 'correct', label: `Correct (${stats.correct})` },
            { id: 'skipped', label: `Skipped (${stats.skipped})` },
          ].map(f => (
            <button key={f.id} className={`filter-tab ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Questions list */}
        <div className="review-list">
          {filtered.length === 0 && (
            <div className="empty-state card">No questions in this category.</div>
          )}
          {filtered.map((ans) => {
            const q = ans.question
            const isExpanded = expandedId === q.id
            const isBookmarked = (progress.bookmarks || []).includes(q.id)
            const hasOptions = q.options && Object.values(q.options).some(v => v?.trim())
            const status = ans.correct ? 'correct' : ans.skipped ? 'skipped' : 'wrong'

            return (
              <div key={q.id} className={`review-item card ${status}`}>
                <div className="ri-header" onClick={() => setExpandedId(isExpanded ? null : q.id)}>
                  <div className="ri-left">
                    <span className={`ri-status-dot ${status}`} />
                    <span className="ri-qnum">Q {q.id}</span>
                    <span className="ri-topic" style={{ color: q.topic?.color }}>
                      {q.topic?.icon} {q.topic?.name}
                    </span>
                  </div>
                  <div className="ri-right">
                    <button className={`icon-btn ${isBookmarked ? 'active-bookmark' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(q.id) }}>
                      {isBookmarked ? '🔖' : '🏷'}
                    </button>
                    <span className="ri-answer-pill">
                      {ans.selected ? `You: ${ans.selected.toUpperCase()}` : '—'}
                    </span>
                    {!ans.correct && (
                      <span className="ri-correct-pill">Ans: {q.answer.toUpperCase()}</span>
                    )}
                    <span className="ri-chevron">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                <p className="ri-question-preview">{q.question.slice(0, 120)}{q.question.length > 120 ? '…' : ''}</p>

                {isExpanded && (
                  <div className="ri-expanded animate-fadeIn">
                    <p className="ri-full-q">{q.question}</p>
                    {hasOptions && (
                      <div className="ri-options">
                        {ALPHA.map(opt => {
                          const optText = q.options?.[opt]
                          if (!optText?.trim()) return null
                          const isCorrect = opt === q.answer
                          const isSelected = opt === ans.selected
                          let cls = 'ri-opt'
                          if (isCorrect) cls += ' correct'
                          else if (isSelected && !isCorrect) cls += ' wrong'
                          return (
                            <div key={opt} className={cls}>
                              <span className="ri-opt-letter">{opt.toUpperCase()}</span>
                              <span className="ri-opt-text">{optText}</span>
                              {isCorrect && <span className="ri-badge correct">✓</span>}
                              {isSelected && !isCorrect && <span className="ri-badge wrong">✗</span>}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {!hasOptions && (
                      <div className="ri-no-options">
                        <span>Correct answer: <strong style={{color: 'var(--green)'}}>{q.answer.toUpperCase()}</strong></span>
                        {ans.selected && ans.selected !== q.answer && (
                          <span> · Your answer: <strong style={{color:'var(--red)'}}>{ans.selected.toUpperCase()}</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
