// symptom-check.js — moved out of the page so the CSP can forbid inline script.
// Answers live in sessionStorage: cleared when the tab closes, never left on a shared device.
const STORAGE_KEY = 'wcnj_symptom_v1';

const questions = [
  { id: 1,  text: "Heart beating quickly or strongly",        group: "psychological" },
  { id: 2,  text: "Feeling tense or nervous",                  group: "psychological" },
  { id: 3,  text: "Difficulty sleeping",                       group: "psychological" },
  { id: 4,  text: "Feeling easily upset or excitable",         group: "psychological" },
  { id: 5,  text: "Attacks of anxiety or panic",               group: "psychological" },
  { id: 6,  text: "Difficulty concentrating",                  group: "psychological" },
  { id: 7,  text: "Feeling tired or lacking energy",           group: "psychological" },
  { id: 8,  text: "Loss of interest in most things",           group: "psychological" },
  { id: 9,  text: "Feeling unhappy or depressed",              group: "psychological" },
  { id: 10, text: "Crying spells",                             group: "psychological" },
  { id: 11, text: "Irritability",                              group: "psychological" },
  { id: 12, text: "Feeling dizzy or faint",                    group: "physical" },
  { id: 13, text: "Pressure or tightness in the head",         group: "physical" },
  { id: 14, text: "Parts of body feeling numb",                group: "physical" },
  { id: 15, text: "Headaches",                                 group: "physical" },
  { id: 16, text: "Muscle and joint pains",                    group: "physical" },
  { id: 17, text: "Loss of feeling in hands or feet",          group: "physical" },
  { id: 18, text: "Breathing difficulties",                    group: "physical" },
  { id: 19, text: "Hot flushes",                               group: "vasomotor" },
  { id: 20, text: "Sweating at night",                         group: "vasomotor" },
  { id: 21, text: "Loss of interest in sex",                   group: "sexual" }
];

const options = [
  { val: 0, label: "Not at all" },
  { val: 1, label: "A little" },
  { val: 2, label: "Quite a bit" },
  { val: 3, label: "Extremely" }
];

const groupLabels = {
  psychological: "Mood",
  physical: "Physical",
  vasomotor: "Vasomotor",
  sexual: "Sexual health"
};

const groupIntros = {
  psychological: {
    eyebrow: "Section 1 of 4",
    title: "How you've been feeling",
    desc: "11 quick questions about your mood, sleep, and energy.",
    icon: '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 12h.01M15 12h.01M9 16c1 1 2 1.5 3 1.5s2-.5 3-1.5M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>',
    bg: 'var(--rose_soft)',
    color: 'var(--rose)'
  },
  physical: {
    eyebrow: "Section 2 of 4",
    title: "Physical symptoms",
    desc: "7 questions about how your body feels.",
    icon: '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="5" r="2.5"/><path d="M9 22V12l-3 -3M15 22V12l3 -3M9 12h6"/></svg>',
    bg: 'var(--sage_soft)',
    color: 'var(--sage)'
  },
  vasomotor: {
    eyebrow: "Section 3 of 4 · Almost done!",
    title: "Hot flushes and sweats",
    desc: "Just 2 quick questions in this section.",
    icon: '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>',
    bg: '#fef3c7',
    color: 'var(--gold)'
  },
  sexual: {
    eyebrow: "Section 4 of 4 · Last one!",
    title: "Sexual health",
    desc: "One final question.",
    icon: '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
    bg: 'var(--peach)',
    color: 'var(--rose)'
  }
};

let state = {
  answers: {},
  currentIndex: 0,
  shownGroups: []
};

// Storage
function save() {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}
function load() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return null;
}
function clearStorage() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch(e) {}
}

// Screen control
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.classList.remove('entering');
  });
  const el = document.getElementById('screen_' + name);
  el.classList.add('active');
  el.classList.add('entering');
  document.getElementById('progressWrap').classList.toggle('show', name === 'question');
}

