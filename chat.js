/* Women's Care AI Care Assistant
   - Rule based, research grounded responses
   - No assumptions, no diagnoses
   - Always cites sources and links to site articles
   - Routes urgent concerns to phone
*/

(function () {
  'use strict';

  // ========== KNOWLEDGE BASE ==========
  // Each topic: keywords + factual response + sources + on-site link
  const KB = [
    {
      id: 'perimenopause',
      keywords: ['perimenopause', 'pre menopause', 'pre-menopause', 'transition'],
      answer: "Perimenopause is the natural transition before menopause. It can last 4 to 8 years on average, and usually begins in a woman's 40s. Hormone levels (oestrogen and progesterone) fluctuate, which causes the well known symptoms: irregular periods, hot flushes, night sweats, sleep changes, mood shifts, and brain fog.",
      source: "North American Menopause Society (NAMS), 2023",
      link: { url: "menopause.html", text: "Read about menopause and perimenopause care" },
      suggestCheck: true
    },
    {
      id: 'menopause',
      keywords: ['menopause', 'hot flush', 'hot flash', 'night sweat'],
      answer: "Menopause is officially diagnosed 12 months after a woman's final menstrual period. The average age in the United States is 51. Hot flushes and night sweats are the most common vasomotor symptoms and affect up to 80 percent of women during the transition. They are highly treatable.",
      source: "NAMS Position Statement, 2022 · ACOG Practice Bulletin",
      link: { url: "menopause.html", text: "Menopause care at our practice" },
      suggestCheck: true
    },
    {
      id: 'hrt',
      keywords: ['hrt', 'hormone replacement', 'hormone therapy', 'oestrogen', 'estrogen'],
      answer: "Hormone therapy is one of the most effective treatments for menopause symptoms. The NAMS 2022 position statement supports hormone therapy for women under 60 (or within 10 years of menopause) who are symptomatic and have no contraindications. The decision is always individualised based on your history.",
      source: "NAMS 2022 Hormone Therapy Position Statement",
      link: { url: "menopause.html", text: "Discuss hormone therapy with our team" }
    },
    {
      id: 'birth_control',
      keywords: ['birth control', 'contraception', 'pill', 'iud', 'implant', 'condom', 'patch', 'ring'],
      answer: "Birth control falls into five categories: hormonal methods (pill, patch, ring, shot), long acting reversible contraception (IUDs and implants), barrier methods (condoms, diaphragms), permanent methods, and emergency contraception. Used correctly, IUDs and implants are roughly 99 percent effective, hormonal pills are 91 percent effective, and condoms alone are about 80 percent effective.",
      source: "CDC Effectiveness of Contraceptive Methods, 2024",
      link: { url: "birth-control.html", text: "Explore birth control options" }
    },
    {
      id: 'family_planning',
      keywords: ['family planning', 'plan a family', 'plan family', 'fertility'],
      answer: "Family planning covers everything from preventing pregnancy to preparing for it. Our practice provides contraception counseling, fertility awareness, pregnancy testing, and counseling about timing. We focus on what fits your life and timeline.",
      source: "ACOG Committee Opinion on Reproductive Health",
      link: { url: "family-planning.html", text: "Family planning services" }
    },
    {
      id: 'endometriosis',
      keywords: ['endometriosis', 'endo', 'pelvic pain', 'painful period'],
      answer: "Endometriosis affects roughly 1 in 10 women of reproductive age. Tissue similar to the uterine lining grows outside the uterus. Symptoms include chronic pelvic pain (often worse during menstruation), pain during sex, heavy bleeding, and sometimes infertility. Many treatment options exist, from over the counter pain relief to hormonal therapy to surgery.",
      source: "ACOG Practice Bulletin No. 114 · WHO Fact Sheet on Endometriosis",
      link: { url: "endometriosis-pelvic-pain.html", text: "Endometriosis and pelvic pain care" }
    },
    {
      id: 'fibroids',
      keywords: ['fibroid', 'myoma', 'uterine tumor'],
      answer: "Up to 80 percent of women will develop uterine fibroids by age 50. Most fibroids are benign and do not cause symptoms. When symptoms occur, they can include pelvic pressure, heavy or longer periods, frequent urination, or pain during intercourse. Treatment depends on size, location, symptoms, and your reproductive goals.",
      source: "ACOG Practice Bulletin · NIH National Institute of Child Health and Human Development",
      link: { url: "fibroids.html", text: "Fibroid care options" }
    },
    {
      id: 'ultrasound',
      keywords: ['ultrasound', 'sonogram', 'pelvic ultrasound', 'imaging'],
      answer: "A pelvic ultrasound uses sound waves (no radiation) to image the uterus, ovaries, fallopian tubes, and bladder. It is the standard tool for evaluating pelvic pain, abnormal bleeding, fibroids, ovarian cysts, IUD position, and early pregnancy. We perform ultrasounds in our office.",
      source: "American Institute of Ultrasound in Medicine (AIUM) Guidelines",
      link: { url: "ultrasound.html", text: "Pelvic ultrasound at our office" }
    },
    {
      id: 'annual_exam',
      keywords: ['annual exam', 'well woman', 'check up', 'checkup', 'yearly'],
      answer: "An annual well woman exam typically includes a clinical breast exam, pelvic exam, cervical cancer screening (Pap test starting at age 21), discussion of menstrual and reproductive health, contraception, screening for sexually transmitted infections when relevant, and age appropriate health counseling. Mammograms generally start at age 40.",
      source: "ACOG Well Woman Recommendations · USPSTF Screening Guidelines",
      link: { url: "annual-well-woman-exam.html", text: "Annual exam information" }
    },
    {
      id: 'pap',
      keywords: ['pap', 'pap smear', 'cervical', 'hpv'],
      answer: "A Pap test screens for changes in cervical cells. ACOG recommends Pap testing every 3 years for women ages 21 to 29. From age 30 to 65, the option is a Pap every 3 years, an HPV test every 5 years, or both together every 5 years. Higher risk patients may need them more often.",
      source: "ACOG Practice Bulletin No. 168 (Cervical Cancer Screening)",
      link: { url: "annual-well-woman-exam.html", text: "Cervical screening at your annual" }
    },
    {
      id: 'colposcopy',
      keywords: ['colposcopy', 'abnormal pap'],
      answer: "Colposcopy is a procedure done in the office using a magnifying tool called a colposcope to examine the cervix more closely. It is recommended when a Pap test shows abnormal cells. The procedure is quick, and if needed, a small biopsy is taken to confirm whether changes are concerning.",
      source: "ASCCP Guidelines for Management of Abnormal Cervical Cancer Screening",
      link: { url: "colposcopy.html", text: "Colposcopy information" }
    },
    {
      id: 'leep',
      keywords: ['leep', 'loop electrosurgical'],
      answer: "LEEP (loop electrosurgical excision procedure) is an in office procedure that removes abnormal cells from the cervix using a thin electrified wire loop. Local anesthesia is used. The procedure itself takes only a few minutes. Recovery includes some cramping and discharge for a couple of weeks.",
      source: "ASCCP Treatment Guidelines for Cervical Intraepithelial Neoplasia",
      link: { url: "leep.html", text: "Learn about LEEP" }
    },
    {
      id: 'urinary',
      keywords: ['urinary', 'incontinence', 'leak', 'bladder', 'pee'],
      answer: "Urinary incontinence affects roughly 1 in 3 women at some point and is more common after pregnancy and menopause. The main types are stress incontinence (leakage with cough, sneeze, exercise), urge incontinence (sudden need to go), and mixed. Many cases improve significantly with lifestyle changes, pelvic floor therapy, or medication before surgery is needed.",
      source: "American Urogynecologic Society Position Statement · ACOG Practice Bulletin",
      link: { url: "urinary-problems.html", text: "Urinary problems care" }
    },
    {
      id: 'sexual_health',
      keywords: ['libido', 'sex drive', 'painful sex', 'dyspareunia', 'sexual health', 'orgasm'],
      answer: "Sexual concerns are common and treatable. Low libido, pain with sex (dyspareunia), and difficulty with orgasm can stem from hormonal changes, medications, relationship factors, pain conditions, or vaginal dryness. We start with a full medical history and exam to identify causes before recommending treatment.",
      source: "International Society for the Study of Women's Sexual Health · NAMS Position Statement",
      link: { url: "sexual-health.html", text: "Sexual health care" }
    },
    {
      id: 'std',
      keywords: ['std', 'sti', 'chlamydia', 'gonorrhea', 'herpes', 'hpv', 'hiv', 'syphilis'],
      answer: "Sexually transmitted infections can be caused by bacteria, viruses, parasites, or yeast. The CDC recommends annual chlamydia and gonorrhea screening for sexually active women under 25 and for older women with risk factors. HIV testing is recommended at least once between ages 13 and 64. Most STIs are treatable, and early detection matters.",
      source: "CDC STI Treatment Guidelines, 2021",
      link: { url: "std-treatment.html", text: "STI testing and treatment" }
    },
    {
      id: 'adolescent',
      keywords: ['teen', 'adolescent', 'first visit', 'daughter', 'first time'],
      answer: "ACOG recommends the first gynecology visit between ages 13 and 15. The first visit is usually a conversation, a general physical, and external exam. A pelvic exam is not usually done unless symptoms warrant it. The first Pap test is recommended at age 21. Visits with teen patients keep their personal information confidential where appropriate.",
      source: "ACOG Committee Opinion No. 460 (The Initial Reproductive Health Visit)",
      link: { url: "adolescent-care.html", text: "Adolescent gynecology care" }
    },
    {
      id: 'insurance',
      keywords: ['insurance', 'plan', 'cover', 'coverage', 'aetna', 'cigna', 'horizon', 'medicaid', 'medicare', 'bluecross', 'blue cross'],
      answer: "We accept most major insurance including Aetna, BlueCross BlueShield, Cigna, United Healthcare, Horizon NJ Health, Oscar, Medicare, and most NJ Medicaid plans. To confirm your specific plan, call us at (973) 782 5577 with your insurance card handy.",
      source: null,
      link: { url: "contact.html", text: "Contact us about insurance" }
    },
    {
      id: 'appointment',
      keywords: ['appointment', 'book', 'schedule', 'visit'],
      answer: "You can request an appointment using our contact form or by calling (973) 782 5577. Most new patients are seen within the same week. We have two locations: Paterson and Totowa, both with the same team and standard of care.",
      source: null,
      link: { url: "contact.html", text: "Request an appointment" }
    },
    {
      id: 'locations',
      keywords: ['location', 'address', 'where', 'paterson', 'totowa', 'directions', 'hours'],
      answer: "We have two New Jersey locations: 1044 Main Street, Paterson NJ 07503 and 825 Riverview Drive, Totowa NJ 07512. Both offices are open Monday through Friday, 9am to 5pm, closed on weekends. Same team, same care at both locations.",
      source: null,
      link: { url: "contact.html", text: "Visit information and directions" }
    },
    {
      id: 'first_visit',
      keywords: ['first visit', 'new patient', 'what to bring', 'what to expect'],
      answer: "For your first visit, bring your insurance card, photo ID, a list of current medications, and details about your last period and any prior gynecological history. The visit usually takes 30 to 45 minutes. We always start with a conversation and never rush.",
      source: null,
      link: { url: "about.html", text: "About our practice" }
    },
    {
      id: 'symptom_check',
      keywords: ['symptom check', 'symptom checker', 'am i in menopause', 'quiz', 'test'],
      answer: "Our Menopause Symptom Check is a 3 minute anonymous self assessment based on the Greene Climacteric Scale, the same tool used by clinicians. You answer 21 questions and get a scored report you can download as a PDF and bring to your visit.",
      source: "Greene JG (1976), Journal of Psychosomatic Research, 20, 425-430",
      link: { url: "symptom-check.html", text: "Start the symptom check" },
      suggestCheck: true
    }
  ];

  // Urgent flags that should route to phone immediately
  const URGENT_PATTERNS = [
    /severe (pain|bleeding)/i,
    /emergency/i,
    /(suicid|self harm|kill myself|end my life|hurt myself)/i,
    /(can't|cannot) (breath|stop bleeding)/i,
    /pregnant.*bleeding/i,
    /911|988/
  ];

  // Greeting + suggested starters
  const GREETING = "Hi. I'm the Women's Care assistant. I can answer questions about menopause, birth control, your annual visit, and our services. I share research backed information only and never give a diagnosis. For anything urgent or personal, please call our office at (973) 782 5577.";
  const SUGGESTED = [
    'Is it perimenopause?',
    'What birth control should I consider?',
    'When is my first annual exam?',
    'Do you accept my insurance?',
    'What is a Pap test?',
    'Where are you located?'
  ];

  // ========== MATCHING LOGIC ==========
  function bestMatch(input) {
    const lower = input.toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const topic of KB) {
      let score = 0;
      for (const kw of topic.keywords) {
        if (lower.includes(kw)) {
          // longer keywords score higher
          score += kw.length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = topic;
      }
    }
    return bestScore >= 4 ? best : null;
  }

  function isUrgent(input) {
    return URGENT_PATTERNS.some(re => re.test(input));
  }

  function buildResponse(topic) {
    let html = '<div class="bot_text">' + escapeHtml(topic.answer) + '</div>';
    if (topic.source) {
      html += '<div class="bot_source">Source: ' + escapeHtml(topic.source) + '</div>';
    }
    if (topic.link) {
      html += '<a class="bot_link" href="' + topic.link.url + '">' + escapeHtml(topic.link.text) + ' <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M7 7h10v10"/></svg></a>';
    }
    if (topic.suggestCheck) {
      html += '<a class="bot_link bot_link_alt" href="symptom-check.html">Take the 3 minute symptom check <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>';
    }
    return html;
  }

  function buildFallback() {
    return '<div class="bot_text">I can\'t answer that one yet, so I don\'t want to guess. For personal medical questions please call us at <a href="tel:9737825577">(973) 782 5577</a> or <a href="contact.html">request an appointment</a>. Topics I can help with: menopause, perimenopause, birth control, family planning, annual exams, ultrasound, fibroids, endometriosis, urinary issues, sexual health, STIs, adolescent care, insurance, and appointment scheduling.</div>';
  }

  function buildUrgent() {
    return '<div class="bot_urgent"><strong>For urgent concerns:</strong> please call our office at <a href="tel:9737825577">(973) 782 5577</a> right away. If you are in a medical emergency or having thoughts of harming yourself, call <strong>911</strong> or <strong>988</strong> (Suicide and Crisis Lifeline) for immediate support.</div>';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ========== UI ==========
  function buildPanel() {
    const panel = document.createElement('div');
    panel.id = 'chatPanel';
    panel.className = 'chat_panel';
    panel.innerHTML = '\
      <div class="chat_head">\
        <div class="chat_head_left">\
          <div class="chat_avatar">\
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>\
          </div>\
          <div>\
            <div class="chat_title">Care Assistant</div>\
            <div class="chat_sub"><span class="chat_dot"></span> Research backed answers</div>\
          </div>\
        </div>\
        <button class="chat_close" id="chatClose" aria-label="Close">\
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>\
        </button>\
      </div>\
      <div class="chat_body" id="chatBody"></div>\
      <div class="chat_disclaimer">Information only. Not a diagnosis. For personal medical advice please call (973) 782 5577.</div>\
      <form class="chat_input_form" id="chatForm">\
        <input class="chat_input" id="chatInput" autocomplete="off" placeholder="Ask a question..." aria-label="Ask a question">\
        <button class="chat_send" type="submit" aria-label="Send">\
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>\
        </button>\
      </form>';
    return panel;
  }

  function buildBackdrop() {
    const bd = document.createElement('div');
    bd.id = 'chatBackdrop';
    bd.className = 'chat_backdrop';
    return bd;
  }

  function appendMessage(role, html) {
    const body = document.getElementById('chatBody');
    const msg = document.createElement('div');
    msg.className = 'chat_msg chat_msg_' + role;
    msg.innerHTML = html;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  function appendSuggested() {
    const body = document.getElementById('chatBody');
    const wrap = document.createElement('div');
    wrap.className = 'chat_suggested';
    SUGGESTED.forEach(s => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat_suggest_btn';
      b.textContent = s;
      b.addEventListener('click', () => {
        handleUserMessage(s);
      });
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function clearSuggested() {
    document.querySelectorAll('.chat_suggested').forEach(el => el.remove());
  }

  function handleUserMessage(text) {
    if (!text || !text.trim()) return;
    text = text.trim();
    clearSuggested();
    appendMessage('user', '<div class="user_text">' + escapeHtml(text) + '</div>');

    // simulate small typing delay
    const typing = document.createElement('div');
    typing.className = 'chat_msg chat_msg_bot chat_typing';
    typing.innerHTML = '<div class="chat_typing_dots"><span></span><span></span><span></span></div>';
    document.getElementById('chatBody').appendChild(typing);
    document.getElementById('chatBody').scrollTop = 99999;

    setTimeout(() => {
      typing.remove();
      let html;
      if (isUrgent(text)) {
        html = buildUrgent();
      } else {
        const match = bestMatch(text);
        html = match ? buildResponse(match) : buildFallback();
      }
      appendMessage('bot', html);
    }, 500);
  }

  // ========== INIT ==========
  function init() {
    const fab = document.querySelector('.ai_fab');
    if (!fab) return;
    // remove old handler that showed alert
    const newFab = fab.cloneNode(true);
    fab.parentNode.replaceChild(newFab, fab);

    document.body.appendChild(buildBackdrop());
    document.body.appendChild(buildPanel());

    newFab.addEventListener('click', openChat);
    document.getElementById('chatClose').addEventListener('click', closeChat);
    document.getElementById('chatBackdrop').addEventListener('click', closeChat);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.getElementById('chatPanel').classList.contains('open')) closeChat();
    });
    document.getElementById('chatForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chatInput');
      handleUserMessage(input.value);
      input.value = '';
    });

    let opened = false;
    function openChat() {
      document.body.classList.add('chat_open');
      document.getElementById('chatBackdrop').classList.add('show');
      document.getElementById('chatPanel').classList.add('open');
      if (!opened) {
        appendMessage('bot', '<div class="bot_text">' + escapeHtml(GREETING) + '</div>');
        appendSuggested();
        opened = true;
      }
      setTimeout(() => { document.getElementById('chatInput').focus(); }, 300);
    }
    function closeChat() {
      document.body.classList.remove('chat_open');
      document.getElementById('chatBackdrop').classList.remove('show');
      document.getElementById('chatPanel').classList.remove('open');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
