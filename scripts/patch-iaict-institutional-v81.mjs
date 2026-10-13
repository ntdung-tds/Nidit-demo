import { readFile, writeFile } from "node:fs/promises";

const path = "scripts/enhance-iaict-institutional-v8.mjs";
let source = await readFile(path, "utf8");

const oldBlock = `  const headerEnd = html.indexOf("</header>");
  const footerStart = html.indexOf("<footer", headerEnd);
  if (headerEnd < 0 || footerStart < 0) throw new Error(\`Cannot locate chrome boundaries in \${relative}\`);
  html = html.replace(/<title>.*?<\\/title>/s, \`<title>\${page.title}</title>\`);
  html = html.replace("</head>", \`\${institutionalCss}</head>\`);
  html = \`\${html.slice(0, headerEnd + 9)}\${page.body}\${html.slice(footerStart)}\`;`;

const newBlock = `  html = html.replace(/<title>.*?<\\/title>/s, \`<title>\${page.title}</title>\`);
  html = html.replace("</head>", \`\${institutionalCss}</head>\`);
  const headerEnd = html.indexOf("</header>");
  const footerStart = html.indexOf("<footer", headerEnd);
  if (headerEnd < 0 || footerStart < 0) throw new Error(\`Cannot locate chrome boundaries in \${relative}\`);
  html = \`\${html.slice(0, headerEnd + 9)}\${page.body}\${html.slice(footerStart)}\`;`;

if (!source.includes(oldBlock)) {
  throw new Error("Institutional V8 boundary block not found; refusing unsafe patch");
}

source = source.replace(oldBlock, newBlock);

// Improve readability on legacy static-page chrome without changing its stable structure.
source = source.replace(
  `.ia-top .ia-shell{font-size:10px!important}`,
  `.ia-top .ia-shell{font-size:10px!important}.topbar .shell{font-size:10px!important}.header .nav{font-size:12.5px!important}.header .brand small{font-size:11px!important}.footer .footgrid p{font-size:13px!important;line-height:1.72!important}.footer .footgrid a{font-size:12px!important;line-height:1.55!important}.footer .footgrid h4{font-size:10px!important;letter-spacing:.12em!important;text-transform:uppercase!important}`,
);

await writeFile(path, source, "utf8");
console.log("Patched institutional V8 transform ordering and legacy chrome typography (V8.1)");
