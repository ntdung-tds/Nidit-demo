import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = "artifacts/nidit-portal/dist/public/iaict-portal";
const file = join(root, "index.html");
const marker = "iaict-wow-hero-v3";
const base = "/Nidit-demo/iaict-portal/";

let html = await readFile(file, "utf8");
if (html.includes(`id="${marker}"`)) {
  console.log("IAICT Hero V3 already applied.");
  process.exit(0);
}

const start = html.indexOf('<section class="hero">');
if (start < 0) throw new Error("Hero section not found");
const end = html.indexOf("</section>", start);
if (end < 0) throw new Error("Hero closing tag not found");

const hero = `
<section class="hero hero-v3" aria-label="IAICT — năng lực và định hướng">
  <div class="hero-v3-atmosphere" aria-hidden="true">
    <i class="hero-v3-glow hero-v3-glow-a"></i>
    <i class="hero-v3-glow hero-v3-glow-b"></i>
    <i class="hero-v3-grid"></i>
    <span class="hero-v3-wordmark">IAICT</span>
  </div>

  <div class="ia-shell hero-v3-grid-layout">
    <div class="hero-v3-copy">
      <div class="hero-v3-overline">
        <span>IAICT</span><i></i><small>Viện Ứng dụng Công nghệ Thông tin và Truyền thông</small>
      </div>
      <p class="eyebrow hero-v3-kicker" id="hero-kicker">Applied Technology · Real-world Value</p>
      <h1 id="hero-title">Ứng dụng công nghệ để tạo ra giá trị có thể triển khai.</h1>
      <p class="hero-lead" id="hero-lead">IAICT kết nối nghiên cứu ứng dụng, thiết kế giải pháp, triển khai hệ thống, chuyển giao và đào tạo trong một hành trình thống nhất.</p>
      <div class="hero-actions hero-v3-actions">
        <a id="hero-primary" class="btn-primary" href="${base}giai-phap-dich-vu/">Khám phá năng lực<span>↗</span></a>
        <a id="hero-secondary" class="btn-ghost" href="${base}du-an/">Dự án tiêu biểu</a>
      </div>
      <div class="hero-v3-ecosystem" aria-label="Hệ sinh thái IAICT">
        <span><b>01</b> Technology</span>
        <span><b>02</b> Solutions</span>
        <span><b>03</b> Transfer</span>
        <span><b>04</b> Academy</span>
      </div>
    </div>

    <aside class="hero-v3-field" aria-label="Trường năng lực IAICT">
      <div class="field-caption"><span>IAICT / CAPABILITY FIELD</span><b>Connected disciplines</b></div>
      <div class="field-stage" id="hero-field-stage">
        <i class="field-ring field-ring-a"></i>
        <i class="field-ring field-ring-b"></i>
        <i class="field-ring field-ring-c"></i>
        <i class="field-axis field-axis-x"></i>
        <i class="field-axis field-axis-y"></i>
        <div class="field-monogram" aria-hidden="true"><span>I</span><span>A</span></div>
        <span class="field-node field-node-ai"><i></i><b>AI</b><small>Intelligence</small></span>
        <span class="field-node field-node-iot"><i></i><b>IoT</b><small>Field systems</small></span>
        <span class="field-node field-node-data"><i></i><b>DATA</b><small>Knowledge</small></span>
        <span class="field-node field-node-dx"><i></i><b>DX</b><small>Transformation</small></span>
        <div class="field-focus"><span>Capability focus</span><strong id="hero-focus">Applied Technology</strong></div>
      </div>
      <div class="field-footer"><span id="hero-signal">Technology → Solutions → Transfer → Academy</span><i></i><small>Applied technology / integrated capability</small></div>
    </aside>
  </div>

  <div class="ia-shell hero-v3-bottom">
    <div class="hero-v3-thesis"><span>Research</span><i></i><span>Application</span><i></i><span>Integration</span><i></i><span>Transfer</span><i></i><span>Training</span></div>
    <div class="slides hero-v3-tabs" role="tablist" aria-label="Chủ đề nổi bật">
      <button aria-label="Applied Technology" data-slide="0" class="active"><span>01</span><small>Applied Technology</small></button>
      <button aria-label="AI & Data" data-slide="1"><span>02</span><small>AI & Data</small></button>
      <button aria-label="IoT & Field Systems" data-slide="2"><span>03</span><small>IoT & Field Systems</small></button>
    </div>
  </div>
  <div class="scroll-cue hero-v3-scroll" aria-hidden="true"><span>Khám phá</span><i></i></div>
</section>`;

