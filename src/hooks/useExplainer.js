import { useState, useCallback } from 'react'

// Cache persists for the whole session in memory
const explanationCache = {}

export function useExplainer() {
  const [loading, setLoading] = useState({})
  const [explanations, setExplanations] = useState({})
  const [errors, setErrors] = useState({})

  const explain = useCallback(async (question) => {
    const id = question.id

    // Return cached result instantly
    if (explanationCache[id]) {
      setExplanations(prev => ({ ...prev, [id]: explanationCache[id] }))
      return
    }

    if (loading[id]) return

    setLoading(prev => ({ ...prev, [id]: true }))
    setErrors(prev => ({ ...prev, [id]: null }))

    try {
      // Call our own Vercel serverless function — no CORS issues, key stays secret
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })

      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const text = data.text || 'No explanation available.'
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
