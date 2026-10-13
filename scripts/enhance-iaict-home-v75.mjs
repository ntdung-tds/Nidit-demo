import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const path = join("artifacts/nidit-portal/dist/public/iaict-portal", "index.html");
const marker = "iaict-home-v75";

const css = `<style id="${marker}">
/* Homepage V7.5 — bring the Academy knowledge card to the same professional density */
.article:nth-child(4){position:relative;overflow:hidden;min-height:315px!important;padding:142px 30px 30px!important;background:linear-gradient(180deg,#fff,#f7fbfa)!important}
.article:nth-child(4)>*{position:relative;z-index:2}.article:nth-child(4) h3{margin:8px 0 10px!important}.article:nth-child(4) p{font-size:14px!important;line-height:1.68!important}
.article:nth-child(4):before{content:"";position:absolute;z-index:0;left:28px;right:28px;top:24px;height:88px;border:1px solid #d5e5e1;border-radius:20px;box-shadow:0 16px 34px rgba(21,73,70,.05);background:radial-gradient(circle at 10% 50%,#0a887d 0 6px,rgba(10,136,125,.11) 7px 16px,transparent 17px),radial-gradient(circle at 36% 50%,#0a887d 0 6px,rgba(10,136,125,.11) 7px 16px,transparent 17px),radial-gradient(circle at 64% 50%,#0a887d 0 6px,rgba(10,136,125,.11) 7px 16px,transparent 17px),radial-gradient(circle at 90% 50%,#0a887d 0 6px,rgba(10,136,125,.11) 7px 16px,transparent 17px),linear-gradient(90deg,transparent 10%,rgba(10,136,125,.28) 10.3% 35%,transparent 35.3% 36.7%,rgba(10,136,125,.28) 37% 63%,transparent 63.3% 64.7%,rgba(10,136,125,.28) 65% 90%,transparent 90.3%),linear-gradient(135deg,#f3f9f7,#edf6f3)}
.article:nth-child(4):after{content:"VAI TRÒ     →     NHIỆM VỤ     →     THỰC HÀNH     →     ĐÁNH GIÁ";position:absolute;z-index:1;left:36px;right:36px;top:87px;color:#55767a;font-size:9px;font-weight:900;letter-spacing:.055em;text-align:center}
.home-v75-points{display:grid;gap:7px;margin:15px 0 0;padding:14px 0 0;border-top:1px solid #d9e6e3;list-style:none}.home-v75-points li{position:relative;padding-left:16px;color:#526f78;font-size:11.5px;line-height:1.52}.home-v75-points li:before{content:"";position:absolute;left:0;top:.6em;width:5px;height:5px;border-radius:50%;background:#0a887d;box-shadow:0 0 0 3px rgba(10,136,125,.08)}.home-v75-focus{margin-top:14px;padding-top:12px;border-top:1px solid #d9e6e3;color:#71888d;font-size:9px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}
@media(max-width:1040px){.article:nth-child(4){min-height:300px!important}}
@media(max-width:680px){.article:nth-child(4){min-height:0!important;padding:128px 24px 26px!important}.article:nth-child(4):before{left:22px;right:22px;top:20px;height:80px}.article:nth-child(4):after{left:28px;right:28px;top:76px;font-size:8px;letter-spacing:.03em}.home-v75-points li{font-size:11px}}
</style>`;

let html = await readFile(path, "utf8");
if (html.includes(marker)) throw new Error("Homepage V7.5 already applied");
if (!html.includes("iaict-home-v74")) throw new Error("Homepage V7.4 must be applied before V7.5");
html = html.replace("</head>", `${css}</head>`);

const card4 = '<article class="article"><span>IAICT Academy</span><h3>Năng lực AI theo vị trí việc làm</h3><p>Đào tạo theo nhiệm vụ, tình huống và trách nhiệm cụ thể giúp AI đi vào công việc thực tế.</p></article>';
const card4New = '<article class="article"><span>IAICT Academy</span><h3>Năng lực AI theo vị trí việc làm</h3><p>Đào tạo theo nhiệm vụ, tình huống và trách nhiệm cụ thể giúp AI đi vào công việc thực tế.</p><ul class="home-v75-points"><li>Xác định năng lực AI cần có theo từng vị trí việc làm</li><li>Thiết kế bài tập theo nhiệm vụ và tình huống thực tế</li><li>Đánh giá bằng sản phẩm công việc thay vì học lý thuyết đơn thuần</li></ul><div class="home-v75-focus">Trọng tâm · Role · Task · Practice · Evidence</div></article>';
if (!html.includes(card4)) throw new Error("Academy knowledge card markup not found");
html = html.replace(card4, card4New);

await writeFile(path, html, "utf8");
console.log("Enhanced IAICT Academy knowledge card V7.5");
