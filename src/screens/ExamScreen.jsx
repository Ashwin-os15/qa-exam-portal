import React, { useState, useEffect, useRef, useCallback } from 'react'
import './ExamScreen.css'

const ALPHA = ['a', 'b', 'c', 'd']
const KEY_MAP = { '1': 'a', '2': 'b', '3': 'c', '4': 'd', 'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd' }

export default function ExamScreen({ config, finishExam, setScreen, progress, toggleBookmark }) {
  const { questions, mode, timed, timeLimit } = config
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({}) // id -> selected option
  const [flagged, setFlagged] = useState(new Set())
  const [revealed, setRevealed] = useState(new Set()) // for practice mode - show answer
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [shake, setShake] = useState(false)
  const timerRef = useRef(null)

  const q = questions[idx]
  const isAnswered = answers[q?.id] !== undefined
  const isBookmarked = (progress.bookmarks || []).includes(q?.id)
  const isRevealed = revealed.has(q?.id)

  // Timer
  useEffect(() => {
    if (!timed || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleFinish(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timed])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      const key = e.key.toLowerCase()
      if (KEY_MAP[key] && !isAnswered) { handleSelect(KEY_MAP[key]); return }
      if (e.key === 'ArrowRight' || e.key === 'Enter') { if (isAnswered || mode !== 'timed') goNext() }
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'f') handleFlag()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx, isAnswered, mode])

  const handleSelect = useCallback((opt) => {
    if (isAnswered) return
    setAnswers(prev => ({ ...prev, [q.id]: opt }))
    if (mode !== 'practice') return // in practice, don't auto-advance
    // For wrong answer, shake
    if (opt !== q.answer) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }, [q, isAnswered, mode])

  const handleReveal = () => setRevealed(prev => new Set([...prev, q.id]))

  const handleFlag = () => {
    setFlagged(prev => {
      const n = new Set(prev)
      n.has(q.id) ? n.delete(q.id) : n.add(q.id)
      return n
    })
  }

  const goNext = () => { if (idx < questions.length - 1) setIdx(idx + 1) }
  const goPrev = () => { if (idx > 0) setIdx(idx - 1) }
  const goTo = (i) => { setIdx(i); setSidebarOpen(false) }

  const handleFinish = useCallback(() => {
    clearInterval(timerRef.current)
    const result = {
      mode, questions,
      answers: questions.map(q => ({
        id: q.id,
        question: q,
        selected: answers[q.id] || null,
        correct: answers[q.id] === q.answer,
        skipped: answers[q.id] === undefined
      }))
    }
    finishExam(result)
  }, [answers, questions, mode, finishExam])

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
  const timePct = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 100
  const timeColor = timePct > 50 ? 'var(--green)' : timePct > 20 ? 'var(--yellow)' : 'var(--red)'

  const answeredCount = Object.keys(answers).length
  const progressPct = Math.round((answeredCount / questions.length) * 100)

  const hasOptions = q && Object.values(q.options).some(v => v && v.trim())

  return (
    <div className="exam-wrap">
      {/* Sidebar overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Question navigator sidebar */}
      <aside className={`q-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span>Questions</span>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <div className="sidebar-stats">
          <span className="s-stat green">{answeredCount} done</span>
          <span className="s-stat yellow">{flagged.size} flagged</span>
          <span className="s-stat dim">{questions.length - answeredCount} left</span>
        </div>
        <div className="q-grid">
          {questions.map((question, i) => {
            const answered = answers[question.id] !== undefined
            const correct = answered && answers[question.id] === question.answer
            const isFlagged = flagged.has(question.id)
            const isCurrent = i === idx
            return (
              <button key={question.id}
                className={`q-dot ${isCurrent ? 'current' : ''} ${answered ? (correct ? 'correct' : 'wrong') : ''} ${isFlagged ? 'flagged' : ''}`}
                onClick={() => goTo(i)}
                title={`Q${question.id}`}>
                {question.id}
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main exam area */}
      <div className="exam-main">
        {/* Top bar */}
        <header className="exam-header">
          <div className="exam-header-left">
            <button className="nav-icon-btn" onClick={() => setSidebarOpen(true)} title="Question navigator">
              ☰
            </button>
            <div className="exam-progress-info">
              <span className="q-counter">{idx + 1} <span style={{color:'var(--text3)'}}>/ {questions.length}</span></span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
          <div className="exam-header-center">
            <span className="topic-badge" style={{ '--tc': q?.topic?.color }}>
              {q?.topic?.icon} {q?.topic?.name}
            </span>
          </div>
          <div className="exam-header-right">
            {timed && (
              <div className="timer" style={{ color: timeColor, borderColor: timeColor }}>
                <span className="timer-icon">⏱</span>
                <span className="timer-val">{formatTime(timeLeft)}</span>
              </div>
            )}
            <button className="nav-icon-btn" onClick={() => setScreen('home')} title="Exit">✕</button>
          </div>
        </header>

        {/* Question card */}
        <div className="exam-body">
          <div className={`question-card card animate-fadeIn ${shake ? 'shake' : ''}`} key={q?.id}>
            <div className="q-header">
              <span className="q-num">Q {q?.id}</span>
              <div className="q-actions">
                <button className={`icon-btn ${isBookmarked ? 'active-bookmark' : ''}`}
                  onClick={() => toggleBookmark(q.id)} title="Bookmark">
                  {isBookmarked ? '🔖' : '🏷'}
                </button>
                <button className={`icon-btn ${flagged.has(q?.id) ? 'active-flag' : ''}`}
                  onClick={handleFlag} title="Flag for review (F)">
                  {flagged.has(q?.id) ? '🚩' : '⚑'}
                </button>
              </div>
            </div>

            <p className="q-text">{q?.question}</p>

            {/* Options */}
            <div className="options-list">
              {ALPHA.map((opt) => {
                const optText = q?.options?.[opt]
                const isSelected = answers[q?.id] === opt
                const isCorrect = opt === q?.answer
                const showResult = isAnswered || isRevealed

                let cls = 'option-btn'
                if (showResult) {
                  if (isCorrect) cls += ' correct'
                  else if (isSelected && !isCorrect) cls += ' wrong'
                  else cls += ' dim'
                } else if (isSelected) {
                  cls += ' selected'
                }

                return (
                  <button key={opt} className={cls}
                    onClick={() => handleSelect(opt)}
                    disabled={isAnswered || isRevealed}>
                    <span className="opt-letter">{opt.toUpperCase()}</span>
                    <span className="opt-text">
                      {optText || <em style={{color:'var(--text3)'}}>Option {opt.toUpperCase()}</em>}
                    </span>
                    {showResult && isCorrect && <span className="opt-badge correct-badge">✓</span>}
                    {showResult && isSelected && !isCorrect && <span className="opt-badge wrong-badge">✗</span>}
                  </button>
                )
              })}
            </div>

            {/* Practice mode reveal / answer indicator */}
            {mode === 'practice' && !isAnswered && !isRevealed && (
              <button className="btn btn-ghost reveal-btn" onClick={handleReveal}>
                Show Answer
              </button>
            )}

            {/* Answer feedback */}
            {(isAnswered || isRevealed) && (
              <div className={`feedback-bar ${isAnswered ? (answers[q.id] === q.answer ? 'correct' : 'wrong') : 'neutral'}`}>
                {isAnswered
                  ? answers[q.id] === q.answer
                    ? '✓ Correct!'
                    : `✗ Wrong — Answer is ${q.answer.toUpperCase()}`
                  : `Answer: ${q.answer.toUpperCase()}`
                }
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div className="exam-nav">
            <button className="btn btn-ghost" onClick={goPrev} disabled={idx === 0}>
              ← Prev
            </button>
            <div className="nav-center-group">
              <span className="keyboard-hint">1-4 or A-D to answer · ← → to navigate · F to flag</span>
            </div>
            {idx < questions.length - 1 ? (
              <button className="btn btn-primary" onClick={goNext}>
                Next →
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleFinish}>
                Finish ✓
              </button>
            )}
          </div>

          {/* Finish early button */}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button className="btn btn-ghost small" onClick={handleFinish} style={{fontSize:'0.78rem', color:'var(--text3)'}}>
              Finish & Review ({answeredCount}/{questions.length} answered)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
