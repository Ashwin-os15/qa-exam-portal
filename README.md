# QA Exam Portal 📚

A sleek, dark-themed MCQ practice portal for Quantitative Aptitude — 484 questions across 10 topics.

## Features

- **3 modes**: Practice (no timer), Timed (90s/question), Bookmarks
- **Topic filter**: Pick specific topics or mix all
- **Question navigator**: Sidebar with color-coded status
- **Keyboard shortcuts**: 1–4 / A–D to answer, ←→ to navigate, F to flag
- **Wrong answer review**: Expand each question to see all options + correct answer
- **Retry wrong**: One click to re-practice only your wrong answers
- **Bookmarks**: Save questions for later
- **Stats**: Per-topic accuracy & completion charts
- **Progress persistence**: Saved in browser localStorage

## Topics (484 questions)

| # | Topic | Questions |
|---|-------|-----------|
| 1 | Number System & Percentages | Q1–50 |
| 2 | Profit, Loss & Partnership | Q51–100 |
| 3 | Ratio, Mixture & Alligation | Q101–150 |
| 4 | Work, Time & Wages | Q151–200 |
| 5 | Speed, Distance & Time | Q201–250 |
| 6 | Clocks & Calendars | Q251–300 |
| 7 | Calendars & Data Interpretation | Q301–350 |
| 8 | Permutation & Combination | Q351–400 |
| 9 | Statistics & Probability | Q401–450 |
| 10 | Ages & Miscellaneous | Q451–484 |

---

## 🚀 Setup & Deploy

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
# → Open http://localhost:5173
```

### Deploy to Vercel (free, shareable link)

**Option A — Via GitHub (recommended)**

1. Push this folder to a new GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Vite — just click **Deploy**
4. Share the link with friends! 🎉

**Option B — Via Vercel CLI**

```bash
npm install -g vercel
vercel
# Follow prompts — framework: Vite
```

### Build for production

```bash
npm run build
# Output in /dist — ready to deploy anywhere
```

---

## Adding More Questions

To add more MCQ banks in the future:
1. Upload the new `.docx` file
2. Parse it into the same JSON format as `src/questions.json`
3. Each entry: `{ "id": N, "question": "...", "options": { "a":"","b":"","c":"","d":"" }, "answer": "a" }`
4. Append to the array and update topic ranges in `src/config.js`
