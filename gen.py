import os, json

OUT = '/sessions/vibrant-nifty-ritchie/mnt/WomensCareNJ'

# ============ SHARED HTML CHUNKS ============

HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#e8f1f8">
<title>{title}</title>
<meta name="description" content="{description}">

<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="apple-touch-icon" href="favicon.svg">

<meta property="og:type" content="website">
<meta property="og:url" content="https://womenscarenj.com/{slug}.html">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="social.svg">
<meta property="og:image:width" content="1672">
<meta property="og:image:height" content="941">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="twitter:image" content="social.svg">

<link rel="preconnect" href="https://api.fontshare.com">
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">
<link href="https://fonts.cdnfonts.com/css/lay-grotesk" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>
'''

NAV = '''
<!-- NAV -->
<nav class="nav" id="nav">
  <div class="nav_inner">
    <a href="index.html" class="logo" aria-label="Women's Care OB/GYN of NJ home">
      <img src="logo.svg" alt="Women's Care OB/GYN of NJ">
    </a>
    <div class="nav_links">
      <a href="index.html" class="nav_link">Home</a>
      <span class="nav_dot"></span>
      <a href="about.html" class="nav_link">About</a>
      <span class="nav_dot"></span>
      <a href="services.html" class="nav_link">Services</a>
      <span class="nav_dot"></span>
      <a href="our-team.html" class="nav_link">Providers</a>
      <span class="nav_dot"></span>
      <a href="symptom-check.html" class="nav_link">Symptom Check</a>
      <span class="nav_dot"></span>
      <a href="contact.html" class="nav_link">Contact</a>
    </div>
    <a href="contact.html" class="nav_cta">
      <span class="nav_cta_text">Book a visit</span>
      <span class="cta_arrow">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M7 7h10v10"/></svg>
      </span>
    </a>
    <button class="menu_btn" id="menuBtn" aria-label="Open menu">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    </button>
  </div>
</nav>

<div class="mobile_menu" id="mobileMenu">
  <div class="mobile_menu_panel">
    <button class="mobile_close" id="mobileClose" aria-label="Close menu">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
    <nav class="mobile_links">
      <a href="index.html" class="mobile_link">Home <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
      <a href="about.html" class="mobile_link">About <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
      <a href="services.html" class="mobile_link">Services <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
      <a href="our-team.html" class="mobile_link">Providers <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
      <a href="symptom-check.html" class="mobile_link">Symptom Check <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
      <a href="contact.html" class="mobile_link">Contact <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
      <a href="tel:9737825577" class="mobile_link">Call (973) 782 5577 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.8a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.35 1.84.59 2.8.72A2 2 0 0122 16.92z"/></svg></a>
    </nav>
    <a href="contact.html" class="mobile_menu_cta">
      Book a visit
      <span class="cta_arrow">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M7 7h10v10"/></svg>
      </span>
    </a>
  </div>
</div>
'''

FOOTER = '''
<!-- FOOTER -->
<footer class="footer">
  <div class="container">
    <div class="f_grid">
      <div class="f_brand">
        <a href="index.html" class="logo">
          <img src="logo.svg" alt="Women's Care OB/GYN of NJ" style="filter: brightness(0) invert(1); height: 32px;">
        </a>
        <p>Personalised OB/GYN care for women of all ages, in Paterson and Totowa, NJ.</p>
      </div>
      <div class="f_col">
        <h4>Care</h4>
        <a href="services.html">Services</a>
        <a href="our-team.html">Providers</a>
        <a href="symptom-check.html">Symptom Check</a>
        <a href="about.html">Insurance</a>
      </div>
      <div class="f_col">
        <h4>Visit</h4>
        <ul>
          <li>1044 Main St, Paterson</li>
          <li>825 Riverview Dr, Totowa</li>
          <li>Mon to Fri, 9am to 5pm</li>
          <li>(973) 782 5577</li>
        </ul>
      </div>
      <div class="f_col">
        <h4>Practice</h4>
        <a href="about.html">About</a>
        <a href="contact.html">Contact</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Accessibility</a>
      </div>
    </div>
    <div class="f_bot">
      <span>&copy; 2026 Women's Care of New Jersey. All rights reserved.</span>
      <span>Designed with care.</span>
    </div>
  </div>
</footer>

<div class="mobile_book">
  <a href="tel:9737825577" class="call_btn">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.8a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.35 1.84.59 2.8.72A2 2 0 0122 16.92z"/></svg>
  </a>
  <a href="contact.html" class="cta_btn_dark">
    Book a visit
    <span class="cta_arrow">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </span>
  </a>
</div>

<button class="ai_fab" aria-label="Open Care Assistant">
  <span class="ai_fab_dot">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
  </span>
  Ask Care Assistant
</button>

<script src="main.js"></script>
</body>
</html>
'''

# ============ FINAL CTA HTML ============
FINAL_CTA = '''
<section class="container sec">
  <div class="cta reveal">
    <img class="cta_img" src="web%20images/1.png" alt="">
    <h2>Ready when <em>you</em><br>are.</h2>
    <p>Book online in under a minute, or give us a call. Accepting new patients at both locations.</p>
    <div class="cta_row">
      <a href="contact.html" class="cta_btn_dark">
        Book a visit
        <span class="cta_arrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </a>
      <a href="tel:9737825577" class="cta_btn_white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.8a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.35 1.84.59 2.8.72A2 2 0 0122 16.92z"/></svg>
        (973) 782 5577
      </a>
    </div>
  </div>
