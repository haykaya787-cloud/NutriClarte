// ---------- Demo data (per 100 g) ----------
const PRODUCTS = [
  { id:"hazelnut", score:35, portion:0.3, allergens:["nuts","milk"],
    name:{en:"Hazelnut spread with cocoa",fr:"Pâte à tartiner noisettes et cacao",es:"Crema de avellanas con cacao"},
    n:{sugars:55,satfat:10,sodium:50,protein:6},
    alts:[
      {name:"Purée de Noisettes 100% Pure",score:88,goals:["lowsugar","cardio"],n:{sugars:3.5,satfat:4.5,sodium:5,protein:15},
       why:{en:"Ideal for Diabetes & Cardio (zero added sugar, healthy fats)",fr:"Idéal diabète et cardio (zéro sucre ajouté, bons gras)",es:"Ideal para diabetes y cardio (sin azúcar añadido, grasas saludables)"}},
      {name:"Beurre de Cacahuète Protéiné",score:78,goals:["highprotein"],n:{sugars:6,satfat:6.2,sodium:40,protein:30},
       why:{en:"Ideal for Bulking (High in protein)",fr:"Idéal pour la prise de masse (riche en protéines)",es:"Ideal para ganar masa muscular (alto en proteínas)"}},
      {name:"Pâte Tartiner Choco Bio Light",score:65,goals:["lowsugar","lowsodium"],n:{sugars:12,satfat:3.1,sodium:15,protein:7},
       why:{en:"Guilt-free alternative with reduced sugar",fr:"Alternative sans culpabilité, moins sucrée",es:"Alternativa sin culpa, con menos azúcar"}}
    ]},
  { id:"cereal", score:42, portion:0.4, allergens:["gluten"],
    name:{en:"Frosted corn flakes",fr:"Flocons de maïs givrés",es:"Copos de maíz azucarados"},
    n:{sugars:37,satfat:0.5,sodium:450,protein:5},
    alts:[
      {name:"Gruau d'avoine nature",score:92,goals:["lowsugar","lowsodium","cardio"],n:{sugars:1,satfat:1.2,sodium:5,protein:13},
       why:{en:"Soluble fibre helps lower cholesterol",fr:"Les fibres solubles aident à réduire le cholestérol",es:"La fibra soluble ayuda a bajar el colesterol"}},
      {name:"Muesli sans sucre ajouté",score:81,goals:["lowsugar","lowsodium"],n:{sugars:8,satfat:1.5,sodium:20,protein:10},
       why:{en:"Natural sweetness from dried fruit only",fr:"Douceur naturelle des fruits séchés seulement",es:"Dulzor natural solo de fruta deshidratada"}},
      {name:"Céréales Protéinées Croquantes",score:74,goals:["highprotein"],n:{sugars:5,satfat:1,sodium:300,protein:25},
       why:{en:"Keeps you full longer (high in protein)",fr:"Rassasie plus longtemps (riche en protéines)",es:"Le mantiene saciado más tiempo (alto en proteínas)"}}
    ]},
  { id:"soup", score:48, portion:2.5, allergens:["gluten","soy"],
    name:{en:"Chicken noodle soup (canned)",fr:"Soupe poulet et nouilles (conserve)",es:"Sopa de pollo con fideos (lata)"},
    n:{sugars:1.2,satfat:0.4,sodium:720,protein:3},
    alts:[
      {name:"Soupe aux lentilles maison",score:86,goals:["lowsodium","highprotein","cardio"],n:{sugars:2,satfat:0.2,sodium:230,protein:9},
       why:{en:"Plant protein and fibre, much less salt",fr:"Protéines végétales et fibres, beaucoup moins de sel",es:"Proteína vegetal y fibra, mucha menos sal"}},
      {name:"Soupe Poulet Réduite en Sodium",score:84,goals:["lowsodium","cardio"],n:{sugars:1,satfat:0.3,sodium:140,protein:3.5},
       why:{en:"Same taste, 80% less sodium",fr:"Même goût, 80 % moins de sodium",es:"Mismo sabor, 80 % menos sodio"}},
      {name:"Bouillon d'os Bio",score:77,goals:["highprotein","lowsugar"],n:{sugars:0.5,satfat:0.2,sodium:290,protein:10},
       why:{en:"High in protein, almost no sugar",fr:"Riche en protéines, presque sans sucre",es:"Alto en proteínas, casi sin azúcar"}}
    ]}
];
const GOALS = ["standard","lowsodium","lowsugar","highprotein","cardio"];
// Alert thresholds apply to the values on screen (per 100 g or per real portion)
const LIMITS = { sugars:15, satfat:5, sodium:400, protein:10 };
const PHONE = "+1 (438) 808-8911";

