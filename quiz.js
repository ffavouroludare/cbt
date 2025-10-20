/* ==========================================================
Asake 1.0 – quiz.js (Part 1 of 2)
---------------------------------

Contains:
• Data loading (questions & scoreboard)
• State setup & spaced-repetition scheduling
• Question rendering & answer handling
--------------------------------------

Teacher Note:
– Adjust SPACED_INTERVAL below to control how often
missed questions are re-injected (default = 5).
– All local progress and scoreboard data is saved in
browser localStorage (no server required).
========================================================== */

const QUESTIONS_FILE = "questions.json";
const SCOREBOARD_FILE = "scoreboard.json";
const SPACED_INTERVAL = 5; // ← Teacher can change this value easily

let questions = [];
let scoreboard = [];
let state = {
username: "",
answered: 0,
correct: 0,
missed: [],
queue: [],
};

/* -------------------------
DOM Shortcuts
-------------------------- */
const intro = document.getElementById("intro");
const quizArea = document.getElementById("quizArea");
const reviewArea = document.getElementById("reviewArea");
const activities = document.getElementById("activities");
const sidebar = document.getElementById("sidebar");
const sidebarContent = document.querySelector(".sidebar-content");
const scoreDiv = document.getElementById("scoreboard");

/* ==========================================================
INITIALIZATION
========================================================== */
async function init() {
// Load question and scoreboard JSON files
const [qRes, sRes] = await Promise.all([
fetch(QUESTIONS_FILE),
fetch(SCOREBOARD_FILE),
]);
questions = await qRes.json();
scoreboard = await sRes.json();

// Restore local scoreboard edits if available
const localScores = localStorage.getItem("asake_scores");
if (localScores) scoreboard = JSON.parse(localScores);

renderScoreboard();
setupEventListeners();
}
document.addEventListener("DOMContentLoaded", init);

/* ==========================================================
EVENT LISTENERS
========================================================== */
function setupEventListeners() {
document
.getElementById("startBtn")
.addEventListener("click", startQuiz);

document
.getElementById("toggleSidebar")
.addEventListener("click", () =>
sidebarContent.classList.toggle("hidden")
);

document
.getElementById("addScore")
.addEventListener("click", addScoreEntry);
}

/* ==========================================================
QUIZ LOGIC
========================================================== */
function startQuiz() {
const name = document.getElementById("username").value.trim();
if (!name) {
alert("Please enter your name to start.");
return;
}
state.username = name;
intro.classList.add("hidden");
quizArea.classList.remove("hidden");

// Shuffle questions for variety
state.queue = shuffle([...questions]);
state.answered = 0;
state.correct = 0;
renderQuestion();
}

/* -------------------------
Render Question
-------------------------- */
function renderQuestion() {
if (state.queue.length === 0) return endQuiz();

const q = state.queue.shift();
const qBox = document.createElement("div");
qBox.className = "card";

// Question header
qBox.innerHTML = `<h3>${q.id}. ${q.question}</h3>     <p class="muted">Topic: ${q.topic}</p>`;

// Generate options by type
if (q.type === "mc") {
q.options.forEach((opt, i) => {
const btn = document.createElement("button");
btn.className = "btn";
btn.textContent = opt;
btn.onclick = () => checkAnswer(q, i, qBox);
qBox.appendChild(btn);
});
} else if (q.type === "tf") {
["True", "False"].forEach((val) => {
const btn = document.createElement("button");
btn.className = "btn";
btn.textContent = val;
btn.onclick = () =>
checkAnswer(q, val.toLowerCase() === "true", qBox);
qBox.appendChild(btn);
});
} else if (q.type === "fill") {
const input = document.createElement("input");
input.type = "text";
input.placeholder = "Type your answer";
const sub = document.createElement("button");
sub.className = "btn";
sub.textContent = "Submit";
sub.onclick = () => checkAnswer(q, input.value, qBox);
qBox.appendChild(input);
qBox.appendChild(sub);
}

quizArea.innerHTML = "";
quizArea.appendChild(qBox);
}