</section>
'''

# ============ HELPERS ============

def page(slug, title, description, body):
    head = HEAD.format(title=title, description=description, slug=slug)
    return head + NAV + body + FOOTER

def crumb(items):
    parts = []
    for i, (label, href) in enumerate(items):
        if i > 0:
            parts.append('<span class="sep"></span>')
        if href:
            parts.append(f'<a href="{href}">{label}</a>')
        else:
            parts.append(f'<span>{label}</span>')
    return '<div class="crumb">' + ' '.join(parts) + '</div>'

def faq_block(items):
    html = '<div class="sub_faq"><h3 class="sub_faq_title">Common questions</h3><div class="faq_list">'
    for i, (q, a) in enumerate(items):
        open_class = ' open' if i == 0 else ''
        html += f'''<div class="faq_item{open_class}">
          <button class="faq_q">{q} <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg></button>
          <div class="faq_a"><div class="faq_a_inner">{a}</div></div>
        </div>'''
    html += '</div></div>'
    return html

def related_services(exclude_slug):
    cards = []
    for s in [s for s in SERVICE_ORDER if s != exclude_slug][:4]:
        d = SERVICES[s]
        cards.append(f'''<a href="{s}.html" class="svc">
          <span class="svc_tag">{d["tag"]}</span>
          <div class="svc_name">{d["name"]}</div>
          <span class="svc_plus"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg></span>
        </a>''')
    return f'''<section class="related">
  <div class="related_grid">
    <div class="related_head">
      <h2 class="related_title">Other <em>services</em></h2>
      <a href="services.html" class="page_hero_cta">View all <span class="cta_arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
    </div>
    <div class="related_cards">{"".join(cards)}</div>
  </div>
</section>'''

# ============ SERVICE PAGE CONTENT ============
SERVICE_ORDER = [
    'annual-well-woman-exam', 'birth-control', 'family-planning', 'menopause',
    'endometriosis-pelvic-pain', 'fibroids', 'ultrasound', 'urinary-problems',
    'colposcopy', 'leep', 'sexual-health', 'std-treatment', 'adolescent-care'
]

SERVICES = {}

SERVICES['annual-well-woman-exam'] = {
    'name': 'Annual Well Woman Exam',
    'tag': '#yearly',
    'lead': 'Your gynecologist is positioned to meet many of your primary health care needs. Our team uses specialised skills and a broad base of knowledge to provide comprehensive annual exams.',
    'body': '''<h2>What is a <em>well woman exam?</em></h2>
<p>The annual well woman exam is the foundation of preventive care in gynecology. During your visit, we cover many important parts of your health, in one focused appointment.</p>
<h3>Cancer screenings</h3>
<p>Annual exams are when you'll undergo routine screenings for breast and cervical cancer. You may also have a colon cancer screening.</p>
<h3>General health</h3>
<p>Depending on your age and history, your visit may include screenings for high blood pressure, diabetes, bone density, or osteoporosis, among other things.</p>
<h3>Vaccinations</h3>
<p>If applicable, you may receive your annual flu shot or HPV vaccination.</p>
<h3>Menstrual cycle concerns</h3>
<p>Your annual exam is an ideal time to discuss menstrual cycle abnormalities, including heavy bleeding, pelvic pain, or irregular periods.</p>
<h3>Concerns about sex</h3>
<p>If you have any concerns about sex, including questions about painful intercourse, libido problems, or hormonal changes, you can address them here.</p>
<h3>STI screening</h3>
<p>You can request sexually transmitted infection screenings, including tests for chlamydia, gonorrhea, genital herpes, or other infections spread through sexual contact.</p>
<h3>Weight and lifestyle</h3>
<p>We can also help you understand how to better manage your weight through physical activity and nutrition.</p>''',
    'faqs': [
        ('When should I get a pap smear?', 'A pap test is usually part of a routine pelvic exam, and is generally recommended every three years for women between the ages of 21 and 65. Starting at age 30, your doctor may recommend continuing a pap test every three years, or pairing it with an HPV screening every five years. Higher risk patients may need them more often.'),
        ('When should I start mammograms?', 'A mammogram is a special type of X-ray used to detect breast cancer in women who do not otherwise have symptoms. Most women should start having annual mammograms at the age of 40.'),
        ('How long does the visit take?', 'Most annual exams take about 30 to 45 minutes. We always make time for your questions and never rush.'),
        ('What should I bring?', 'Your insurance card, photo ID, a list of medications, and details about your last period. If you have prior records, bring them or ask your previous office to send them ahead.')
    ]
}

SERVICES['birth-control'] = {
    'name': 'Birth Control',
    'tag': '#contraception',
    'lead': 'Birth control reduces the risk of unintended pregnancy. With many options available, the right method depends on your age, history, lifestyle, and goals. We help you find what fits.',
    'body': '''<h2>The five <em>categories</em> of birth control</h2>
<h3>Hormonal methods</h3>
<p>Hormonal birth control prevents ovulation so that your eggs cannot be fertilised. The pill, the shot, the contraceptive patch, and the vaginal ring are common hormonal options.</p>
<h3>Long acting reversible contraception (LARC)</h3>
<p>LARC methods include intrauterine devices (IUDs) and implants. An IUD is a T shaped device placed in your uterus to prevent sperm from reaching an egg. An implant is a tiny flexible rod placed in your upper arm that releases hormones to prevent ovulation.</p>
<h3>Barrier methods</h3>
<p>Barrier methods block sperm from entering the uterus. Male condoms, female condoms, diaphragms, and cervical caps fit here, along with spermicidal foams, sponges, and films.</p>
<h3>Lasting birth control</h3>
<p>Lasting birth control can be surgical (tubal ligation that cuts, ties, or seals fallopian tubes) or non surgical (small flexible implants that block the fallopian tubes).</p>
<h3>Emergency contraception</h3>
<p>The two most effective methods for preventing pregnancy in the hours following unprotected sex or condom breakage are a copper IUD and emergency contraceptive pills.</p>
<h2>How to choose</h2>
<p>We consider your age and history, comfort with the method, sexual frequency and partners, and your future family planning goals. If you do not want to start a family soon, an IUD may be a good choice. If you have irregular periods, a hormone based method like the pill may help regulate your cycle.</p>''',
    'faqs': [
        ('How effective is birth control?', 'Used correctly, IUDs and implants are 99% effective, hormonal shots are 94% effective, and hormonal patches, vaginal rings, and birth control pills are 91% effective. Male and female condoms used alone are around 80% effective, and are often paired with another method for added protection.'),
        ('Do I need an appointment to get an IUD?', 'Yes. We start with a consultation to talk through options and confirm an IUD is right for you, then schedule the placement visit. The placement itself is usually a short, in office procedure.'),
        ('Can birth control help with anything besides preventing pregnancy?', 'Yes. Hormonal methods can help with irregular or heavy periods, cramping, acne, and some symptoms of endometriosis and PCOS.')
    ]
}

SERVICES['family-planning'] = {
    'name': 'Family Planning',
    'tag': '#planning',
    'lead': 'We provide comprehensive family planning services for women of all ages, in a friendly, welcoming environment, with the latest evidence based care.',
    'body': '''<h2>What we <em>provide</em></h2>