// ---------- State ----------
const store = {
  get(k,d){ try{ const v=localStorage.getItem("nc."+k); return v?JSON.parse(v):d; }catch(e){ return d; } },
  set(k,v){ try{ localStorage.setItem("nc."+k,JSON.stringify(v)); }catch(e){} },
  wipe(){ try{ Object.keys(localStorage).filter(k=>k.startsWith("nc.")).forEach(k=>localStorage.removeItem(k)); }catch(e){}
          try{ sessionStorage.clear(); }catch(e){} }
};
// Validate everything read back from storage: it can be edited or corrupted, so keep only known values.
const LANGS=["fr","en","es"], AGES=["1","2","3"], ALLERGENS=["nuts","peanuts","milk","gluten","soy"];
function cleanLang(v){ return LANGS.includes(v)?v:"fr"; }
function cleanProfile(v){
  const o=(v&&typeof v==="object")?v:{};
  return { age:AGES.includes(o.age)?o.age:"2",
    allergies:Array.isArray(o.allergies)?[...new Set(o.allergies.filter(a=>ALLERGENS.includes(a)))]:[] };
}
function cleanHistory(v){
  if(!Array.isArray(v)) return null;
  return v.slice(0,30).filter(h=>h&&typeof h==="object"&&PRODUCTS.some(p=>p.id===h.pid)&&Number.isFinite(h.t))
    .map(h=>{ let g=Array.isArray(h.goals)?[...new Set(h.goals.filter(x=>GOALS.includes(x)))]:[];
      if(g.includes("standard")&&g.length>1) g=g.filter(x=>x!=="standard");
      g=g.slice(0,3); return {pid:h.pid,goals:g.length?g:["standard"],t:h.t,example:h.example===true}; });
}
const S = {
  lang: cleanLang(store.get("lang","fr")),
  goals: ["standard"],
  profile: cleanProfile(store.get("profile",null)),
  history: cleanHistory(store.get("history",null)),
  result: null, mode:"portion", mult:0.3, scanIdx:0,
  contactSent: null, confirmDelete:false
};
if(!Array.isArray(S.history)){
  const now=Date.now();
  S.history=[
    {pid:"cereal",goals:["lowsugar"],t:now-86400000*1-3600000*3,example:true},
    {pid:"soup",goals:["lowsodium","cardio"],t:now-86400000*3-3600000*6,example:true}
  ];
}

// ---------- Helpers ----------
const $=(s,r=document)=>r.querySelector(s);
const app=$("#app"), layer=$("#layer");
function t(k,vars){ let s=(T[S.lang]&&T[S.lang][k]); if(s===undefined) s=T.en[k]; if(s===undefined) return k;
  if(vars&&typeof s==="string") for(const v in vars) s=s.split("{"+v+"}").join(vars[v]); return s; }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function num(x,dec){ return x.toLocaleString(S.lang==="en"?"en-CA":S.lang==="fr"?"fr-CA":"es",{minimumFractionDigits:dec,maximumFractionDigits:dec}); }
