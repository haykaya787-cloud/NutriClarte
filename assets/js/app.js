function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

const toggle = document.querySelector('[data-theme-toggle]');
const root = document.documentElement;
let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

root.setAttribute('data-theme', theme);

const setIcon = () => {
  toggle.innerHTML = theme === 'dark'
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  toggle.setAttribute('aria-label', `Switch to theme ${theme === 'dark' ? 'light' : 'dark'} mode`);
};

setIcon();

toggle.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', theme);
  setIcon();
});

const form = document.getElementById('product-form');
const badges = document.getElementById('badges');
const conditionScores = document.getElementById('conditionScores');
const recs = document.getElementById('recommendations');
const overallScore = document.getElementById('overallScore');
const overallRing = document.getElementById('overallRing');
const resultTitle = document.getElementById('resultTitle');
const resultSummary = document.getElementById('resultSummary');
const cerealButton = document.getElementById('load-cereal');

const categoryAlternatives = {
  Soup: ['Low-sodium vegetable soup', 'No-salt-added lentil soup'],
  'Breakfast cereal': ['Unsweetened oat cereal', 'High-fiber bran cereal'],
  Yogurt: ['Plain Greek yogurt', 'Unsweetened skyr'],
  'Snack bar': ['Mixed nuts pack', 'Low-sugar protein bar'],
  Beverage: ['Sparkling water', 'Unsweetened iced tea'],
  'Frozen meal': ['Lower-sodium grain bowl', 'Vegetable-forward meal with beans']
};

function scoreDiabetes(data) {
  let score = 100;
  score -= Math.min(data.addedSugar * 4, 40);
  score -= Math.min(Math.max(data.carbs - 15, 0) * 1.2, 20);
  score += Math.min(data.fiber * 3, 12);
  if (data.category === 'Beverage' && data.addedSugar > 0) score -= 18;
  if (data.servingsPerPack > 1 && data.addedSugar * data.servingsPerPack > 15) score -= 10;
  return clamp(Math.round(score), 0, 100);
}

function scoreCholesterol(data) {
  let score = 100;
  score -= Math.min(data.satFat * 12, 42);
  score += Math.min(data.fiber * 4, 16);
  if (data.category === 'Frozen meal') score -= 8;
  return clamp(Math.round(score), 0, 100);
}

function scoreHypertension(data) {
  let score = 100;
  score -= Math.min(data.sodium / 12, 60);
  if (data.servingsPerPack > 1) score -= Math.min(data.sodium * data.servingsPerPack / 40, 15);
  if (data.category === 'Soup' || data.category === 'Frozen meal') score -= 8;
  return clamp(Math.round(score), 0, 100);
}

function band(score) {
  if (score >= 80) return ['Great fit', 'good', 'var(--color-success)'];
  if (score >= 60) return ['Use sometimes', 'warn', 'var(--color-warning)'];
  return ['Limit', 'alert', 'var(--color-error)'];
}

function card(title, body, extraClass = '') {
  return `<article class="card"><h3>${title}</h3><p class="${extraClass}">${body}</p></article>`;
}

function render() {
  const fd = new FormData(form);
  const selected = [...form.querySelectorAll('input[name="profile"]:checked')].map(el => el.value);
  const data = {
    productName: fd.get('productName'),
    category: fd.get('category'),
    serving: fd.get('serving'),
    servingsPerPack: Number(fd.get('servingsPerPack')),
    sodium: Number(fd.get('sodium')),
    addedSugar: Number(fd.get('addedSugar')),
    satFat: Number(fd.get('satFat')),
    fiber: Number(fd.get('fiber')),
    carbs: Number(fd.get('carbs')),
    calories: Number(fd.get('calories'))
  };

  const scores = {
    diabetes: scoreDiabetes(data),
    cholesterol: scoreCholesterol(data),
    hypertension: scoreHypertension(data)
  };

  const activeScores = selected.length ? selected.map(k => scores[k]) : Object.values(scores);
  const overall = Math.round(activeScores.reduce((a, b) => a + b, 0) / activeScores.length);
  const [title, tone, ring] = band(overall);

  overallScore.textContent = overall;
  overallRing.style.setProperty('--score', overall);
  overallRing.style.setProperty('--ring-color', ring);
  resultTitle.textContent = `${title}`;
  
  const notes = [];
  if (scores.hypertension < 60) notes.push('Sodium is the main concern.');
  if (scores.diabetes < 60) notes.push('Added sugar and carbohydrate load are high.');
  if (scores.cholesterol < 60) notes.push('Saturated fat is too high for frequent use.');
  if (!notes.length) notes.push('This product fits the selected profile reasonably well.');
  resultSummary.textContent = notes[0];

  badges.innerHTML = [
    ['Sodium', data.sodium > 400 ? 'alert' : 'good'],
    ['Added sugar', data.addedSugar > 10 ? 'alert' : data.addedSugar > 5 ? 'warn' : 'good'],
    ['Sat fat', data.satFat > 2 ? 'warn' : 'good']
  ].map(([label, cls]) => `<span class="badge ${cls}">${label}</span>`).join('');

  conditionScores.innerHTML = '';
  const labels = { diabetes: 'Diabetes', cholesterol: 'Cholesterol', hypertension: 'Blood pressure' };
  Object.entries(scores).forEach(([key, val]) => {
    const [t] = band(val);
    conditionScores.insertAdjacentHTML('beforeend', card(labels[key], `<strong>${val}/100</strong> ${t}`));
  });

  const alternatives = categoryAlternatives[data.category] || ['Healthier same-category option'];
  const dynamicRecs = [];
  if (data.sodium > 400) dynamicRecs.push(card('Reduce sodium exposure', 'Choose versions closer to 230 mg sodium per serving, and watch multi-serving packages.'));
  if (data.addedSugar > 10) dynamicRecs.push(card('Reduce sugar spikes', 'Swap toward products with 5 g or less added sugar and more fiber per serving.'));
  if (data.satFat > 2) dynamicRecs.push(card('Protect heart health', 'Prefer products with 1 to 2 g saturated fat or less, especially for everyday foods.'));
  if (data.fiber < 3) dynamicRecs.push(card('Improve satiety', 'Look for higher-fiber alternatives to slow absorption and support cholesterol management.'));
  dynamicRecs.push(card('Suggested alternatives', alternatives.join(', ')));

  recs.innerHTML = dynamicRecs.slice(0, 4).join('');
}

form.addEventListener('submit', e => { e.preventDefault(); render(); });

cerealButton.addEventListener('click', () => {
  document.getElementById('productName').value = 'Chocolate cereal';
  document.getElementById('category').value = 'Breakfast cereal';
  document.getElementById('serving').value = '40 g';
  document.getElementById('servingsPerPack').value = 7;
  document.getElementById('sodium').value = 280;
  document.getElementById('addedSugar').value = 12;
  document.getElementById('satFat').value = 0.5;
  document.getElementById('fiber').value = 2;
  document.getElementById('carbs').value = 31;
  document.getElementById('calories').value = 160;
  render();
});

render();