<ul>
  <li>Adolescent reproductive care and counseling</li>
  <li>Contraception counseling</li>
  <li>Contraceptive implant insertion and removal</li>
  <li>Depo Provera injection</li>
  <li>Fertility awareness counseling</li>
  <li>IUD insertion and removal</li>
  <li>Permanent contraception or sterilisation</li>
  <li>Pregnancy testing</li>
</ul>
<h2>Counseling and <em>support</em></h2>
<p>We are a resource for women, educating patients on family planning and contraception options. We also provide counseling and support services so you can make informed decisions about your reproductive health on your timeline.</p>''',
    'faqs': [
        ('When should I think about family planning?', 'Any time. Whether you are years away from wanting children, actively trying, or have decided not to have children, we can help you make a plan that fits your life.'),
        ('Can I switch methods later?', 'Absolutely. Many patients change methods at different life stages. We will talk through what is working, what is not, and what to try next.')
    ]
}

SERVICES['menopause'] = {
    'name': 'Menopause & Perimenopause',
    'tag': '#menopause',
    'lead': 'Menopause is not a disease. It is an inevitable chapter in a woman\'s life. We strive to understand what is most bothersome to you, and offer treatments that work for you. Our clinicians are all NAMS certified by the North American Menopause Society.',
    'body': '''<h2>What is <em>menopause?</em></h2>
<p>Menopause is the biological process that marks the end of female fertility. It is set in motion by a decline in oestrogen and progesterone, the reproductive hormones that control menstruation and make pregnancy possible. Hormone levels begin to decline in your late 30s, but menopause does not usually occur until your late 40s or early 50s. In the United States, the average age is 51.</p>
<p>Menopause officially starts twelve months after your final menstrual cycle. For women who have a total hysterectomy that removes the uterus and both ovaries, menopause begins without a transitional phase. This is called surgical menopause. If the uterus is removed but the ovaries are retained, patients are not surgically menopausal.</p>
<h2>Common <em>symptoms</em></h2>
<ul>
  <li>Irregular menstruation, including skipped periods</li>
  <li>Hot flushes and night sweats</li>
  <li>Weight gain and slower metabolism</li>
  <li>Mood changes and sleep problems</li>
  <li>Vaginal dryness and sexual discomfort</li>
  <li>Urinary urgency, frequency, and infections</li>
  <li>Drier skin, thinner hair, loss of breast fullness</li>
</ul>
<h2>Our <em>approach</em></h2>
<p>We take a holistic but progressive approach, using complementary and alternative therapies as well as traditional medical options. Hormone replacement therapy (HRT), in the form of a pill, patch, gel, cream, or spray, can help relieve hot flushes and night sweats, boost energy, improve sleep, reduce brain fog, and protect bone and heart health.</p>
<h2>Not sure if it\'s perimenopause?</h2>
<p>Take our anonymous 3 minute symptom check to see where you stand. It uses the same Greene Climacteric Scale our providers use in the office.</p>
<p><a href="symptom-check.html">Start the symptom check &rarr;</a></p>''',
    'faqs': [
        ('Can menopause affect my long term health?', 'Yes. Hormonal shifts can increase your risk of certain health issues. Urinary incontinence and weight gain are common. Lower oestrogen accelerates loss of bone density, increasing the risk of osteoporosis and fractures. Reduced oestrogen also raises cardiovascular risk, the leading cause of death in adult women.'),
        ('What are my treatment options?', 'Because menopause is natural, treatment is not required. You may seek treatment if symptoms interfere with daily life or affect your health. Low dose systemic oestrogen can help relieve hot flushes, boost energy, improve sleep, reduce brain fog, and protect heart and bone health.'),
        ('What is NAMS certification?', 'NAMS is the North American Menopause Society. Certified clinicians have completed additional training and exams in menopause care. Every clinician in our practice holds this credential.')
    ]
}

SERVICES['endometriosis-pelvic-pain'] = {
    'name': 'Endometriosis & Pelvic Pain',
    'tag': '#pelvic',
    'lead': 'Endometriosis is a common disorder in which tissues that normally line the uterus, called endometrium, are found growing outside of the organ. It can cause significant pain and can affect fertility. There are real options to ease the pain.',
    'body': '''<h2>What is <em>endometriosis?</em></h2>
<p>Even when it grows outside the uterus, endometrium still acts as it normally would. It thickens, breaks down, and bleeds with each menstrual cycle. Because these displaced tissues have no way to exit your body, they can cause scar tissue, ovarian cysts, and adhesions.</p>
<h2>Common <em>symptoms</em></h2>
<ul>
  <li>Chronic pelvic pain, especially during menstruation</li>
  <li>Pain during sexual intercourse</li>
  <li>Heavy menstrual bleeding, or bleeding between cycles</li>
  <li>Painful bowel movements or pain while urinating</li>
</ul>
<h2>Treatment <em>options</em></h2>
<p>Endometriosis cannot be cured, but there are real options to help with symptoms and related issues. For mild pelvic pain, over the counter pain relievers like ibuprofen or naproxen may be enough.</p>
<p>If you are not planning to become pregnant, hormonal birth control or other hormonal medications can slow the growth of endometrial tissues and may prevent new adhesions. Extended cycle or continuous cycle hormonal birth control, available as a pill or an injection, can help stop bleeding and reduce pelvic pain.</p>
<p>For more severe cases, surgical removal of displaced endometrial tissues may be the best option for pain relief and improved fertility. Because the problem usually returns over time, hormonal medications after surgery can help delay its return.</p>''',
    'faqs': [
        ('Is endometriosis linked to other health risks?', 'Yes. Endometriosis can cause chronic pelvic pain that is debilitating and hard to manage. Women with endometriosis have a slightly higher than average rate of ovarian cancer. Infertility is another possible complication. Up to half of all women with endometriosis have difficulty conceiving, and about 40% of women with infertility also have endometriosis. The chronic inflammation can damage sperm and eggs, hinder movement, and prevent them from coming together. Women with mild to moderate endometriosis are often advised not to delay having children, since the condition can worsen with time.'),
        ('How is endometriosis diagnosed?', 'Diagnosis usually starts with a conversation about your symptoms and history, followed by an examination and imaging like ultrasound. Laparoscopy is the only way to definitively confirm the diagnosis.'),
        ('When should I see a doctor about pelvic pain?', 'If pelvic pain is interfering with your life, work, sleep, or relationships, or if over the counter medication is not enough, please book a visit. Pain is information. We listen.')
    ]
}

SERVICES['fibroids'] = {
    'name': 'Fibroids',
    'tag': '#fibroids',
    'lead': 'Researchers estimate as many as 80% of all women will develop fibroids by the age of 50. They are almost always benign, but they can still cause uncomfortable symptoms.',
    'body': '''<h2>What are <em>fibroids?</em></h2>
