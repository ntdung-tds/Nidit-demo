import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const path = join("artifacts/nidit-portal/dist/public/iaict-portal", "index.html");
const marker = "iaict-home-v72";

const css = `<style id="${marker}">
/* Homepage V7.2 — fill intentional space with visuals, not filler copy */
.need:first-child{position:relative;padding-right:220px!important}
.need:first-child:before{content:"";position:absolute;right:28px;top:88px;width:164px;height:138px;border-radius:22px;background:linear-gradient(180deg,rgba(3,24,33,.06),rgba(3,24,33,.5)),url('../images/field-chuyen-doi-so.jpg') center/cover no-repeat;box-shadow:0 18px 44px rgba(0,0,0,.22);opacity:.95}
.need:first-child:after{content:"MAP  →  PRIORITY  →  ROADMAP";position:absolute;right:38px;top:238px;width:144px;color:#9fdbd1;font-size:8px;font-weight:900;letter-spacing:.08em;text-align:center}

.gallery .g{position:relative;overflow:hidden;background-position:center!important;background-size:cover!important;isolation:isolate}
.gallery .g:before{content:"";position:absolute;inset:0;z-index:0;background:linear-gradient(180deg,rgba(3,18,27,.12),rgba(3,22,32,.78) 76%)}
.gallery .g>*{position:relative;z-index:1}
.gallery .g:nth-child(1){background-image:url('../images/ha-tang-iot.jpg')!important}
.gallery .g:nth-child(2){background-image:url('../images/field-du-lieu.jpg')!important}
.gallery .g:nth-child(3){background-image:url('../images/du-lieu-gan-nhan.jpg')!important}
.gallery .g:nth-child(4){background-image:url('../images/news-tap-huan.jpg')!important}

.article:first-child{position:relative;overflow:hidden;padding:270px 44px 42px!important;display:block!important;justify-content:initial!important;min-height:500px!important;background:linear-gradient(145deg,#f1f7f5,#e8f3f0)!important}
.article:first-child:before{content:"";position:absolute;left:24px;right:24px;top:24px;height:205px;border-radius:26px;background:linear-gradient(180deg,rgba(5,25,38,.1),rgba(5,25,38,.48)),url('../images/news-phong-lab-ai.jpg') center/cover no-repeat;box-shadow:0 20px 52px rgba(10,42,56,.11)}
.article:first-child:after{content:"DATA  →  AI  →  REVIEW";position:absolute;left:50px;right:50px;top:198px;color:#d8f3ec;font-size:9px;font-weight:900;letter-spacing:.14em;text-align:right}
.article:first-child span{display:inline-flex;align-items:center;gap:10px;margin:0 0 16px!important}
.article:first-child span:before{content:"";width:34px;height:1px;background:#0a8b7c}
.article:first-child h3{margin:0 0 12px!important}
.home-v72-article-points{display:grid;gap:8px;margin:17px 0 0;padding:15px 0 0;border-top:1px solid #d7e5e1;list-style:none}
.home-v72-article-points li{position:relative;padding-left:17px;color:#526e78;font-size:12px;line-height:1.6}
.home-v72-article-points li:before{content:"";position:absolute;left:0;top:.6em;width:6px;height:6px;border-radius:50%;background:#0a8b7c;box-shadow:0 0 0 4px rgba(10,139,124,.08)}
.article:not(:first-child){min-height:185px!important}

.journey article{min-height:220px!important;padding-bottom:24px!important}
.journey article:after{content:"";position:absolute;left:0;right:22px;bottom:0;height:3px;background:linear-gradient(90deg,#0b8a82,rgba(11,138,130,.06) 75%,transparent)}

@media(max-width:1040px){
  .need:first-child{padding-right:26px!important;padding-top:210px!important}
  .need:first-child:before{left:26px;right:26px;top:28px;width:auto;height:144px}
  .need:first-child:after{left:40px;right:40px;top:182px;width:auto}
  .article:first-child{padding:245px 34px 34px!important}
  .article:first-child:before{left:24px;right:24px;height:180px}
  .article:first-child:after{top:175px}
}
@media(max-width:680px){
  .need:first-child{padding-top:185px!important}
  .need:first-child:before{height:125px}
  .need:first-child:after{top:160px}
  .article:first-child{min-height:0!important;padding:220px 24px 28px!important}
  .article:first-child:before{left:18px;right:18px;top:18px;height:165px}
  .article:first-child:after{left:32px;right:32px;top:158px;font-size:8px}
  .journey article{min-height:0!important}
}
</style>`;

let html = await readFile(path, "utf8");
if (html.includes(marker)) throw new Error("Homepage V7.2 already applied");
if (!html.includes("iaict-home-v7")) throw new Error("Homepage V7 must be applied before V7.2");
html = html.replace("</head>", `${css}</head>`);

const knowledgeLead = '<article class="article"><span>AI & Công vụ</span><h3>AI có kiểm soát trong môi trường công vụ</h3><p>Cách gắn AI với quy trình, dữ liệu, quyền truy cập và cơ chế kiểm tra.</p></article>';
const knowledgeLeadV72 = '<article class="article"><span>AI & Công vụ</span><h3>AI có kiểm soát trong môi trường công vụ</h3><p>Cách gắn AI với quy trình, dữ liệu, quyền truy cập và cơ chế kiểm tra.</p><ul class="home-v72-article-points"><li>Gắn AI với quy trình nghiệp vụ cụ thể</li><li>Phân quyền dữ liệu và kiểm soát đầu ra</li><li>Thiết lập bước rà soát, phê duyệt và lưu vết</li></ul></article>';
if (!html.includes(knowledgeLead)) throw new Error("Knowledge lead card not found");
html = html.replace(knowledgeLead, knowledgeLeadV72);

await writeFile(path, html, "utf8");
console.log("Balanced IAICT homepage visual density V7.2");