function fmtMult(m){ return num(m,1); }
function rating(sc){ return sc<40?"poor":sc<60?"fair":sc<80?"good":"excellent"; }
function ringColor(sc){ return sc<40?"var(--bad)":sc<60?"var(--warn)":sc<80?"var(--water)":"var(--good)"; }
function toast(msg){ const d=document.createElement("div"); d.className="toast"; d.setAttribute("role","status"); d.textContent=msg; document.body.appendChild(d); setTimeout(()=>d.remove(),2200); }
function goalLabel(g){ return t("goal."+g); }
function prod(id){ return PRODUCTS.find(p=>p.id===id); }
function when(ts){ return new Date(ts).toLocaleString(S.lang==="en"?"en-CA":S.lang==="fr"?"fr-CA":"es",{dateStyle:"medium",timeStyle:"short"}); }

// ---------- Chrome (header, tabs, lang) ----------
function paintChrome(){
  document.documentElement.lang = S.lang==="fr"?"fr-CA":S.lang==="es"?"es":"en-CA";
  document.querySelectorAll("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lang===S.lang)));
  document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n));
  const route=currentRoute();
  document.querySelectorAll("#tabs a").forEach(a=>{ if(a.getAttribute("href")==="#"+route) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  const tabs=$("#tabs"), act=tabs.querySelector('[aria-current="page"]');
  if(act) tabs.scrollLeft=act.offsetLeft-(tabs.clientWidth-act.offsetWidth)/2;
}
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{ S.lang=b.dataset.lang; store.set("lang",S.lang); render(); }));

const ROUTES=["analyze","history","faq","about","support","privacy","contact"];
function currentRoute(){ const h=location.hash.replace("#",""); return ROUTES.includes(h)?h:"analyze"; }
window.addEventListener("hashchange",()=>{ S.confirmDelete=false; render(); window.scrollTo(0,0); });

// ---------- Views ----------
function render(){
  paintChrome();
  const r=currentRoute();
  if(r==="analyze") S.result?viewResult():viewHome();
  else if(r==="history") viewHistory();
  else if(r==="faq") viewFaq();
  else if(r==="contact") viewContact();
  else viewPage(r);
}

const CAM=`<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="13" width="40" height="28" rx="6" fill="#7fb6e8"/><path d="M16 13l3-5h10l3 5z" fill="#5a8fc4"/><circle cx="24" cy="27" r="9" fill="#17365d" stroke="#fff" stroke-width="3"/><circle cx="24" cy="27" r="4" fill="#5aa6e6"/><path d="M36 6l1.6 3.4L41 11l-3.4 1.6L36 16l-1.6-3.4L31 11l3.4-1.6z" fill="#ffd34d"/></svg>`;

function viewHome(){
  const std=S.goals.includes("standard");
  app.innerHTML=`<section class="view">
    <div class="hero"><img src="${$(".brand img").src}" alt="NutriClarté — La santé sans confusion. Wellness made simple."><h1>Nutri<span>Clarté</span></h1><p>${t("tagline")}</p></div>
    <div class="goals">
      <h2><span aria-hidden="true">🎯</span>${t("goals.title")}</h2>
      <div class="chips" role="group" aria-label="${esc(t("goals.title"))}">
        ${GOALS.map(g=>`<button type="button" class="chip" data-goal="${g}" aria-pressed="${S.goals.includes(g)}">${goalLabel(g)}${S.goals.includes(g)&&g!=="standard"?" ✓":""}</button>`).join("")}
      </div>
      <p class="sub">${std?t("goals.std"):t("goals.active",{n:S.goals.length})}</p>
    </div>
    <div class="scanwrap"><button type="button" class="scanbtn" id="scan">${CAM}<span>${t("scan.btn")}</span></button></div>
    <div class="center"><button type="button" class="btn ghost" id="profile"><span aria-hidden="true">👤</span>${t("profile.btn")}</button></div>
    <div class="card trust">
      <div><b>${t("trust.1a")}</b>${t("trust.1b")}</div>
      <div><b>${t("trust.2a")}</b>${t("trust.2b")}</div>
      <div><b>${t("trust.3a")}</b>${t("trust.3b")}</div>
    </div>
  </section>`;
  app.querySelectorAll("[data-goal]").forEach(b=>b.addEventListener("click",()=>toggleGoal(b.dataset.goal)));
  $("#scan").addEventListener("click",openScanner);
  $("#profile").addEventListener("click",openProfile);
}
function toggleGoal(g){
  let gs=S.goals.filter(x=>x!=="standard");
  if(g==="standard"){ gs=[]; }
  else if(gs.includes(g)) gs=gs.filter(x=>x!==g);
  else { if(gs.length>=3){ toast(t("goals.max")); return; } gs.push(g); }
  S.goals=gs.length?gs:["standard"];
  const sc=$(".chips")?.scrollLeft||0; viewHome(); const c=$(".chips"); if(c) c.scrollLeft=sc;
}

