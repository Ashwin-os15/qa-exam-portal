import React, { useMemo, useState } from 'react'
import './HomeScreen.css'

export default function HomeScreen({ QUESTIONS, TOPICS, progress, startExam, resetProgress, setScreen }) {
  const [selectedTopics, setSelectedTopics] = useState([])
  const [mode, setMode] = useState('practice') // practice | timed | bookmarks
  const [count, setCount] = useState(20)

  const stats = useMemo(() => {
    const attempted = Object.keys(progress.attempts).length
    const correct = Object.entries(progress.attempts).filter(([id, arr]) => {
      const last = arr[arr.length - 1]
      return last && last.correct
    }).length
    const topicStats = TOPICS.map(t => {
      const qs = QUESTIONS.filter(q => q.topic.id === t.id)
      const done = qs.filter(q => progress.attempts[q.id]?.length > 0)
      const corr = done.filter(q => {
        const last = progress.attempts[q.id]
        return last && last[last.length - 1].correct
      })
      return { ...t, total: qs.length, done: done.length, correct: corr.length }
    })
    return { attempted, correct, total: QUESTIONS.length, topicStats, bookmarks: (progress.bookmarks || []).length }
  }, [progress, QUESTIONS, TOPICS])

  const toggleTopic = (id) => {
    setSelectedTopics(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  const handleStart = () => {
    let pool = QUESTIONS
    if (mode === 'bookmarks') {
      const bm = new Set(progress.bookmarks || [])
      pool = QUESTIONS.filter(q => bm.has(q.id))
      if (!pool.length) return alert('No bookmarked questions yet!')
    } else if (selectedTopics.length > 0) {
      pool = QUESTIONS.filter(q => selectedTopics.includes(q.topic.id))
    }

    // Shuffle
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(count, shuffled.length))

    startExam({
      questions: selected,
      mode,
      timed: mode === 'timed',
      timeLimit: Math.min(count, selected.length) * 90, // 90 sec per question
    })
  }

  const pct = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0

  return (
    <div className="home">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-inner">
          <div className="home-logo">
            <span className="logo-icon">◈</span>
            <div>
              <h1>QA Practice Portal</h1>
              <p>Quantitative Aptitude · 484 Questions</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-ghost" onClick={() => setScreen('stats')}>
              <span>📈</span> Stats
            </button>
            <button className="btn btn-ghost small" onClick={resetProgress} title="Reset progress">
              ↺
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        {/* Overview cards */}
        <section className="overview-strip">
          <div className="ov-card">
            <div className="ov-num">{stats.attempted}</div>
            <div className="ov-label">Attempted</div>
          </div>
          <div className="ov-card accent">
            <div className="ov-num">{stats.correct}</div>
            <div className="ov-label">Correct</div>
          </div>
          <div className="ov-card">
            <div className="ov-num">{pct}%</div>
            <div className="ov-label">Accuracy</div>
          </div>
          <div className="ov-card">
            <div className="ov-num">{stats.bookmarks}</div>
            <div className="ov-label">Bookmarks</div>
          </div>
          <div className="ov-card dim">
            <div className="ov-num">{stats.total - stats.attempted}</div>
            <div className="ov-label">Remaining</div>
          </div>
        </section>

        <div className="home-content">
          {/* Left: Config */}
          <section className="config-panel card animate-fadeIn">
            <h2 className="panel-title">Start Practice</h2>

            {/* Mode selector */}
            <div className="field">
              <label>Mode</label>
              <div className="mode-grid">
                {[
                  { id: 'practice', label: 'Practice', desc: 'No timer, see answers', icon: '📖' },
                  { id: 'timed',    label: 'Timed',    desc: '90s per question',      icon: '⏱' },
                  { id: 'bookmarks',label: 'Bookmarks',desc: 'Saved questions only',  icon: '🔖' },
                ].map(m => (
                  <button key={m.id} className={`mode-btn ${mode === m.id ? 'active' : ''}`}
                    onClick={() => setMode(m.id)}>
                    <span className="mode-icon">{m.icon}</span>
                    <span className="mode-label">{m.label}</span>
                    <span className="mode-desc">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question count */}
            {mode !== 'bookmarks' && (
              <div className="field">
                <label>Questions: <strong>{count}</strong></label>
                <input type="range" min="5" max="100" step="5" value={count}
                  onChange={e => setCount(+e.target.value)} className="slider" />
                <div className="slider-labels"><span>5</span><span>50</span><span>100</span></div>
              </div>
            )}

            {/* Topics filter */}
            {mode !== 'bookmarks' && (
              <div className="field">
                <label>Topics <span className="label-hint">(all if none selected)</span></label>
                <div className="topic-filter">
                  {TOPICS.map(t => {
                    const ts = stats.topicStats.find(s => s.id === t.id)
                    const sel = selectedTopics.includes(t.id)
                    return (
                      <button key={t.id}
                        className={`topic-chip ${sel ? 'selected' : ''}`}
                        style={{ '--tc': t.color }}
                        onClick={() => toggleTopic(t.id)}>
                        <span className="chip-icon">{t.icon}</span>
                        <span>{t.name}</span>
                        <span className="chip-count">{ts?.done}/{ts?.total}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <button className="btn btn-primary start-btn" onClick={handleStart}>
              Start Session →
            </button>
          </section>

          {/* Right: Topic progress */}
          <section className="progress-panel">
            <h2 className="panel-title">Topic Progress</h2>
            <div className="topic-progress-list">
              {stats.topicStats.map(t => {
                const pct = t.total > 0 ? Math.round((t.done / t.total) * 100) : 0
                const acc = t.done > 0 ? Math.round((t.correct / t.done) * 100) : null
                return (
                  <div key={t.id} className="tp-row card animate-fadeIn">
                    <div className="tp-top">
                      <div className="tp-name">
                        <span className="tp-icon" style={{ color: t.color }}>{t.icon}</span>
                        <span>{t.name}</span>
                      </div>
                      <div className="tp-meta">
                        {acc !== null && (
                          <span className="tp-acc" style={{ color: acc >= 70 ? 'var(--green)' : acc >= 40 ? 'var(--yellow)' : 'var(--red)' }}>
                            {acc}% acc
                          </span>
                        )}
                        <span className="tp-count">{t.done}/{t.total}</span>
                      </div>
                    </div>
                    <div className="tp-bar-track">
                      <div className="tp-bar-fill" style={{ width: `${pct}%`, background: t.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