<p>Uterine fibroids are noncancerous growths on the uterine wall. Also known as myomas, they usually emerge during a woman\'s childbearing years and are most often diagnosed in women in their 40s or early 50s. Fibroids can be so small they are virtually undetectable, or so large they distend the uterus. In severe cases involving multiple large fibroids, a woman\'s uterus may expand upward as far as her rib cage.</p>
<p>Fibroids almost never develop into cancer, and they are not linked to an increased risk of uterine cancer.</p>
<h2>Possible <em>symptoms</em></h2>
<ul>
  <li>Pelvic pressure or lower back pain</li>
  <li>A feeling of fullness or enlargement in the lower abdomen</li>
  <li>Longer, more frequent, or heavier periods</li>
  <li>Frequent urination or difficulty emptying the bladder</li>
  <li>Pain during intercourse</li>
</ul>
<p>Pregnant women with uterine fibroids have an increased risk of complications during pregnancy and labour, and are six times more likely to deliver via cesarean.</p>
<h2>Diagnosis and <em>treatment</em></h2>
<p>Fibroids are often found during a routine pelvic exam. If we can feel a fibroid with our fingers, we may perform imaging tests to confirm. This is usually accomplished with an ultrasound. If ultrasound imaging does not reveal enough information, you may undergo a hysteroscopy or a laparoscopy.</p>
<p>If you have small fibroids that do not cause disruptive symptoms, treatment may not be needed. If you are approaching menopause and you have fibroids, you may be able to use a wait and see approach, as fibroids usually shrink during menopause.</p>
<p>Treatment can be very beneficial for women with large fibroids that cause significant symptoms, or for women who want to avoid complications with future pregnancies. A myomectomy is a surgical procedure that removes fibroids while leaving the uterus in place. Birth control pills and other hormonal medications can reduce pelvic pain and heavy periods. A hysterectomy (removing the uterus) is the only way to completely cure an ongoing fibroid problem.</p>''',
    'faqs': [
        ('Do all fibroids cause symptoms?', 'No. Most women who have fibroids do not experience symptoms and may not even know they exist. Symptoms depend on size, location, and number.'),
        ('Do I need surgery?', 'Not always. The right treatment depends on the size of the fibroids, your symptoms, and your goals. We start with the least invasive option that fits your situation.')
    ]
}

SERVICES['ultrasound'] = {
    'name': 'Pelvic Ultrasound',
    'tag': '#imaging',
    'lead': 'Ultrasound imaging is integral to gynecological care. A pelvic ultrasound uses sound waves to evaluate the organs of the female pelvis and helps us diagnose a wide range of conditions, in office, with no radiation.',
    'body': '''<h2>How it <em>works</em></h2>
<p>A pelvic ultrasound is a medical test that uses sound waves to evaluate the organs of the female pelvis. These sound waves bounce off the organs and internal tissues, and send an echo back to the transducer, the handpiece that transmits sound waves. A computer converts the sound waves into a picture of your organs, which appear on a video screen. A pelvic ultrasound can image the cervix, fallopian tubes, ovaries, uterus, vagina, and bladder.</p>
<h2>What we <em>look for</em></h2>
<ul>
  <li>Check the location of an IUD</li>
  <li>Look for causes of abnormal vaginal bleeding</li>
  <li>Evaluate pelvic or abdominal pain</li>
  <li>Evaluate couples with infertility</li>
  <li>Diagnose ectopic pregnancies (pregnancy located outside the uterus)</li>
  <li>Look for growth of uterine fibroids, ovarian or paraovarian cysts, or tumours in the pelvic organs</li>
</ul>
<h2>What to <em>expect</em></h2>
<p>A pelvic ultrasound can be performed transvaginally or transabdominally based on your unique concerns and needs. If you are having a transvaginal ultrasound, you will need to have an empty bladder. If you are having a transabdominal ultrasound, your bladder will need to be full, so we recommend avoiding the bathroom in the 1 to 2 hours before the exam and drinking plenty of fluids. Wear loose and comfortable clothes to the exam, as you may need to wear a gown during the procedure.</p>''',
    'faqs': [
        ('Does an ultrasound hurt?', 'A gynecologic ultrasound does not use radiation and does not come with the risks associated with radiation. A transabdominal ultrasound should not hurt. A transvaginal scan may cause some discomfort when the transducer is inserted, but most patients tolerate it well.'),
        ('How long does it take?', 'Most pelvic ultrasounds take 15 to 30 minutes. You can usually return to normal activities right after.'),
        ('Do I need a referral?', 'In some cases yes, depending on your insurance. Call us and we will help sort it out.')
    ]
}

SERVICES['urinary-problems'] = {
    'name': 'Urinary Problems',
    'tag': '#bladder',
    'lead': 'Urinary incontinence (UI) is a common medical problem that affects millions of women. It does not have to be a source of embarrassment, and it is not something you have to live with.',
    'body': '''<h2>What is <em>UI?</em></h2>