function openScanner(){
  layer.innerHTML=`<div class="scanner" role="dialog" aria-modal="true" aria-label="${esc(t("scan.btn"))}">
    <div class="frame"><div class="bars"></div></div>
    <p id="hint">${t("scanner.hint")}</p>
    <button type="button" class="sim" id="sim">${t("scanner.sim")}</button>
    <button type="button" class="cancel" id="cancel">${t("scanner.cancel")}</button>
  </div>`;
  $("#sim").focus();
  $("#cancel").addEventListener("click",()=>layer.innerHTML="");
  $("#sim").addEventListener("click",()=>{
    $("#hint").textContent=t("scanner.reading"); $("#sim").disabled=true;
    setTimeout(()=>{
      const p=PRODUCTS[S.scanIdx%PRODUCTS.length]; S.scanIdx++;
      layer.innerHTML="";
      showResult(p.id,S.goals.slice(),true);
    },900);
  });
}
function showResult(pid,goals,record){
  const p=prod(pid);
  S.result={pid,goals}; S.mode="portion"; S.mult=p.portion; S.goals=goals.slice();
  if(record){ S.history.unshift({pid,goals,t:Date.now()}); S.history=S.history.slice(0,30); store.set("history",S.history); }
  if(location.hash!=="#analyze") location.hash="analyze"; else render();
  window.scrollTo(0,0);
}

