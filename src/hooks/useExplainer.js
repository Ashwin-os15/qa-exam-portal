import { useState, useCallback } from 'react'

// Cache persists for the whole session in memory
const explanationCache = {}

export function useExplainer() {
  const [loading, setLoading] = useState({})   // { [qId]: true/false }
  const [explanations, setExplanations] = useState({})
  const [errors, setErrors] = useState({})

  const explain = useCallback(async (question) => {
    const id = question.id

    // Already have it
    if (explanationCache[id]) {
      setExplanations(prev => ({ ...prev, [id]: explanationCache[id] }))
      return
    }

    // Already loading
    if (loading[id]) return

    setLoading(prev => ({ ...prev, [id]: true }))
    setErrors(prev => ({ ...prev, [id]: null }))

    const opts = Object.entries(question.options || {})
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => `${k.toUpperCase()}) ${v}`)
      .join('\n')

    const prompt = `You are a concise math tutor. Explain how to solve this MCQ in 3–5 short lines. Be direct, use simple language, and show the key calculation step.

Question: ${question.question}
${opts ? `Options:\n${opts}\n` : ''}Correct Answer: ${question.answer.toUpperCase()}${opts ? ` — ${question.options[question.answer] || ''}` : ''}

Give only the explanation. No preamble, no "The answer is..." at the end.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      const text = data.content?.[0]?.text?.trim() || 'No explanation available.'

      explanationCache[id] = text
      setExplanations(prev => ({ ...prev, [id]: text }))
    } catch (err) {
      setErrors(prev => ({ ...prev, [id]: 'Failed to load explanation. Try again.' }))
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }))
    }
  }, [loading])

  return { explain, explanations, loading, errors }
}
