import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const path = join("artifacts/nidit-portal/dist/public/iaict-portal", "index.html");
const marker = "iaict-home-v74";

const css = `<style id="${marker}">
/* Homepage V7.4 — densify the two remaining sparse knowledge cards */
.article:nth-child(2),.article:nth-child(3){position:relative;overflow:hidden;min-height:315px!important;padding:142px 30px 30px!important;background:linear-gradient(180deg,#fff,#f7fbfa)!important}
.article:nth-child(2)>*,.article:nth-child(3)>*{position:relative;z-index:2}.article:nth-child(2) h3,.article:nth-child(3) h3{margin:8px 0 10px!important}.article:nth-child(2) p,.article:nth-child(3) p{font-size:14px!important;line-height:1.68!important}.home-v74-points{display:grid;gap:7px;margin:15px 0 0;padding:14px 0 0;border-top:1px solid #d9e6e3;list-style:none}.home-v74-points li{position:relative;padding-left:16px;color:#526f78;font-size:11.5px;line-height:1.52}.home-v74-points li:before{content:"";position:absolute;left:0;top:.6em;width:5px;height:5px;border-radius:50%;background:#0b8980;box-shadow:0 0 0 3px rgba(11,137,128,.08)}.home-v74-focus{margin-top:14px;padding-top:12px;border-top:1px solid #d9e6e3;color:#71888d;font-size:9px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}
.article:nth-child(2):before,.article:nth-child(3):before{content:"";position:absolute;z-index:0;left:28px;right:28px;top:24px;height:88px;border:1px solid #d5e5e1;border-radius:20px;box-shadow:0 16px 34px rgba(21,73,70,.05)}
.article:nth-child(2):before{background:radial-gradient(circle at 14% 50%,#0b8b80 0 7px,rgba(11,139,128,.12) 8px 18px,transparent 19px),radial-gradient(circle at 50% 50%,#0b8b80 0 7px,rgba(11,139,128,.12) 8px 18px,transparent 19px),radial-gradient(circle at 86% 50%,#0b8b80 0 7px,rgba(11,139,128,.12) 8px 18px,transparent 19px),linear-gradient(90deg,transparent 14%,rgba(11,139,128,.30) 14.3% 49%,transparent 49.3% 50.7%,rgba(11,139,128,.30) 51% 86%,transparent 86.3%),linear-gradient(135deg,#f3f9f7,#edf6f3)}
.article:nth-child(2):after{content:"HIỆN TRẠNG     →     CHUẨN HÓA     →     SỐ HÓA";position:absolute;z-index:1;left:42px;right:42px;top:87px;color:#55767a;font-size:9px;font-weight:900;letter-spacing:.07em;text-align:center}
.article:nth-child(3):before{background:radial-gradient(circle at 10% 50%,#0c7e89 0 6px,rgba(12,126,137,.11) 7px 16px,transparent 17px),radial-gradient(circle at 36% 50%,#0c7e89 0 6px,rgba(12,126,137,.11) 7px 16px,transparent 17px),radial-gradient(circle at 64% 50%,#0c7e89 0 6px,rgba(12,126,137,.11) 7px 16px,transparent 17px),radial-gradient(circle at 90% 50%,#0c7e89 0 6px,rgba(12,126,137,.11) 7px 16px,transparent 17px),linear-gradient(90deg,transparent 10%,rgba(12,126,137,.28) 10.3% 35%,transparent 35.3% 36.7%,rgba(12,126,137,.28) 37% 63%,transparent 63.3% 64.7%,rgba(12,126,137,.28) 65% 90%,transparent 90.3%),linear-gradient(135deg,#f2f8f8,#edf5f4)}
.article:nth-child(3):after{content:"SENSOR     →     EDGE     →     SERVER     →     VALUE";position:absolute;z-index:1;left:38px;right:38px;top:87px;color:#55757b;font-size:9px;font-weight:900;letter-spacing:.065em;text-align:center}
@media(max-width:1040px){.article:nth-child(2),.article:nth-child(3){min-height:300px!important}}
@media(max-width:680px){.article:nth-child(2),.article:nth-child(3){min-height:0!important;padding:128px 24px 26px!important}.article:nth-child(2):before,.article:nth-child(3):before{left:22px;right:22px;top:20px;height:80px}.article:nth-child(2):after,.article:nth-child(3):after{left:30px;right:30px;top:76px;font-size:8px;letter-spacing:.04em}.home-v74-points li{font-size:11px}}
</style>`;

let html = await readFile(path, "utf8");
if (html.includes(marker)) throw new Error("Homepage V7.4 already applied");
if (!html.includes("iaict-home-v73")) throw new Error("Homepage V7.3 must be applied before V7.4");
html = html.replace("</head>", `${css}</head>`);

const card2 = '<article class="article"><span>Chuyển đổi số</span><h3>Tái thiết kế quy trình trước khi số hóa</h3><p>Số hóa hiệu quả bắt đầu từ việc hiểu và cải tiến cách công việc đang được thực hiện.</p></article>';
const card2New = '<article class="article"><span>Chuyển đổi số</span><h3>Tái thiết kế quy trình trước khi số hóa</h3><p>Số hóa hiệu quả bắt đầu từ việc hiểu và cải tiến cách công việc đang được thực hiện.</p><ul class="home-v74-points"><li>Rà soát bước làm việc và điểm nghẽn hiện tại</li><li>Chuẩn hóa biểu mẫu, dữ liệu và trách nhiệm</li><li>Chỉ số hóa khi quy trình mục tiêu đã đủ rõ</li></ul><div class="home-v74-focus">Trọng tâm · Process · Data · Governance</div></article>';
const card3 = '<article class="article"><span>IoT & Dữ liệu</span><h3>Từ sensor đến dữ liệu có giá trị</h3><p>Một chuỗi dữ liệu tốt cần thu thập, kiểm tra, truyền dẫn, lưu trữ và khai thác nhất quán.</p></article>';
const card3New = '<article class="article"><span>IoT & Dữ liệu</span><h3>Từ sensor đến dữ liệu có giá trị</h3><p>Một chuỗi dữ liệu tốt cần thu thập, kiểm tra, truyền dẫn, lưu trữ và khai thác nhất quán.</p><ul class="home-v74-points"><li>Thu nhận dữ liệu ổn định từ cảm biến hiện trường</li><li>Kiểm tra và truyền dữ liệu qua gateway/kết nối</li><li>Lưu trữ có cấu trúc để phân tích và khai thác</li></ul><div class="home-v74-focus">Trọng tâm · Sensor · Edge · Server · Data</div></article>';
if (!html.includes(card2)) throw new Error("Knowledge card 02 markup not found");
if (!html.includes(card3)) throw new Error("Knowledge card 03 markup not found");
html = html.replace(card2, card2New).replace(card3, card3New);

await writeFile(path, html, "utf8");
console.log("Densified IAICT knowledge cards V7.4");
