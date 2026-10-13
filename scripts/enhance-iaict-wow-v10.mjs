import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = "artifacts/nidit-portal/dist/public/iaict-portal";
const marker = "iaict-wow-v10";

const css = `<style id="${marker}">
:root{--v10-blue:#0b3d91;--v10-deep:#072b6b;--v10-accent:#1d6ef2;--v10-accent2:#4895ff;--v10-sky:#eaf3ff;--v10-bg:#f7fbff;--v10-paper:#fff;--v10-ink:#10233f;--v10-muted:#5b6b85;--v10-line:#d6e6ff;--v10-shadow:0 25px 68px rgba(26,73,139,.11);--v9-bg:#f7fbff;--v9-warm:#fff;--v9-alt:#eaf3ff;--v9-paper:rgba(255,255,255,.94);--v9-line:rgba(74,132,213,.21);--v9-ink:#10233f;--v9-muted:#5b6b85;--v9-teal:#1d6ef2;--v9-navy:#061f4a;--v9-shadow:0 25px 68px rgba(26,73,139,.11)}
html{background:var(--v10-bg)!important}body{color:var(--v10-ink)!important;background:radial-gradient(circle at 7% 8%,rgba(72,149,255,.13),transparent 25rem),radial-gradient(circle at 94% 24%,rgba(11,61,145,.09),transparent 32rem),linear-gradient(180deg,#fff 0%,#f7fbff 36%,#f0f6ff 100%)!important;background-attachment:fixed}
.ia-header{background:rgba(255,255,255,.95)!important;border-bottom-color:var(--v10-line)!important;box-shadow:0 12px 36px rgba(21,67,128,.055)!important}.ia-top{background:#061f4a!important;color:#c9dcfb!important}.ia-top span:last-child{color:#83b7ff!important}.ia-mark{background:linear-gradient(145deg,#0b3d91,#1d6ef2)!important}.ia-nav a:hover,.ia-nav summary:hover,.ia-search:hover{color:#1d6ef2!important}.ia-cta{background:#0b3d91!important;color:#fff!important}.ia-cta:hover{background:#072b6b!important}.ia-footer{background:#061f4a!important;color:#a9c3e8!important}.ia-footer b{color:#77adff!important}
.section:not(.dark):not(.project-v4-section){background:transparent!important}.section.mist,.soft,.v8-section.alt{background:linear-gradient(145deg,#eaf3ff,#f8fbff 62%,#eef6ff)!important;border-color:var(--v10-line)!important}.detail,.card,.tile,.need,.article,.safe-state,.search-shell{border-color:var(--v10-line)!important;background:#fff!important;box-shadow:0 14px 38px rgba(26,73,139,.065)!important}.need:first-child,.article:first-child{background:linear-gradient(145deg,#e7f1ff,#fff)!important}.need:hover{background:linear-gradient(145deg,#061f4a,#0b3d91)!important}.project-v4-section{background:linear-gradient(145deg,#e3efff,#f8fbff 56%,#eaf3ff)!important;border-color:var(--v10-line)!important}.journey article{background:rgba(255,255,255,.72)!important}.gallery .g{box-shadow:0 22px 58px rgba(26,73,139,.12)!important}
.v6-page{--accent:#1d6ef2!important;--accent-soft:#eaf3ff!important;--ink:#10233f!important;--muted:#5b6b85!important;--hero-a:#fff!important;--hero-b:#eaf3ff!important;background:transparent!important}.v6-hero{background:radial-gradient(circle at 86% 16%,rgba(29,110,242,.16),transparent 28%),linear-gradient(142deg,#fff,#f2f7ff 50%,#eaf3ff)!important;border-bottom-color:var(--v10-line)!important}.v6-body{background:linear-gradient(180deg,#f8fbff,#eaf3ff)!important}.v6-card{background:linear-gradient(155deg,#fff,#f5f9ff 86%)!important;border-color:var(--v10-line)!important;box-shadow:0 18px 42px rgba(26,73,139,.08)!important}.v62-meta>div,.v62-tags span{background:#fff!important;border-color:var(--v10-line)!important}.v6-final{background:linear-gradient(135deg,#061f4a,#0b3d91 64%,#125fc9)!important}
.v8-section{background:transparent!important}.v8-section.alt{background:linear-gradient(145deg,#eaf3ff,#f8fbff)!important}.v8-card,.v8-principle,.v8-topic,.v8-process article,.v8-story,.v8-news article,.v8-events{background:#fff!important;border-color:var(--v10-line)!important;box-shadow:0 14px 38px rgba(26,73,139,.065)!important}.v8-chip{background:#fff!important;border-color:var(--v10-line)!important}.v8-hero{background:radial-gradient(circle at 82% 18%,rgba(72,149,255,.20),transparent 30%),linear-gradient(145deg,#061f4a,#0b3d91 66%,#125fc9)!important}.v8-eyebrow,.v8-label{color:#91bdff!important}.v8-btn{background:#1d6ef2!important;color:#fff!important}
.v9-hero{background:radial-gradient(circle at 84% 18%,rgba(72,149,255,.18),transparent 28%),radial-gradient(circle at 18% 84%,rgba(11,61,145,.07),transparent 25%),linear-gradient(145deg,#fff,#f2f7ff 58%,#eaf3ff)!important;border-bottom-color:var(--v10-line)!important}.v9-hero:before{background-image:linear-gradient(rgba(29,110,242,.038) 1px,transparent 1px),linear-gradient(90deg,rgba(29,110,242,.038) 1px,transparent 1px)!important}.v9-kicker{color:#1d6ef2!important}.v9-hero h1{color:#10233f!important}.v9-lead{color:#5b6b85!important}.v9-signal{background:rgba(255,255,255,.9)!important;border-color:var(--v10-line)!important}.v9-signal>div{border-color:var(--v10-line)!important}.v9-signal strong{color:#17365f!important}.v9-section.alt{background:linear-gradient(145deg,#eaf3ff,#f8fbff)!important;border-color:var(--v10-line)!important}.v9-section.dark{background:linear-gradient(145deg,#061f4a,#082f70 58%,#0b3d91)!important}.v9-feature{background:#fff!important;border-color:var(--v10-line)!important;box-shadow:var(--v10-shadow)!important}.v9-feature-visual{background:linear-gradient(145deg,#0b3d91,#072b6b)!important}.v9-feature-visual>span{color:#91bdff!important}.v9-feature-visual p{color:#c3d7f5!important}.v9-card,.v9-search,.v9-path{background:#fff!important;border-color:var(--v10-line)!important;box-shadow:0 14px 38px rgba(26,73,139,.065)!important}.v9-card>span,.v9-search label,.v9-path span,.v9-action{color:#1d6ef2!important}.v9-searchbox input{border-color:#bfd6f8!important;background:#f7fbff!important}.v9-searchbox button{background:#0b3d91!important;color:#fff!important}.v9-flow article:after,.v9-flow span{color:#79adff!important}.v9-cta{background:linear-gradient(135deg,#061f4a,#0b3d91)!important}.v9-btn{background:#1d6ef2!important;color:#fff!important}
.hero{background:#061a3c!important}.need h3,.article h3,.v9-card h3{color:#10233f}.project-v4-copy,.project-v4-dark,.dark{background-color:#061f4a!important}.project-v4-copy{background:linear-gradient(145deg,#0b3d91,#0a56b8)!important}.knowledge,.expertise{background:linear-gradient(180deg,#f8fbff,#eaf3ff)!important}.closing{background:linear-gradient(135deg,#0b3d91,#0a56b8)!important}
.button.primary,.button-primary,.primary,.ia-btn-primary{background:#0b3d91!important;color:#fff!important;box-shadow:0 12px 28px rgba(11,61,145,.18)!important}.button.secondary,.button-secondary{background:#fff!important;border-color:#b8d3fb!important;color:#0b3d91!important}.text-link,a.text-link{color:#1d6ef2!important}
@media(max-width:680px){body{background-attachment:scroll}}
</style>`;

async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collect(path));
    else if (entry.name === "index.html") files.push(path);
  }
  return files;
}

const files = await collect(root);
let changed = 0;
for (const file of files) {
  let html = await readFile(file, "utf8");
  if (html.includes(`id="${marker}"`)) continue;
  if (!html.includes("</head>")) throw new Error(`Missing </head>: ${file}`);
  html = html.replace("</head>", `${css}</head>`);
  await writeFile(file, html);
  changed += 1;
}

console.log(`IAICT WOW+++ V10 blue-white applied to ${changed} pages.`);
