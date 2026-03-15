
document.addEventListener('DOMContentLoaded', () => {
  // Navbar
  const nav = document.getElementById('nav');
  if (nav) {
    const update = () => nav.classList.toggle('solid', scrollY > 60);
    update(); window.addEventListener('scroll', update);
  }
  // Active link
  const pg = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nm a').forEach(a => {
    if (a.getAttribute('href') === pg) a.classList.add('active');
  });
  // Reveal on scroll
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
  }), { threshold: .07 });
  document.querySelectorAll('.rv').forEach(r => io.observe(r));
  // Mobile menu
  const mb = document.getElementById('mb'), mob = document.getElementById('mob');
  if (mb && mob) {
    mb.addEventListener('click', () => { mob.classList.toggle('open'); mb.classList.toggle('open'); });
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mob.classList.remove('open'); mb.classList.remove('open');
    }));
  }
  // Cookies
  const ck = document.getElementById('ck');
  if (ck) {
    if (localStorage.getItem('dfcok')) { ck.classList.add('gone'); }
    const accept = (v) => { localStorage.setItem('dfcok', v); ck.classList.add('gone'); };
    const ok = document.getElementById('ckok'), no = document.getElementById('ckno');
    if (ok) ok.addEventListener('click', () => accept('y'));
    if (no) no.addEventListener('click', () => accept('n'));
  }
  // Counter animation
  document.querySelectorAll('.count').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const isInt = Number.isInteger(target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    let start = null;
    const dur = 1800;
    const io2 = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io2.unobserve(el);
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        const val = ease * target;
        el.textContent = prefix + (isInt ? Math.round(val) : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: .5 });
    io2.observe(el);
  });
});