// Update progress
function updateProgress() {
  const idx = state.currentIndex;
  document.getElementById('progressFill').style.width = (idx / 21 * 100) + '%';
  document.getElementById('progressLabel').textContent = 'Question ' + idx + ' of 21';
  const remaining = 21 - idx;
  if (remaining <= 0) {
    document.getElementById('progressTime').textContent = 'Done!';
  } else {
    const secs = remaining * 8;
    document.getElementById('progressTime').textContent = secs < 60 ? 'almost done' : 'about ' + Math.ceil(secs / 60) + ' min left';
  }
}

// Render question
function renderQuestion() {
  const q = questions[state.currentIndex - 1];
  document.getElementById('qText').textContent = q.text;
  document.getElementById('qMeta').textContent = groupLabels[q.group] + ' · Item ' + q.id;

  const optsEl = document.getElementById('opts');
  const currentAnswer = state.answers[q.id];
  optsEl.innerHTML = options.map(o => `
    <button class="opt ${currentAnswer === o.val ? 'selected' : ''}" data-val="${o.val}">
      <span class="opt_label">${o.label}</span>
      <span class="opt_num">${o.val}</span>
    </button>
  `).join('');

  optsEl.querySelectorAll('.opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = parseInt(btn.dataset.val, 10);
      state.answers[q.id] = v;
      save();
      optsEl.querySelectorAll('.opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('nextBtn').disabled = false;
      // tiny haptic-feel: brief delay so user sees their choice
      setTimeout(goNext, 320);
    });
  });

  document.getElementById('nextBtn').disabled = currentAnswer === undefined;
  document.getElementById('backBtn').style.visibility = state.currentIndex > 1 ? 'visible' : 'hidden';
  updateProgress();
}

