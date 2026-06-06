import sys
sys.path.insert(0, '/sessions/vibrant-nifty-ritchie/mnt/WomensCareNJ')
exec(open('/sessions/vibrant-nifty-ritchie/mnt/WomensCareNJ/gen.py').read().split('# Generate all')[0])

OUT = '/sessions/vibrant-nifty-ritchie/mnt/WomensCareNJ'

# ============ ABOUT PAGE ============
about_body = '''
<section class="page_hero">
  <div class="page_hero_inner">
    ''' + crumb([('Home', 'index.html'), ('About', None)]) + '''
    <span class="page_eyebrow">About us</span>
    <h1 class="page_h1">Personalised care, every <em>visit</em>.</h1>
    <p class="page_lead">We are an OB/GYN practice in Paterson and Totowa, NJ, focused entirely on women\\'s health. Every visit is built around you.</p>
    <a href="contact.html" class="page_hero_cta">
      Book a visit
      <span class="cta_arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
    </a>
  </div>
</section>

<section class="article">
  <div class="article_grid">
    <div class="article_body">
      <p>Your first visit is your opportunity to get to know our practice, see our facility, and meet our office team. During your initial appointment, we discuss your concerns, collect your health history, and perform a clinical exam to establish a baseline for care.</p>
      <p>We tailor each treatment plan to address individual needs and fulfill expectations of care. You can count on every member of our friendly and experienced office team to pay close attention to your comfort, and to address your needs with kindness, patience, and compassion.</p>

      <h2>What to <em>expect</em></h2>
      <p>We do all we can to make your visit a welcoming, informative, and productive experience. Once we have gathered the relevant background and examined you, we will discuss whether treatment is required and explain your best options in care.</p>

      <h2>Our promise to <em>you</em></h2>
      <h3>Accessible</h3>
      <p>A clinic where every woman\\'s health matters, and accessibility is our priority. Same week appointments, two NJ locations, and most major insurance accepted.</p>
      <h3>Respectful</h3>
      <p>Respect is at the heart of every interaction. Your dignity is our utmost concern. Every conversation begins with listening.</p>
      <h3>Dependable</h3>
      <p>Count on us for unwavering support and care. Board certified clinicians with NAMS certification in menopause care and years of experience treating women\\'s health every single day.</p>

      <h2>Insurance and <em>access</em></h2>
      <p>Your peace of mind matters to us. We accept a wide range of insurance plans to make your healthcare more accessible. If you do not see your plan listed or are not sure, please call us and we will help you confirm coverage.</p>
    </div>
    <aside class="article_aside">
      <div class="aside_book">
        <h4>Visit us</h4>
        <p>Two convenient NJ locations, same standard of care.</p>
        <a href="contact.html" class="aside_book_btn">Book a visit <span class="cta_arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></a>
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
</section>

''' + FINAL_CTA

with open(f'{OUT}/about.html', 'w') as f:
    f.write(page('about', "About · Women's Care OB/GYN of NJ", "Personalised OB/GYN care in Paterson and Totowa, NJ. Our practice, our promise, and what to expect on your first visit.", about_body))


# ============ SERVICES PAGE ============
service_cards = ''
for slug in SERVICE_ORDER:
    d = SERVICES[slug]
    service_cards += f'''<a href="{slug}.html" class="svc">
      <span class="svc_tag">{d["tag"]}</span>
      <div class="svc_name">{d["name"]}</div>
      <span class="svc_plus"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg></span>
    </a>'''

# add symptom check
service_cards += '''<a href="symptom-check.html" class="svc">
      <span class="svc_tag">#new</span>
      <div class="svc_name">Menopause Symptom Check</div>
      <span class="svc_plus"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
    </a>'''

services_body = '''
<section class="page_hero">
  <div class="page_hero_inner">
    ''' + crumb([('Home', 'index.html'), ('Services', None)]) + '''
    <span class="page_eyebrow">What we treat</span>
    <h1 class="page_h1">Full range of <em>women\\'s</em> health care.</h1>
    <p class="page_lead">Comprehensive, patient centered OB/GYN care designed around your unique needs. From routine check ups and family planning to specialised care for menopause and pelvic conditions.</p>
    <a href="contact.html" class="page_hero_cta">
      Book a visit
      <span class="cta_arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
    </a>
  </div>
</section>

<section class="all_services">
  <div class="svc_grid">
    ''' + service_cards + '''
  </div>
</section>
''' + FINAL_CTA