/* -------------------------
Check Answer and Feedback
-------------------------- */
function checkAnswer(q, answer, container) {
const fb = document.createElement("p");
fb.className = "feedback";

let correct = false;

if (q.type === "mc") {
correct = q.correct === answer;
} else if (q.type === "tf") {
correct = q.correct === answer;
} else if (q.type === "fill") {
const val = String(answer).trim().toLowerCase();
correct = q.correct.some((ans) => val === ans.toLowerCase());
}

if (correct) {
fb.textContent = "✅ Correct! " + q.explanation;
fb.classList.add("success");
state.correct++;
} else {
fb.textContent = "❌ Incorrect. " + q.explanation;
fb.classList.add("error");
// Push question back later in queue for spaced repetition
state.missed.push(q);
}

container.appendChild(fb);
state.answered++;

// Determine if we should re-inject a missed question
if (
state.answered % SPACED_INTERVAL === 0 &&
state.missed.length > 0
) {
const reinject = state.missed.shift();
state.queue.splice(1, 0, reinject);
}

// Delay next question for readability
setTimeout(renderQuestion, 1200);
}

/* -------------------------
Shuffle Utility
-------------------------- */
function shuffle(arr) {
for (let i = arr.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[arr[i], arr[j]] = [arr[j], arr[i]];
}
return arr;
}

/* -------------------------
End Quiz
-------------------------- */
function endQuiz() {
quizArea.classList.add("hidden");
reviewArea.classList.remove("hidden");

const score = Math.round(
(state.correct / questions.length) * 100
);

reviewArea.innerHTML = `     <h2>Quiz Complete!</h2>     <p>${state.username}, you scored ${state.correct} / ${questions.length} (${score}%)</p>     <button class="btn" onclick="showActivities()">Continue to Activities</button>
  `;

// Update scoreboard
scoreboard.push({
name: state.username,
score: score,
date: new Date().toLocaleDateString(),
});
localStorage.setItem("asake_scores", JSON.stringify(scoreboard));
renderScoreboard();
}

/* ==========================================================
Asake 1.0 – quiz.js (Part 2 of 2)
---------------------------------

Contains:
• Review / activity navigation
• Drag-and-drop interactive tasks
• Editable local scoreboard
---------------------------

Teacher Note:
– To modify drag-drop steps, edit the arrays in
HAND_STEPS and BRUSH_STEPS below.
– Steps appear in random order each time.
– Leaderboard edits are stored automatically in localStorage.
========================================================== */

/* ==========================================================
REVIEW & ACTIVITIES NAVIGATION
========================================================== */
function showActivities() {
reviewArea.classList.add("hidden");
activities.classList.remove("hidden");
initHandActivity();
initBrushActivity();
}

/* ==========================================================
DRAG & DROP ACTIVITY DATA
========================================================== */
const HAND_STEPS = [
"Wet your hands with clean running water.",
"Apply enough soap to cover all surfaces.",
"Rub hands together for at least 20 seconds.",
"Rinse thoroughly under clean water.",
"Dry hands with a clean towel."
];

const BRUSH_STEPS = [
"Apply fluoride toothpaste to a soft-bristled brush.",
"Angle bristles toward the gumline and brush gently in circles.",
"Brush outer, inner, and chewing surfaces of teeth.",
"Brush your tongue and rinse your mouth.",
"Rinse and store toothbrush properly."
];