function computeAlerts(p,vals,goals){
  const a=[];
  if(goals.includes("lowsugar") && vals.sugars>LIMITS.sugars) a.push(["bad","!",t("alert.sugar")]);
  if(goals.includes("cardio") && vals.satfat>LIMITS.satfat) a.push(["warn","⚠",t("alert.satfat")]);
  if(goals.includes("lowsodium") && vals.sodium>LIMITS.sodium) a.push(["bad","!",t("alert.sodium")]);
  if(goals.includes("highprotein") && vals.protein<LIMITS.protein) a.push(["warn","⚠",t("alert.protein")]);
  const hits=p.allergens.filter(x=>S.profile.allergies.includes(x));
  if(hits.length) a.push(["bad","!",t("alert.allergen",{a:hits.map(x=>t("allergen."+x).toLowerCase()).join(", ")})]);
  return a;
}
function viewResult(){
  const p=prod(S.result.pid), goals=S.result.goals;
  const m=S.mode==="portion"?S.mult:1;
  const v={sugars:p.n.sugars*m,satfat:p.n.satfat*m,sodium:p.n.sodium*m,protein:p.n.protein*m};
  const alerts=computeAlerts(p,v,goals);
  const rc=ringColor(p.score);
  const filters=goals.map(goalLabel).join(" + ");
  const rankedAlts=p.alts.map(a=>({...a,fit:a.goals.filter(g=>goals.includes(g)).length}))
    .sort((x,y)=>y.fit-x.fit||y.score-x.score);
  const cell=(k,unit,dec,over)=>`<div class="${over?"over":""}"><b>${num(v[k],dec)}${unit}</b><span>${t("nut."+k)}</span></div>`;
  app.innerHTML=`<section class="view">
    <button type="button" class="btn block" id="home"><span aria-hidden="true">🏠</span>${t("res.back")}</button>
    <div class="filters"><strong>${t("res.filters")}</strong> ${esc(filters)}</div>
    <div class="seg" role="group">
      <button type="button" data-mode="base" aria-pressed="${S.mode==="base"}">${t("res.base")}</button>
      <button type="button" data-mode="portion" aria-pressed="${S.mode==="portion"}">${t("res.portion")}</button>
    </div>
    ${S.mode==="portion"?`<div class="card slider"><label for="mult"><span>${t("res.adjust",{m:fmtMult(S.mult)})}</span><span class="muted">${t("res.grams",{g:Math.round(S.mult*100)})}</span></label>
      <input id="mult" type="range" min="0.1" max="3" step="0.1" value="${S.mult}" aria-valuetext="x${S.mult}"></div>`:""}
    <div class="card" style="--rc:${rc}">
      <div class="score"><div class="ring" aria-label="${p.score}/100">${p.score}</div>
        <div><div class="pname">${esc(p.name[S.lang])}</div><div class="rating">${t("rating."+rating(p.score))}</div></div></div>
      <div class="alerts">${alerts.length?alerts.map(a=>`<div class="alert ${a[0]}"><i aria-hidden="true">${a[1]}</i><span>${a[2]}</span></div>`).join("")
        :`<div class="alert good"><i aria-hidden="true">✓</i><span>${t("res.matches")}</span></div>`}</div>
    </div>
    <div class="label">${t("res.bio")}</div>
    <div class="card nutr">
      ${cell("sugars","g",1,goals.includes("lowsugar")&&v.sugars>LIMITS.sugars)}
      ${cell("satfat","g",1,goals.includes("cardio")&&v.satfat>LIMITS.satfat)}
      ${cell("sodium","mg",0,goals.includes("lowsodium")&&v.sodium>LIMITS.sodium)}
      ${cell("protein","g",1,goals.includes("highprotein")&&v.protein<LIMITS.protein)}
    </div>
    <div class="label"><span aria-hidden="true">✨</span> ${t("res.alts")}</div>
    ${rankedAlts.map(a=>`<div class="card alt">
      <div class="head"><h3>${esc(a.name)}</h3><span class="pill">${a.score}/100</span></div>
      <p class="why">${esc(a.why[S.lang])}</p>
      ${a.fit&&!goals.includes("standard")?`<span class="match">✓ ${t("res.fits")}</span>`:""}
      <div class="tags"><span>${t("nut.sugars")}: ${num(a.n.sugars*m,1)}g</span><span>${t("nut.satfat")}: ${num(a.n.satfat*m,1)}g</span><span>${t("nut.sodium")}: ${num(a.n.sodium*m,0)}mg</span><span>${t("nut.protein")}: ${num(a.n.protein*m,1)}g</span></div>
    </div>`).join("")}
  </section>`;
  $("#home").addEventListener("click",()=>{ S.result=null; render(); window.scrollTo(0,0); });
  app.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>{ S.mode=b.dataset.mode; viewResult(); }));
  const r=$("#mult"); if(r) r.addEventListener("input",()=>{ S.mult=Math.round(parseFloat(r.value)*10)/10; viewResult(); const n=$("#mult"); n&&n.focus(); });
}