<p>Urinary incontinence, also known as urinary leakage or loss of bladder control, usually involves the involuntary leaking of urine, either in the form of a few drops or something more severe. It can include leaking urine before you can make it to the bathroom, a sudden urge to urinate that cannot always be controlled, and urine leakage while coughing or during sexual intercourse.</p>
<h2>Why it <em>happens</em></h2>
<p>Compared to men, women are twice as likely to have UI, largely because of the stresses and changes brought on by pregnancy, childbirth, and menopause. Pregnancy puts increased pressure on pelvic floor muscles. Vaginal childbirth can damage the nerves that control bladder function. Lower oestrogen levels brought on by menopause can also contribute to UI by weakening urethral tissues.</p>
<h2>Main <em>types</em></h2>
<h3>Stress incontinence</h3>
<p>The most prevalent type of UI. Leakage occurs when physical movement puts pressure on the bladder, like coughing, sneezing, laughing, exercising, or lifting something heavy.</p>
<h3>Urge incontinence</h3>
<p>Often called overactive bladder. A strong, sudden urge to urinate, followed by leakage. Can occur when least expected, like during sleep or when hearing running water.</p>
<h3>Mixed incontinence</h3>
<p>Many women have a mix of stress and urge incontinence.</p>
<h2>Treatment <em>options</em></h2>
<p>UI can often be treated without surgery. We may start with lifestyle changes, bladder training, physical therapy, or bladder support devices. Eating high sodium foods can cause you to urinate more frequently. Certain prescription medications can contribute. Losing weight can reduce pressure on the bladder. Kegel exercises can strengthen pelvic floor muscles.</p>
<p>If these methods do not work, you may find success with bladder control medication, nerve stimulation therapy, or surgery.</p>''',
    'faqs': [
        ('Is leakage just part of getting older?', 'No. It is common, but it is treatable. Many women see big improvement with simple changes.'),
        ('Will I need surgery?', 'Most patients do not. We start with non surgical approaches first.')
    ]
}

SERVICES['colposcopy'] = {
    'name': 'Colposcopy',
    'tag': '#screening',
    'lead': 'Colposcopy is a way of looking at the cervix through a special magnifying device called a colposcope. It allows us to see problems that cannot be seen by the eye alone, usually after an abnormal cervical cancer screening result.',
    'body': '''<h2>Why we do a <em>colposcopy</em></h2>
<p>Colposcopy is done when results of cervical cancer screening tests show abnormal changes in the cells of the cervix. It provides more information about the abnormal cells. Colposcopy may also be used to further assess other concerns:</p>
<ul>
  <li>Genital warts on the cervix</li>
  <li>Cervicitis (an inflamed cervix)</li>
  <li>Benign growths, such as polyps</li>
  <li>Pain</li>
  <li>Bleeding</li>
</ul>
<p>Sometimes colposcopy needs to be done more than once. It can also be used to check the result of a treatment.</p>
<h2>How the <em>procedure</em> works</h2>
<p>Colposcopy is done in the office. It is best done when you are not having your menstrual period, which gives a better view of the cervix. For at least 24 hours before the test, you should not douche, use tampons, use vaginal medications, or have sex.</p>
<p>As with a pelvic exam, you will lie on your back with your feet raised on foot rests. A speculum will hold apart the vaginal walls so the inside of the vagina and the cervix can be seen. The colposcope is placed just outside the opening of your vagina. A mild solution is applied to your cervix and vagina with a cotton swab or cotton ball. This liquid makes abnormal areas easier to see. You may feel a slight burning.</p>
<h2>If a <em>biopsy</em> is needed</h2>
<p>If we see abnormal areas, a biopsy may be done. A small piece of tissue is removed from the cervix using a special device. Cells may also be taken from the canal of the cervix, called endocervical curettage (ECC).</p>
<h2>Recovery</h2>
<p>If you have a colposcopy without a biopsy, you should feel fine right away. You can do the things you normally do. You may have a little spotting for a couple of days.</p>
<p>If you have a biopsy, you may have pain and discomfort for 1 or 2 days. Over the counter pain medications can help. You may have vaginal bleeding and a dark discharge for a few days. While the cervix heals, do not put anything into your vagina for 2 to 3 days: no sex, no tampons, no douching.</p>''',
    'faqs': [
        ('Will it hurt?', 'Most patients feel mild pressure or a slight burning. If a biopsy is needed, you may feel a quick pinch.'),
        ('How long does it take?', 'The procedure itself is usually 10 to 20 minutes.')
    ]
}

SERVICES['leep'] = {
    'name': 'LEEP',
    'tag': '#procedure',
    'lead': 'If you have an abnormal cervical cancer screening result, we may suggest a loop electrosurgical excision procedure (LEEP) for evaluation or treatment. It removes abnormal cells from the cervix using a thin wire loop.',
    'body': '''<h2>How <em>LEEP</em> works</h2>
<p>LEEP uses a thin wire loop that acts like a scalpel. An electric current is passed through the loop, which cuts away a thin layer of the cervix. The tissue removed is studied in a lab to confirm the diagnosis.</p>
<p>LEEP is done when you are not having your menstrual period to give a better view of the cervix. In most cases, it is done in the office and only takes a few minutes. You will lie on your back and place your legs in stirrups. A speculum is inserted into the vagina. Local anesthesia is used to prevent pain, given through a needle attached to a syringe. You may feel a slight sting, then a dull ache or cramp. The loop is then inserted to the cervix.</p>
<p>After the procedure, a special paste may be applied to your cervix to stop bleeding. Electrocautery may also be used.</p>
<h2>What to <em>expect</em> during recovery</h2>
<p>After the procedure, you may have a watery, pinkish discharge, mild cramping, and a brownish black discharge (from the paste) that looks like coffee grounds. It will take a few weeks for your cervix to heal. While it heals, do not place anything in the vagina (no tampons, douches, or intercourse). We will tell you when it is safe.</p>
<h3>Post LEEP instructions</h3>
<ul>
  <li>For cramping, take Ibuprofen (up to 600 mg every 6 hours) or acetaminophen as needed.</li>
  <li>Light bleeding is normal. Call the office if you soak more than one pad per hour.</li>
  <li>A brownish black coffee ground discharge with light bleeding for the first week is normal.</li>
  <li>Avoid heavy lifting and vigorous exercise for 1 week.</li>
  <li>Do not use tampons for 2 weeks. Use pads.</li>
  <li>Do not have intercourse for 2 weeks.</li>
  <li>Shower rather than tub baths. No swimming, jacuzzis, or hot tubs for 2 weeks.</li>
  <li>You may receive a prescription for Flagyl. If you develop foul smelling discharge, you may take it. If no symptoms, you do not have to fill it.</li>
  <li>For severe abdominal pain or fever greater than 100.4&deg;F, call the office.</li>