/* ==========================================================
HAND WASHING ACTIVITY
========================================================== */
function initHandActivity() {
const itemsBox = document.getElementById("handItems");
const zonesBox = document.getElementById("handZones");
const feedback = document.getElementById("handFeedback");
itemsBox.innerHTML = "";
zonesBox.innerHTML = "";
feedback.textContent = "";

shuffle([...HAND_STEPS]).forEach((txt, i) => {
const div = document.createElement("div");
div.className = "drag-item";
div.draggable = true;
div.textContent = txt;
div.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", txt));
itemsBox.appendChild(div);
});

for (let i = 0; i < HAND_STEPS.length; i++) {
const dz = document.createElement("div");
dz.className = "drop-zone";
dz.textContent = (i + 1).toString();
dz.addEventListener("dragover", e => e.preventDefault());
dz.addEventListener("drop", e => {
e.preventDefault();
const data = e.dataTransfer.getData("text/plain");
if (!data) return;
dz.textContent = "";
const el = document.createElement("div");
el.className = "drag-item";
el.textContent = data;
dz.appendChild(el);
});
zonesBox.appendChild(dz);
}

document.getElementById("checkHand").onclick = () => {
const zones = zonesBox.querySelectorAll(".drop-zone");
let correct = 0;
zones.forEach((z, i) => {
const txt = z.textContent.trim();
if (txt === HAND_STEPS[i]) {
z.classList.add("correct");
correct++;
} else {
z.classList.add("incorrect");
}
});
feedback.textContent =
correct === HAND_STEPS.length
? "✅ Perfect handwashing order!"
: `You got ${correct}/${HAND_STEPS.length} steps correct.`;
feedback.className = correct === HAND_STEPS.length ? "feedback success" : "feedback error";
};
}

/* ==========================================================
TOOTHBRUSHING ACTIVITY
========================================================== */
function initBrushActivity() {
const itemsBox = document.getElementById("brushItems");
const zonesBox = document.getElementById("brushZones");
const feedback = document.getElementById("brushFeedback");
itemsBox.innerHTML = "";
zonesBox.innerHTML = "";
feedback.textContent = "";

shuffle([...BRUSH_STEPS]).forEach((txt) => {
const div = document.createElement("div");
div.className = "drag-item";
div.draggable = true;
div.textContent = txt;
div.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", txt));
itemsBox.appendChild(div);
});

for (let i = 0; i < BRUSH_STEPS.length; i++) {
const dz = document.createElement("div");
dz.className = "drop-zone";
dz.textContent = (i + 1).toString();
dz.addEventListener("dragover", e => e.preventDefault());
dz.addEventListener("drop", e => {
e.preventDefault();
const data = e.dataTransfer.getData("text/plain");
if (!data) return;
dz.textContent = "";
const el = document.createElement("div");
el.className = "drag-item";
el.textContent = data;
dz.appendChild(el);
});
zonesBox.appendChild(dz);
}

document.getElementById("checkBrush").onclick = () => {
const zones = zonesBox.querySelectorAll(".drop-zone");
let correct = 0;
zones.forEach((z, i) => {
const txt = z.textContent.trim();
if (txt === BRUSH_STEPS[i]) {
z.classList.add("correct");
correct++;
} else {
z.classList.add("incorrect");
}
});
feedback.textContent =
correct === BRUSH_STEPS.length
? "✅ Perfect brushing order!"
: `You got ${correct}/${BRUSH_STEPS.length} steps correct.`;
feedback.className = correct === BRUSH_STEPS.length ? "feedback success" : "feedback error";
};
}

/* ==========================================================
SCOREBOARD (LOCAL EDITABLE)
========================================================== */
function renderScoreboard() {
scoreDiv.innerHTML = "";
scoreboard.forEach((s, i) => {
const row = document.createElement("div");
const nameSpan = document.createElement("span");
const scoreSpan = document.createElement("span");
nameSpan.textContent = s.name;
scoreSpan.textContent = s.score + "%";
row.appendChild(nameSpan);
row.appendChild(scoreSpan);
row.onclick = () => editScore(i);
scoreDiv.appendChild(row);
});
}

/* Teacher Note:
– Teachers or students can click a scoreboard entry to edit.
– All changes persist locally until manually cleared via browser storage.
*/
function addScoreEntry() {
const name = prompt("Enter student name:");
if (!name) return;
const val = prompt("Enter score (0-100):");
const score = parseInt(val);
if (isNaN(score)) return;
scoreboard.push({ name, score, date: new Date().toLocaleDateString() });
localStorage.setItem("asake_scores", JSON.stringify(scoreboard));
renderScoreboard();
}

function editScore(index) {
const entry = scoreboard[index];
const newScore = prompt(
`Edit score for ${entry.name}:`,
entry.score
);
if (newScore === null) return;
entry.score = parseInt(newScore);
localStorage.setItem("asake_scores", JSON.stringify(scoreboard));
renderScoreboard();
}

/* ==========================================================
END OF FILE
========================================================== */
