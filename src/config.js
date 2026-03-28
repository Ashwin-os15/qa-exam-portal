export const TOPICS = [
  { id: 'numbers',      name: 'Number System & %',       full: 'Number System & Percentages',      range: [1,   50],  color: '#7c6af7', icon: '∑' },
  { id: 'commerce',     name: 'Profit, Loss & Partners', full: 'Profit, Loss & Partnership',        range: [51,  100], color: '#f59e0b', icon: '₹' },
  { id: 'ratio',        name: 'Ratio & Mixtures',        full: 'Ratio, Mixture & Alligation',       range: [101, 150], color: '#34d399', icon: '⚗' },
  { id: 'work',         name: 'Work, Time & Wages',      full: 'Work, Time & Wages',                range: [151, 200], color: '#f87171', icon: '⚙' },
  { id: 'speed',        name: 'Speed & Distance',        full: 'Speed, Distance & Time',            range: [201, 250], color: '#a78bfa', icon: '⚡' },
  { id: 'clocks',       name: 'Clocks & Calendars',      full: 'Clocks & Calendars',                range: [251, 300], color: '#38bdf8', icon: '◷' },
  { id: 'datainterpret',name: 'Calendars & Data',        full: 'Calendars & Data Interpretation',   range: [301, 350], color: '#fb923c', icon: '📊' },
  { id: 'permcomb',     name: 'Permutation & Combo',     full: 'Permutation & Combination',         range: [351, 400], color: '#f472b6', icon: 'nCr' },
  { id: 'stats',        name: 'Statistics & Probability',full: 'Statistics & Probability',          range: [401, 450], color: '#2dd4bf', icon: 'P(x)' },
  { id: 'ages',         name: 'Ages & Miscellaneous',    full: 'Ages & Miscellaneous',              range: [451, 484], color: '#c084fc', icon: '👤' },
]

export const getTopicForQuestion = (id) => {
  return TOPICS.find(t => id >= t.range[0] && id <= t.range[1]) || TOPICS[0]
}

export const STORAGE_KEY = 'qa_exam_portal_v2'

export const loadProgress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { attempts: {}, bookmarks: [] }
  } catch { return { attempts: {}, bookmarks: [] } }
}

export const saveProgress = (progress) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) } catch {}
}