</ul>
<h2>Follow up</h2>
<p>After the procedure, you will need follow up visits. You will have cervical cancer screening to confirm the abnormal cells are gone and have not returned. If another abnormal result comes back, you may need more treatment.</p>''',
    'faqs': [
        ('When should I call you afterward?', 'Heavy bleeding (more than your normal period), bleeding with clots, severe abdominal pain, or fever over 100.4&deg;F. Call us right away.'),
        ('Will it affect future pregnancies?', 'A LEEP slightly increases the risk of preterm labour in future pregnancies. We talk this through with you and consider it when planning treatment.')
    ]
}

SERVICES['sexual-health'] = {
    'name': 'Sexual Health',
    'tag': '#wellness',
    'lead': 'It is easy to take your sexual health for granted when it is good. When something is off, whether libido, pain, or comfort, we look at the whole picture to help you feel like yourself again.',
    'body': '''<h2>Low <em>libido</em></h2>
<p>Sexual desire naturally fluctuates over the years. A persistent lack of interest in sex usually includes feeling no interest in any sexual activity, including self stimulation, and lacking sexual fantasies or thoughts. Low libido can be caused by certain medications, sexual problems, exhaustion, hormonal shifts, or stress.</p>
<h2>Orgasmic <em>dysfunction</em></h2>
<p>An estimated 10 to 15% of women have never experienced an orgasm, and research suggests up to half of all sexually active women are not satisfied with how often they reach orgasm. Never having an orgasm, even when sexually excited, may be a sign of orgasmic dysfunction. Causes can include boredom, fatigue, stress, depression, shyness or negative feelings about sex, vaginal dryness, hormonal changes, or chronic pelvic pain.</p>
<h2>Painful <em>intercourse</em></h2>
<p>Nearly three out of four women experience painful intercourse at some point in their lives. Dyspareunia is the medical term for painful vaginal intercourse that occurs frequently or all the time. It usually involves genital pain just before, during, or after intercourse.</p>
<p>A range of issues can lead to pain: physical, gynecological, or emotional. Medications, including some birth control methods, can interfere with natural lubrication. Hormonal changes from menopause can cause vaginal dryness. Emotions or relationship strain that make it hard to relax can also play a role.</p>
<h2>Treatment <em>options</em></h2>
<p>Options are as wide ranging as the causes. For some patients, changing a prescription that interferes with natural lubrication is all it takes. Others benefit from sexual education, physical therapy, hormone replacement therapy, or vaginal rejuvenation treatments. We work to get to the root of the problem so we can offer the right treatment.</p>''',
    'faqs': [
        ('Will my conversations be private?', 'Yes. Everything you share with us is confidential.'),
        ('Do you treat both partners?', 'We are focused on your care. We can suggest referrals or resources if your partner would benefit from their own consultation.')
    ]
}

SERVICES['std-treatment'] = {
    'name': 'STD Treatment',
    'tag': '#testing',
    'lead': 'Sexually transmitted diseases (STDs), also called STIs, are spread through intimate contact. We test, treat, and educate, with discretion and without judgment.',
    'body': '''<h2>Common <em>STDs</em></h2>
<p>There are more than 20 different kinds of STDs and STIs, caused by viruses, parasites, bacteria, and yeast.</p>
<ul>
  <li><strong>Chlamydia:</strong> a bacteria that can infect the reproductive organs, rectum, and throat. Symptoms can include burning during urination, abnormal discharge, and pain.</li>
  <li><strong>Gonorrhea:</strong> a bacteria that affects the reproductive organs. Symptoms can include burning during urination and genital discharge.</li>
  <li><strong>Hepatitis B:</strong> infects the liver. Spreads through blood, body fluids, or open sores. Easily treated but can be serious if untreated.</li>
  <li><strong>Herpes:</strong> the herpes simplex virus causes redness and sores on the genital area, thighs, and rectal area. The virus does not go away but symptoms can be managed.</li>
  <li><strong>HIV / AIDS:</strong> spread through intercourse and shared needles. Attacks the immune system.</li>
  <li><strong>HPV:</strong> spreads through intercourse and causes warts in the genital area. Some types can lead to cancer.</li>
  <li><strong>Syphilis:</strong> a bacteria passed through sexual contact. Early symptoms can be a small painless sore. Untreated, it can cause complications later.</li>
  <li><strong>Trichomoniasis:</strong> a parasite that spreads through unprotected sex. Most common among women. Often has a long incubation and few symptoms.</li>
</ul>
<h2>How they <em>spread</em></h2>
<p>Both men and women can be infected and spread STDs. Risk depends on the infection and the practice. With protection and open communication, you and your partner can enjoy sexual intimacy while keeping risks low.</p>
<h2>Prevention</h2>
<p>Always use protection (condoms, dental dams) unless you are in a committed relationship in which both partners have been tested. Avoid unprotected sex with multiple partners or with someone you do not know well. If you or your partner experience symptoms, avoid intercourse until you have both been tested.</p>
<h2>Testing</h2>
<p>You do not have to wait until symptoms appear. If you have ever had sex, especially unprotected sex, testing is a good idea. There is no single test for all STDs. Many tests involve a urine sample, a physical exam, or a blood sample.</p>''',
    'faqs': [
        ('How long do results take?', 'Most results come back within a few days. We call you with results either way.'),
        ('Will my results show up on my insurance?', 'Possibly. If you would prefer confidentiality, ask us about self pay options.')
    ]
}

SERVICES['adolescent-care'] = {
    'name': 'Adolescent Care',
    'tag': '#teens',
    'lead': 'As older girls become teens, appropriate medical care and annual wellness should include gynecology. Most young women should have their first visit between the ages of 13 and 15.',
    'body': '''<h2>Why <em>teens</em> see a gynecologist</h2>
