(function(){
  const P=/*PRICES*/null;
  const eur=v=>v.toLocaleString('de-DE')+' €';
  // Preis-Tabs
  document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.tabs button').forEach(x=>x.setAttribute('aria-selected',x===b));
    const g=P[b.dataset.g];
    document.querySelector('[data-p=jahrM]').textContent=eur(g.m);
    document.querySelector('[data-p=jahrY]').textContent=eur(g.m*12);
    document.querySelector('[data-p=monM]').textContent=eur(g.mo);
    document.querySelector('[data-p=saisonAb]').textContent='ab '+eur(Math.min(...g.s));
    document.getElementById('g-'+b.dataset.g).checked=true; calc();
  }));
  // Rechner
  const f=document.getElementById('calc');
  if(f){
  function calc(){
    const g=f.querySelector('[name=g]:checked').value, p=f.querySelector('[name=p]:checked').value, d=P[g];
    document.getElementById('seasons').hidden=p!=='saison';
    let monthly=0, once=0, items=[], note='', total=0;
        if(p==='jahr'){items.push('Jahresabo: '+eur(d.m)+' × 12 Monate');}
    if(p==='monat'){monthly=d.mo; items.push('Monatsabo: '+eur(d.mo)+' im Monat, monatlich kündbar');}
    if(p==='saison'){[['s1','Frühling'],['s2','Sommer'],['s3','Herbst und Winter']].forEach((s,i)=>{if(document.getElementById(s[0]).checked){once+=d.s[i];items.push(s[1]+': '+eur(d.s[i]));}});}
    const stein=document.getElementById('x1').checked; if(stein){items.push('Komplette Grabsteinreinigung: Preis auf Anfrage');}
    const ab=document.getElementById('x4').checked; if(ab){once+=45;items.push('Gestecke und Deko: ab 45 €');}
    if(p==='jahr'){total=d.m*12+once; note='im Jahr · entspricht '+eur(d.m)+' im Monat'+(once?' plus '+(ab?'ab ':'')+eur(once)+' für Extras':'');}
    else if(p==='monat'){total=monthly; note='im Monat · monatlich kündbar'+(once?' · zusätzlich '+(ab?'ab ':'')+eur(once)+' für Extras':'');}
    else if(p==='saison'){total=once; const n=['s1','s2','s3'].filter(i=>document.getElementById(i).checked).length; note=n===3?'Tipp: Das Jahresabo ('+eur(d.m*12)+') umfasst mehr Besuche und ist günstiger.':'für die gewählten Leistungen';}
    else {total=once; note=total?'für die gewählten Einzelleistungen':'Bitte Leistungen wählen. Zusätzlicher Pflegebesuch: '+eur(d.pf);}
    let sumTxt=(ab&&p!=='monat'?'ab ':'')+eur(total);
    if(p==='none'&&!once&&stein){sumTxt='auf Anfrage';note='Den Festpreis nennen wir Ihnen nach Ihrer Anfrage.';}
    else if(stein)note+=(note?' · ':'')+'Grabsteinreinigung auf Anfrage';
    document.getElementById('sum').textContent=sumTxt;
    document.getElementById('sumNote').textContent=note;
    document.getElementById('sumList').innerHTML=items.map(i=>'<li>'+i+'</li>').join('');
  }
  f.addEventListener('input',calc); f.addEventListener('submit',e=>e.preventDefault()); calc();
  // Paket vorwählen
  document.querySelectorAll('[data-pick]').forEach(a=>a.addEventListener('click',()=>{document.getElementById('pk').value=a.dataset.pick}));
  document.getElementById('calcCta').addEventListener('click',()=>{const p=f.querySelector('[name=p]:checked').value;document.getElementById('pk').value=p==='jahr'?'Jahresabo':p==='monat'?'Monatsabo':p==='saison'?'Saisonpaket':'Einzelleistung';const g=f.querySelector('[name=g]:checked').value;document.getElementById('ga').value={urne:'Urnengrab',einzel:'Einzelgrab',doppel:'Doppelgrab'}[g];});
  }
  // Formular
  const form=document.getElementById('form');
  if(form){form.addEventListener('submit',async e=>{
    e.preventDefault();const fm=e.target, ok=document.getElementById('ok'), btn=fm.querySelector('button[type=submit]');
    if(!fm.checkValidity()){fm.reportValidity();return}
    btn.disabled=true; ok.hidden=true; ok.classList.remove('err');
    try{
      const data=Object.fromEntries(new FormData(fm).entries());
      const r=await fetch(fm.action,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)});
      const j=await r.json().catch(()=>({}));
      if(!r.ok||!j.ok) throw new Error(j.error||'Fehler');
      ok.textContent='Vielen Dank für Ihre Anfrage. Ich melde mich innerhalb von 24 Stunden bei Ihnen.';
      fm.reset();
    }catch(err){
      ok.classList.add('err');
      ok.textContent=(err.message&&err.message!=='Fehler'&&err.message!=='Failed to fetch'?err.message+' ':'Die Anfrage konnte gerade nicht gesendet werden. ')+'Sie erreichen mich auch per E-Mail an kontakt@stillgruen.de.';
    }finally{ok.hidden=false;btn.disabled=false;}
  });}
  // Mobiles Menü
  const mb=document.getElementById('menuBtn'), mn=document.getElementById('menuNav');
  if(mb&&mn){
    const close=()=>{mn.hidden=true;mb.setAttribute('aria-expanded','false')};
    mb.addEventListener('click',()=>{const open=mn.hidden;mn.hidden=!open;mb.setAttribute('aria-expanded',String(open))});
    document.addEventListener('click',e=>{if(!mb.contains(e.target)&&!mn.contains(e.target))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    mn.addEventListener('click',e=>{if(e.target.tagName==='A')close()});
  }
  // Große Schrift
  const big=document.getElementById('big');
  try{if(localStorage.getItem('sg-big')==='1'){document.documentElement.classList.add('big');big.setAttribute('aria-pressed','true')}}catch(e){}
  big.addEventListener('click',()=>{const on=document.documentElement.classList.toggle('big');big.setAttribute('aria-pressed',on);try{localStorage.setItem('sg-big',on?'1':'0')}catch(e){}});
})();
