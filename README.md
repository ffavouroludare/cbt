# 🧠 Asake 1.0

### Personal Hygiene & Dental Education Interactive Quiz

---

## 📋 Overview

**Asake 1.0** is a lightweight, browser-based learning app designed to teach and assess understanding of personal hygiene and dental education.
It runs fully offline, requires no server, and works seamlessly on desktop and mobile.

---

## 🚀 Quick Start

1. **Download / Clone** this repository or extract `Asake_1.0.zip`.
2. Open `index.html` in any modern browser.
3. Enter a name, start the quiz, and complete all sections.
4. View results and continue to the interactive drag-and-drop activities.

> 🪶 Tip: You can host the folder directly on **GitHub Pages**.
> Simply push the contents to a new repo and enable Pages → “main branch / root”.

---

## 🧩 File Structure

| File              | Purpose                                              |
| :---------------- | :--------------------------------------------------- |
| `index.html`      | Main interface linking all sections                  |
| `style.css`       | Modern responsive styling (mobile-first)             |
| `quiz.js`         | Quiz logic, spaced repetition, drag-drop, scoreboard |
| `questions.json`  | Question bank (70 items with topics & explanations)  |
| `scoreboard.json` | Editable local leaderboard                           |
| `README.md`       | Teacher & deployment guide                           |

---

## 🧑‍🏫 For Teachers

### Editing Questions

* Open `questions.json` in any text editor.
* Duplicate an existing block, give it a new `id`, and update the fields:

  ```json
  {
    "id": 71,
    "type": "mc",
    "question": "Example question?",
    "options": ["A", "B", "C", "D"],
    "correct": 1,
    "explanation": "Explanation of the correct answer.",
    "topic": "new topic"
  }
  ```
* Supported types:

  * `mc`    – Multiple Choice
  * `tf`    – True / False
  * `fill` – Short Answer

### Adjusting Spaced Repetition

Inside `quiz.js`, change:

```js
const SPACED_INTERVAL = 5;
```

Lower numbers = more frequent reinforcement.

### Customizing Activities

In `quiz.js`, edit `HAND_STEPS` and `BRUSH_STEPS` arrays to update or add new steps.

### Managing the Scoreboard

* Scores are saved automatically to the browser’s localStorage.
* Teachers can edit or add entries directly within the sidebar or in `scoreboard.json`.
* To reset all scores:

  1. Open the browser console.
  2. Run `localStorage.removeItem('asake_scores');`

---

## 🧠 Learning Features

✅ 70 document-based questions with explanations
✅ Spaced repetition for reinforcement
✅ Instant feedback and review mode
✅ Interactive handwashing & toothbrushing activities
✅ Editable local scoreboard
✅ Offline ready & mobile responsive

---

## 📱 Accessibility & Responsiveness

* Uses large touch-friendly buttons.
* Text reflows for small screens.
* Color contrast meets WCAG AA standards.

---

## 🧾 License

© 2025 Asake 1.0 – Educational Use Only.
Free to use and modify for non-commercial teaching purposes.
