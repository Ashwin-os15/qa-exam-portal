import React, { useState, useEffect, useCallback, useMemo } from 'react'
import rawQuestions from './questions.json'
import { TOPICS, getTopicForQuestion, loadProgress, saveProgress } from './config.js'
import HomeScreen from './screens/HomeScreen.jsx'
import ExamScreen from './screens/ExamScreen.jsx'
import ReviewScreen from './screens/ReviewScreen.jsx'
import StatsScreen from './screens/StatsScreen.jsx'

// Enrich questions with topic info
const QUESTIONS = rawQuestions.map(q => ({
  ...q,
  topic: getTopicForQuestion(q.id)
}))

export default function App() {
  const [screen, setScreen] = useState('home') // home | exam | review | stats
  const [examConfig, setExamConfig] = useState(null)
  const [examResult, setExamResult] = useState(null)
  const [progress, setProgress] = useState(loadProgress)

  // Persist progress
  useEffect(() => { saveProgress(progress) }, [progress])

  const startExam = useCallback((config) => {
    setExamConfig(config)
    setExamResult(null)
    setScreen('exam')
  }, [])

  const finishExam = useCallback((result) => {
    setExamResult(result)
    // Save attempts
    setProgress(prev => {
      const newAttempts = { ...prev.attempts }
      result.answers.forEach(ans => {
        if (!newAttempts[ans.id]) newAttempts[ans.id] = []
        newAttempts[ans.id] = [...(newAttempts[ans.id] || []), {
          selected: ans.selected,
          correct: ans.correct,
          ts: Date.now()
        }].slice(-5) // keep last 5 attempts
      })
      return { ...prev, attempts: newAttempts }
    })
    setScreen('review')
  }, [])

  const toggleBookmark = useCallback((id) => {
    setProgress(prev => {
      const bm = prev.bookmarks || []
      const has = bm.includes(id)
      return { ...prev, bookmarks: has ? bm.filter(b => b !== id) : [...bm, id] }
    })
  }, [])

  const resetProgress = useCallback(() => {
    if (window.confirm('Reset ALL progress? This cannot be undone.')) {
      const fresh = { attempts: {}, bookmarks: [] }
      setProgress(fresh)
      saveProgress(fresh)
    }
  }, [])

  const ctx = { QUESTIONS, TOPICS, progress, startExam, finishExam, toggleBookmark, resetProgress, setScreen }

  return (
    <div style={{ minHeight: '100vh' }}>
      {screen === 'home'   && <HomeScreen   {...ctx} />}
      {screen === 'exam'   && <ExamScreen   {...ctx} config={examConfig} />}
      {screen === 'review' && <ReviewScreen {...ctx} result={examResult} />}
      {screen === 'stats'  && <StatsScreen  {...ctx} />}

      {/* Watermark — always visible */}
      <div style={{
        position: 'fixed', bottom: 16, right: 20,
        fontSize: '0.78rem', fontFamily: 'var(--font-mono)',
        color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.06em', pointerEvents: 'none',
        userSelect: 'none', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(0,0,0,0.35)',
        padding: '4px 10px', borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(6px)',
      }}>
        <span style={{ color: '#7c6af7', fontSize: '0.8rem' }}>◈</span>
        Made by Ashwin
      </div>
    </div>
  )
}
