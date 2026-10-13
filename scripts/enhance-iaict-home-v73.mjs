import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const path = join("artifacts/nidit-portal/dist/public/iaict-portal", "index.html");
const marker = "iaict-home-v73";

const css = `<style id="${marker}">
/* Homepage V7.3 — tighten remaining empty blocks from visual review */

/* Closing CTA: restore deliberate horizontal breathing room. */
.closing{padding:58px clamp(42px,5.4vw,72px)!important;box-sizing:border-box!important}
.closing>div:first-child{padding-left:0!important}.closing>div:last-child{padding-right:0!important}
.closing p{font-size:15px!important;line-height:1.75!important}.closing .btn-primary{margin-top:20px}

/* Knowledge card 02: compact height + process strip in the formerly empty lower half. */
.article:nth-child(2){position:relative;overflow:hidden;min-height:292px!important;padding:28px 30px 126px!important;background:linear-gradient(180deg,#fff,#f8fbfa)!important}
.article:nth-child(2):before{content:"";position:absolute;left:30px;right:30px;bottom:30px;height:70px;border:1px solid #d8e6e3;border-radius:18px;background:radial-gradient(circle at 13% 50%,#0b8b80 0 6px,rgba(11,139,128,.12) 7px 15px,transparent 16px),radial-gradient(circle at 50% 50%,#0b8b80 0 6px,rgba(11,139,128,.12) 7px 15px,transparent 16px),radial-gradient(circle at 87% 50%,#0b8b80 0 6px,rgba(11,139,128,.12) 7px 15px,transparent 16px),linear-gradient(90deg,transparent 13%,rgba(11,139,128,.28) 13.2% 49%,transparent 49.2% 50.8%,rgba(11,139,128,.28) 51% 87%,transparent 87.2%),rgba(244,249,247,.94)}
.article:nth-child(2):after{content:"HIỆN TRẠNG     →     CHUẨN HÓA     →     SỐ HÓA";position:absolute;left:44px;right:44px;bottom:53px;color:#5d797e;font-size:9px;font-weight:900;letter-spacing:.08em;text-align:center}
.article:nth-child(2) h3{margin-top:18px!important}.article:nth-child(2) p{font-size:14px!important;line-height:1.7!important}

/* Journey: pull the heading/timeline together and turn the footer into useful deliverables. */
.section:has(.journey){padding:82px 0 88px!important}
.section:has(.journey) .editorial-head{margin-bottom:34px!important}
.journey article{min-height:232px!important;padding-bottom:72px!important}
.journey article:after{position:absolute!important;left:0!important;right:20px!important;bottom:18px!important;height:auto!important;padding-top:10px;border-top:1px solid #d8e4e3;background:none!important;color:#698188;font-size:10px;font-weight:760;line-height:1.45;letter-spacing:.015em}
.journey article:nth-child(1):after{content:"Đầu ra · hiện trạng · điểm nghẽn · phạm vi"}
.journey article:nth-child(2):after{content:"Đầu ra · kiến trúc · backlog · tiêu chí đo"}
.journey article:nth-child(3):after{content:"Đầu ra · PoC · đánh giá · điều chỉnh"}
.journey article:nth-child(4):after{content:"Đầu ra · tài liệu · đào tạo · bàn giao"}
.journey article:nth-child(5):after{content:"Đầu ra · chuẩn mở rộng · roadmap"}

@media(max-width:1040px){
  .closing{padding:48px 44px!important}
  .section:has(.journey){padding:76px 0 80px!important}
  .article:nth-child(2){min-height:270px!important}
}
@media(max-width:680px){
  .closing{padding:34px 26px 38px!important}
  .article:nth-child(2){min-height:0!important;padding:24px 24px 118px!important}
  .article:nth-child(2):before{left:24px;right:24px;bottom:24px;height:66px}
  .article:nth-child(2):after{left:32px;right:32px;bottom:46px;font-size:8px}
  .section:has(.journey){padding:68px 0 72px!important}
  .section:has(.journey) .editorial-head{margin-bottom:28px!important}
  .journey article{min-height:0!important;padding-bottom:70px!important}
}
</style>`;

let html = await readFile(path, "utf8");
if (html.includes(marker)) throw new Error("Homepage V7.3 already applied");
if (!html.includes("iaict-home-v72")) throw new Error("Homepage V7.2 must be applied before V7.3");
if (!html.includes("Tái thiết kế quy trình trước khi số hóa")) throw new Error("Knowledge card 02 not found");
if (!html.includes("Từ nhu cầu đến khả năng nhân rộng")) throw new Error("Journey section not found");
html = html.replace("</head>", `${css}</head>`);
await writeFile(path, html, "utf8");
console.log("Fixed remaining IAICT homepage empty blocks V7.3");