function viewHistory(){
  app.innerHTML=`<section class="view">
    <div><h1 style="font-size:1.6rem">${t("hist.title")}</h1><p class="muted">${t("hist.lede")}</p></div>
    <div class="hist">${S.history.length?S.history.map((h,i)=>{ const p=prod(h.pid); return `
      <button type="button" class="card hrow" data-i="${i}" style="--rc:${ringColor(p.score)}">
        <span class="ring">${p.score}</span>
        <div><strong>${esc(p.name[S.lang])}</strong>${h.example?`<span class="ex">${t("hist.example")}</span>`:""}<br>
        <small>${when(h.t)} · ${esc(h.goals.map(goalLabel).join(" + "))}</small></div>
      </button>`;}).join(""):`<div class="card muted">${t("hist.empty")}</div>`}</div>
    ${S.history.length?`<div><button type="button" class="btn ghost" id="clear">${t("hist.clear")}</button></div>`:""}
    <div class="card danger">
      <h2 style="font-size:1.1rem">${t("data.title")}</h2>
      <p class="muted">${t("data.desc")}</p>
      ${S.confirmDelete?`<p role="alert" style="font-weight:600">${t("data.confirm")}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn red" id="delyes">${t("data.yes")}</button><button type="button" class="btn ghost" id="delno">${t("data.no")}</button></div>`
      :`<div><button type="button" class="btn red" id="delall">${t("data.delete")}</button></div>`}
    </div>
  </section>`;
  const da=$("#delall"); if(da) da.addEventListener("click",()=>{ S.confirmDelete=true; viewHistory(); $("#delyes").focus(); });
  const dn=$("#delno"); if(dn) dn.addEventListener("click",()=>{ S.confirmDelete=false; viewHistory(); });
  const dy=$("#delyes"); if(dy) dy.addEventListener("click",()=>{
    store.wipe();
    S.history=[]; S.profile=cleanProfile(null); S.goals=["standard"]; S.result=null; S.contactSent=null; S.confirmDelete=false;
    render(); toast(t("data.deleted"));
  });
  app.querySelectorAll("[data-i]").forEach(b=>b.addEventListener("click",()=>{ const h=S.history[+b.dataset.i]; showResult(h.pid,h.goals,false); }));
  const c=$("#clear"); if(c) c.addEventListener("click",()=>{ S.history=[]; store.set("history",[]); viewHistory(); toast(t("hist.cleared")); });
}

function viewFaq(){
  app.innerHTML=`<section class="view"><h1 style="font-size:1.6rem">${t("faq.title")}</h1>
    <div>${t("faq").map((q,i)=>`<details${i===0?" open":""}><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join("")}</div>
    <p class="muted"><a href="#support">${t("tab.support")}</a> · <a href="#contact">${t("tab.contact")}</a></p></section>`;
}

function viewPage(r){ app.innerHTML=`<article class="view prose">${t("page."+r)}</article>`; }

function viewContact(){
  const topics=["general","support","privacy","partner"];
  const sent=S.contactSent;
  const prev=$("#cform")?{n:$("#c-name").value,e:$("#c-email").value,tp:$("#c-topic").value,m:$("#c-msg").value,c:$("#c-consent").checked}:null;
  app.innerHTML=`<section class="view">
    <div class="prose"><span class="eyebrow">${t("contact.eyebrow")}</span><h1>${t("contact.title")}</h1><p class="lede">${t("contact.lede")}</p></div>
    <div class="contact">
      <div class="card">${sent?`<div class="success" role="status">
          <h3>${esc(t("ok.title",{name:sent.name}))}</h3>
          <p>${esc(t("ok.body",{topic:t("topic."+sent.topic),email:sent.email}))}</p>
          <p class="muted" style="font-size:.88rem">${t("ok.demo")}</p>
          <div><button type="button" class="btn ghost" id="again">${t("ok.again")}</button></div></div>`
      :`<form id="cform" novalidate>
        <div class="field"><label for="c-name">${t("f.name")}</label><input id="c-name" name="name" autocomplete="name" required><span class="err" id="e-name"></span></div>
        <div class="field"><label for="c-email">${t("f.email")}</label><input id="c-email" name="email" type="email" autocomplete="email" required><span class="err" id="e-email"></span></div>
        <div class="field"><label for="c-topic">${t("f.topic")}</label><select id="c-topic" name="topic">${topics.map(x=>`<option value="${x}">${t("topic."+x)}</option>`).join("")}</select></div>
        <div class="field"><label for="c-msg">${t("f.message")}</label><textarea id="c-msg" name="message" required></textarea><span class="err" id="e-message"></span></div>
        <label class="check"><input type="checkbox" id="c-consent"><span>${t("f.consent")}</span></label><span class="err" id="e-consent" style="color:var(--bad);font-size:.85rem"></span>
        <button type="submit" class="btn">${t("f.send")}</button>
      </form>`}</div>
      <aside class="side">
        <div class="card"><span class="label">${t("c.call")}</span><span class="phone" id="phone">${PHONE}</span><span class="muted">${t("c.hours")}</span>
          <button type="button" class="copy" id="copy">${t("c.copy")}</button></div>
        <div class="card"><span class="label">${t("c.reply")}</span><span>${t("c.replyv")}</span></div>
        <div class="card"><span class="label">${t("c.where")}</span><span>${t("c.place")}</span></div>
      </aside>
    </div></section>`;
  $("#copy").addEventListener("click",()=>{
    const ok=()=>toast(t("c.copied"));
    try{ navigator.clipboard.writeText(PHONE).then(ok,()=>selectPhone()); }catch(e){ selectPhone(); }
  });
  const again=$("#again"); if(again) again.addEventListener("click",()=>{ S.contactSent=null; viewContact(); });
  const f=$("#cform"); if(!f) return;
  if(prev){ $("#c-name").value=prev.n; $("#c-email").value=prev.e; $("#c-topic").value=prev.tp; $("#c-msg").value=prev.m; $("#c-consent").checked=prev.c; }
  f.addEventListener("submit",e=>{
    e.preventDefault();
    const d={name:$("#c-name").value.trim(),email:$("#c-email").value.trim(),topic:$("#c-topic").value,message:$("#c-msg").value.trim(),consent:$("#c-consent").checked};
    const errs={name:!d.name&&t("err.name"),email:!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)&&t("err.email"),message:d.message.length<10&&t("err.message"),consent:!d.consent&&t("err.consent")};
    let first=null;
    for(const k in errs){ $("#e-"+k).textContent=errs[k]||""; if(errs[k]&&!first) first=k; }
    if(first){ ({name:"#c-name",email:"#c-email",message:"#c-msg",consent:"#c-consent"})[first] && $(({name:"#c-name",email:"#c-email",message:"#c-msg",consent:"#c-consent"})[first]).focus(); return; }
    // Production: POST `d` to your form endpoint here (e.g. Formspree, Netlify Forms or your own API).
    S.contactSent=d; viewContact(); window.scrollTo(0,0);
  });
}
function selectPhone(){ const r=document.createRange(); r.selectNodeContents($("#phone")); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }

