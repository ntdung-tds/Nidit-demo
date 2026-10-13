import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = "artifacts/nidit-portal/dist/public/iaict-portal";
const home = join(root, "index.html");
const marker = "iaict-wow-v2";

const css = `
<style id="${marker}">
/* IAICT WOW v2 — institutional deep-tech art direction */
:root{--v2-teal:#71ead1;--v2-teal-strong:#28cbb0;--v2-ink:#071b2b;--v2-paper:#fbfcfa;--v2-line:#d7e4e5;--v2-soft:#627b89}
body{background:var(--v2-paper)}

/* header refinement */
.ia-header{box-shadow:0 1px 0 rgba(7,27,43,.04)}
.ia-top{background:#061722}
.ia-mark{border-radius:12px;background:linear-gradient(145deg,#0a4966,#0a7e73);box-shadow:0 10px 28px rgba(5,58,73,.14)}
.ia-cta{border-radius:9px;transition:transform .25s ease,background .25s ease,box-shadow .25s ease}
.ia-cta:hover{transform:translateY(-1px);background:#0b3b4c;box-shadow:0 10px 24px rgba(5,42,55,.13)}

/* hero — less dashboard, more spatial composition */
.hero{min-height:max(720px,calc(100svh - 113px));isolation:isolate;background:radial-gradient(circle at 78% 24%,rgba(55,222,191,.16),transparent 23%),radial-gradient(circle at 20% 80%,rgba(38,111,205,.12),transparent 29%),linear-gradient(128deg,#03121d 0%,#061f2e 48%,#0a343b 100%)}
.hero::before{content:"IAICT";position:absolute;right:-.035em;top:50%;z-index:0;transform:translateY(-53%);font-size:clamp(210px,26vw,420px);line-height:.8;font-weight:800;letter-spacing:-.085em;color:transparent;-webkit-text-stroke:1px rgba(179,240,226,.05);pointer-events:none;user-select:none}
.hero::after{opacity:.72;background-size:74px 74px;mask-image:linear-gradient(90deg,transparent 2%,#000 28%,#000 85%,transparent 100%)}
.hero-grid{min-height:max(720px,calc(100svh - 113px));grid-template-columns:1.12fr .88fr;gap:84px;padding-block:88px 112px}
.hero-grid>div:first-child{position:relative;z-index:3}
.hero-index{margin-bottom:26px;color:#87a4b1;letter-spacing:.13em}
.eyebrow{margin:0 0 18px;color:#8debd8;letter-spacing:.13em}
.hero h1{max-width:780px;font-size:clamp(52px,6vw,86px)!important;line-height:1.01!important;font-weight:700;letter-spacing:-.032em!important;text-wrap:balance}
.hero-lead{max-width:650px;margin:28px 0 34px;color:#b7ccd4;font-size:17px;line-height:1.78}
.hero-actions{gap:10px}
.btn-primary,.btn-ghost{min-height:52px;padding:13px 19px;border-radius:10px;transition:transform .24s ease,box-shadow .24s ease,background .24s ease,border-color .24s ease}
.btn-primary{background:#9af0dd;box-shadow:0 14px 36px rgba(57,207,181,.12)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 18px 42px rgba(57,207,181,.2)}
.btn-ghost:hover{transform:translateY(-2px);border-color:rgba(154,240,221,.42);background:rgba(255,255,255,.085)}
.hero-meta{margin-top:40px;gap:18px}
.hero-meta span{position:relative;padding:0 0 0 14px;border:0;border-radius:0;background:none;color:#8fa9b5;font-size:9px;letter-spacing:.08em;text-transform:uppercase}
.hero-meta span::before{content:"";position:absolute;left:0;top:50%;width:5px;height:5px;border-radius:50%;background:#58dac1;transform:translateY(-50%);opacity:.8}
.nexus{min-height:500px;border:0;border-left:1px solid rgba(163,227,214,.12);border-radius:0;background:linear-gradient(90deg,rgba(255,255,255,.025),transparent 75%);box-shadow:none;backdrop-filter:none;overflow:visible}
.nexus-top{padding:12px 0 17px 22px;border-bottom:1px solid rgba(255,255,255,.07)}
.orbit{inset:70px -24px 72px 10px}
.ring{border-color:rgba(113,234,209,.16)}
.ring.r1{width:206px;height:206px}.ring.r2{width:316px;height:316px}.ring.r3{width:430px;height:430px;border-color:rgba(255,255,255,.045)}
.core{width:150px;height:150px;background:radial-gradient(circle at 35% 25%,#16897e,#0a4c58 59%,#072b3d);box-shadow:0 0 0 17px rgba(80,229,200,.025),0 30px 72px rgba(0,0,0,.28)}
.node{border-color:rgba(255,255,255,.1);border-radius:10px;background:rgba(7,36,51,.88);backdrop-filter:blur(10px);box-shadow:0 16px 35px rgba(0,0,0,.17)}
.nexus-bottom{left:22px;right:0;bottom:8px;color:#7898a4}
.slides{bottom:38px;left:calc(50% - 23%);transform:none}
.scroll-cue{position:absolute;z-index:6;left:max(24px,calc((100vw - min(1240px,calc(100vw - 48px)))/2));bottom:25px;display:flex;align-items:center;gap:12px;color:#7898a4;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.scroll-cue i{position:relative;width:66px;height:1px;background:rgba(142,190,193,.28);overflow:hidden}
.scroll-cue i::after{content:"";position:absolute;inset:0;width:26px;background:#71ead1;animation:v2scan 2.8s ease-in-out infinite}

/* capability rail */
.cap-strip{position:relative;background:#061924;border:0}
.cap-strip::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(113,234,209,.28),transparent)}
.cap-grid{grid-template-columns:repeat(6,minmax(0,1fr))}
.cap{min-height:104px;padding:20px 18px;border-right:0;border-left:0!important;position:relative}
.cap:not(:last-child)::after{content:"";position:absolute;right:0;top:27%;height:46%;width:1px;background:rgba(255,255,255,.065)}
.cap span{color:#4bcdb4}.cap b{margin-top:13px;font-size:10px;font-weight:700}.cap small{color:#6f8b96;line-height:1.45}

/* section rhythm and editorial indexing */
main{counter-reset:iaict-section}
main>.section{position:relative;padding:128px 0;counter-increment:iaict-section}
main>.section::after{content:"0" counter(iaict-section);position:absolute;right:max(24px,calc((100vw - min(1240px,calc(100vw - 48px)))/2));top:34px;color:#9ab0b8;font-size:9px;font-weight:700;letter-spacing:.16em}
main>.section.dark::after{color:#5e7d89}
main>.section+.section{border-top:1px solid rgba(7,48,62,.055)}
.section.mist{background:#f3f7f6;border-block:0}
.editorial-head{grid-template-columns:1.12fr .88fr;gap:92px;margin-bottom:58px}
.editorial-head h2{font-size:clamp(40px,4.4vw,63px);line-height:1.08!important;letter-spacing:-.024em!important}
.editorial-side{grid-template-columns:76px 1fr;gap:22px}.editorial-side p{font-size:14px;line-height:1.8}

/* problem area: one lead story + three editorial rows */
.needs{display:grid;grid-template-columns:1.08fr .92fr;grid-template-rows:repeat(3,1fr);gap:0;min-height:590px;border-top:1px solid var(--v2-line);border-bottom:1px solid var(--v2-line)}
.need{min-height:0;padding:29px 30px;border:0;border-radius:0!important;background:transparent;box-shadow:none;transition:background .25s ease,padding .25s ease,transform .25s ease}
.need:first-child{grid-column:1;grid-row:1/4;padding:42px 46px;border-right:1px solid rgba(196,215,218,.72);background:linear-gradient(145deg,#0a3140,#0a5b5e);border-radius:0!important}
.need:not(:first-child){grid-column:2;border-bottom:1px solid var(--v2-line)}
.need:last-child{border-bottom:0}
.need:not(:first-child):hover{padding-left:40px;background:rgba(224,239,236,.38);transform:none;box-shadow:none}
.need:first-child:hover{transform:none;box-shadow:none;background:linear-gradient(145deg,#092e3c,#09645f)}
.need:first-child .need-top{margin-bottom:auto}
.need:first-child h3{max-width:500px;font-size:clamp(36px,3.3vw,52px);line-height:1.08;letter-spacing:-.025em}
.need:first-child p{max-width:530px;font-size:14px;line-height:1.75}
.need:not(:first-child){display:grid;grid-template-columns:130px 1fr 34px;align-items:center;gap:22px}
.need:not(:first-child) .need-top{display:block}.need:not(:first-child) .need-top span{display:block;margin-bottom:8px}.need:not(:first-child) .need-top small{display:block;line-height:1.55}
.need:not(:first-child) h3{font-size:21px}.need:not(:first-child) p{font-size:12px;line-height:1.7}.need:not(:first-child) .arrow{position:static;text-align:right}

/* ecosystem as a calm, architectural list */
.section.dark{background:linear-gradient(132deg,#051620,#082936)}
.eco{grid-template-columns:.82fr 1.18fr;gap:88px}
.eco-intro{top:146px}.eco-intro h2{font-size:clamp(42px,4.7vw,66px);letter-spacing:-.026em;line-height:1.04}.eco-intro>p:last-child{line-height:1.8}
.eco-item{min-height:172px;grid-template-columns:62px 1fr 34px;padding:28px 0}.eco-item:hover{padding-inline:14px;background:rgba(255,255,255,.025)}
.eco-item h3{font-size:25px;font-weight:600}.eco-item p{line-height:1.7}

/* project spotlight: visual depth, no floating-card feeling */
.project{grid-template-columns:.92fr 1.08fr;gap:0;overflow:hidden;border:1px solid #d4e3e3;background:#fff}
.project-copy{padding:48px 46px;border-radius:0;background:linear-gradient(145deg,#083244,#096760);position:relative;overflow:hidden}
.project-copy::after{content:"";position:absolute;width:320px;height:320px;right:-175px;bottom:-170px;border:1px solid rgba(130,238,216,.15);border-radius:50%;box-shadow:0 0 0 40px rgba(130,238,216,.025),0 0 0 80px rgba(130,238,216,.015)}
.project-copy h2{font-size:clamp(39px,4vw,58px);line-height:1.06;letter-spacing:-.024em}
.data-panel{position:relative;padding:48px 38px;border:0;border-radius:0;box-shadow:none;background:linear-gradient(180deg,#fff,#f6faf9)}
.data-panel::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(11,116,107,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(11,116,107,.035) 1px,transparent 1px);background-size:38px 38px;mask-image:linear-gradient(to bottom,black,transparent 92%);pointer-events:none}
.data-top,.flow{position:relative;z-index:2}.flow div{border-radius:10px;background:rgba(236,246,244,.92)}

/* journey becomes a connected timeline */
.journey{position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:0;border-top:0;padding-top:34px}
.journey::before{content:"";position:absolute;left:3%;right:3%;top:42px;height:1px;background:linear-gradient(90deg,#b9d2d1,#43bdaa,#b9d2d1)}
.journey article{position:relative;min-height:290px;padding:42px 23px 10px;border-left:0;border-right:0;background:transparent}
.journey article::before{content:"";position:absolute;top:1px;left:23px;width:13px;height:13px;border:4px solid var(--v2-paper);border-radius:50%;background:#20b79f;box-shadow:0 0 0 1px #8ec8bf}
.journey article span{display:block;color:#0a8476;font-size:9px;font-weight:800;letter-spacing:.1em}.journey article h3{margin-top:34px;font-size:20px}.journey article p{font-size:12px;line-height:1.75;color:#647d89}

/* expertise: calmer hierarchy */
.expert-layout{grid-template-columns:.9fr 1.1fr;gap:0;border-top:1px solid #d4e2e2;border-bottom:1px solid #d4e2e2}
.expert-lead{min-height:520px;padding:46px;border-radius:0;background:linear-gradient(150deg,#082e3d,#0a5959)}
.expert-lead h3{font-size:clamp(33px,3.3vw,49px);line-height:1.08;letter-spacing:-.022em}
.expert-grid{gap:0;grid-template-columns:1fr 1fr}
.expert{min-height:260px;padding:34px;border:0;border-left:1px solid #d4e2e2;border-bottom:1px solid #d4e2e2;border-radius:0;background:transparent}
.expert:nth-child(3),.expert:nth-child(4){border-bottom:0}.expert h3{margin-top:56px;font-size:21px}.expert p{line-height:1.75}

/* immersive gallery */
.gallery{gap:8px;grid-template-rows:250px 250px}
.g{border-radius:4px!important;isolation:isolate;transition:transform .35s ease,filter .35s ease}
.g::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,transparent 22%,rgba(2,16,25,.76));transition:opacity .35s ease}
.g:hover{transform:translateY(-3px);filter:saturate(1.08)}
.g:first-child{background:radial-gradient(circle at 72% 26%,rgba(79,232,164,.21),transparent 24%),linear-gradient(145deg,#073124,#071c22)}
.g:nth-child(2){background:radial-gradient(circle at 56% 38%,rgba(57,211,239,.22),transparent 21%),linear-gradient(145deg,#071d30,#0a4256)}
.g:nth-child(3){background:repeating-linear-gradient(40deg,rgba(116,235,214,.055) 0 1px,transparent 1px 18px),linear-gradient(145deg,#10273a,#0a4d52)}
.g:nth-child(4){background:radial-gradient(circle at 72% 35%,rgba(137,127,247,.17),transparent 24%),linear-gradient(145deg,#141f38,#082435)}
.g small{letter-spacing:.11em}.g b{font-size:clamp(17px,1.7vw,24px);line-height:1.2}

/* knowledge stream becomes an editorial magazine layout */
.knowledge{display:grid;grid-template-columns:1.12fr .88fr;grid-template-rows:repeat(3,1fr);gap:0;border-top:1px solid var(--v2-line);border-bottom:1px solid var(--v2-line)}
.article{min-height:0;padding:26px 30px;border:0;border-radius:0!important;background:transparent}
.article:first-child{grid-row:1/4;padding:42px 44px;border-right:1px solid var(--v2-line);display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(145deg,#f1f7f5,#e8f3f0)}
.article:not(:first-child){border-bottom:1px solid var(--v2-line)}.article:last-child{border-bottom:0}
.article:first-child span{margin-bottom:auto}.article:first-child h3{max-width:650px;margin-top:120px;font-size:clamp(30px,3vw,44px);line-height:1.12}
.article:first-child p{max-width:600px;font-size:14px;line-height:1.8}.article:not(:first-child) h3{margin-top:22px;font-size:19px}.article:not(:first-child) p{font-size:12px;line-height:1.7}

/* closing */
.closing{min-height:340px;padding:52px 0;align-items:center;border-top:1px solid #cbdede;border-bottom:1px solid #cbdede}
.closing h2{max-width:760px;font-size:clamp(38px,4.5vw,64px);line-height:1.05;letter-spacing:-.024em}.closing p{max-width:650px;line-height:1.8}

/* reveal motion */
.v2-reveal{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.v2-reveal.v2-visible{opacity:1;transform:none}
.eco-item.v2-reveal,.journey article.v2-reveal,.article.v2-reveal{transition-delay:calc(var(--v2-i,0) * 60ms)}

@keyframes v2scan{0%{transform:translateX(-30px)}50%,100%{transform:translateX(72px)}}
@media(max-width:1040px){
  .hero-grid{grid-template-columns:1fr;gap:44px;padding-top:72px}.hero{min-height:auto}.hero-grid{min-height:auto}.nexus{min-height:430px;border-left:0;border-top:1px solid rgba(163,227,214,.12)}.slides{left:50%;transform:translateX(-50%)}.scroll-cue{display:none}
  .cap-grid{grid-template-columns:repeat(3,1fr)}.cap:nth-child(3)::after{display:none}
  main>.section{padding:100px 0}.needs{grid-template-columns:1fr;grid-template-rows:auto}.need:first-child{grid-column:1;grid-row:auto;min-height:420px;border-right:0}.need:not(:first-child){grid-column:1;grid-template-columns:110px 1fr 30px}
  .eco{grid-template-columns:1fr;gap:48px}.eco-intro{position:static}.project{grid-template-columns:1fr}.journey{grid-template-columns:1fr 1fr}.journey::before{display:none}.journey article::before{top:18px}.expert-layout{grid-template-columns:1fr}.expert-lead{min-height:380px}.expert{border-left:0;border-top:1px solid #d4e2e2}.knowledge{grid-template-columns:1fr}.article:first-child{grid-row:auto;border-right:0;min-height:430px}.article:first-child h3{margin-top:90px}
}
@media(max-width:680px){
  .hero::before{font-size:190px;right:-20%}.hero-grid{padding:62px 0 82px}.hero h1{font-size:clamp(42px,12.5vw,58px)!important}.hero-lead{font-size:15px}.nexus{min-height:360px}.ring.r3{width:330px;height:330px}.ring.r2{width:260px;height:260px}.ring.r1{width:180px;height:180px}.core{width:126px;height:126px}.node{min-width:58px;padding:7px 8px}.nexus-bottom{display:block}.nexus-bottom span{display:block;margin-top:5px}.cap-grid{grid-template-columns:1fr 1fr}.cap:nth-child(3)::after{display:block}.cap:nth-child(2n)::after{display:none}
  main>.section{padding:82px 0}.editorial-head{grid-template-columns:1fr;gap:28px}.editorial-side{grid-template-columns:44px 1fr}.needs{border-top:0}.need:first-child{min-height:400px;padding:34px 28px}.need:not(:first-child){display:block;padding:26px 6px}.need:not(:first-child) .need-top{margin-bottom:22px}.need:not(:first-child) .arrow{position:absolute}.journey{grid-template-columns:1fr}.journey article{min-height:auto;padding:48px 0 34px;border-bottom:1px solid var(--v2-line)}.journey article::before{left:0}.expert-grid{grid-template-columns:1fr}.expert{min-height:220px;border-bottom:1px solid #d4e2e2!important}.gallery{grid-template-columns:1fr!important;grid-template-rows:300px repeat(3,190px)!important}.g:first-child{grid-column:auto!important;grid-row:auto!important}.article:first-child{padding:34px 24px}.article:not(:first-child){padding-inline:6px}.closing{display:block;padding:40px 0}.closing .btn-primary{margin-top:24px}
}
@media(prefers-reduced-motion:reduce){.scroll-cue i::after{animation:none}.v2-reveal{opacity:1;transform:none;transition:none}.btn-primary,.btn-ghost,.g,.need{transition:none}}
</style>`;

const script = `
<script id="${marker}-script">
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = [
    ...document.querySelectorAll('main > .section .editorial-head'),
    ...document.querySelectorAll('.eco-item'),
    ...document.querySelectorAll('.journey article'),
    ...document.querySelectorAll('.article')
  ];
  targets.forEach((el, i) => {
    el.classList.add('v2-reveal');
    el.style.setProperty('--v2-i', String(i % 6));
  });
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('v2-visible'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('v2-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: .13, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(el => io.observe(el));
})();
</script>`;

let html = await readFile(home, "utf8");
if (!html.includes(`id="${marker}"`)) {
  html = html.replace("</head>", `${css}\n</head>`);
  html = html.replace('<div class="slides">', '<div class="scroll-cue" aria-hidden="true"><span>Khám phá</span><i></i></div><div class="slides">');
  html = html.replace("</body>", `${script}\n</body>`);
  await writeFile(home, html, "utf8");
  console.log("IAICT WOW v2 homepage refinement applied.");
} else {
  console.log("IAICT WOW v2 already present; no changes made.");
}
