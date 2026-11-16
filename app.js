const habitList = document.querySelector('#habitList');
const storageKey = 'daylight-habits-v1';
let rows = [...habitList.querySelectorAll('.habit-row')];
const count = document.querySelector('#progressCount');
const percent = document.querySelector('#progressPercent');
const ring = document.querySelector('#progressRing');
const navCount = document.querySelector('#navCount');
const encouragement = document.querySelector('#encouragement');
const habitTotal = document.querySelector('#habitTotal');
const progressTotal = document.querySelector('#progressTotal');
const toast = document.querySelector('#toast');
let toastTimer;

function updateProgress() {
  const done = rows.filter(row => row.classList.contains('completed')).length;
  const rate = rows.length ? Math.round(done / rows.length * 100) : 0;
  habitTotal.textContent = rows.length;
  progressTotal.textContent = rows.length;
  count.textContent = done;
  percent.textContent = `${rate}%`;
  ring.style.setProperty('--progress', `${rate}%`);
  ring.setAttribute('aria-label', `${rate} percent complete`);
  navCount.textContent = Math.max(0, rows.length - done);
  if (done === rows.length) {
    encouragement.innerHTML = '<span class="encouragement-mark">✦</span><span>You did it! <strong>All of today’s habits are complete.</strong></span><span class="encouragement-flower">✿</span>';
  } else if (done >= 3) {
    encouragement.innerHTML = '<span class="encouragement-mark">✦</span><span>You’re off to a lovely start. <strong>Keep your gentle rhythm going.</strong></span><span class="encouragement-flower">✿</span>';
  } else {
    encouragement.innerHTML = '<span class="encouragement-mark">✦</span><span>Every small step counts. <strong>Choose one thing to begin.</strong></span><span class="encouragement-flower">✿</span>';
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1900);
}

function saveHabits() {
  const habits = rows.map(row => ({
    name: row.querySelector('.habit-copy strong').textContent,
    description: row.querySelector('.habit-copy span').textContent,
    completed: row.classList.contains('completed')
  }));
  try { localStorage.setItem(storageKey, JSON.stringify(habits)); }
  catch { showToast('Could not save changes in this browser'); }
}

function attachHabitEvents(row) {
  const button = row.querySelector('.check-button');
  button.addEventListener('click', () => {
    const complete = row.classList.toggle('completed');
    button.setAttribute('aria-pressed', String(complete));
    const name = row.querySelector('.habit-copy strong').textContent;
    button.setAttribute('aria-label', `Mark ${name} ${complete ? 'incomplete' : 'complete'}`);
    saveHabits();
    updateProgress();
    showToast(complete ? 'A little win for today ✦' : 'Habit unchecked');
  });
}

function makeHabit(name, description) {
  const row = document.createElement('article');
  row.className = 'habit-row';
  const check = document.createElement('button');
  check.className = 'check-button'; check.type = 'button'; check.setAttribute('aria-pressed', 'false');
  check.setAttribute('aria-label', `Mark ${name} complete`);
  const checkmark = document.createElement('span'); checkmark.textContent = '✓'; check.append(checkmark);
  const emoji = document.createElement('div'); emoji.className = 'habit-emoji'; emoji.textContent = '✦'; emoji.setAttribute('aria-hidden', 'true');
  const copy = document.createElement('div'); copy.className = 'habit-copy';
  const title = document.createElement('strong'); title.textContent = name;
  const note = document.createElement('span'); note.textContent = description || 'A small step, just for you';
  copy.append(title, note);
  const streak = document.createElement('span'); streak.className = 'habit-streak muted-streak'; streak.textContent = '✦ Start today';
  const menu = document.createElement('button'); menu.className = 'row-menu'; menu.type = 'button'; menu.setAttribute('aria-label', `More options for ${name}`); menu.textContent = '···';
  row.append(check, emoji, copy, streak, menu);
  attachHabitEvents(row);
  menu.addEventListener('click', () => showToast('Habit options are coming soon.'));
  return row;
}

function loadHabits() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!Array.isArray(saved)) return;
    habitList.replaceChildren();
    saved.forEach(habit => {
      if (!habit || typeof habit.name !== 'string') return;
      const row = makeHabit(habit.name, typeof habit.description === 'string' ? habit.description : '');
      if (habit.completed) {
        row.classList.add('completed');
        row.querySelector('.check-button').setAttribute('aria-pressed', 'true');
        row.querySelector('.check-button').setAttribute('aria-label', `Mark ${habit.name} incomplete`);
      }
      habitList.append(row);
    });
    rows = [...habitList.querySelectorAll('.habit-row')];
  } catch { /* Keep the sample habits if browser storage is unavailable. */ }
}

rows.forEach(attachHabitEvents);
loadHabits();

const habitForm = document.querySelector('#habitForm');
const habitName = document.querySelector('#habitName');
document.querySelector('#addHabitButton').addEventListener('click', () => {
  habitForm.hidden = !habitForm.hidden;
  if (!habitForm.hidden) habitName.focus();
});
document.querySelector('#cancelHabitButton').addEventListener('click', () => {
  habitForm.reset(); habitForm.hidden = true;
});
habitForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = habitName.value.trim();
  if (!name) { habitName.focus(); return; }
  const description = document.querySelector('#habitDescription').value.trim();
  const row = makeHabit(name, description);
  habitList.append(row);
  rows = [...habitList.querySelectorAll('.habit-row')];
  saveHabits(); updateProgress();
  habitForm.reset(); habitForm.hidden = true;
  showToast('Your new habit is ready ✦');
});

document.querySelectorAll('.row-menu').forEach(button => {
  button.addEventListener('click', () => showToast('Habit options are coming soon.'));
});

const today = new Date();
document.querySelector('#dateLabel').textContent = new Intl.DateTimeFormat('en', {
  weekday: 'long', month: 'long', day: 'numeric'
}).format(today).toUpperCase();
updateProgress();

