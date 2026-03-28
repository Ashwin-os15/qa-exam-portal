import explanations from '../explanations.json'

export function useExplainer() {
  const explain = () => {} // no-op, explanations are pre-loaded

  const getExplanation = (questionId) => explanations[questionId] || null

  return { explain, getExplanation }
}