html = html.slice(0, start) + hero + html.slice(end + "</section>".length);
html = html.replace("<body>", '<body class="home-wow-v3">');

const css = `
<style id="${marker}">
/* Hero V3 — IAICT brand field */
.home-wow-v3 .ia-header{position:fixed;inset:0 0 auto;z-index:100;background:linear-gradient(180deg,rgba(3,17,28,.92),rgba(3,17,28,.54) 70%,transparent);border-bottom-color:transparent;backdrop-filter:none;transition:background .35s ease,border-color .35s ease,box-shadow .35s ease,backdrop-filter .35s ease}
.home-wow-v3 .ia-header .ia-top{background:rgba(2,14,24,.54);border-bottom:1px solid rgba(255,255,255,.055);color:#87a4b4}
.home-wow-v3 .ia-header .ia-navrow{min-height:86px}
.home-wow-v3 .ia-header .ia-brand b,.home-wow-v3 .ia-header .ia-nav>a,.home-wow-v3 .ia-header .ia-nav summary,.home-wow-v3 .ia-header .ia-search{color:#edf6f7}
.home-wow-v3 .ia-header .ia-brand small{color:#8ea8b6}
.home-wow-v3 .ia-header .ia-mark{background:rgba(255,255,255,.035);border:1px solid rgba(128,235,211,.28);box-shadow:none;color:#8df2de;border-radius:4px}
.home-wow-v3 .ia-header .ia-cta{background:#8df2de;color:#042822;border:1px solid #8df2de}
.home-wow-v3 .ia-header .ia-nav details>div{color:#102a43}
.home-wow-v3 .ia-header.ia-header--scrolled{background:rgba(251,252,250,.965);border-bottom-color:#dce6ec;box-shadow:0 12px 36px rgba(6,25,38,.07);backdrop-filter:blur(18px)}
.home-wow-v3 .ia-header.ia-header--scrolled .ia-top{display:none}
.home-wow-v3 .ia-header.ia-header--scrolled .ia-navrow{min-height:72px}
.home-wow-v3 .ia-header.ia-header--scrolled .ia-brand b,.home-wow-v3 .ia-header.ia-header--scrolled .ia-nav>a,.home-wow-v3 .ia-header.ia-header--scrolled .ia-nav summary{color:#102a43}
.home-wow-v3 .ia-header.ia-header--scrolled .ia-search{color:#607789}
.home-wow-v3 .ia-header.ia-header--scrolled .ia-brand small{color:#647b8d}
.home-wow-v3 .ia-header.ia-header--scrolled .ia-mark{background:linear-gradient(145deg,#0b4f70,#0b8b7c);border-color:transparent;color:#fff}
.home-wow-v3 .ia-header.ia-header--scrolled .ia-cta{background:#061725;color:#fff;border-color:#061725}

.hero-v3{position:relative;min-height:900px;padding-top:117px;overflow:hidden;background:linear-gradient(123deg,#03121d 0%,#061f2e 44%,#073943 100%);isolation:isolate}
.hero-v3-atmosphere{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.hero-v3-glow{position:absolute;border-radius:50%;filter:blur(12px);opacity:.85}
.hero-v3-glow-a{width:820px;height:820px;right:-220px;top:-260px;background:radial-gradient(circle,rgba(48,225,191,.2),rgba(34,127,143,.06) 48%,transparent 70%)}
.hero-v3-glow-b{width:650px;height:650px;left:-320px;bottom:-390px;background:radial-gradient(circle,rgba(47,125,244,.22),transparent 68%)}
.hero-v3-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.027) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.027) 1px,transparent 1px);background-size:72px 72px;mask-image:linear-gradient(110deg,transparent 4%,#000 40%,#000 82%,transparent 100%)}
.hero-v3-wordmark{position:absolute;right:-.04em;bottom:-.18em;color:rgba(255,255,255,.018);font-size:clamp(180px,27vw,440px);font-weight:800;line-height:.8;letter-spacing:-.095em;white-space:nowrap;user-select:none}
.hero-v3-grid-layout{position:relative;z-index:2;min-height:690px;padding:92px 0 68px;display:grid;grid-template-columns:1.1fr .9fr;gap:72px;align-items:center}
.hero-v3-copy{position:relative;z-index:3;max-width:790px}
.hero-v3-overline{display:grid;grid-template-columns:auto 62px 1fr;gap:14px;align-items:center;margin-bottom:46px;color:#7795a7;font-size:9px;font-weight:700;letter-spacing:.08em}
.hero-v3-overline>span{color:#75e8cf;font-weight:800;letter-spacing:.18em}.hero-v3-overline i{height:1px;background:linear-gradient(90deg,rgba(117,232,207,.65),transparent)}.hero-v3-overline small{font:inherit;color:#7894a4}
.hero-v3-kicker{margin-bottom:20px!important;font-size:10px!important;letter-spacing:.13em!important;color:#8cebd8!important}
.hero-v3 h1{max-width:850px;margin:0;color:#f7fbfc;font-size:clamp(54px,6.25vw,94px);font-weight:650;line-height:.98!important;letter-spacing:-.036em!important;text-wrap:balance}
.hero-v3 .hero-lead{max-width:680px;margin:27px 0 34px;color:#abc1cd;font-size:17px;line-height:1.78}
.hero-v3-actions{margin-bottom:42px}.hero-v3 .btn-primary,.hero-v3 .btn-ghost{border-radius:2px;min-height:52px;padding-inline:20px}.hero-v3 .btn-primary{background:#8df2de;color:#04261f}.hero-v3 .btn-ghost{background:transparent;border-color:rgba(255,255,255,.18)}
.hero-v3-ecosystem{max-width:650px;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(255,255,255,.09)}
.hero-v3-ecosystem span{padding:17px 10px 0 0;color:#7895a6;font-size:9px;font-weight:700;letter-spacing:.055em}.hero-v3-ecosystem b{display:block;margin-bottom:5px;color:#4e7186;font-size:8px;font-weight:700}

.hero-v3-field{position:relative;min-height:540px;align-self:center;transform:translate3d(calc(var(--field-x,0) * 1px),calc(var(--field-y,0) * 1px),0);transition:transform .55s cubic-bezier(.2,.7,.2,1)}
.field-caption{display:flex;justify-content:space-between;gap:24px;padding:0 4px 15px;border-bottom:1px solid rgba(255,255,255,.09);color:#5f8397;font-size:8px;letter-spacing:.14em;text-transform:uppercase}.field-caption b{color:#79a0ad;font-weight:700}
.field-stage{position:relative;height:452px;overflow:visible}
.field-ring,.field-axis{position:absolute;pointer-events:none}.field-ring{left:50%;top:50%;border:1px solid rgba(101,224,201,.13);border-radius:50%;transform:translate(-50%,-50%)}
.field-ring-a{width:420px;height:420px;animation:v3Spin 50s linear infinite}.field-ring-b{width:310px;height:310px;border-style:dashed;border-color:rgba(103,143,220,.15);animation:v3SpinReverse 38s linear infinite}.field-ring-c{width:196px;height:196px;border-color:rgba(255,255,255,.09)}
.field-axis-x{left:4%;right:4%;top:50%;height:1px;background:linear-gradient(90deg,transparent,rgba(112,220,201,.16),transparent)}.field-axis-y{top:5%;bottom:5%;left:50%;width:1px;background:linear-gradient(180deg,transparent,rgba(112,220,201,.14),transparent)}
.field-monogram{position:absolute;left:50%;top:50%;width:240px;height:190px;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;color:rgba(226,252,246,.88);font-size:156px;font-weight:500;line-height:.7;letter-spacing:-.17em;text-shadow:0 0 70px rgba(65,226,199,.11)}.field-monogram span:last-child{color:#72e2cd;transform:translateY(18px)}
.field-node{position:absolute;display:grid;grid-template-columns:9px auto;column-gap:8px;align-items:center;color:#dcebef;font-size:10px;font-weight:700;letter-spacing:.08em}.field-node i{width:7px;height:7px;border-radius:50%;background:#69e5cc;box-shadow:0 0 0 6px rgba(105,229,204,.06),0 0 24px rgba(105,229,204,.35)}.field-node small{grid-column:2;color:#54798d;font-size:8px;font-weight:500;letter-spacing:0}.field-node-ai{left:5%;top:21%}.field-node-iot{right:1%;top:30%}.field-node-data{right:9%;bottom:15%}.field-node-dx{left:10%;bottom:18%}
.field-focus{position:absolute;left:50%;top:50%;transform:translate(-50%,105px);min-width:230px;text-align:center}.field-focus span{display:block;color:#4f7689;font-size:8px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}.field-focus strong{display:block;margin-top:5px;color:#e3f1f3;font-size:13px;font-weight:600;letter-spacing:.015em}
.field-footer{display:grid;grid-template-columns:1fr 44px auto;gap:14px;align-items:center;padding-top:16px;border-top:1px solid rgba(255,255,255,.09);color:#66879a;font-size:8px;font-weight:650;letter-spacing:.08em;text-transform:uppercase}.field-footer i{height:1px;background:linear-gradient(90deg,#65dac1,transparent)}.field-footer small{font:inherit;color:#456b7e}

.hero-v3-bottom{position:relative;z-index:4;min-height:94px;display:flex;align-items:center;justify-content:space-between;gap:36px;border-top:1px solid rgba(255,255,255,.085)}
.hero-v3-thesis{display:flex;align-items:center;gap:10px;color:#55798d;font-size:8px;font-weight:750;letter-spacing:.13em;text-transform:uppercase}.hero-v3-thesis i{width:14px;height:1px;background:#315164}
.hero-v3-tabs{position:static!important;left:auto!important;bottom:auto!important;transform:none!important;display:grid!important;grid-template-columns:repeat(3,1fr);gap:0!important;min-width:500px}
.hero-v3-tabs button{position:relative!important;width:auto!important;height:62px!important;min-width:0!important;padding:0 18px!important;display:grid!important;grid-template-columns:25px 1fr!important;gap:8px!important;align-items:center!important;text-align:left!important;border:0!important;border-left:1px solid rgba(255,255,255,.09)!important;border-radius:0!important;background:transparent!important;color:#53778a!important;transition:background .25s,color .25s!important}
.hero-v3-tabs button span{font-size:8px;font-weight:800}.hero-v3-tabs button small{font-size:9px;font-weight:650;white-space:nowrap}.hero-v3-tabs button.active{color:#8df2de!important;background:rgba(255,255,255,.035)!important}.hero-v3-tabs button.active:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:#79e6d0}
.hero-v3-scroll{bottom:24px!important;left:24px!important;right:auto!important;transform:none!important;opacity:.7}

.hero-v3 #hero-kicker,.hero-v3 #hero-title,.hero-v3 #hero-lead,.hero-v3 #hero-focus,.hero-v3 #hero-signal{transition:opacity .2s ease,transform .3s ease}.hero-v3 .v3-swap{animation:v3Swap .48s cubic-bezier(.2,.7,.2,1)}
@keyframes v3Swap{0%{opacity:.15;transform:translateY(8px)}100%{opacity:1;transform:none}}
@keyframes v3Spin{to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes v3SpinReverse{to{transform:translate(-50%,-50%) rotate(-360deg)}}

@media(max-width:1080px){
  .home-wow-v3 .ia-header{background:rgba(4,20,32,.96);backdrop-filter:blur(16px)}
  .hero-v3{padding-top:112px}.hero-v3-grid-layout{grid-template-columns:1fr;gap:36px;padding-top:72px}.hero-v3-copy{max-width:900px}.hero-v3-field{width:min(640px,100%);margin:auto;min-height:500px}.hero-v3-bottom{display:grid;gap:14px;padding:18px 0}.hero-v3-tabs{min-width:0;width:100%}.hero-v3-thesis{justify-content:center;flex-wrap:wrap}
}
@media(max-width:720px){
  .hero-v3{min-height:auto;padding-top:106px}.hero-v3-grid-layout{padding:54px 0 36px;gap:20px}.hero-v3-overline{grid-template-columns:auto 36px 1fr;margin-bottom:32px}.hero-v3-overline small{font-size:8px}.hero-v3 h1{font-size:clamp(43px,12vw,64px);line-height:1.01!important;letter-spacing:-.026em!important}.hero-v3 .hero-lead{font-size:15px;line-height:1.7}.hero-v3-actions{display:grid;grid-template-columns:1fr 1fr}.hero-v3-ecosystem{grid-template-columns:repeat(2,1fr);row-gap:12px}.hero-v3-field{min-height:420px}.field-stage{height:360px}.field-ring-a{width:330px;height:330px}.field-ring-b{width:250px;height:250px}.field-ring-c{width:160px;height:160px}.field-monogram{font-size:118px;width:190px}.field-node small{display:none}.field-node-iot{right:0}.field-node-data{right:5%}.field-footer{grid-template-columns:1fr}.field-footer i,.field-footer small{display:none}.hero-v3-tabs button{height:58px!important;padding:0 10px!important;grid-template-columns:20px 1fr!important}.hero-v3-tabs button small{font-size:8px;white-space:normal;line-height:1.25}.hero-v3-thesis span:nth-of-type(n+4),.hero-v3-thesis i:nth-of-type(n+4){display:none}.hero-v3-scroll{display:none!important}
}
@media(prefers-reduced-motion:reduce){.field-ring-a,.field-ring-b{animation:none}.hero-v3-field{transform:none!important}.hero-v3 .v3-swap{animation:none}}
</style>`;

