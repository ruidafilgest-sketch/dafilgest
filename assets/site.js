/* Dafilgest — livro digital, efeitos, prazos ao vivo, mapa e formulário (sem cookies, sem rastreio) */
(function(){
  'use strict';
  var EMAIL='geral.dafilgest@gmail.com', FUND=2001, D=document, H=D.documentElement;
  var REDUZ=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINO=window.matchMedia&&matchMedia('(pointer: fine)').matches;
  var PAGINAS=[['index.html','Início'],['sobre.html','Sobre nós'],['servicos.html','Serviços'],['equipa.html','Equipa'],['links.html','Links úteis'],['contacto.html','Contacto']];
  var ss=function(k,v){ try{ if(v===undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k,v); }catch(e){ return null; } };
  var ls=function(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
  var pg=(location.pathname.split('/').pop()||'index.html'); if(pg.indexOf('.html')<0) pg='index.html';
  var pIdx=PAGINAS.findIndex(function(p){ return p[0]===pg; });
  var icon=function(d,s){ return '<svg width="'+(s||18)+'" height="'+(s||18)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>'; };
  var SETA_D='<path d="M5 12h14M13 6l6 6-6 6"/>', SETA_E='<path d="M19 12H5M11 6l-6 6 6 6"/>';

  /* ---------- anos e ano corrente ---------- */
  var ano=new Date().getFullYear(), anos=Math.max(ano-FUND,1);
  D.querySelectorAll('[data-ano]').forEach(function(el){ el.textContent=ano; });
  D.querySelectorAll('[data-anos]').forEach(function(el){ el.setAttribute('data-count',anos); el.textContent=anos; });
  function conta(el){
    if(el._feito) return; el._feito=1;
    var alvo=parseInt(el.getAttribute('data-count'),10)||0; if(REDUZ||alvo<2){ el.textContent=alvo; return; }
    var t0=null, dur=1700;
    (function passo(t){ if(!t0) t0=t; var p=Math.min((t-t0)/dur,1), e=1-Math.pow(1-p,3); el.textContent=Math.round(alvo*e); if(p<1) requestAnimationFrame(passo); })(performance.now());
    el.textContent='0';
  }

  /* ---------- cabeçalho, menu e tema ---------- */
  var hd=D.querySelector('.hd'), mb=hd&&hd.querySelector('.mb');
  function fechaMenu(){ if(hd){ hd.classList.remove('open'); if(mb){ mb.setAttribute('aria-expanded','false'); mb.setAttribute('aria-label','Abrir menu'); } } }
  if(mb) mb.addEventListener('click',function(){ var o=hd.classList.toggle('open'); mb.setAttribute('aria-expanded',o?'true':'false'); mb.setAttribute('aria-label',o?'Fechar menu':'Abrir menu'); });
  D.addEventListener('keydown',function(e){ if(e.key==='Escape') fechaMenu(); });
  D.querySelectorAll('.nav a[data-p]').forEach(function(a){ if(a.getAttribute('data-p')===pg){ a.classList.add('on'); a.setAttribute('aria-current','page'); } });
  var bTema=D.querySelector('.tema');
  function escuroAtivo(){ return H.getAttribute('data-theme')==='dark'; }
  if(bTema) bTema.addEventListener('click',function(){ var n=escuroAtivo()?'light':'dark'; H.setAttribute('data-theme',n); ls('dfg-tema',n); bTema.setAttribute('aria-pressed',n==='dark'?'true':'false'); tomCabecalho(); });
  if(bTema) bTema.setAttribute('aria-pressed',escuroAtivo()?'true':'false');

  /* ---------- livro digital ---------- */
  var folhas=[].slice.call(D.querySelectorAll('.folha')), idx=0, ocupado=false, book=folhas.length>1;
  var DUR=REDUZ?520:960;
  function folhaAtual(){ return folhas[idx]; }
  function tomCabecalho(){
    if(!hd) return; var f=book?folhaAtual():null;
    var claro=f?(f.getAttribute('data-tone')!=='dark'&&!escuroAtivo()):false;
    var desceu=f?f.scrollTop>12:window.scrollY>12;
    if(!book){ claro=desceu&&!escuroAtivo(); }
    hd.classList.toggle('claro',claro);
    hd.classList.toggle('escuro',!claro&&desceu);
  }
  function revela(f){
    f.querySelectorAll('.rv').forEach(function(el){ el.classList.add('in'); });
    f.querySelectorAll('[data-count]').forEach(conta);
    if(f.querySelector('.mapa')) setTimeout(function(){ Mapa.voar(false); }, REDUZ?0:500);
    if(f.querySelector('#pzLista')) Prazos.render();
  }
  function idxDeHash(){ return idxDe(decodeURIComponent(location.hash.slice(1))); }
  function rolaPara(h){ if(!h) return; var el=D.getElementById(h); if(!el) return; var f=el.closest('.folha'); if(!f||f.id===h) return; setTimeout(function(){ var r=el.getBoundingClientRect(), rf=f.getBoundingClientRect(); f.scrollTo({top:f.scrollTop+r.top-rf.top-100,behavior:REDUZ?'auto':'smooth'}); }, ocupado?DUR+50:60); }
  function idxDe(h){
    if(!h) return 0;
    if(h==='fim') return folhas.length-1;
    for(var i=0;i<folhas.length;i++){ if(folhas[i].id===h||folhas[i].querySelector('[id="'+h+'"]')) return i; }
    return 0;
  }
  var bnav, bPrev, bNext, ctEl, dotsEl;
  function atualizaNav(){
    if(!bnav) return;
    var ult=idx===folhas.length-1, prim=idx===0;
    ctEl.textContent=String(idx+1).padStart(2,'0')+' / '+String(folhas.length).padStart(2,'0');
    [].forEach.call(dotsEl.children,function(b,i){ b.classList.toggle('on',i===idx); b.setAttribute('aria-current',i===idx?'true':'false'); });
    bPrev.disabled=prim&&pIdx<=0;
    var lbl='Seguinte';
    if(ult){ lbl=pIdx>=0&&pIdx<PAGINAS.length-1?PAGINAS[pIdx+1][1]:'Voltar ao início'; }
    bNext.innerHTML='<b>'+lbl+'</b>'+icon(SETA_D,17);
    bNext.setAttribute('aria-label',ult?'Ir para: '+lbl:'Folha seguinte');
    H.classList.toggle('ultima',ult);
  }
  function mostra(i,dir){
    if(ocupado||i===idx||i<0||i>=folhas.length) return;
    ocupado=true; fechaMenu();
    var cur=folhas[idx], nxt=folhas[i];
    nxt.scrollTop=0;
    if(dir>0){ nxt.classList.add('sob'); cur.classList.add('sai'); }
    else { nxt.classList.add('entra'); }
    revela(nxt);
    idx=i; atualizaNav();
    try{ history.replaceState(null,'',nxt.id?'#'+nxt.id:location.pathname); }catch(e){}
    setTimeout(function(){
      cur.classList.remove('on','sai','sob','entra'); nxt.classList.remove('sob','entra'); nxt.classList.add('on');
      ocupado=false; tomCabecalho();
      var foco=nxt.querySelector('h1,h2'); if(foco){ foco.setAttribute('tabindex','-1'); try{ foco.focus({preventScroll:true}); }catch(e){} }
    },DUR);
    setTimeout(tomCabecalho,DUR*0.5);
  }
  function irPagina(url,efeito){
    if(efeito===false||REDUZ&&!book){ location.href=url; return; }
    ss('dfg-chega','1'); fechaMenu();
    H.classList.add('saindo');
    setTimeout(function(){ location.href=url; }, REDUZ?380:700);
  }
  function seguinte(){
    if(idx<folhas.length-1) return mostra(idx+1,1);
    var n=pIdx>=0&&pIdx<PAGINAS.length-1?PAGINAS[pIdx+1][0]:PAGINAS[0][0]; irPagina(n);
  }
  function anterior(){
    if(idx>0) return mostra(idx-1,-1);
    if(pIdx>0) irPagina(PAGINAS[pIdx-1][0]+'#fim');
  }
  function podeRolar(f,d){ return d>0? f.scrollTop+f.clientHeight<f.scrollHeight-2 : f.scrollTop>2; }

  if(book){
    H.classList.add('book'); if(REDUZ) H.classList.add('fade');
    var livro=D.querySelector('.livro');
    idx=idxDeHash();
    folhas[idx].classList.add('on');
    folhas.forEach(function(f){ f.addEventListener('scroll',function(){ if(f===folhaAtual()) tomCabecalho(); },{passive:true}); });
    /* barra de navegação */
    bnav=D.createElement('nav'); bnav.className='bnav'; bnav.setAttribute('aria-label','Folhear');
    bPrev=D.createElement('button'); bPrev.type='button'; bPrev.setAttribute('aria-label','Folha anterior'); bPrev.innerHTML=icon(SETA_E,18);
    dotsEl=D.createElement('div'); dotsEl.className='dots';
    folhas.forEach(function(f,i){ var b=D.createElement('button'); b.type='button'; var t=f.getAttribute('data-titulo')||('Folha '+(i+1)); b.setAttribute('aria-label',t); b.innerHTML='<span>'+t+'</span>'; b.addEventListener('click',function(){ mostra(i,i>idx?1:-1); }); dotsEl.appendChild(b); });
    ctEl=D.createElement('span'); ctEl.className='ct';
    bNext=D.createElement('button'); bNext.type='button'; bNext.className='nx';
    bPrev.addEventListener('click',anterior); bNext.addEventListener('click',seguinte);
    bnav.appendChild(bPrev); bnav.appendChild(dotsEl); bnav.appendChild(ctEl); bnav.appendChild(bNext);
    D.body.appendChild(bnav);
    var canto=D.createElement('button'); canto.type='button'; canto.className='canto'; canto.setAttribute('aria-label','Virar a folha'); canto.innerHTML='<span>VIRAR</span>';
    canto.addEventListener('click',seguinte); D.body.appendChild(canto);
    atualizaNav();
    /* chegada de outra página */
    if(ss('dfg-chega')==='1'){ ss('dfg-chega','0'); if(!REDUZ){ folhas[idx].classList.add('chega'); setTimeout(function(){ folhas[idx]&&folhas[idx].classList.remove('chega'); },1100); } }
    setTimeout(function(){ revela(folhas[idx]); tomCabecalho(); rolaPara(decodeURIComponent(location.hash.slice(1))); }, 60);
    /* teclado */
    D.addEventListener('keydown',function(e){
      var t=e.target, tag=(t&&t.tagName)||''; if(/INPUT|TEXTAREA|SELECT/.test(tag)||t.isContentEditable||e.altKey||e.ctrlKey||e.metaKey) return;
      var f=folhaAtual(), k=e.key;
      if(k==='ArrowRight'||k==='PageDown'&&!podeRolar(f,1)){ e.preventDefault(); seguinte(); }
      else if(k==='ArrowLeft'||k==='PageUp'&&!podeRolar(f,-1)){ e.preventDefault(); anterior(); }
      else if((k==='ArrowDown'||k===' ')&&!podeRolar(f,1)&&tag!=='BUTTON'&&tag!=='A'){ e.preventDefault(); seguinte(); }
      else if(k==='ArrowUp'&&!podeRolar(f,-1)){ e.preventDefault(); anterior(); }
      else if(k==='Home'&&!e.shiftKey){ e.preventDefault(); mostra(0,-1); }
      else if(k==='End'&&!e.shiftKey){ e.preventDefault(); mostra(folhas.length-1,1); }
    });
    /* roda do rato / trackpad: só vira quando a folha já não tem mais para rolar */
    var acc=0, ult=0, preso=false;
    window.addEventListener('wheel',function(e){
      var agora=Date.now(), gap=agora-ult; ult=agora;
      if(e.ctrlKey) return;
      if(e.target&&e.target.closest&&e.target.closest('.mapa')) return;
      var f=folhaAtual(), d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
      if(preso){ if(gap>260&&!ocupado) preso=false; else return; }
      if(ocupado) return;
      if(Math.abs(e.deltaY)>=Math.abs(e.deltaX)&&podeRolar(f,d>0?1:-1)){ acc=0; return; }
      if(gap>260) acc=0;
      acc+=d;
      if(Math.abs(acc)>60){ preso=true; var dir=acc>0; acc=0; dir?seguinte():anterior(); }
    },{passive:true});
    /* toque: deslizar para o lado (ou para cima/baixo no fim da folha) */
    var tx=0, ty=0, tFim=false, tIni=false, tOk=false;
    D.addEventListener('touchstart',function(e){ if(e.touches.length!==1){ tOk=false; return; } var p=e.touches[0]; tx=p.clientX; ty=p.clientY; var f=folhaAtual(); tFim=!podeRolar(f,1); tIni=!podeRolar(f,-1); tOk=!(e.target.closest&&e.target.closest('input,textarea,select,.mapa')); },{passive:true});
    D.addEventListener('touchend',function(e){
      if(!tOk) return; var p=e.changedTouches[0], dx=p.clientX-tx, dy=p.clientY-ty;
      if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.4){ dx<0?seguinte():anterior(); }
      else if(dy<-80&&tFim&&Math.abs(dy)>Math.abs(dx)*1.5){ seguinte(); }
      else if(dy>90&&tIni&&Math.abs(dy)>Math.abs(dx)*1.5&&folhaAtual().scrollTop<=0){ anterior(); }
    },{passive:true});
    /* dica (uma vez por visita) */
    if(ss('dfg-dica')!=='1'){ ss('dfg-dica','1'); setTimeout(function(){ var d=D.createElement('div'); d.className='dica'; d.textContent=('ontouchstart' in window)?'Deslize para o lado para folhear':'Use as setas, a roda do rato ou o canto da folha para folhear'; D.body.appendChild(d); setTimeout(function(){ d.remove(); },6200); }, ss('dfg-intro')==='1'?1800:3600); }
  } else {
    D.querySelectorAll('.rv').forEach(function(el){ el.classList.add('in'); });
    window.addEventListener('scroll',tomCabecalho,{passive:true}); tomCabecalho();
  }

  /* ligações internas: virar a página em vez de saltar */
  D.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]'); if(!a||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||a.target==='_blank') return;
    var href=a.getAttribute('href'); if(!href||/^(mailto:|tel:|https?:|#$)/i.test(href)) return;
    var partes=href.split('#'), dest=partes[0]||pg, hash=partes[1];
    if(dest===pg&&book){ e.preventDefault(); fechaMenu(); if(hash){ var i=idxDe(hash); if(i!==idx) mostra(i,i>idx?1:-1); rolaPara(hash); } else if(idx!==0) mostra(0,-1); return; }
    if(/\.html$/.test(dest)&&book){ e.preventDefault(); irPagina(href); }
  });
  window.addEventListener('hashchange',function(){ if(!book) return; var i=idxDeHash(); if(i!==idx) mostra(i,i>idx?1:-1); rolaPara(decodeURIComponent(location.hash.slice(1))); });
  window.addEventListener('pageshow',function(e){ if(e.persisted){ H.classList.remove('saindo'); } });

  /* ---------- entrada cinematográfica (uma vez por visita) ---------- */
  if(!REDUZ&&ss('dfg-intro')!=='1'&&book){
    ss('dfg-intro','1');
    var it=D.createElement('div'); it.id='intro'; it.setAttribute('aria-hidden','true');
    it.innerHTML='<div class="p1"></div><div class="p2"></div><div class="c"><svg class="lgv" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256.9 102" width="256.9" height="102"><defs><linearGradient id="iwa" x1="4" y1="4" x2="16" y2="26" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E4EAEE"/></linearGradient><linearGradient id="iwb" x1="4" y1="23" x2="30" y2="53" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F4F7F9"/><stop offset="1" stop-color="#C9D3DA"/></linearGradient><linearGradient id="iwc" x1="4" y1="41" x2="16" y2="97" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E9EEF2"/><stop offset="1" stop-color="#B9C5CE"/></linearGradient><linearGradient id="iwd" x1="20" y1="13" x2="44" y2="87" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2DCDF2"/><stop offset=".5" stop-color="#0E9AD0"/><stop offset="1" stop-color="#0A65A3"/></linearGradient><linearGradient id="iwt" x1="160.0" y1="0" x2="253.9" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1495CB"/><stop offset="1" stop-color="#16B9EC"/></linearGradient></defs><path d="M4 4.00L16 10.72L16 25.72L4 19.00Z" fill="url(#iwa)"/><path d="M4 22.60L30.5 37.44L30.5 52.44L4 37.60Z" fill="url(#iwb)"/><path d="M4 41.2L16 47.92L16 90.28L4 97Z" fill="url(#iwc)"/><path d="M19.6 12.8L46.4 27.8C52.6 31.3 57.6 38.6 57.6 50C57.6 61.4 52.6 68.7 46.4 72.2L19.6 87.2L19.6 71.2L40.6 59.4C43.2 57.9 44.8 54.6 44.8 50C44.8 45.4 43.2 42.1 40.6 40.6L19.6 28.8Z" fill="url(#iwd)"/><g fill="#FFFFFF"><path d="M65.5 65.0V35.0H78.61428571428571Q83.5 35.0 87.18571428571428 36.885714285714286Q90.87142857142857 38.77142857142857 92.92857142857143 42.114285714285714Q94.9857142857143 45.457142857142856 94.9857142857143 50.0Q94.9857142857143 54.5 92.92857142857143 57.864285714285714Q90.87142857142857 61.22857142857143 87.18571428571428 63.114285714285714Q83.5 65.0 78.61428571428571 65.0ZM71.07142857142857 60.285714285714285H78.35714285714286Q81.7 60.285714285714285 84.18571428571428 59.0Q86.67142857142858 57.714285714285715 88.02142857142857 55.400000000000006Q89.37142857142857 53.08571428571429 89.37142857142857 50.0Q89.37142857142857 46.87142857142857 88.02142857142857 44.57857142857142Q86.67142857142858 42.285714285714285 84.18571428571428 41.0Q81.7 39.714285714285715 78.35714285714286 39.714285714285715H71.07142857142857Z"/><path d="M113.78571428571429 65.0V60.371428571428574L113.4857142857143 59.385714285714286V51.285714285714285Q113.4857142857143 48.92857142857143 112.07142857142858 47.621428571428574Q110.65714285714286 46.31428571428572 107.78571428571429 46.31428571428572Q105.85714285714286 46.31428571428572 103.99285714285715 46.91428571428571Q102.12857142857143 47.51428571428571 100.84285714285716 48.58571428571429L98.74285714285715 44.68571428571428Q100.58571428571429 43.27142857142857 103.1357142857143 42.56428571428572Q105.6857142857143 41.85714285714286 108.42857142857143 41.85714285714286Q113.4 41.85714285714286 116.12142857142858 44.23571428571429Q118.84285714285716 46.614285714285714 118.84285714285716 51.58571428571429V65.0ZM106.58571428571429 65.3Q104.01428571428572 65.3 102.08571428571429 64.42142857142858Q100.15714285714286 63.542857142857144 99.10714285714286 61.97857142857143Q98.05714285714286 60.41428571428571 98.05714285714286 58.44285714285714Q98.05714285714286 56.51428571428571 98.97857142857143 54.971428571428575Q99.9 53.42857142857143 102.0 52.528571428571425Q104.10000000000001 51.628571428571426 107.57142857142858 51.628571428571426H114.21428571428572V55.18571428571428H107.95714285714287Q105.21428571428572 55.18571428571428 104.27142857142857 56.06428571428572Q103.32857142857144 56.94285714285714 103.32857142857144 58.22857142857143Q103.32857142857144 59.68571428571428 104.4857142857143 60.542857142857144Q105.64285714285715 61.4 107.7 61.4Q109.67142857142858 61.4 111.2357142857143 60.5Q112.80000000000001 59.6 113.4857142857143 57.84285714285714L114.3857142857143 61.05714285714286Q113.61428571428573 63.07142857142857 111.62142857142858 64.18571428571428Q109.62857142857143 65.3 106.58571428571429 65.3Z"/><path d="M125.72857142857144 65.0V40.82857142857143Q125.72857142857144 37.22857142857143 127.85000000000002 35.06428571428572Q129.9714285714286 32.9 133.9142857142857 32.9Q135.32857142857145 32.9 136.59285714285716 33.2Q137.85714285714286 33.5 138.71428571428572 34.14285714285714L137.25714285714287 38.17142857142857Q136.65714285714287 37.7 135.8857142857143 37.464285714285715Q135.11428571428573 37.22857142857143 134.3 37.22857142857143Q132.62857142857143 37.22857142857143 131.77142857142857 38.15Q130.9142857142857 39.07142857142857 130.9142857142857 40.91428571428571V43.48571428571428L131.0857142857143 45.885714285714286V65.0ZM121.95714285714287 46.57142857142857V42.285714285714285H137.21428571428572V46.57142857142857Z"/><path d="M140.15714285714287 65.0V42.114285714285714H145.51428571428573V65.0ZM142.8571428571429 38.34285714285714Q141.3571428571429 38.34285714285714 140.39285714285717 37.4Q139.42857142857144 36.457142857142856 139.42857142857144 35.12857142857143Q139.42857142857144 33.75714285714285 140.39285714285717 32.83571428571428Q141.3571428571429 31.91428571428571 142.8571428571429 31.91428571428571Q144.3571428571429 31.91428571428571 145.3214285714286 32.792857142857144Q146.2857142857143 33.67142857142857 146.2857142857143 35.0Q146.2857142857143 36.41428571428571 145.34285714285716 37.378571428571426Q144.40000000000003 38.34285714285714 142.8571428571429 38.34285714285714Z"/><path d="M151.84285714285716 65.0V33.2H157.20000000000002V65.0Z"/></g><g fill="url(#iwt)"><path d="M173.90000000000003 73.61428571428571Q170.72857142857146 73.61428571428571 167.70714285714288 72.77857142857144Q164.6857142857143 71.94285714285715 162.75714285714287 70.35714285714286L165.15714285714287 66.32857142857142Q166.65714285714287 67.57142857142857 168.95000000000002 68.32142857142857Q171.24285714285716 69.07142857142857 173.60000000000002 69.07142857142857Q177.3714285714286 69.07142857142857 179.12857142857143 67.33571428571429Q180.8857142857143 65.6 180.8857142857143 62.128571428571426V58.05714285714286L181.31428571428575 52.871428571428574L181.14285714285717 47.68571428571428V42.114285714285714H186.24285714285716V61.528571428571425Q186.24285714285716 67.74285714285715 183.0714285714286 70.67857142857143Q179.90000000000003 73.61428571428571 173.90000000000003 73.61428571428571ZM173.21428571428572 63.971428571428575Q169.95714285714288 63.971428571428575 167.3214285714286 62.57857142857143Q164.6857142857143 61.18571428571428 163.16428571428574 58.7Q161.64285714285717 56.214285714285715 161.64285714285717 52.871428571428574Q161.64285714285717 49.57142857142857 163.16428571428574 47.08571428571429Q164.6857142857143 44.6 167.3214285714286 43.22857142857143Q169.95714285714288 41.85714285714286 173.21428571428572 41.85714285714286Q176.12857142857143 41.85714285714286 178.44285714285715 43.01428571428572Q180.75714285714287 44.17142857142857 182.15000000000003 46.614285714285714Q183.54285714285717 49.05714285714286 183.54285714285717 52.871428571428574Q183.54285714285717 56.68571428571428 182.15000000000003 59.15Q180.75714285714287 61.614285714285714 178.44285714285715 62.792857142857144Q176.12857142857143 63.971428571428575 173.21428571428572 63.971428571428575ZM174.02857142857144 59.42857142857143Q176.04285714285717 59.42857142857143 177.62857142857143 58.59285714285714Q179.21428571428572 57.75714285714286 180.09285714285716 56.278571428571425Q180.9714285714286 54.8 180.9714285714286 52.871428571428574Q180.9714285714286 50.94285714285714 180.09285714285716 49.46428571428571Q179.21428571428572 47.98571428571428 177.62857142857143 47.192857142857136Q176.04285714285717 46.4 174.02857142857144 46.4Q172.01428571428573 46.4 170.40714285714287 47.192857142857136Q168.8 47.98571428571428 167.92142857142858 49.46428571428571Q167.04285714285717 50.94285714285714 167.04285714285717 52.871428571428574Q167.04285714285717 54.8 167.92142857142858 56.278571428571425Q168.8 57.75714285714286 170.40714285714287 58.59285714285714Q172.01428571428573 59.42857142857143 174.02857142857144 59.42857142857143Z"/><path d="M203.32857142857145 65.3Q199.51428571428573 65.3 196.66428571428574 63.778571428571425Q193.81428571428575 62.25714285714286 192.25000000000003 59.6Q190.6857142857143 56.94285714285714 190.6857142857143 53.55714285714286Q190.6857142857143 50.128571428571426 192.20714285714288 47.49285714285715Q193.72857142857146 44.85714285714286 196.4071428571429 43.35714285714286Q199.08571428571432 41.85714285714286 202.51428571428573 41.85714285714286Q205.8571428571429 41.85714285714286 208.4714285714286 43.31428571428572Q211.08571428571432 44.77142857142857 212.58571428571432 47.42857142857143Q214.08571428571432 50.08571428571429 214.08571428571432 53.68571428571428Q214.08571428571432 54.028571428571425 214.06428571428575 54.457142857142856Q214.04285714285717 54.885714285714286 214.00000000000003 55.27142857142857H194.92857142857144V51.714285714285715H211.17142857142858L209.07142857142858 52.82857142857143Q209.11428571428573 50.85714285714286 208.25714285714287 49.35714285714286Q207.40000000000003 47.85714285714286 205.9214285714286 47.0Q204.44285714285718 46.14285714285714 202.51428571428573 46.14285714285714Q200.54285714285717 46.14285714285714 199.06428571428575 47.0Q197.58571428571432 47.85714285714286 196.75000000000003 49.37857142857143Q195.91428571428574 50.9 195.91428571428574 52.957142857142856V53.81428571428572Q195.91428571428574 55.871428571428574 196.8571428571429 57.457142857142856Q197.8 59.042857142857144 199.51428571428573 59.900000000000006Q201.22857142857146 60.75714285714286 203.45714285714288 60.75714285714286Q205.3857142857143 60.75714285714286 206.92857142857144 60.15714285714286Q208.4714285714286 59.55714285714286 209.67142857142858 58.27142857142857L212.54285714285717 61.57142857142857Q211.00000000000003 63.371428571428574 208.66428571428574 64.33571428571429Q206.32857142857145 65.3 203.32857142857145 65.3Z"/><path d="M225.60000000000002 65.3Q222.72857142857146 65.3 220.09285714285716 64.55Q217.45714285714288 63.8 215.91428571428574 62.72857142857143L217.9714285714286 58.65714285714286Q219.51428571428573 59.642857142857146 221.65714285714287 60.28571428571429Q223.8 60.92857142857143 225.94285714285715 60.92857142857143Q228.4714285714286 60.92857142857143 229.6071428571429 60.24285714285715Q230.74285714285716 59.55714285714286 230.74285714285716 58.4Q230.74285714285716 57.457142857142856 229.9714285714286 56.964285714285715Q229.20000000000002 56.471428571428575 227.95714285714286 56.214285714285715Q226.71428571428572 55.957142857142856 225.19285714285715 55.74285714285714Q223.67142857142858 55.528571428571425 222.15000000000003 55.16428571428571Q220.62857142857146 54.8 219.3857142857143 54.09285714285714Q218.14285714285717 53.385714285714286 217.3714285714286 52.18571428571428Q216.60000000000002 50.98571428571429 216.60000000000002 49.01428571428571Q216.60000000000002 46.82857142857143 217.84285714285716 45.221428571428575Q219.08571428571432 43.614285714285714 221.33571428571432 42.73571428571429Q223.58571428571432 41.85714285714286 226.67142857142858 41.85714285714286Q228.9857142857143 41.85714285714286 231.34285714285716 42.371428571428574Q233.70000000000002 42.885714285714286 235.24285714285716 43.82857142857143L233.1857142857143 47.9Q231.55714285714288 46.91428571428571 229.90714285714287 46.55Q228.25714285714287 46.18571428571428 226.62857142857143 46.18571428571428Q224.1857142857143 46.18571428571428 223.00714285714287 46.91428571428571Q221.82857142857145 47.64285714285714 221.82857142857145 48.75714285714285Q221.82857142857145 49.785714285714285 222.60000000000002 50.3Q223.3714285714286 50.81428571428572 224.61428571428576 51.114285714285714Q225.8571428571429 51.41428571428571 227.37857142857146 51.607142857142854Q228.90000000000003 51.8 230.40000000000003 52.18571428571428Q231.90000000000003 52.57142857142857 233.16428571428574 53.23571428571428Q234.42857142857144 53.9 235.20000000000002 55.099999999999994Q235.9714285714286 56.3 235.9714285714286 58.22857142857143Q235.9714285714286 60.371428571428574 234.70714285714286 61.957142857142856Q233.44285714285715 63.542857142857144 231.12857142857143 64.42142857142858Q228.81428571428575 65.3 225.60000000000002 65.3Z"/><path d="M248.51428571428573 65.3Q244.74285714285716 65.3 242.6857142857143 63.349999999999994Q240.62857142857143 61.4 240.62857142857143 57.58571428571429V37.05714285714286H245.9857142857143V57.457142857142856Q245.9857142857143 59.08571428571429 246.82142857142858 59.98571428571429Q247.65714285714287 60.885714285714286 249.15714285714287 60.885714285714286Q250.95714285714288 60.885714285714286 252.15714285714287 59.94285714285714L253.65714285714287 63.75714285714286Q252.71428571428572 64.52857142857142 251.34285714285716 64.91428571428571Q249.9714285714286 65.3 248.51428571428573 65.3ZM236.85714285714286 46.4V42.114285714285714H252.11428571428573V46.4Z"/></g></svg><div class="ln"></div><div class="tx">Contabilidade · Fiscalidade · Recursos Humanos — desde 2001</div></div>';
    D.body.appendChild(it);
    var abre=function(){ if(it._a) return; it._a=1; it.classList.add('abre'); setTimeout(function(){ it.remove(); },1100); };
    it.addEventListener('click',abre); setTimeout(abre,2300);
  }

  /* ---------- aviso: o site não usa cookies (informativo, uma vez) ---------- */
  if(ls('dfg-aviso')!=='1'){
    setTimeout(function(){
      var av=D.createElement('div'); av.className='aviso'; av.setAttribute('role','dialog'); av.setAttribute('aria-label','Aviso sobre cookies');
      av.innerHTML='<b>Este site não usa cookies.</b><p>Não usamos cookies nem ferramentas de rastreio. Guardamos apenas no seu navegador as preferências que escolher, como o modo noite.</p><div class="ac"><button type="button" class="btn btn-p">Compreendi</button><a href="privacidade.html#cookies">Saber mais</a></div>';
      D.body.appendChild(av);
      av.querySelector('button').addEventListener('click',function(){ ls('dfg-aviso','1'); av.remove(); });
    }, (ss('dfg-intro')==='1'&&!D.getElementById('intro'))?900:3000);
  }

  /* ---------- cartões 3D com reflexo ---------- */
  if(!REDUZ){
    D.querySelectorAll('.tilt').forEach(function(el){
      var raf=0;
      var mexe=function(x,y){ var r=el.getBoundingClientRect(), px=(x-r.left)/r.width, py=(y-r.top)/r.height;
        cancelAnimationFrame(raf); raf=requestAnimationFrame(function(){ el.classList.add('ativo'); el.style.transform='perspective(900px) rotateX('+((.5-py)*9).toFixed(2)+'deg) rotateY('+((px-.5)*11).toFixed(2)+'deg) translateZ(0) scale(1.015)'; el.style.setProperty('--gx',(px*100).toFixed(1)+'%'); el.style.setProperty('--gy',(py*100).toFixed(1)+'%'); }); };
      var solta=function(){ cancelAnimationFrame(raf); el.classList.remove('ativo'); el.style.transform=''; };
      el.addEventListener('pointermove',function(e){ if(e.pointerType==='mouse') mexe(e.clientX,e.clientY); });
      el.addEventListener('pointerleave',solta);
      el.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse'){ mexe(e.clientX,e.clientY); setTimeout(solta,650); } });
    });
  }

  /* ---------- prazos fiscais ao vivo ---------- */
  var MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var MES3=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  var DIAS=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  var Prazos=(function(){
    var cacheFer={};
    function pascoa(y){ var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mes=Math.floor((h+l-7*m+114)/31),dia=((h+l-7*m+114)%31)+1; return new Date(y,mes-1,dia); }
    function feriados(y){
      if(cacheFer[y]) return cacheFer[y];
      var p=pascoa(y), s={}; var add=function(d){ s[d.getMonth()+'-'+d.getDate()]=1; };
      [[0,1],[3,25],[4,1],[5,10],[7,15],[9,5],[10,1],[11,1],[11,8],[11,25]].forEach(function(x){ add(new Date(y,x[0],x[1])); });
      add(new Date(y,p.getMonth(),p.getDate()-2)); add(p); add(new Date(y,p.getMonth(),p.getDate()+60));
      return (cacheFer[y]=s);
    }
    function util(d){ var x=new Date(d); while(x.getDay()===0||x.getDay()===6||feriados(x.getFullYear())[x.getMonth()+'-'+x.getDate()]) x.setDate(x.getDate()+1); return x; }
    function ultimoDia(y,m){ return new Date(y,m+1,0).getDate(); }
    function gerar(reg){
      var hoje=new Date(); hoje.setHours(0,0,0,0);
      var L=[], y0=hoje.getFullYear(), m0=hoje.getMonth();
      var add=function(y,m,d,t,s,cat,ord){ var legal=new Date(y,m,Math.min(d,ultimoDia(y,m))); var ef=util(legal); if(ef>=hoje) L.push({t:t,s:s,cat:cat,legal:legal,ef:ef,o:ord||0}); };
      for(var k=0;k<15;k++){
        var y=y0+Math.floor((m0+k)/12), m=(m0+k)%12;
        var pm=(m+11)%12, pm2=(m+10)%12, ypm=m===0?y-1:y, ypm2=m<2?y-1:y;
        add(y,m,5,'Comunicação das faturas à AT','Faturas emitidas em '+MESES[pm],'fat',1);
        add(y,m,10,'Declaração Mensal de Remunerações (AT)','Salários e retenções de '+MESES[pm],'ret',2);
        add(y,m,10,'Declaração de remunerações à Segurança Social','Remunerações de '+MESES[pm],'ss',3);
        add(y,m,20,'Pagamento das contribuições à Segurança Social','Contribuições de '+MESES[pm]+' de '+ypm,'ss',4);
        add(y,m,20,'Entrega das retenções na fonte (IRS/IRC)','Retenções de '+MESES[pm]+' de '+ypm,'ret',5);
        if(reg==='mensal'){
          add(y,m,20,'Declaração periódica do IVA','Regime mensal · período de '+MESES[pm2]+' de '+ypm2,'iva',6);
          add(y,m,25,'Pagamento do IVA','Regime mensal · período de '+MESES[pm2]+' de '+ypm2,'iva',7);
        } else if(m===1||m===4||m===7||m===10){
          var q={1:4,4:1,7:2,10:3}[m], yq=m===1?y-1:y;
          add(y,m,20,'Declaração periódica do IVA','Regime trimestral · '+q+'.º trimestre de '+yq,'iva',6);
          add(y,m,25,'Pagamento do IVA','Regime trimestral · '+q+'.º trimestre de '+yq,'iva',7);
        }
        if(m===0) add(y,0,31,'Comunicação dos inventários','Inventário a 31 de dezembro de '+(y-1),'anual',8);
        if(m===4) add(y,4,31,'Declaração Modelo 22 (IRC)','Exercício de '+(y-1),'anual',8);
        if(m===5) add(y,5,30,'Fim do prazo do IRS (Modelo 3)','Rendimentos de '+(y-1),'anual',8);
        if(m===6){ add(y,6,15,'IES — Informação Empresarial Simplificada','Exercício de '+(y-1),'anual',8); add(y,6,31,'1.º pagamento por conta (IRC)','Exercício de '+y,'anual',9); }
        if(m===8) add(y,8,30,'2.º pagamento por conta (IRC)','Exercício de '+y,'anual',9);
        if(m===11) add(y,11,15,'3.º pagamento por conta (IRC)','Exercício de '+y,'anual',9);
      }
      L.sort(function(a,b){ return a.ef-b.ef||a.o-b.o; });
      return L;
    }
    var CAT={fat:['iva','Faturação'],iva:['iva','IVA'],ss:['ss','Seg. Social'],ret:['irs','IRS / IRC'],anual:['anual','Anual']};
    function dias(d){ var h=new Date(); h.setHours(0,0,0,0); return Math.round((d-h)/864e5); }
    function quando(d){ var n=dias(d); return n<=0?'termina hoje':n===1?'amanhã':'em '+n+' dias'; }
    function diasUteis(d){ var h=new Date(); h.setHours(0,0,0,0); var n=0, x=new Date(h); while(x<d){ x.setDate(x.getDate()+1); if(x.getDay()%6!==0&&!feriados(x.getFullYear())[x.getMonth()+'-'+x.getDate()]) n++; } return n; }
    function dataLonga(d){ return DIAS[d.getDay()]+', '+d.getDate()+' de '+MESES[d.getMonth()]+' de '+d.getFullYear(); }
    var reg=ls('dfg-iva')||'mensal', timer=0, alvo=null;
    function tick(){
      if(!alvo) return; var fim=new Date(alvo); fim.setHours(23,59,59,999); var ms=Math.max(0,fim-new Date());
      var d=Math.floor(ms/864e5), h=Math.floor(ms%864e5/36e5), m=Math.floor(ms%36e5/6e4), s=Math.floor(ms%6e4/1e3);
      var el=D.getElementById('pzCd'); if(!el) return;
      var v=[d,h,m,s]; [].forEach.call(el.querySelectorAll('b'),function(b,i){ var t=String(v[i]).padStart(2,'0'); if(b.textContent!==t) b.textContent=t; });
    }
    function render(){
      var lista=D.getElementById('pzLista'), heroEl=D.getElementById('pzHero'), mini=D.getElementById('pzMini');
      var L=gerar(reg);
      if(mini){
        var M=gerar('mensal').slice(0,4); var hj=new Date();
        var cab=mini.querySelector('.pt small'); if(cab) cab.textContent=DIAS[hj.getDay()].replace('-feira','')+', '+hj.getDate()+' '+MES3[hj.getMonth()];
        mini.querySelectorAll('.row').forEach(function(r){ r.remove(); });
        var ref=mini.querySelector('.kpis');
        M.forEach(function(it){ var r=D.createElement('div'); r.className='row'; var n=dias(it.ef); var c=n<=0?'am':n<=3?'am':'az';
          r.innerHTML='<span>'+it.t+'</span><time datetime="'+it.ef.toISOString().slice(0,10)+'">'+it.ef.getDate()+' '+MES3[it.ef.getMonth()]+'</time><em class="tg '+c+'">'+quando(it.ef)+'</em>';
          mini.insertBefore(r,ref); });
      }
      if(heroEl&&L.length){
        var p=L[0], mesmo=L.filter(function(x){ return +x.ef===+p.ef; });
        alvo=p.ef;
        heroEl.querySelector('h3').textContent=p.t;
        heroEl.querySelector('.dt').textContent='Até '+dataLonga(p.ef)+(+p.ef!==+p.legal?' (prazo legal a '+p.legal.getDate()+' '+MES3[p.legal.getMonth()]+', passa para o dia útil seguinte)':'')+(mesmo.length>1?' · e mais '+(mesmo.length-1)+(mesmo.length===2?' obrigação':' obrigações')+' no mesmo dia':'');
        var du=diasUteis(p.ef); var bar=heroEl.querySelector('.pz-bar i'); var lb=heroEl.querySelector('.pz-bar+small');
        if(lb) lb.textContent=du===0?'O prazo termina hoje.':du===1?'Falta 1 dia útil.':'Faltam '+du+' dias úteis.';
        if(bar) setTimeout(function(){ bar.style.width=Math.max(6,Math.min(100,100-du/22*100))+'%'; },120);
        tick(); clearInterval(timer); timer=setInterval(tick,1000);
      }
      if(lista){
        lista.innerHTML='';
        L.slice(0,window.innerHeight<860&&window.innerWidth>900?4:6).forEach(function(it,i){ var li=D.createElement('li'); li.style.animationDelay=(i*70)+'ms'; var c=CAT[it.cat]; var n=dias(it.ef);
          li.innerHTML='<div class="pz-d"><b>'+it.ef.getDate()+'</b><small>'+MES3[it.ef.getMonth()]+'</small></div><div><div class="t"><span class="cat '+c[0]+'">'+c[1]+'</span>'+it.t+'</div><div class="s">'+it.s+'</div></div><div class="f'+(n<=0?' hoje':'')+'">'+quando(it.ef)+'</div>';
          lista.appendChild(li); });
        D.querySelectorAll('.seg button').forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-reg')===reg); b.setAttribute('aria-pressed',b.getAttribute('data-reg')===reg?'true':'false'); });
      }
    }
    D.querySelectorAll('.seg button').forEach(function(b){ b.addEventListener('click',function(){ reg=b.getAttribute('data-reg'); ls('dfg-iva',reg); render(); }); });
    return {render:render};
  })();
  if(D.getElementById('pzMini')||D.getElementById('pzLista')) Prazos.render();
  setInterval(function(){ if(D.getElementById('pzMini')||D.getElementById('pzLista')){ var h=new Date(); if(h.getHours()===0&&h.getMinutes()===0&&h.getSeconds()<2) Prazos.render(); } },1000);

  /* ---------- mapa «onde estamos» ---------- */
  var Mapa=(function(){
    var box=D.querySelector('.mapa'), M=window.DFG_MAPA, svg, VZ, st=-1, anim=0, feito=false;
    var NS='http://www.w3.org/2000/svg';
    function el(n,a,p){ var e=D.createElementNS(NS,n); for(var k in a) e.setAttribute(k,a[k]); if(p) p.appendChild(e); return e; }
    function monta(){
      if(!box||!M||svg) return !!svg;
      VZ=M.c.filter(function(c){ return c.n==='Vizela'; })[0];
      svg=el('svg',{viewBox:'0 0 400 570',preserveAspectRatio:'xMidYMid slice',role:'img','aria-label':'Mapa: Dafilgest em Vizela, no Vale do Ave, norte de Portugal'});
      var df=el('defs',{},svg);
      var lg=el('linearGradient',{id:'gPT',x1:0,y1:0,x2:0,y2:1},df); el('stop',{offset:0,'stop-color':'#17496B'},lg); el('stop',{offset:1,'stop-color':'#0F3150'},lg);
      var fl=el('filter',{id:'brilho',x:'-20%',y:'-20%',width:'140%',height:'140%'},df); el('feGaussianBlur',{stdDeviation:'2.2',result:'b'},fl); var mg=el('feMerge',{},fl); el('feMergeNode',{in:'b'},mg); el('feMergeNode',{in:'SourceGraphic'},mg);
      var g=el('g',{},svg);
      for(var lo=-11;lo<=-4;lo++){ var x=(lo+10.6)*77.0; el('line',{x1:x,y1:-200,x2:x,y2:800,stroke:'rgba(255,255,255,.05)','vector-effect':'non-scaling-stroke'},g); }
      for(var la=36;la<=43;la++){ var yv=(42.4-la)*100; el('line',{x1:-300,y1:yv,x2:700,y2:yv,stroke:'rgba(255,255,255,.05)','vector-effect':'non-scaling-stroke'},g); }
      el('path',{d:M.es,fill:'#132C42',stroke:'rgba(255,255,255,.22)','stroke-width':1,'vector-effect':'non-scaling-stroke'},g);
      el('path',{d:M.pt,fill:'url(#gPT)',stroke:'#2BB8E8','stroke-width':1.4,'vector-effect':'non-scaling-stroke',filter:'url(#brilho)'},g);
      var gl=el('g',{'class':'linhas'},g), gc=el('g',{},g);
      var mostrar={Lisboa:[0],Porto:[0,1,2],Coimbra:[0],Faro:[0],Braga:[1,2],'Guimarães':[1,2],'Santo Tirso':[2],Felgueiras:[2],Lousada:[2],'Famalicão':[2]};
      M.c.forEach(function(c){
        if(c.n==='Vizela') return;
        var gg=el('g',{'data-st':(mostrar[c.n]||[]).join(','),style:'transition:opacity .6s;opacity:0'},gc);
        c.dot=el('circle',{cx:c.x,cy:c.y,r:2,fill:'#9FD9F0'},gg);
        c.txt=el('text',{x:c.x,y:c.y,fill:'#DCE7EF','font-family':'Inter,Arial,sans-serif','font-weight':600},gg); c.txt.textContent=c.n;
        c.kmEl=el('text',{x:c.x,y:c.y,fill:'#7FD6F5','font-family':'Inter,Arial,sans-serif','font-weight':500},gg); c.kmEl.textContent=c.km+' km';
        c.g=gg;
        if((mostrar[c.n]||[]).indexOf(2)>=0){ c.ln=el('line',{x1:VZ.x,y1:VZ.y,x2:c.x,y2:c.y,stroke:'rgba(43,184,232,.55)','stroke-width':1.2,'stroke-dasharray':'4 4','vector-effect':'non-scaling-stroke',style:'opacity:0;transition:opacity .8s'},gl); }
      });
      var pin=el('g',{style:'opacity:0;transition:opacity .4s'},g);
      VZ.an1=el('circle',{cx:VZ.x,cy:VZ.y,r:1,fill:'none',stroke:'#2BB8E8','stroke-width':1.5,'vector-effect':'non-scaling-stroke'},pin);
      VZ.an2=el('circle',{cx:VZ.x,cy:VZ.y,r:1,fill:'none',stroke:'#2BB8E8','stroke-width':1.5,'vector-effect':'non-scaling-stroke'},pin);
      VZ.pin=el('path',{d:'M0 0C-6-9-11-14-11-21A11 11 0 1 1 11-21C11-14 6-9 0 0Z',fill:'#2BB8E8',stroke:'#fff','stroke-width':1.6,'vector-effect':'non-scaling-stroke'},pin);
      VZ.pinC=el('circle',{cx:0,cy:-21,r:4.2,fill:'#fff'},pin);
      
      VZ.grp=pin;
      box.appendChild(svg);
      return true;
    }
    function vista(cx,cy,w){
      svg.setAttribute('viewBox',(cx-w/2).toFixed(2)+' '+(cy-w/2).toFixed(2)+' '+w.toFixed(2)+' '+w.toFixed(2));
      var k=Math.max(1,Math.min(1.9,520/(box.clientWidth||520))), fs=w*0.034*k, r=w*0.0085*k;
      M.c.forEach(function(c){ if(!c.txt) return; c.dot.setAttribute('r',r); c.txt.setAttribute('font-size',fs); c.txt.setAttribute('x',c.x+r*2); c.txt.setAttribute('y',c.y+fs*0.35); c.kmEl.setAttribute('font-size',fs*0.8); c.kmEl.setAttribute('x',c.x+r*2); c.kmEl.setAttribute('y',c.y+fs*1.3); });
      var s=w/420; VZ.pin.setAttribute('transform','translate('+VZ.x+' '+VZ.y+') scale('+s+')'); VZ.pinC.setAttribute('transform','translate('+VZ.x+' '+VZ.y+') scale('+s+')');
      
      svg._w=w;
    }
    function estagio(n){
      st=n; var chip=box.querySelector('.chip span'); if(chip) chip.textContent=['Portugal','Norte · Vale do Ave','Vizela'][n];
      M.c.forEach(function(c){ if(!c.g) return; var on=(c.g.getAttribute('data-st')||'').split(',').indexOf(String(n))>=0; c.g.style.opacity=on?1:0; c.kmEl.style.display=n===2?'':'none'; if(c.ln) c.ln.style.opacity=n===2?1:0; });
      VZ.grp.style.opacity=n>=1?1:0;
      var ct=box.querySelector('.cartao'); if(ct) ct.classList.toggle('on',n===2);
    }
    var ETAPAS=function(){ return [[200,300,620],[VZ.x-8,VZ.y+26,230],[VZ.x-4,VZ.y+2,66]]; };
    var ease=function(t){ return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; };
    function pulso(){ if(!svg) return; var t=(performance.now()%2200)/2200, w=svg._w||66; [VZ.an1,VZ.an2].forEach(function(c,i){ var tt=(t+i*.5)%1; c.setAttribute('r',(w*0.01+tt*w*0.07).toFixed(3)); c.setAttribute('opacity',(1-tt).toFixed(3)); }); requestAnimationFrame(pulso); }
    /* último passo: mapa de ruas (OpenStreetMap) até à porta do gabinete */
    var GAB=[41.36805,-8.30950], rua=null, ruaEl=D.getElementById('mapaRua'), tRua=0;
    function ruaMostra(imediato){
      if(!ruaEl||!window.L) return;
      if(!rua){
        rua=L.map(ruaEl,{center:[VZ_LAT,VZ_LON],zoom:13,zoomControl:true,scrollWheelZoom:false,attributionControl:true,zoomSnap:.25});
        rua.zoomControl.setPosition('bottomright');
        rua.attributionControl.setPrefix(false);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'}).addTo(rua);
        L.marker(GAB,{icon:L.divIcon({className:'pinx',html:'<i></i><b></b>',iconSize:[44,56],iconAnchor:[22,52]}),keyboard:false,title:'Dafilgest'}).addTo(rua);
      }
      ruaEl.classList.add('on'); box.classList.add('ruas');
      var chip=box.querySelector('.chip span'); if(chip) chip.textContent='Rua Senhora de Lurdes';
      rua.invalidateSize(); rua.setView([VZ_LAT,VZ_LON],imediato?18:13.5,{animate:false});
      if(imediato) rua.setView(GAB,18,{animate:false}); else { clearTimeout(tRua); tRua=setTimeout(function(){ rua.flyTo(GAB,18,{duration:2.8}); },350); }
    }
    function ruaEsconde(){ if(ruaEl){ ruaEl.classList.remove('on'); box.classList.remove('ruas'); clearTimeout(tRua); } }
    var VZ_LAT=41.3767, VZ_LON=-8.3084;
    function voar(forcar){
      if(!monta()) return; if(feito&&!forcar) return; feito=true;
      cancelAnimationFrame(anim); var E=ETAPAS(); ruaEsconde();
      if(REDUZ){ vista(E[2][0],E[2][1],E[2][2]); estagio(2); ruaMostra(true); return; }
      vista(E[0][0],E[0][1],E[0][2]); estagio(0);
      var seq=[[0,1,1700,700],[1,2,1900,900]], i=0;
      function corre(){
        if(i>=seq.length){ tRua=setTimeout(function(){ ruaMostra(false); },1300); return; } var s=seq[i], a=E[s[0]], b=E[s[1]], t0=null;
        setTimeout(function(){
          (function f(t){ if(!t0) t0=t; var p=Math.min((t-t0)/s[2],1), e=ease(p);
            var w=Math.exp(Math.log(a[2])+(Math.log(b[2])-Math.log(a[2]))*e);
            vista(a[0]+(b[0]-a[0])*e, a[1]+(b[1]-a[1])*e, w);
            if(p>.55&&st!==s[1]) estagio(s[1]);
            if(p<1) anim=requestAnimationFrame(f); else { i++; corre(); } })(performance.now());
        },s[3]);
      }
      corre();
    }
    if(box){ var bt=D.querySelector('.voar'); if(bt) bt.addEventListener('click',function(){ voar(true); }); requestAnimationFrame(pulso); if(!book) setTimeout(function(){ voar(false); },400); }
    return {voar:voar};
  })();

  /* ---------- formulário de contacto (envio real para o email do gabinete) ---------- */
  var fm=D.getElementById('fContacto');
  if(fm){
    var ok=fm.querySelector('.msg.ok'), er=fm.querySelector('.msg.er'), bt=fm.querySelector('button[type=submit]'), btTxt=bt.innerHTML;
    var g=function(n){ return (fm.elements[n]&&fm.elements[n].value||'').trim(); };
    var mostraMsg=function(el,html){ [ok,er].forEach(function(x){ x.classList.remove('show'); }); if(el){ if(html) el.innerHTML=html; el.classList.add('show'); } };
    var mailto=function(){
      var assunto='Pedido de contacto — '+(g('servico')||'Geral')+' — '+g('nome');
      var corpo='Nome: '+g('nome')+'\nEmail: '+g('email')+'\nTelefone: '+g('telefone')+'\nEmpresa / NIF: '+g('empresa')+'\nAssunto: '+(g('servico')||'Geral')+'\n\n'+g('mensagem');
      return 'mailto:'+EMAIL+'?subject='+encodeURIComponent(assunto)+'&body='+encodeURIComponent(corpo);
    };
    fm.addEventListener('submit',function(e){
      e.preventDefault(); mostraMsg(null);
      if(g('_honey')) return;
      var em=g('email');
      if(!g('nome')||!g('mensagem')||(!em&&!g('telefone'))){ mostraMsg(er,'Indique o seu nome, a mensagem e pelo menos um contacto (email ou telefone).'); return; }
      if(fm.elements.aceito&&!fm.elements.aceito.checked){ mostraMsg(er,'Para enviarmos a sua mensagem, confirme que leu a política de privacidade.'); return; }
      if(em&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){ mostraMsg(er,'O email indicado não parece válido. Verifique, por favor.'); fm.elements.email.focus(); return; }
      bt.disabled=true; bt.innerHTML='A enviar…';
      var dados={ Nome:g('nome'), Email:em||'—', Telefone:g('telefone')||'—', 'Empresa / NIF':g('empresa')||'—', Assunto:g('servico')||'Geral', Mensagem:g('mensagem'),
        _subject:'Site Dafilgest — '+(g('servico')||'Pedido de contacto')+' — '+g('nome'), _template:'table', _captcha:'false' };
      if(em) dados._replyto=em;
      var fim=function(){ bt.disabled=false; bt.innerHTML=btTxt; };
      var falha=function(){ fim(); mostraMsg(er,'Não foi possível enviar neste momento. <a href="'+mailto()+'">Clique aqui para enviar pelo seu email</a> ou ligue <a href="tel:+351253484490">253 484 490</a>.'); };
      var ctl=('AbortController' in window)?new AbortController():null, to=setTimeout(function(){ if(ctl) ctl.abort(); },15000);
      fetch('https://formsubmit.co/ajax/'+EMAIL,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(dados),signal:ctl?ctl.signal:undefined})
        .then(function(r){ return r.json().catch(function(){ return {}; }); })
        .then(function(j){ clearTimeout(to); if(j&&(j.success===true||j.success==='true')){ fim(); fm.reset(); mostraMsg(ok,'<b>Mensagem enviada.</b> Obrigado pelo contacto — respondemos no próprio dia útil.'); } else falha(); })
        .catch(function(){ clearTimeout(to); falha(); });
    });
  }
})();