// Group intro
function showGroupIntro(group) {
  const g = groupIntros[group];
  document.getElementById('groupEyebrow').textContent = g.eyebrow;
  document.getElementById('groupTitle').textContent = g.title;
  document.getElementById('groupDesc').textContent = g.desc;
  const icon = document.getElementById('groupIcon');
  icon.innerHTML = g.icon;
  icon.style.background = g.bg;
  icon.style.color = g.color;
  showScreen('group');
  // smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigation
function goNext() {
  const nextIndex = state.currentIndex + 1;
  if (nextIndex > 21) {
    state.currentIndex = 22; // mark as completed
    save();
    showResults();
    return;
  }
  const nextQ = questions[nextIndex - 1];
  const prevQ = questions[state.currentIndex - 1];
  state.currentIndex = nextIndex;
  save();

  // entering a new group? show intro first
  if ((!prevQ || prevQ.group !== nextQ.group) && !state.shownGroups.includes(nextQ.group)) {
    state.shownGroups.push(nextQ.group);
    save();
    showGroupIntro(nextQ.group);
    return;
  }

  renderQuestion();
  showScreen('question');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
  if (state.currentIndex <= 1) return;
  state.currentIndex--;
  save();
  renderQuestion();
  showScreen('question');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Scoring
function calcScores() {
  const a = state.answers;
  const sum = ids => ids.reduce((t, id) => t + (a[id] || 0), 0);
  return {
    psychological: { score: sum([1,2,3,4,5,6,7,8,9,10,11]), max: 33, name: 'Mood, sleep & anxiety' },
    physical:      { score: sum([12,13,14,15,16,17,18]),     max: 21, name: 'Physical symptoms' },
    vasomotor:     { score: sum([19,20]),                    max: 6,  name: 'Hot flushes & sweats' },
    sexual:        { score: sum([21]),                       max: 3,  name: 'Sexual health' }
  };
}

function tierFor(key, s) {
  if (key === 'psychological') {
    if (s <= 7)  return ['mild', 'Mild', 'Your responses are in a typical range for mood, sleep, and anxiety.'];
    if (s <= 16) return ['mod', 'Moderate', "You may be carrying more anxiety, low mood, or sleep trouble than usual. This is common in perimenopause and is treatable."];
    return ['sig', 'Significant', 'Your responses point to considerable strain. A visit is a good idea.'];
  }
  if (key === 'physical') {
    if (s <= 5)  return ['mild', 'Mild', 'Few notable physical symptoms reported.'];
    if (s <= 12) return ['mod', 'Moderate', "You're reporting a noticeable cluster of physical symptoms. Some may be related to perimenopause."];
    return ['sig', 'Significant', 'Several bothersome physical symptoms. We recommend an evaluation.'];
  }
  if (key === 'vasomotor') {
    if (s <= 1) return ['mild', 'Minimal', 'Hot flushes and night sweats are not bothering you much right now.'];
    if (s <= 3) return ['mod', 'Moderate', 'Hot flushes or night sweats are bothersome. Effective treatments are available.'];
    return ['sig', 'Significant', 'Hot flushes and night sweats are affecting you noticeably. This is very treatable.'];
  }
  if (s === 0) return ['mild', 'Not reported', 'No change reported in sexual interest.'];
  if (s === 1) return ['mild', 'Mild', 'A small change. This is common and can have many causes.'];
  return ['mod', 'Notable', 'A meaningful change in sexual interest. Hormones, sleep, mood, and dryness can all play a role.'];
}

function checkUrgent() {
  const a = state.answers;
  const flags = [];
  if ((a[9] || 0) >= 2 || (a[10] || 0) >= 2) flags.push("low mood or crying spells");
  if ((a[5] || 0) >= 2) flags.push("anxiety or panic");
  const wrap = document.getElementById('urgentBlock');
  if (flags.length) {
    wrap.innerHTML = `<div class="urgent">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>
      <div><strong>If a symptom feels severe or sudden,</strong> please call us at <a href="tel:9737825577">(973) 782 5577</a>. For a medical emergency or thoughts of self harm, call 911 or 988.</div>
    </div>`;
  } else {
    wrap.innerHTML = '';
  }
}

function showResults() {
  const s = calcScores();
  const wrap = document.getElementById('subscales');
  wrap.innerHTML = Object.keys(s).map(k => {
    const v = s[k];
    const [t, tlabel, msg] = tierFor(k, v.score);
    return `
      <div class="res_card tier_${t}">
        <div class="res_card_head">
          <span class="res_card_name">${v.name}</span>
          <span class="res_card_tag">${tlabel}</span>
        </div>
        <div class="res_card_bar"><div class="res_card_fill" data-pct="${(v.score / v.max) * 100}"></div></div>
        <div class="res_card_score">Score ${v.score} of ${v.max}</div>
        <div class="res_card_msg">${msg}</div>
      </div>
    `;
  }).join('');

  // animate bars after render
  requestAnimationFrame(() => {
    wrap.querySelectorAll('.res_card_fill').forEach((fill, i) => {
      const pct = fill.dataset.pct;
      setTimeout(() => { fill.style.width = pct + '%'; }, i * 100);
    });
  });

  checkUrgent();
  document.getElementById('progressWrap').classList.remove('show');
  showScreen('results');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// Copy summary
function buildSummary() {
  const s = calcScores();
  const lines = ['Women\'s Care of NJ · Menopause Symptom Check'];
  lines.push('Date: ' + new Date().toLocaleDateString());
  lines.push('');
  Object.keys(s).forEach(k => {
    const v = s[k];
    const [, tlabel] = tierFor(k, v.score);
    lines.push(`${v.name}: ${v.score} of ${v.max} (${tlabel})`);
  });
  lines.push('');
  lines.push('Educational only. Greene Climacteric Scale.');
  return lines.join('\n');
}

// Handlers
document.getElementById('startBtn').addEventListener('click', () => {
  state = { answers: {}, currentIndex: 1, shownGroups: ['psychological'] };
  save();
  showGroupIntro('psychological');
});

document.getElementById('groupNextBtn').addEventListener('click', () => {
  renderQuestion();
  showScreen('question');
  window.scrollTo({ top: 0, behavior: 'instant' });
});

document.getElementById('nextBtn').addEventListener('click', goNext);
document.getElementById('backBtn').addEventListener('click', goBack);

document.getElementById('closeBtn').addEventListener('click', () => {
  // mid-questionnaire? confirm; otherwise close/navigate
  if (state.currentIndex >= 1 && state.currentIndex <= 21) {
    document.getElementById('exitSheet').classList.add('show');
  } else {
    exitToParent();
  }
});

// If we're inside the modal iframe, postMessage to parent to close it.
// Otherwise navigate to the home page.
function exitToParent() {
  if (window.parent && window.parent !== window) {
    try { window.parent.postMessage({ type: 'sym-close' }, location.origin); return; } catch (e) {}
  }
  window.location.href = 'index.html';
}

document.getElementById('exitCancel').addEventListener('click', () => {
  document.getElementById('exitSheet').classList.remove('show');
});
document.getElementById('exitConfirm').addEventListener('click', () => {
  save();
  exitToParent();
});
const discardBtn = document.getElementById('exitDiscard');
if (discardBtn) {
  discardBtn.addEventListener('click', () => {
    if (typeof clearStorage === 'function') clearStorage();
    state = { answers: {}, currentIndex: 0, shownGroups: [] };
    exitToParent();
  });
}

document.getElementById('restartBtn').addEventListener('click', () => {
  clearStorage();
  state = { answers: {}, currentIndex: 0, shownGroups: [] };
  document.getElementById('resumeBanner').classList.remove('show');
  showScreen('welcome');
  window.scrollTo({ top: 0, behavior: 'instant' });
});

document.getElementById('resumeBtn').addEventListener('click', () => {
  const saved = load();
  if (saved && saved.currentIndex >= 1 && saved.currentIndex <= 21) {
    state = saved;
    document.getElementById('resumeBanner').classList.remove('show');
    renderQuestion();
    showScreen('question');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
});

document.getElementById('copyBtn').addEventListener('click', async () => {
  const text = buildSummary();
  try {
    await navigator.clipboard.writeText(text);
    const lbl = document.getElementById('copyLabel');
    lbl.textContent = 'Copied!';
    setTimeout(() => { lbl.textContent = 'Copy summary'; }, 1800);
  } catch (e) {
    alert(text);
  }
});

// PDF download
function downloadPDF() {
  const lib = window.jspdf;
  if (!lib) {
    alert("PDF tool is still loading. Please try again in a second.");
    return;
  }
  const btn = document.getElementById('pdfBtn');
  const lbl = document.getElementById('pdfLabel');
  btn.disabled = true;
  const origText = lbl.textContent;
  lbl.textContent = 'Preparing PDF…';

  const { jsPDF } = lib;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 56;
  let y = margin;

  // Practice header bar
  doc.setFillColor(10, 23, 51);
  doc.rect(0, 0, pageW, 8, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(10, 23, 51);
  y = 60;
  doc.text("Women's Care OB/GYN of NJ", margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(110, 110, 120);
  y += 16;
  doc.text("Menopause Symptom Check Results", margin, y);

  // Right side: date + locations
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(10);
  doc.setTextColor(110, 110, 120);
  const dateW = doc.getTextWidth(dateStr);
  doc.text(dateStr, pageW - margin - dateW, 60);
  const phone = "(973) 782 5577";
  const phoneW = doc.getTextWidth(phone);
  doc.text(phone, pageW - margin - phoneW, 76);

  y += 28;

  // Patient name line
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 50);
  doc.text("Patient name:", margin, y);
  doc.setDrawColor(190, 190, 200);
  doc.line(margin + 78, y + 2, pageW - margin, y + 2);
  y += 24;

  // Divider
  doc.setDrawColor(220, 220, 230);
  doc.line(margin, y, pageW - margin, y);
  y += 24;

  // Summary heading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(10, 23, 51);
  doc.text("Summary by area", margin, y);
  y += 18;

  // Subscale results
  const scores = calcScores();
  Object.keys(scores).forEach(k => {
    const v = scores[k];
    const [t, tag, msg] = tierFor(k, v.score);

    // Title and score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(10, 23, 51);
    doc.text(v.name, margin, y);

    // Score on right
    const scoreText = `${v.score} / ${v.max}`;
    const sW = doc.getTextWidth(scoreText);
    doc.text(scoreText, pageW - margin - sW - 90, y);

    // Tier pill on right
    const pillX = pageW - margin - 80;
    const pillY = y - 10;
    let fill = [200, 200, 210];
    if (t === 'mild') fill = [209, 250, 229];
    if (t === 'mod') fill = [254, 243, 199];
    if (t === 'sig') fill = [254, 226, 226];
    doc.setFillColor(...fill);
    doc.roundedRect(pillX, pillY, 80, 16, 8, 8, 'F');
    doc.setFontSize(9);
    let textCol = [80, 80, 90];
    if (t === 'mild') textCol = [6, 95, 70];
    if (t === 'mod') textCol = [146, 64, 14];
    if (t === 'sig') textCol = [153, 27, 27];
    doc.setTextColor(...textCol);
    const tW = doc.getTextWidth(tag);
    doc.text(tag, pillX + 40 - tW / 2, y);

    y += 6;

    // Progress bar
    const barW = pageW - margin * 2 - 90;
    doc.setFillColor(238, 242, 247);
    doc.roundedRect(margin, y, barW, 6, 3, 3, 'F');
    const fillW = barW * (v.score / v.max);
    let barCol = [200, 200, 210];
    if (t === 'mild') barCol = [75, 138, 91];
    if (t === 'mod') barCol = [201, 168, 106];
    if (t === 'sig') barCol = [190, 66, 85];
    doc.setFillColor(...barCol);
    if (fillW > 0) doc.roundedRect(margin, y, fillW, 6, 3, 3, 'F');
    y += 16;

    // Message
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(70, 80, 95);
    const lines = doc.splitTextToSize(msg, pageW - margin * 2);
    lines.forEach(line => {
      doc.text(line, margin, y);
      y += 12;
    });
    y += 12;
  });

  // Individual answers section
  if (y > pageH - 200) {
    doc.addPage();
    y = margin;
  }

  doc.setDrawColor(220, 220, 230);
  doc.line(margin, y, pageW - margin, y);
  y += 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(10, 23, 51);
  doc.text("Individual responses", margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 50);

  questions.forEach(q => {
    const ans = state.answers[q.id];
    const ansLabel = ans !== undefined ? options[ans].label : 'Not answered';
    const line = `${q.id}.  ${q.text}`;
    const ansText = `${ansLabel} (${ans !== undefined ? ans : '-'})`;

    if (y > pageH - 60) {
      doc.addPage();
      y = margin;
    }

    doc.setTextColor(40, 40, 50);
    doc.text(line, margin, y);
    const aW = doc.getTextWidth(ansText);
    doc.setTextColor(10, 23, 51);
    doc.setFont('helvetica', 'bold');
    doc.text(ansText, pageW - margin - aW, y);
    doc.setFont('helvetica', 'normal');
    y += 14;
  });

  // Footer
  const footerY = pageH - 48;
  doc.setDrawColor(220, 220, 230);
  doc.line(margin, footerY - 18, pageW - margin, footerY - 18);
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 130);
  doc.text("Educational only. Based on the Greene Climacteric Scale (Greene J., 1976, Journal of Psychosomatic Research, 20, 425 to 430).", margin, footerY);
  doc.text("Bring this summary to your appointment. 825 Riverview Dr, Totowa NJ  |  (973) 782 5577", margin, footerY + 11);

  // Save
  const stamp = now.toISOString().slice(0, 10);
  doc.save(`womenscare-symptom-check-${stamp}.pdf`);

  setTimeout(() => {
    btn.disabled = false;
    lbl.textContent = origText;
  }, 800);
}

document.getElementById('pdfBtn').addEventListener('click', downloadPDF);

// On load
window.addEventListener('DOMContentLoaded', () => {
  const saved = load();
  if (saved && saved.currentIndex >= 1 && saved.currentIndex <= 21 && Object.keys(saved.answers || {}).length > 0) {
    document.getElementById('resumeBanner').classList.add('show');
    state = saved;
  }
});
(function(){if(document.getElementById('bg-fx'))return;var f=document.createElement('div');f.id='bg-fx';f.setAttribute('aria-hidden','true');f.innerHTML='<div class="fx-aurora fx-a1"></div><div class="fx-aurora fx-a2"></div><div class="fx-aurora fx-a3"></div>';document.body.insertBefore(f,document.body.firstChild);})();