html = html.replace("</head>", `${css}\n</head>`);

const script = `
<script id="${marker}-script">
(() => {
  const header = document.querySelector('.ia-header');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setHeader = () => header?.classList.toggle('ia-header--scrolled', window.scrollY > 42);
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const swapTargets = ['hero-kicker','hero-title','hero-lead','hero-focus','hero-signal']
    .map(id => document.getElementById(id)).filter(Boolean);
  swapTargets.forEach(el => {
    const obs = new MutationObserver(() => {
      el.classList.remove('v3-swap');
      void el.offsetWidth;
      el.classList.add('v3-swap');
    });
    obs.observe(el, { childList: true, characterData: true, subtree: true });
  });

  if (!reduce) {
    const hero = document.querySelector('.hero-v3');
    const field = document.querySelector('.hero-v3-field');
    hero?.addEventListener('pointermove', event => {
      if (!field || window.innerWidth < 1080) return;
      const r = hero.getBoundingClientRect();
      const x = ((event.clientX - r.left) / r.width - .5) * 10;
      const y = ((event.clientY - r.top) / r.height - .5) * 8;
      field.style.setProperty('--field-x', x.toFixed(2));
      field.style.setProperty('--field-y', y.toFixed(2));
    });
    hero?.addEventListener('pointerleave', () => {
      field?.style.setProperty('--field-x', '0');
      field?.style.setProperty('--field-y', '0');
    });
  }
})();
</script>`;
html = html.replace("</body>", `${script}\n</body>`);

await writeFile(file, html, "utf8");
console.log("IAICT Hero V3 applied: integrated header, open capability field, named slide tabs, refined motion.");