with open(f'{OUT}/services.html', 'w') as f:
    f.write(page('services', "Services · Women's Care OB/GYN of NJ", "Full range of women's health services in Paterson and Totowa, NJ. Annual exams, menopause, ultrasound, family planning, and more.", services_body))


# ============ OUR TEAM PAGE ============
prov_cards = ''
for slug in PROVIDER_ORDER:
    d = PROVIDERS[slug]
    alt = f' alt{d["photo_alt"]}' if d.get('photo_alt') else ''
    prov_cards += f'''
    <a href="{slug}.html" class="prov_full">
      <div class="prov_full_photo{alt}">{d['initials']}</div>
      <div class="prov_full_body">
        <div class="prov_full_role">{d['role']}</div>
        <div class="prov_full_name">{d['name']}</div>
        <div class="prov_full_tags">{"".join(f'<span class="tag">{t}</span>' for t in d['tags'][:2])}</div>
        <span class="prov_full_link">View profile <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
      </div>
    </a>'''

team_body = '''
<section class="page_hero">
  <div class="page_hero_inner">
    ''' + crumb([('Home', 'index.html'), ('Providers', None)]) + '''
    <span class="page_eyebrow">Meet your providers</span>
    <h1 class="page_h1">Specialists who treat women\\'s health <em>every day</em>.</h1>
    <p class="page_lead">Board certified clinicians who listen, with NAMS certification for menopause care and years of experience across the full spectrum of women\\'s health.</p>
    <a href="contact.html" class="page_hero_cta">
      Book a visit
      <span class="cta_arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
    </a>
  </div>
</section>

<style>
.team_grid { max-width: var(--maxw); margin: 0 auto; padding: 64px clamp(24px, 5vw, 64px) 80px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.prov_full { background: var(--bg_section); border-radius: var(--radius_lg); padding: 28px; display: flex; gap: 24px; align-items: center; transition: transform 0.3s; }
.prov_full:hover { transform: translateY(-4px); }
.prov_full_photo { width: 140px; height: 180px; border-radius: 24px; background: linear-gradient(160deg, var(--rose_soft), #e3a8b6); display: grid; place-items: center; color: white; font-size: 56px; font-weight: 500; letter-spacing: -0.04em; flex-shrink: 0; box-shadow: var(--shadow_md); }
.prov_full_photo.alt2 { background: linear-gradient(160deg, #d6e4f0, #8fb4d4); }
.prov_full_photo.alt3 { background: linear-gradient(160deg, #f6e8d8, #d4b478); }
.prov_full_photo.alt4 { background: linear-gradient(160deg, #e3d4f0, #a489c7); }
.prov_full_body { flex: 1; min-width: 0; }
.prov_full_role { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--ink_soft); font-weight: 500; margin-bottom: 4px; }
.prov_full_name { font-size: clamp(22px, 2.4vw, 30px); font-weight: 500; letter-spacing: -0.025em; margin-bottom: 12px; line-height: 1.1; }
.prov_full_tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.prov_full_tags .tag { padding: 4px 10px; background: white; border-radius: 999px; font-size: 11px; font-weight: 500; color: var(--ink); box-shadow: var(--shadow_sm); }
.prov_full_link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--ink); font-weight: 500; }
@media (max-width: 900px) { .team_grid { grid-template-columns: 1fr; } .prov_full { flex-direction: column; align-items: flex-start; padding: 24px; } .prov_full_photo { width: 100%; height: 200px; } }
</style>

<section class="team_grid">''' + prov_cards + '''</section>
''' + FINAL_CTA

with open(f'{OUT}/our-team.html', 'w') as f:
    f.write(page('our-team', "Our Team · Women's Care OB/GYN of NJ", "Meet the providers at Women's Care OB/GYN of NJ: Dr. Christine Sticco, Ifrah Syed, Gessica Russo, and Rawan Hammoudeh.", team_body))