function openProfile(){
  const P=S.profile, al=["nuts","peanuts","milk","gluten","soy"];
  layer.innerHTML=`<div class="modal" id="pm"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="pt">
    <h2 id="pt">${t("profile.title")}</h2><p class="muted">${t("profile.desc")}</p>
    <div class="field"><label for="p-age">${t("profile.age")}</label><select id="p-age">${["1","2","3"].map(x=>`<option value="${x}"${P.age===x?" selected":""}>${t("age."+x)}</option>`).join("")}</select></div>
    <div class="field"><span style="font-weight:600">${t("profile.allergies")}</span><div class="opts">${al.map(x=>`<button type="button" class="chip" data-al="${x}" aria-pressed="${P.allergies.includes(x)}">${t("allergen."+x)}</button>`).join("")}</div></div>
    <div class="row"><button type="button" class="btn ghost" id="pc">${t("profile.cancel")}</button><button type="button" class="btn" id="ps">${t("profile.save")}</button></div>
  </div></div>`;
  layer.querySelectorAll("[data-al]").forEach(b=>b.addEventListener("click",()=>b.setAttribute("aria-pressed",String(b.getAttribute("aria-pressed")!=="true"))));
  $("#pc").addEventListener("click",()=>layer.innerHTML="");
  $("#pm").addEventListener("click",e=>{ if(e.target.id==="pm") layer.innerHTML=""; });
  $("#ps").addEventListener("click",()=>{
    S.profile={age:$("#p-age").value,allergies:[...layer.querySelectorAll('[data-al][aria-pressed="true"]')].map(b=>b.dataset.al)};
    store.set("profile",S.profile); layer.innerHTML=""; toast(t("profile.saved"));
  });
}
document.addEventListener("keydown",e=>{ if(e.key==="Escape") layer.innerHTML=""; });

render();
