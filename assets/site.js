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
    it.innerHTML='<div class="p1"></div><div class="p2"></div><div class="c"><img src="assets/logo-dafilgest-branco.png" alt="" width="247" height="102"><div class="ln"></div><div class="tx">Contabilidade · Fiscalidade · Recursos Humanos — desde 2001</div></div>';
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
