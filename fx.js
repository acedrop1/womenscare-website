// fx.js — soft shader backgrounds, liquid-glass nav, care bento and the
// connected provider carousel. Vanilla ports of the React components; every
// block is a no-op on pages that don't carry its markup.
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ES = document.documentElement.lang === 'es';

  /* ================================================================
     Shader runner: one fullscreen fragment shader per canvas.
     Renders at reduced resolution (the art is soft anyway), pauses
     off-screen and in background tabs.
     ================================================================ */
  var VERT = 'attribute vec2 a;varying vec2 v_uv;void main(){v_uv=a*.5+.5;gl_Position=vec4(a,0.,1.);}';

  function hex(c) { var n = parseInt(c.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }

  function runShader(canvas, frag, vec3s, opts) {
    opts = opts || {};
    var gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) return false;
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var v = sh(gl.VERTEX_SHADER, VERT), f = sh(gl.FRAGMENT_SHADER, frag);
    if (!v || !f) return false;
    var p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f); gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return false;
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(p, 'u_res'), uTime = gl.getUniformLocation(p, 'u_time');
    Object.keys(vec3s).forEach(function (k) { gl.uniform3fv(gl.getUniformLocation(p, k), hex(vec3s[k])); });

    var scale = opts.scale || 0.5, visible = false, raf = 0, t0 = performance.now() - (opts.offset || 0) * 1000;
    function resize() {
      var w = Math.max(1, Math.round(canvas.clientWidth * scale)), h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h); gl.uniform2f(uRes, w, h);
    }
    function frame(now) {
      raf = 0;
      gl.uniform1f(uTime, reduce ? 4 : (now - t0) / 1000 * (opts.speed || 1));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (visible && !reduce && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    new ResizeObserver(function () { resize(); kick(); }).observe(canvas);
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) kick(); }).observe(canvas);
    document.addEventListener('visibilitychange', kick);
    resize(); kick();
    canvas.classList.add('fx-on');
    return true;
  }

  /* Ashima simplex noise, shared by both shaders */
  var NOISE = [
    'vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 m289(vec4 x){return x-floor(x*(1./289.))*289.;}',
    'vec4 perm(vec4 x){return m289(((x*34.)+1.)*x);}vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}',
    'float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);',
    'vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;',
    'vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;',
    'i=m289(i);vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));',
    'float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);',
    'vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);',
    'vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));',
    'vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);',
    'vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 nm=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));',
    'p0*=nm.x;p1*=nm.y;p2*=nm.z;p3*=nm.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;',
    'return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}'
  ].join('\n');

  /* Gradient wave: layered noise colour bands with a drifting wavy crest
     (fragment-only take on the Stripe-style mesh gradient). */
  var WAVE = 'precision highp float;varying vec2 v_uv;uniform vec2 u_res;uniform float u_time;' +
    'uniform vec3 c0,c1,c2,c3,c4;' + NOISE +
    'float layer(vec2 p,float t,float i){return smoothstep(.1,.63+.07*i,snoise(vec3(p.x*(2.+i*.2)+t*(6.5+.3*i)*.02,p.y*(3.+i*.2),t*(11.+.3*i)*.012+5.+10.*i))*.5+.5);}' +
    'void main(){vec2 p=v_uv;p.x*=u_res.x/u_res.y;float t=u_time;' +
    'vec2 q=p*.55;q.y+=.22*snoise(vec3(q.x*1.4+t*.035,0.,t*.05))+(p.x-.5)*.25;' +
    'vec3 c=c0;c=mix(c,c1,pow(layer(q,t,1.),2.));c=mix(c,c2,pow(layer(q,t,2.),2.));c=mix(c,c3,pow(layer(q,t,3.),2.5));c=mix(c,c4,pow(layer(q,t,4.),3.));' +
    'c+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/255.;' +
    'gl_FragColor=vec4(c,1.);}';

  /* Cloud sky (port of the Aceternity cloud shader), tinted blush. */
  var CLOUDS = 'precision highp float;varying vec2 v_uv;uniform vec2 u_res;uniform float u_time;' +
    'uniform vec3 u_cloud,u_skyTop,u_skyBottom;const mat2 R=mat2(.8,.6,-.6,.8);' +
    'float hash(vec2 p){return fract(sin(dot(p,vec2(41.31,289.17)))*26737.367);}' +
    'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}' +
    'float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=R*p*2.03+19.19;a*=.5;}return s;}' +
    'float bil(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*(1.-abs(2.*vn(p)-1.));p=R*p*2.11+13.37;a*=.5;}return s;}' +
    'float dens(vec2 p,vec2 c,vec2 r,float sd,float t){vec2 q=p-c;float ry=q.y>0.?r.y:r.y*.42;float e=1.-length(vec2(q.x/r.x,q.y/ry));if(e<-.35)return 0.;' +
    'vec2 d=q*(2.4/r.x)+sd;d+=.6*vec2(fbm(d*1.4+t*.04),fbm(d*1.4+7.7-t*.03));return e+(bil(d*1.6)-.62)*.62;}' +
    'vec3 shade(vec3 col,vec3 sky,vec2 p,vec2 c,vec2 r,float sd,float t,float ds){float d=dens(p,c,r,sd,t);if(d<.02)return col;' +
    'float up=dens(p+vec2(0.,r.y*.55),c,r,sd,t);float oc=clamp((up-d)*1.1+d*.55,0.,1.);' +
    'vec3 cc=mix(u_cloud*1.04,mix(u_cloud*.8,sky,.38),oc*.85);float al=smoothstep(.02,.38,d);' +
    'cc+=smoothstep(.02,.14,d)*(1.-smoothstep(.14,.4,d))*.1;cc=mix(cc,sky,ds*.35);al*=mix(1.,.8,ds);return mix(col,cc,al);}' +
    'vec3 pass(vec3 col,vec3 sky,vec2 p,float as,float t,float sp,float ph,float y,vec2 r,float sd,float ds){' +
    'float cx=mix(-r.x-.25,as+r.x+.25,fract(t*sp+ph));return shade(col,sky,p,vec2(cx,y+sin(t*.05+ph*6.2831)*.012),r,sd,t,ds);}' +
    'void main(){float as=u_res.x/u_res.y;vec2 p=vec2(v_uv.x*as,v_uv.y);float t=u_time;' +
    'vec3 sky=mix(u_skyBottom,u_skyTop,v_uv.y);vec3 c=sky;c=mix(c,u_skyBottom*1.03,smoothstep(.35,0.,v_uv.y)*.5);' +
    'float sd=length(p-vec2(as*.78,.92));c+=vec3(1.,.93,.9)*exp(-sd*sd*5.)*.22;' +
    'c=pass(c,sky,p,as,t,.006,.10,.84,vec2(.20,.10),43.7,1.);c=pass(c,sky,p,as,t,.008,.62,.73,vec2(.24,.12),71.3,.85);' +
    'c=pass(c,sky,p,as,t,.011,.33,.60,vec2(.34,.16),17.3,.55);c=pass(c,sky,p,as,t,.013,.80,.47,vec2(.30,.15),29.9,.45);' +
    'c=pass(c,sky,p,as,t,.016,.05,.35,vec2(.46,.20),91.1,.15);c=pass(c,sky,p,as,t,.020,.48,.20,vec2(.56,.24),57.2,0.);' +
    'gl_FragColor=vec4(min(c,vec3(1.)),1.);}';

  var PALETTE = { c0: '#fff6f9', c1: '#fbd3e2', c2: '#e9dcff', c3: '#ffe3d3', c4: '#f7b9d0' };
  var SKY = { u_cloud: '#fffafc', u_skyTop: '#f4c6da', u_skyBottom: '#fdeef4' };

  function canvasIn(host, cls) {
    var c = document.createElement('canvas');
    c.className = 'fx-canvas ' + (cls || '');
    c.setAttribute('aria-hidden', 'true');
    host.insertBefore(c, host.firstChild);
    return c;
  }

  // site-wide soft wave behind every page (replaces the CSS aurora washes)
  var bg = document.getElementById('bg-fx');
  if (bg) runShader(canvasIn(bg, 'fx-bg'), WAVE, PALETTE, { scale: 0.25, speed: 0.6 });
  // hero wave, bento + CTA cloud skies
  document.querySelectorAll('[data-fx="wave"]').forEach(function (h) { runShader(canvasIn(h), WAVE, PALETTE, { scale: 0.4, speed: 0.8 }); });
  document.querySelectorAll('[data-fx="clouds"]').forEach(function (h, i) { runShader(canvasIn(h), CLOUDS, SKY, { scale: 0.4, offset: 40 + i * 37 }); });

  // sliding highlight under the desktop nav links
  var links = document.querySelector('.lp_nav_links');
  if (links) {
    var blob = document.createElement('span');
    blob.className = 'fx-navblob'; blob.setAttribute('aria-hidden', 'true');
    links.appendChild(blob);
    var here = location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
    var active = Array.prototype.find.call(links.querySelectorAll('a'), function (a) {
      return (a.getAttribute('href') || '').replace(/(\.es)?\.html$/, '').replace(/\.es$/, '') === here.replace(/\.es$/, '');
    });
    if (active) active.classList.add('is-here');
    function moveTo(a) {
      if (!a) { blob.style.opacity = 0; return; }
      blob.style.opacity = 1;
      blob.style.width = a.offsetWidth + 'px';
      blob.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    }
    links.querySelectorAll('a').forEach(function (a) { a.addEventListener('mouseenter', function () { moveTo(a); }); a.addEventListener('focus', function () { moveTo(a); }); });
    links.addEventListener('mouseleave', function () { moveTo(active); });
    addEventListener('load', function () { moveTo(active); });
    addEventListener('resize', function () { moveTo(active); });
  }

  /* ================================================================
     Section titles blur-in word by word when they enter the viewport.
     ================================================================ */
  if (!reduce) {
    var titles = document.querySelectorAll('.sec_title, .wh_h2, .fx-split');
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('fx-words-in'); tio.unobserve(e.target); } });
    }, { threshold: 0.3 });
    titles.forEach(function (t) {
      var n = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
              var s = document.createElement('span');
              s.className = 'fx-w'; s.style.setProperty('--i', n++); s.textContent = w;
              frag.appendChild(s);
            });
            c.parentNode.replaceChild(frag, c);
          } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
        });
      })(t);
      t.classList.add('fx-words');
      tio.observe(t);
    });
  }

  /* ================================================================
     Care bento: dot-matrix counters, week gauge, life-stage stream.
     ================================================================ */
  var bento = document.querySelector('.fxb');
  if (bento) {
    var NS = 'http://www.w3.org/2000/svg';
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var el = function (t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
    var tip = document.createElement('div'); tip.className = 'fxb-tip'; document.body.appendChild(tip);
    function showTip(x, y, title, rows) {
      tip.innerHTML = '<div class="t">' + title + '</div>' + rows.map(function (r) { return '<div class="r"><span>' + (r[1] ? '<i style="background:' + r[1] + '"></i>' : '') + r[0] + '</span></div>'; }).join('');
      tip.classList.add('on');
      var b = tip.getBoundingClientRect(), L = x + 16, T = y - b.height - 14;
      if (L + b.width > innerWidth - 8) L = x - b.width - 16;
      if (T < 8) T = y + 16;
      tip.style.left = L + 'px'; tip.style.top = T + 'px';
    }
    function hideTip() { tip.classList.remove('on'); }

    // 5x7 dot-matrix glyphs
    var F = { '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'], '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'], '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'], '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'], '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'], '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'], '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'], '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'], '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'], '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'], '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'], ' ': ['00', '00', '00', '00', '00', '00', '00'] };
    function dotNumber(host, pitch, suffix) {
      var cols = 24, s = el('svg', { 'class': 'fxb-dots', 'aria-hidden': 'true' }, host), cells = [];
      for (var c = 0; c < cols; c++) for (var r = 0; r < 7; r++) {
        var ci = el('circle', { cx: c * pitch + pitch / 2, cy: r * pitch + pitch / 2, r: pitch * 0.36, fill: 'currentColor', opacity: 0 }, s);
        ci.style.transitionDelay = c * 9 + 'ms'; cells.push([c, r, ci]);
      }
      function set(txt) {
        var on = {}, x = 0;
        for (var i = 0; i < txt.length; i++) {
          var g = F[txt[i]] || F[' '], w = g[0].length;
          for (var rr = 0; rr < 7; rr++) for (var k = 0; k < w; k++) if (g[rr][k] === '1') on[(x + k) * 8 + rr] = 1;
          x += w + 1;
        }
        var used = Math.max(1, x - 1);
        cells.forEach(function (cl) { var v = on[cl[0] * 8 + cl[1]]; cl[2].setAttribute('opacity', v ? 1 : (cl[0] < used ? 0.1 : 0)); cl[2].style.transform = v ? 'none' : 'scale(.55)'; });
        s.setAttribute('width', used * pitch); s.setAttribute('height', 7 * pitch); s.setAttribute('viewBox', '0 0 ' + used * pitch + ' ' + 7 * pitch);
      }
      return function count(to, dur) {
        var t0 = performance.now(), last = '';
        (function f(now) {
          var t = reduce ? 1 : Math.min(1, (now - t0) / (dur || 1100)), txt = Math.round(to * ease(t)) + (t === 1 ? suffix || '' : '');
          if (txt !== last) { set(txt); last = txt; }
          if (t < 1) requestAnimationFrame(f);
        })(t0);
      };
    }

    function smooth(P, move) {
      var d = (move === false ? 'L' : 'M') + P[0][0] + ',' + P[0][1];
      for (var i = 0; i < P.length - 1; i++) {
        var p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2, k = 0.17;
        d += 'C' + (p1[0] + (p2[0] - p0[0]) * k) + ',' + (p1[1] + (p2[1] - p0[1]) * k) + ' ' + (p2[0] - (p3[0] - p1[0]) * k) + ',' + (p2[1] - (p3[1] - p1[1]) * k) + ' ' + p2[0] + ',' + p2[1];
      }
      return d;
    }

    // Life-stage stream: how the focus of care shifts with age (illustrative shape)
    var STAGES = JSON.parse(bento.getAttribute('data-stages'));
    var COL = { a: '#ffffff', b: '#ffd3e4', c: '#d9c8ff' };
    var stream = bento.querySelector('.fxb-stream'), grow = 0;
    function drawStream() {
      var W = stream.clientWidth, H = stream.clientHeight, top = 22, bot = 26, mid = top + (H - top - bot) / 2, half = (H - top - bot) / 2;
      var D = STAGES.points, n = D.length, X = function (i) { return -20 + i / (n - 1) * (W + 40); }, g = ease(grow);
      var lay = D.map(function (p) { var q = half * g / (p[0] + p[1] + p[2]) * (0.55 + 0.45 * (p[0] + p[1] + p[2]) / 10); return { a: p[0] * q, ab: (p[0] + p[1]) * q, abc: (p[0] + p[1] + p[2]) * q }; });
      function band(k) {
        var T = D.map(function (p, i) { return [X(i), mid - lay[i][k]]; }), B = D.map(function (p, i) { return [X(i), mid + lay[i][k]]; }).reverse();
        return smooth(T) + smooth(B, false) + 'Z';
      }
      stream.innerHTML = '<defs><linearGradient id="fxbf" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".22" stop-color="#fff" stop-opacity="1"/></linearGradient><mask id="fxbm"><rect width="' + W + '" height="' + H + '" fill="url(#fxbf)"/></mask></defs>' +
        '<g mask="url(#fxbm)"><path d="' + band('abc') + '" fill="' + COL.c + '" opacity=".95"/><path d="' + band('ab') + '" fill="' + COL.b + '"/><path d="' + band('a') + '" fill="' + COL.a + '" opacity=".95"/></g>' +
        STAGES.marks.map(function (m) { return [Math.min(W - 44, Math.max(44, X(m[0]))), m[1]]; })
        // narrow cards: drop a label that would collide with the one before it
        .filter(function (m, k, all) { return !k || m[0] - all[k - 1][0] >= 92; })
        .map(function (m, k) {
          var x = m[0], pw = Math.max(64, m[1].length * 7 + 24);
          return '<g style="opacity:' + (g > 0.6 ? 1 : 0) + ';transition:opacity .4s ' + k * 0.08 + 's"><line x1="' + x + '" x2="' + x + '" y1="' + (top - 4) + '" y2="' + (H - bot + 4) + '" stroke="rgba(74,16,46,.45)" stroke-width="1.5"/>' +
            '<rect x="' + (x - pw / 2) + '" y="' + (H - bot - 8) + '" width="' + pw + '" height="22" rx="11" fill="#4a102e"/><text x="' + x + '" y="' + (H - bot + 7) + '" text-anchor="middle" font-size="11" font-weight="600" fill="#fff">' + m[1] + '</text></g>';
        }).join('') +
        '<line class="hl" y1="' + top + '" y2="' + (H - bot) + '" stroke="#fff" stroke-width="1.5" opacity="0"/><rect class="hit" width="' + W + '" height="' + H + '" fill="transparent"/>';
      var hit = stream.querySelector('.hit'), hl = stream.querySelector('.hl');
      hit.onpointermove = function (e) {
        var r = stream.getBoundingClientRect(), x = e.clientX - r.left, i = Math.max(0, Math.min(n - 1, Math.round((x + 20) / (W + 40) * (n - 1))));
        hl.setAttribute('x1', X(i)); hl.setAttribute('x2', X(i)); hl.setAttribute('opacity', 1);
        var s = STAGES.tips[i];
        showTip(r.left + X(i), r.top + mid - lay[i].abc, s[0], s.slice(1).map(function (t, j) { return [t, [COL.a, COL.b, COL.c][j]]; }).filter(function (row) { return row[0] !== '—'; }));
      };
      hit.onpointerleave = function () { hl.setAttribute('opacity', 0); hideTip(); };
    }

    // Mon–Fri week gauge
    function drawGauge() {
      var g = bento.querySelector('.fxb-gauge'), days = JSON.parse(g.getAttribute('data-days')), n = 60, s = '';
      var tones = ['#f7a8c6', '#c9b5ff', '#ffc7a8', '#a8d8f0', '#f9d77e'];
      for (var i = 0; i <= n; i++) {
        var f = i / n, a = (180 + f * 180) * Math.PI / 180, d = Math.min(4, Math.floor(f * 5));
        var x1 = 136 * Math.cos(a), y1 = 136 * Math.sin(a), r2 = i % 12 === 0 ? 110 : 118, x2 = r2 * Math.cos(a), y2 = r2 * Math.sin(a);
        s += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + tones[d] + '" stroke-width="3.2" stroke-linecap="round" style="opacity:0;animation:fxbtk .4s ' + (reduce ? 0 : i * 12) + 'ms forwards"/>';
      }
      days.forEach(function (d, k) {
        var a = (180 + (k + 0.5) / 5 * 180) * Math.PI / 180;
        s += '<text x="' + (96 * Math.cos(a)).toFixed(1) + '" y="' + (96 * Math.sin(a) + 4).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="600" fill="rgba(255,255,255,.7)">' + d + '</text>';
      });
      s += '<text y="-26" text-anchor="middle" font-weight="300" font-size="44" fill="#fff" letter-spacing="-2">9–5</text><text y="-4" text-anchor="middle" font-size="12" font-weight="500" fill="rgba(255,255,255,.6)">' + g.getAttribute('data-cap') + '</text>';
      g.innerHTML = s;
    }

    function tickBar(svgEl, frac, on) {
      var W = svgEl.getBoundingClientRect().width || 220, n = 36, s = '';
      for (var i = 0; i < n; i++) {
        var x = 1 + i * (W - 2) / (n - 1), lit = i / (n - 1) <= frac;
        s += '<line x1="' + x + '" x2="' + x + '" y1="' + (i % 6 === 0 ? 0 : 6) + '" y2="18" stroke="' + (lit ? on : 'rgba(74,16,46,.18)') + '" stroke-width="1.6" stroke-linecap="round" style="opacity:0;animation:fxbtk .3s ' + (reduce ? 0 : 200 + i * 14) + 'ms forwards"/>';
      }
      svgEl.innerHTML = s;
    }

    var counters = [];
    bento.querySelectorAll('[data-count]').forEach(function (h) { counters.push([dotNumber(h, +h.getAttribute('data-pitch') || 6, h.getAttribute('data-suffix')), +h.getAttribute('data-count')]); });

    function start() {
      bento.classList.add('in');
      bento.querySelectorAll('.fxb-card').forEach(function (c, i) { c.style.transitionDelay = i * 70 + 'ms'; });
      counters.forEach(function (c) { c[0](c[1]); });
      drawGauge();
      bento.querySelectorAll('.fxb-ticks').forEach(function (t) { tickBar(t, +t.getAttribute('data-frac'), t.getAttribute('data-on')); });
      var t0 = performance.now();
      (function f(now) { grow = reduce ? 1 : Math.min(1, (now - t0) / 1300); drawStream(); if (grow < 1) requestAnimationFrame(f); })(t0);
    }
    new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { o.disconnect(); start(); } }, { threshold: 0.08 }).observe(bento);
    var rz; new ResizeObserver(function () { clearTimeout(rz); rz = setTimeout(function () { if (grow) drawStream(); }, 120); }).observe(stream);
  }

  /* ================================================================
     Connected carousel (port of CalendlyCarousel) for the providers.
     ================================================================ */
  var cc = document.querySelector('.cc');
  if (cc) {
    var items = Array.prototype.map.call(cc.querySelectorAll('template.cc-item'), function (t) { return t; });
    var total = items.length, page = 0, stage = cc.querySelector('.cc-stage'), tabs = cc.querySelector('.cc-tabs');
    var cards = new Map(), tier = '', vw = innerWidth, INTERVAL = 6000, elapsed = 0, last = null, paused = false, inView = false;
    var NOTCH = '<svg viewBox="0 0 20 37.3338" preserveAspectRatio="none"><path d="M0 0C0 0 1.2422 13.5759 10 13.5759C18.7578 13.5759 20 0 20 0V37.3338C20 37.3338 18.7578 23.7578 10 23.7578C1.2422 23.7578 0 37.3338 0 37.3338V0Z"/></svg>';
    var mod = function (n) { return ((n % total) + total) % total; };

    // desktop shows two providers side by side; tablet/mobile show one
    var PEEK = 96, GAP = 18, MID = 22;
    function slotW() { return Math.min(620, (cc.clientWidth - 2 * (PEEK + GAP) - MID - 8) / 2); }
    function dims() { return { desktop: { w: slotW(), h: 470 }, tablet: { w: 560, h: 440 }, mobile: { w: Math.min(340, vw - 56), h: 520 } }[tier]; }
    function isActive(off) { return off === 0 || (tier === 'desktop' && off === 1); }
    function variant(off) {
      var A = dims(), hid = Math.abs(off) > 1;
      if (tier === 'desktop') {
        var L = -A.w - MID / 2;
        if (off === 0) return { x: L, y: -A.h / 2, w: A.w, h: A.h, o: 1 };
        if (off === 1) return { x: MID / 2, y: -A.h / 2, w: A.w, h: A.h, o: 1 };
        if (off === -1) return { x: L - GAP - PEEK, y: -170, w: PEEK, h: 340, o: 1 };
        if (off === 2) return { x: MID / 2 + A.w + GAP, y: -170, w: PEEK, h: 340, o: 1 };
        return { x: off < 0 ? L - GAP - PEEK - 240 : MID / 2 + A.w + GAP + 240, y: -102, w: 74, h: 205, o: 0 };
      }
      if (off === 0) return { x: -A.w / 2, y: -A.h / 2, w: A.w, h: A.h, o: 1 };
      if (tier === 'mobile') {
        var pw = 60, ph = 440, gap = 16;
        if (hid) return { x: off < 0 ? -A.w / 2 - 220 : A.w / 2 + 220, y: -ph / 2, w: pw, h: ph, o: 0 };
        return { x: off < 0 ? -A.w / 2 - gap - pw : A.w / 2 + gap, y: -ph / 2, w: pw, h: ph, o: 1 };
      }
      if (tier === 'tablet') {
        if (hid) return { x: off < 0 ? -A.w / 2 - 240 : A.w / 2 + 240, y: -102, w: 74, h: 205, o: 0 };
        return { x: off < 0 ? -A.w / 2 - 18 - 100 : A.w / 2 + 18, y: -170, w: 100, h: 340, o: 1 };
      }
    }
    function apply(card, v) {
      card.style.transform = 'translate(' + v.x + 'px,' + v.y + 'px)';
      card.style.width = v.w + 'px'; card.style.height = v.h + 'px';
      card.style.opacity = v.o; card.style.pointerEvents = v.o ? 'auto' : 'none';
    }
    function make(vi) {
      var card = document.createElement('div');
      card.className = 'cc-card';
      card.innerHTML = '<span class="cc-notch cc-notch-r">' + NOTCH + '</span><span class="cc-notch cc-notch-l">' + NOTCH + '</span><div class="cc-clip"></div>';
      var clip = card.querySelector('.cc-clip');
      clip.appendChild(items[mod(vi)].content.cloneNode(true));
      card.addEventListener('click', function (e) {
        var off = +card.getAttribute('data-offset');
        if (!isActive(off)) { e.preventDefault(); go(page + (off < 0 ? off : tier === 'desktop' ? off - 1 : off)); }
      });
      return card;
    }
    function render() {
      var A = dims(), want = new Set();
      stage.style.height = A.h + 'px';
      for (var off = -3; off <= 3; off++) {
        var vi = page + off, card = cards.get(vi);
        want.add(vi);
        if (!card) {
          card = make(vi); cards.set(vi, card); stage.appendChild(card);
          card.classList.add('cc-instant'); apply(card, variant(off < 0 ? -4 : 4));
          card.offsetWidth; card.classList.remove('cc-instant');
        }
        var on = isActive(off);
        card.setAttribute('data-offset', off);
        card.setAttribute('data-notch', off === -1 ? 'r' : off === (tier === 'desktop' ? 2 : 1) ? 'l' : '');
        card.classList.toggle('is-active', on);
        card.setAttribute('aria-hidden', on ? 'false' : 'true');
        card.querySelectorAll('a').forEach(function (a) { a.tabIndex = on ? 0 : -1; });
        var act = card.querySelector('.cc-active');
        act.style.width = A.w + 'px'; act.style.height = A.h + 'px';
        act.style.setProperty('--away', (off < 0 ? -1 : 1) * 822 + 'px');
        apply(card, variant(off));
      }
      cards.forEach(function (c, vi) { if (!want.has(vi)) { c.remove(); cards.delete(vi); } });
      cc.classList.toggle('is-two', tier === 'desktop');
      var ai = mod(page);
      tabs.querySelectorAll('button').forEach(function (b, i) { b.setAttribute('aria-selected', i === ai); b.tabIndex = i === ai ? 0 : -1; });
    }
    function go(p) { page = p; elapsed = 0; last = null; setProgress(0); render(); }
    function setProgress(f) { var b = tabs.querySelector('[aria-selected="true"] i'); if (b) b.style.transform = 'scaleX(' + f + ')'; }

    tabs.innerHTML = items.map(function (t, i) { return '<button type="button" role="tab" aria-label="' + t.getAttribute('data-label') + '"><i></i></button>'; }).join('');
    tabs.querySelectorAll('button').forEach(function (b, i) {
      b.addEventListener('click', function () {
        var diff = i - mod(page);
        if (diff > total / 2) diff -= total; else if (diff < -total / 2) diff += total;
        go(page + diff);
      });
    });
    cc.querySelector('.cc-prev').addEventListener('click', function () { go(page - 1); });
    cc.querySelector('.cc-next').addEventListener('click', function () { go(page + 1); });
    cc.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(page - 1); else if (e.key === 'ArrowRight') go(page + 1); });
    cc.addEventListener('mouseenter', function () { paused = true; });
    cc.addEventListener('mouseleave', function () { paused = false; last = null; });
    cc.addEventListener('focusin', function () { paused = true; });
    cc.addEventListener('focusout', function () { paused = false; last = null; });
    new IntersectionObserver(function (e) { inView = e[0].isIntersecting; last = null; }).observe(cc);
    // swipe: a horizontal drag of 40px+ steps the carousel
    var sx = null, sy = 0;
    stage.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { sx = e.clientX; sy = e.clientY; } });
    stage.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(page + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener('pointercancel', function () { sx = null; });

    function setTier() {
      vw = innerWidth;
      var t = vw < 768 ? 'mobile' : cc.clientWidth < 1000 ? 'tablet' : 'desktop';
      if (t !== tier) { tier = t; cards.forEach(function (c) { c.remove(); }); cards.clear(); }
      render();
    }
    addEventListener('resize', setTier);
    setTier();

    if (!reduce) (function step(now) {
      if (paused || !inView || document.hidden) last = null;
      else {
        if (last !== null) elapsed += now - last;
        last = now;
        if (elapsed >= INTERVAL) go(page + 1); else setProgress(elapsed / INTERVAL);
      }
      requestAnimationFrame(step);
    })(performance.now());
  }

  /* ================================================================
     Mobile menu: stagger index, current page, office hours line.
     ================================================================ */
  var menuPanel = document.querySelector('.mobile_menu_panel');
  if (menuPanel) {
    var page0 = location.pathname.split('/').pop() || 'index.html';
    menuPanel.querySelectorAll('.mobile_link').forEach(function (a, i) {
      a.style.setProperty('--i', i);
      if (a.getAttribute('href') === page0) a.classList.add('is-here');
    });
    // anchor the popover under the hamburger and grow it out of the button
    var burger = document.getElementById('menuBtn'), menu = document.getElementById('mobileMenu');
    function anchor() {
      if (!burger) return;
      var r = burger.getBoundingClientRect(), top = Math.round(r.bottom + 10);
      menuPanel.style.setProperty('--mt', top + 'px');
      menuPanel.style.setProperty('--ox', Math.round(r.left + r.width / 2 - 10) + 'px');
      menuPanel.style.setProperty('--oy', Math.round(r.top + r.height / 2 - top) + 'px');
    }
    if (menu) new MutationObserver(function () { if (menu.classList.contains('open')) anchor(); }).observe(menu, { attributes: true, attributeFilter: ['class'] });
    addEventListener('resize', anchor);
    anchor();
    var hours = document.querySelector('.top_bar_hours');
    if (hours && !menuPanel.querySelector('.fx-menu-meta')) {
      var meta = document.createElement('p');
      meta.className = 'fx-menu-meta';
      meta.textContent = hours.textContent.replace(/\s+/g, ' ').trim();
      menuPanel.appendChild(meta);
    }
  }

  /* ================================================================
     Mobile swipe rows: focus the centred item and show dots.
     ================================================================ */
  function swipeRow(row, items, onFocus) {
    row.classList.add('fx-swipe');
    var dots = document.createElement('div');
    dots.className = 'fx-dots'; dots.setAttribute('aria-hidden', 'true');
    dots.innerHTML = items.map(function () { return '<i></i>'; }).join('');
    row.parentNode.insertBefore(dots, row.nextSibling);
    var ticking = false;
    function focus() {
      ticking = false;
      if (row.scrollWidth <= row.clientWidth + 4) return;
      var mid = row.getBoundingClientRect().left + row.clientWidth / 2, best = 0, bd = Infinity;
      items.forEach(function (it, i) { var r = it.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = i; } });
      dots.querySelectorAll('i').forEach(function (d, i) { d.classList.toggle('on', i === best); });
      if (onFocus) onFocus(best);
    }
    row.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(focus); } }, { passive: true });
    addEventListener('resize', focus);
    setTimeout(focus, 300);
  }
  var bentoGrid = document.querySelector('.fxb-grid');
  if (bentoGrid) swipeRow(bentoGrid, [].slice.call(bentoGrid.children));
  var organList = document.querySelector('.fx3d_list');
  if (organList) organList.classList.add('fx-swipe');
  var locs = document.querySelector('body.home .locs');
  if (locs) swipeRow(locs, [].slice.call(locs.children));

  /* ================================================================
     World of care: on mobile, a centre-snapping swipe row that
     highlights the focused card (desktop shows all five).
     ================================================================ */
  var wh = document.querySelector('body.home .wh_cards');
  if (wh) {
    var whCards = [].slice.call(wh.querySelectorAll('.wh_card')), desk = matchMedia('(min-width: 769px)');
    swipeRow(wh, whCards, function (i) {
      whCards.forEach(function (c, k) { c.classList.toggle('is-on', !desk.matches && k === i); });
    });
  }
})();