# ============ CONTACT PAGE ============
contact_body = '''
<section class="page_hero">
  <div class="page_hero_inner">
    ''' + crumb([('Home', 'index.html'), ('Contact', None)]) + '''
    <span class="page_eyebrow">Get in touch</span>
    <h1 class="page_h1"><em>Two</em> locations, one team.</h1>
    <p class="page_lead">Same week appointments at both offices. Now accepting new patients.</p>
  </div>
</section>

<section class="contact_grid">
  <div class="contact_loc">
    <h3>Paterson</h3>
    <p>1044 Main Street, Paterson, NJ 07503</p>
    <div class="contact_loc_meta">
      <a href="https://goo.gl/maps/hHuUioELVX3rzfo5A" target="_blank" rel="noopener">Get directions</a>
      <a href="tel:9737825577">(973) 782 5577</a>
    </div>
  </div>
  <div class="contact_loc">
    <h3>Totowa</h3>
    <p>825 Riverview Drive, Totowa, NJ 07512</p>
    <div class="contact_loc_meta">
      <a href="https://goo.gl/maps/Gq9cmHb4YerfXQpEA" target="_blank" rel="noopener">Get directions</a>
      <a href="tel:9737825577">(973) 782 5577</a>
    </div>
  </div>
</section>

<section class="contact_full">
  <div class="contact_form">
    <h3>Request an appointment</h3>
    <p>Fill out the form and we will get back to you by the end of the next working day. For urgent concerns, please call us at (973) 782 5577.</p>
    <form>
      <div class="form_row">
        <div class="form_field">
          <label for="first_name">First name</label>
          <input type="text" id="first_name" name="first_name" autocomplete="given-name" required>
        </div>
        <div class="form_field">
          <label for="last_name">Last name</label>
          <input type="text" id="last_name" name="last_name" autocomplete="family-name" required>
        </div>
      </div>
      <div class="form_row">
        <div class="form_field">
          <label for="phone">Phone</label>
          <input type="tel" id="phone" name="phone" autocomplete="tel" required>
        </div>
        <div class="form_field">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" autocomplete="email" required>
        </div>
      </div>
      <div class="form_row">
        <div class="form_field">
          <label for="location">Preferred location</label>
          <select id="location" name="location">
            <option>Paterson</option>
            <option>Totowa</option>
            <option>No preference</option>
          </select>
        </div>
        <div class="form_field">
          <label for="visit_type">Visit type</label>
          <select id="visit_type" name="visit_type">
            <option>Annual exam</option>
            <option>New patient consultation</option>
            <option>Birth control</option>
            <option>Menopause</option>
            <option>Pelvic ultrasound</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div class="form_field" style="margin-top:8px;">
        <label for="message">Message</label>
        <textarea id="message" name="message" placeholder="Briefly tell us what you would like to discuss"></textarea>
      </div>
      <button type="submit" class="form_btn">
        Send request
        <span class="cta_arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
      </button>
    </form>
  </div>
  <div class="contact_info_col">
    <h3>Visit us</h3>
    <p>Reach us by phone, fax, or by filling out the form. We will respond by the next business day.</p>
    <div class="contact_info_item">
      <span class="contact_info_item_icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.72 2.8a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.35 1.84.59 2.8.72A2 2 0 0122 16.92z"/></svg>
      </span>
      <div>
        <div class="contact_info_item_label">Phone</div>
        <div class="contact_info_item_value"><a href="tel:9737825577">(973) 782 5577</a></div>
      </div>
    </div>
    <div class="contact_info_item">
      <span class="contact_info_item_icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
      </span>
      <div>
        <div class="contact_info_item_label">Fax</div>
        <div class="contact_info_item_value">(888) 498 4106</div>
      </div>
    </div>
    <div class="contact_info_item">
      <span class="contact_info_item_icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      </span>
      <div>
        <div class="contact_info_item_label">Hours</div>
        <div class="contact_info_item_value">Mon to Fri, 9am to 5pm<br>Sat and Sun closed</div>
      </div>
    </div>
    <div class="contact_info_item">
      <span class="contact_info_item_icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </span>
      <div>
        <div class="contact_info_item_label">Languages</div>
        <div class="contact_info_item_value">English &middot; Español</div>
      </div>
    </div>
  </div>
</section>
'''

with open(f'{OUT}/contact.html', 'w') as f:
    f.write(page('contact', "Contact · Women's Care OB/GYN of NJ", "Request an appointment at Women's Care OB/GYN. Two locations in Paterson and Totowa, NJ. Same week appointments.", contact_body))

print("Shell pages generated:")
for p in ['about', 'services', 'our-team', 'contact']:
    print(f"  {p}.html")
