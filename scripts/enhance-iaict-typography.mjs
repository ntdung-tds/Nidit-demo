import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = "artifacts/nidit-portal/dist/public/iaict-portal";
const marker = "iaict-vietnamese-typography";

const typography = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style id="${marker}">
  html body {
    font-family: "Be Vietnam Pro", "Segoe UI", Arial, sans-serif;
    font-synthesis: none;
    font-kerning: normal;
    font-feature-settings: "kern" 1, "liga" 1;
  }
  button, input, textarea, select { font: inherit; }
  h1, h2, h3, h4, h5, h6 {
    font-family: "Be Vietnam Pro", "Segoe UI", Arial, sans-serif;
    font-kerning: normal;
    text-wrap: balance;
  }
  p, li { text-wrap: pretty; }
  h1 { letter-spacing: -0.032em !important; }
  h2 { letter-spacing: -0.024em !important; }
  h3 { letter-spacing: -0.014em !important; }
  .hero h1 { line-height: .99 !important; font-weight: 700; }
  .editorial-head h2 { line-height: 1.06 !important; font-weight: 700; }
  .ia-nav, .ia-actions, .ia-brand, .eyebrow, .kicker { font-family: "Be Vietnam Pro", "Segoe UI", Arial, sans-serif; }
  @media (max-width: 720px) {
    h1 { letter-spacing: -0.024em !important; }
    h2 { letter-spacing: -0.018em !important; }
  }
</style>`;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && entry.name === "index.html") files.push(path);
  }
  return files;
}

const files = await walk(root);
let updated = 0;

for (const file of files) {
  let html = await readFile(file, "utf8");
  if (html.includes(`id="${marker}"`)) continue;
  if (!html.includes("</head>")) continue;
  html = html.replace("</head>", `${typography}\n</head>`);
  await writeFile(file, html, "utf8");
  updated += 1;
}

console.log(`IAICT typography applied to ${updated} page(s): Be Vietnam Pro + Vietnamese spacing rules.`);
