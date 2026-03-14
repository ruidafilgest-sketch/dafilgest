document.addEventListener('DOMContentLoaded',()=>{
  const nav=document.getElementById('nav');
  if(nav) window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>50));
  const pg=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nm a').forEach(a=>{if(a.getAttribute('href')===pg)a.classList.add('active');});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');io.unobserve(e.target);}}),{threshold:.08});
  document.querySelectorAll('.rv').forEach(r=>io.observe(r));
  const mb=document.getElementById('mb'),mob=document.getElementById('mob');
  if(mb&&mob){
    mb.addEventListener('click',()=>{mob.classList.toggle('open');mb.classList.toggle('open');});
    mob.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mob.classList.remove('open');mb.classList.remove('open');}));
  }
});
// ── COOKIES ──
(function() {
  var banner = document.getElementById('cookie-banner');
  if (!banner) return;
  if (localStorage.getItem('dafil_cookies')) {
    banner.classList.add('hidden');
    return;
  }
  banner.classList.remove('hidden');
  document.getElementById('cookie-ok').addEventListener('click', function() {
    localStorage.setItem('dafil_cookies', 'accepted');
    banner.classList.add('hidden');
  });
  document.getElementById('cookie-no').addEventListener('click', function() {
    localStorage.setItem('dafil_cookies', 'rejected');
    banner.classList.add('hidden');
  });
})();
