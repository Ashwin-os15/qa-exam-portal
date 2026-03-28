export const config = { runtime: 'edge' }

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { question } = body

    const opts = Object.entries(question.options || {})
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => `${k.toUpperCase()}) ${v}`)
      .join('\n')

    const prompt = `You are a concise math tutor. Explain how to solve this MCQ in 3-5 short lines. Be direct, use simple language, and show the key calculation step.

Question: ${question.question}
${opts ? `Options:\n${opts}\n` : ''}Correct Answer: ${question.answer.toUpperCase()}${opts ? ` - ${question.options[question.answer] || ''}` : ''}

Give only the explanation. No preamble, no "The answer is..." at the end.`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: err }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const data = await res.json()
    const text = data.content?.[0]?.text?.trim() || 'No explanation available.'

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}
