import React, { useMemo } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import './StatsScreen.css'

export default function StatsScreen({ QUESTIONS, TOPICS, progress, setScreen, resetProgress }) {
  const stats = useMemo(() => {
    const attempts = progress.attempts || {}
    const bookmarks = progress.bookmarks || []

    let totalAttempted = 0, totalCorrect = 0

    const topicStats = TOPICS.map(t => {
      const qs = QUESTIONS.filter(q => q.topic.id === t.id)
      let attempted = 0, correct = 0, totalAtt = 0
      qs.forEach(q => {
        const att = attempts[q.id] || []
        if (att.length > 0) { attempted++ }
        const lastCorrect = att.length > 0 && att[att.length - 1].correct
        if (lastCorrect) correct++
        totalAtt += att.length
      })
      totalAttempted += attempted
      totalCorrect += correct
      return {
        ...t, total: qs.length, attempted, correct,
        accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
        completion: Math.round((attempted / qs.length) * 100)
      }
    })

    // Weekly streak - count distinct days with attempts
    const days = new Set()
    Object.values(attempts).forEach(arr => {
      arr.forEach(a => {
        const d = new Date(a.ts).toDateString()
        days.add(d)
      })
    })

    const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0
    return { topicStats, totalAttempted, totalCorrect, overallAccuracy, bookmarks: bookmarks.length, days: days.size }
  }, [progress, QUESTIONS, TOPICS])

  const chartData = stats.topicStats.map(t => ({
    name: t.id, label: t.name.substring(0,12) + '…',
    accuracy: t.accuracy, completion: t.completion, color: t.color,
    correct: t.correct, total: t.total
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ color: 'var(--text)', fontSize: '0.82rem', fontWeight: 600 }}>{d.label}</div>
        <div style={{ color: 'var(--green)', fontSize: '0.78rem' }}>Accuracy: {d.accuracy}%</div>
        <div style={{ color: 'var(--text2)', fontSize: '0.78rem' }}>Done: {d.correct}/{d.total}</div>
      </div>
    )
  }

  return (
    <div className="stats-wrap">
      <header className="stats-header">
        <button className="btn btn-ghost" onClick={() => setScreen('home')}>← Home</button>
        <h2 className="stats-title">Performance Stats</h2>
        <button className="btn btn-danger small" onClick={resetProgress}>Reset</button>
      </header>

      <div className="stats-body">
        {/* Overview pills */}
        <div className="stats-overview animate-fadeIn">
          {[
            { label: 'Attempted', val: stats.totalAttempted, sub: `/ ${QUESTIONS.length}` },
            { label: 'Correct', val: stats.totalCorrect, color: 'var(--green)' },
            { label: 'Accuracy', val: `${stats.overallAccuracy}%`, color: stats.overallAccuracy >= 70 ? 'var(--green)' : stats.overallAccuracy >= 40 ? 'var(--yellow)' : 'var(--red)' },
            { label: 'Bookmarks', val: stats.bookmarks },
            { label: 'Active Days', val: stats.days },
          ].map(s => (
            <div key={s.label} className="stat-pill card">
              <span className="sp-val" style={{ color: s.color || 'var(--text)' }}>{s.val}<span className="sp-sub">{s.sub || ''}</span></span>
              <span className="sp-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="charts-row">
          <div className="chart-card card animate-fadeIn">
            <h3 className="chart-title">Accuracy by Topic</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 40, left: 0 }}>
                <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} domain={[0, 100]} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accuracy" radius={[4,4,0,0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card card animate-fadeIn">
            <h3 className="chart-title">Completion by Topic</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 40, left: 0 }}>
                <XAxis dataKey="label" tick={{ fill: 'var(--text3)', fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 10 }} domain={[0, 100]} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completion" radius={[4,4,0,0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} opacity={0.7} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic details table */}
        <div className="topic-table card animate-fadeIn">
          <h3 className="chart-title">Topic Breakdown</h3>
          <div className="table-wrap">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Done</th>
                  <th>Correct</th>
                  <th>Accuracy</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {stats.topicStats.map(t => (
                  <tr key={t.id}>
                    <td>
                      <span style={{ color: t.color, marginRight: 6 }}>{t.icon}</span>
                      <span className="topic-name-cell">{t.name}</span>
                    </td>
                    <td className="mono">{t.attempted}/{t.total}</td>
                    <td className="mono" style={{ color: t.correct > 0 ? 'var(--green)' : 'var(--text3)' }}>{t.correct}</td>
                    <td>
                      <span className="acc-chip"
                        style={{ color: t.accuracy >= 70 ? 'var(--green)' : t.accuracy >= 40 ? 'var(--yellow)' : t.accuracy === 0 ? 'var(--text3)' : 'var(--red)' }}>
                        {t.attempted > 0 ? `${t.accuracy}%` : '—'}
                      </span>
                    </td>
                    <td>
                      <div className="mini-bar-track">
                        <div className="mini-bar-fill" style={{ width: `${t.completion}%`, background: t.color }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