<p>A girl\'s first visit covers a variety of important topics. It usually begins with a conversation about good health habits and why gynecology should be part of routine preventive care. The visit also includes a general physical that measures height, weight, and blood pressure, plus a breast exam and an external genital exam. Young girls do not usually have pelvic exams, unless they have been experiencing a problem like pelvic pain or abnormal bleeding.</p>
<h2>The three main <em>goals</em></h2>
<h3>Information</h3>
<p>We provide accurate information for any questions or concerns a girl may have about sex, sexuality, menstruation, or her changing body. All questions and answers are kept confidential.</p>
<h3>Prevention</h3>
<p>We educate young patients on how to prevent sexually transmitted infections and pregnancy. Prevention also includes advice and recommendations on how to lead a healthy lifestyle.</p>
<h3>Treatment</h3>
<p>We assess early gynecological problems, such as irregular, painful, or heavy periods, and offer treatment options.</p>
<h2>About the <em>pelvic exam</em></h2>
<p>Adolescents generally do not need a pelvic exam unless they are experiencing a problem or symptom that warrants one. For most healthy women, the first pelvic exam happens at age 21, the age at which the first pap smear is recommended. Girls who do need a pelvic exam should know it is quick and has three parts: looking at the vulva, looking at the vagina and cervix with a speculum, and checking the internal organs with a gloved hand.</p>
<h2>What is <em>confidential</em></h2>
<p>Gynecologists want their young patients to feel confident sharing personal information. It is the only way they can offer the right treatment or advice. Most information shared with the gynecologist is confidential, including sexual activity, sexual orientation, gender identity, contraception, and STI testing or treatment.</p>''',
    'faqs': [
        ('Can my teen come alone?', 'Yes. Many of the most important parts of the visit are confidential between the patient and clinician. We always work to make her feel safe and respected.'),
        ('What if she is nervous?', 'That is completely normal. We never rush. We start with a conversation and only proceed with what is appropriate and comfortable.')
    ]
}

# ============ PROVIDER PAGE CONTENT ============
PROVIDERS = {
    'christine-sticco': {
        'name': 'Dr. Christine Sticco',
        'credentials': 'MD, FACOG',
        'role': 'OB/GYN',
        'initials': 'CS',
        'photo_alt': '',
        'tags': ['Board Certified OB/GYN', 'NAMS Certified', 'Fellow of ACOG', 'Over 14 years in practice'],
        'bio': '''<p>Dr. Christine Sticco, MD, FACOG is a board certified Ob-Gyn who has been in practice for over 14 years. She is a member of the American College of Obstetrics and Gynecologists (ACOG) and holds the prestigious designation of Fellow of the American College of Obstetrics and Gynecology.</p>
<p>She obtained her medical degree from Ross University School of Medicine and completed her residency training at New York Medical College. During training she earned the coveted Society of Laparoendoscopic Surgeons Resident Achievement Award and was highly respected by her peers. As chief resident, she earned the Berlex Best Teaching Resident Award.</p>
<p>She practiced in New York City for over 10 years where she gained a breadth of experience in simple and complex obstetrical and gynecological issues, including performing numerous surgeries for gynecologic pathologies. During her time in NYC she was awarded the Dr. Maria Montessori Italian American women in the field of medicine award, and was included in the 2007 to 2008 Cambridge Who\'s Who as an Honored Member. She brings a wealth of knowledge to the NJ area.</p>
<p>She has decided to focus on Gynecology only so she can dedicate her expertise to better help this patient population. Dr. Sticco is well known as a caring, compassionate doctor who has a passion for learning, teaching, and ensuring best outcomes for her patients. She regularly attends academic conferences and stays current on the most up to date technologies in medicine. With her unique whole system approach to patient care, she is able to provide thoughtful, individualised, comprehensive care.</p>''',
        'specialties': ['Annual exams', 'Menopause and perimenopause', 'Endometriosis and pelvic pain', 'Birth control and family planning', 'Pelvic ultrasound', 'Colposcopy and LEEP', 'Fibroids', 'Urinary problems']
    },
    'ifrah-syed': {
        'name': 'Ifrah Syed, PA-C',
        'credentials': 'PA-C',
        'role': 'Physician Assistant',
        'initials': 'IS',
        'photo_alt': '2',
        'tags': ['Nationally Certified', 'Over 10 years experience', 'AAPA Member'],
        'bio': '''<p>Ifrah Syed, PA-C is a nationally certified Physician Assistant. She completed her Bachelors of Science and Masters in Basic Medical Sciences at Wayne State University in Detroit, MI, and then earned her Masters in Physician Assistant Studies at Mercy College in Bronx, NY.</p>
<p>She is certified by the National Commission for Certification of Physician Assistants and is a member of the American Academy of Physician Assistants.</p>
<p>She has been practising for over 10 years, with experience in urgent care, pediatrics, and family medicine. She has worked in Passaic County for the past 7 years and feels a strong sense of community here. She hopes to participate further in providing underserved regions with better access to healthcare.</p>
<p>Ifrah\'s compassionate, kind, and enthusiastic nature allows patients to feel comfortable raising their medical concerns with her. She is well known for her optimistic attitude and kind bedside manner, and brings that warmth to every visit.</p>''',
        'specialties': ['Annual exams', 'Birth control', 'STI testing', 'Adolescent care', 'General gynecology']
    },
    'gessica-russo': {
        'name': 'Gessica Russo, FNP-C',
        'credentials': 'FNP-C',
        'role': 'Family Nurse Practitioner',
        'initials': 'GR',
        'photo_alt': '3',
        'tags': ['AANP Member', 'Master\'s in Nursing', 'Years serving Passaic County'],
        'bio': '''<p>Gessica Russo is a concerned and attentive nurse practitioner serving the communities of Paterson, Garfield, and Passaic, NJ. She attended the College of New Rochelle, where she earned her master\'s degree as a family nurse practitioner. She completed her bachelor\'s degree in nursing at New York University, and also earned her bachelor\'s in health sciences from James Madison University.</p>
<p>Ms. Russo is a member of the American Association of Nurse Practitioners. She provides complete gynecological care for women of all ages and treats a variety of medical conditions.</p>
<p>She is a compassionate and dedicated healthcare provider, deeply committed to the wellbeing of her patients. She takes a thorough and precise approach to her consultations to ensure she is consistently giving accurate diagnoses.</p>''',
        'specialties': ['Annual exams', 'Birth control and IUDs', 'Menopause care', 'STI testing', 'General gynecology']
    },
    'rawan-hammoudeh': {
        'name': 'Rawan Hammoudeh, FNP-C',
        'credentials': 'FNP-C',
        'role': 'Family Nurse Practitioner',
        'initials': 'RH',
        'photo_alt': '4',
        'tags': ['Nationally Certified', 'William Paterson alumna', 'Local to the community'],
        'bio': '''<p>Rawan Hammoudeh is a very caring Nurse Practitioner who graduated from William Paterson University with a Bachelor\'s Degree in Nursing. Growing up in this area, she had always wanted to serve her community. Seeking to further serve those around her, she furthered her career and graduated at the top of her class in her Master\'s program in Family Nurse Practitioner.</p>
<p>She is nationally certified and is a member of many professional organisations as a means of further development in her career.</p>
<p>She consults patients for a variety of illnesses and offers the utmost of care to her patients. She is committed to serving the population of Passaic County and demonstrates excellence in both diagnosing and treating her patients.</p>''',
        'specialties': ['Annual exams', 'Birth control', 'Adolescent care', 'STI testing', 'General gynecology']
    }
}

PROVIDER_ORDER = ['christine-sticco', 'ifrah-syed', 'gessica-russo', 'rawan-hammoudeh']

# Output
print("Templates loaded. Ready to generate.")

# ============ SERVICE PAGE BUILDER ============

def build_service_page(slug):
    d = SERVICES[slug]
    breadcrumb = crumb([('Home', 'index.html'), ('Services', 'services.html'), (d['name'], None)])
    
    hero = f'''<section class="page_hero">
  <div class="page_hero_inner">
    {breadcrumb}
    <span class="page_eyebrow">{d['tag']}</span>
    <h1 class="page_h1">{d['name']}</h1>
    <p class="page_lead">{d['lead']}</p>
    <a href="contact.html" class="page_hero_cta">
      Book a visit
      <span class="cta_arrow">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </span>
    </a>
  </div>
</section>'''
    
    article = f'''<section class="article">
  <div class="article_grid">
    <div class="article_body">
      {d['body']}
      {faq_block(d['faqs'])}
    </div>
    <aside class="article_aside">
      <div class="aside_book">
        <h4>Ready when you are</h4>
        <p>Book a consultation about {d['name'].lower()} with our team. Same week appointments available at both locations.</p>
        <a href="contact.html" class="aside_book_btn">
          Book a visit
          <span class="cta_arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
        </a>
        <a href="tel:9737825577" class="aside_phone">Or call (973) 782 5577</a>
      </div>
      <div class="aside_card">
        <h4>Quick facts</h4>
        <p>Two NJ locations &middot; Mon to Fri, 9am to 5pm &middot; Most insurance accepted &middot; Hablamos español</p>
      </div>
      <div class="aside_card">
        <h4>Our team</h4>
        <a href="christine-sticco.html">Dr. Christine Sticco <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        <a href="ifrah-syed.html">Ifrah Syed, PA <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        <a href="gessica-russo.html">Gessica Russo, FNP <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        <a href="rawan-hammoudeh.html">Rawan Hammoudeh, FNP <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
      </div>
    </aside>
  </div>
</section>'''
    
    body = hero + article + related_services(slug) + FINAL_CTA
    return page(slug, f"{d['name']} · Women's Care OB/GYN of NJ", d['lead'][:155], body)

# ============ PROVIDER PAGE BUILDER ============

def build_provider_page(slug):
    d = PROVIDERS[slug]
    initials = d['initials']
    alt_class = f' alt{d["photo_alt"]}' if d.get('photo_alt') else ''
    
    breadcrumb = crumb([('Home', 'index.html'), ('Providers', 'our-team.html'), (d['name'], None)])
    
    tags_html = ''.join(f'<span class="tag">{t}</span>' for t in d['tags'])
    
    hero = f'''<section class="page_hero">
  <div class="page_hero_inner prov_hero_grid">
    <div>
      {breadcrumb}
      <span class="page_eyebrow">{d['role']}</span>
      <h1 class="page_h1">{d['name']}</h1>
      <p class="page_lead">{d['credentials']} &middot; {d['role']}</p>
      <div class="prov_hero_meta">{tags_html}</div>
      <a href="contact.html" class="page_hero_cta">
        Book with {d['name'].split()[-1] if 'Dr.' in d['name'] else d['name'].split()[0]}
        <span class="cta_arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
      </a>
    </div>
    <div class="prov_hero_photo{alt_class}">{initials}</div>
  </div>
</section>'''
    
    specialties_html = ''.join(f'<li>{s}</li>' for s in d['specialties'])
    
    article = f'''<section class="article">
  <div class="article_grid">
    <div class="article_body">
      <h2>About <em>{d['name'].split(',')[0]}</em></h2>
      {d['bio']}
      <h2>Areas of <em>focus</em></h2>
      <ul>{specialties_html}</ul>
    </div>
    <aside class="article_aside">
      <div class="aside_book">
        <h4>Book with {d['name'].split(',')[0]}</h4>
        <p>Same week appointments available. New patients welcome at both locations.</p>
        <a href="contact.html" class="aside_book_btn">
          Request appointment
          <span class="cta_arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
        </a>
        <a href="tel:9737825577" class="aside_phone">Or call (973) 782 5577</a>
      </div>
      <div class="aside_card">
        <h4>Other providers</h4>
        {"".join(f'<a href="{s}.html">{PROVIDERS[s]["name"]} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>' for s in PROVIDER_ORDER if s != slug)}
      </div>
    </aside>
  </div>
</section>'''
    
    body = hero + article + FINAL_CTA
    return page(slug, f"{d['name']} · Women's Care OB/GYN of NJ", f"{d['name']}, {d['role']} at Women's Care OB/GYN of NJ.", body)

# Generate all
generated = []
for slug in SERVICE_ORDER:
    html = build_service_page(slug)
    with open(f'{OUT}/{slug}.html', 'w') as f:
        f.write(html)
    generated.append(f'{slug}.html')

for slug in PROVIDER_ORDER:
    html = build_provider_page(slug)
    with open(f'{OUT}/{slug}.html', 'w') as f:
        f.write(html)
    generated.append(f'{slug}.html')

print(f"Generated {len(generated)} pages")
for g in generated:
    print(f"  {g}")
