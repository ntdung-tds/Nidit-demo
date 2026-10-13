import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const path = join("artifacts/nidit-portal/dist/public/iaict-portal", "index.html");
const marker = "iaict-home-v7";

const needs = [
  {
    narrative: "Phù hợp với đơn vị đang có nhiều nhu cầu hoặc sáng kiến rời rạc nhưng chưa có thứ tự ưu tiên, tiêu chí đo và lộ trình triển khai thống nhất.",
    points: ["Rà soát quy trình, dữ liệu và hệ thống hiện có", "Xác định điểm nghẽn và nhóm ưu tiên", "Chia lộ trình theo giai đoạn và khả năng tiếp nhận"],
    output: "Bản đồ ưu tiên · lộ trình · tiêu chí đánh giá",
    tags: ["Roadmap", "Process", "Governance"],
  },
  {
    narrative: "Trọng tâm là dữ liệu đầu vào, quyền truy cập, cách kiểm tra kết quả và vị trí AI tham gia vào quy trình — không chỉ dừng ở một chatbot độc lập.",
    points: ["Chuẩn hóa nguồn dữ liệu và luồng xử lý", "Gắn AI với nhiệm vụ, vai trò và quyền truy cập", "Thiết kế cơ chế kiểm tra và phản hồi đầu ra"],
    output: "Luồng dữ liệu · nguyên mẫu AI · tiêu chí kiểm soát",
    tags: ["AI", "Data", "Workflow"],
  },
  {
    narrative: "Thiết kế ưu tiên dữ liệu đến được server ổn định, có thể kiểm tra và lưu trữ có cấu trúc trước khi bổ sung các lớp phân tích hoặc tự động hóa.",
    points: ["Cảm biến, gateway, nguồn và kết nối phù hợp hiện trường", "Luồng dữ liệu từ thiết bị về server/CSDL", "Giám sát trạng thái và hỗ trợ vận hành"],
    output: "Kiến trúc IoT · luồng dữ liệu · cấu hình vận hành",
    tags: ["Sensor", "Edge", "Server"],
  },
  {
    narrative: "Một dự án chỉ thực sự hoàn thành khi người tiếp nhận hiểu cách cấu hình, vận hành, xử lý tình huống và tiếp tục phát triển hệ thống sau bàn giao.",
    points: ["Chuẩn hóa tài liệu và cấu hình bàn giao", "Đào tạo theo vai trò và nhiệm vụ thực tế", "Hỗ trợ sau tiếp nhận và mở rộng khi cần"],
    output: "Tài liệu · đào tạo · cơ chế hỗ trợ sau bàn giao",
    tags: ["Transfer", "Academy", "Support"],
  },
];

const css = `<style id="${marker}">
.cap b{font-size:13px!important;line-height:1.35}.cap small{font-size:11px!important;line-height:1.45}.cap span{font-size:10px!important}
.needs{grid-template-rows:330px 330px!important}.need{gap:20px;padding:28px!important}.need-top{font-size:10px!important}.need h3{font-size:28px!important}.need>div>p:first-of-type{font-size:14px!important;line-height:1.7!important}.home-v7-narrative{margin:12px 0 0;color:#496671;font-size:12px;line-height:1.62}.home-v7-points{display:grid;gap:7px;margin:15px 0 0;padding:14px 0 0;border-top:1px solid #dbe6e5;list-style:none}.home-v7-points li{position:relative;padding-left:15px;color:#496671;font-size:11px;line-height:1.5}.home-v7-points li:before{content:"";position:absolute;left:0;top:.6em;width:5px;height:5px;border-radius:50%;background:#0b857a;box-shadow:0 0 0 3px rgba(11,133,122,.08)}.home-v7-output{display:grid;gap:5px;margin-top:14px;padding-top:12px;border-top:1px solid #dbe6e5}.home-v7-output small{color:#84979c;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.home-v7-output b{color:#294f5a;font-size:11px;line-height:1.45}.home-v7-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;padding-right:25px}.home-v7-tags span{padding:5px 8px;border:1px solid #dce7e5;border-radius:999px;color:#667f87;background:rgba(255,255,255,.8);font-size:9px;font-weight:800}.need:first-child .home-v7-narrative,.need:first-child .home-v7-points li,.need:first-child .home-v7-output small,.need:first-child .home-v7-output b{color:#d4e7e7}.need:first-child .home-v7-points,.need:first-child .home-v7-output{border-color:rgba(255,255,255,.15)}.need:first-child .home-v7-tags span{color:#d9eeee;border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.05)}.need:first-child .home-v7-points li:before{background:#72e3cd;box-shadow:0 0 0 3px rgba(114,227,205,.08)}
.eco-item h3{font-size:27px!important}.eco-item p{font-size:14px!important;line-height:1.7!important}.eco-item>span{font-size:11px!important}
.project-v4-story>p{font-size:15px!important;line-height:1.72!important}.project-v4-facts small,.project-v4-top small,.project-v4-step small,.project-v4-note>span{font-size:10px!important}.project-v4-facts b{font-size:13px!important}.project-v4-step>b{font-size:14px!important}.project-v4-step>p{font-size:12px!important;line-height:1.58!important}.project-v4-note p{font-size:13px!important;line-height:1.65!important}
.journey span{font-size:10px!important}.journey h3{font-size:22px!important}.journey p{font-size:14px!important;line-height:1.68!important}.expert span{font-size:10px!important}.expert h3{font-size:23px!important}.expert p{font-size:14px!important;line-height:1.68!important}.g small{font-size:11px!important}.g b{font-size:23px!important;line-height:1.18}.g:first-child b{font-size:29px!important}.article span{font-size:10px!important}.article h3{font-size:23px!important}.article p{font-size:14px!important;line-height:1.68!important}
@media(max-width:1080px){.needs{grid-template-rows:auto!important}.need{min-height:360px}.need:first-child{min-height:500px}.home-v7-narrative{font-size:11.5px}.home-v7-points li{font-size:10.5px}}
@media(max-width:760px){.needs{grid-template-rows:auto!important}.need,.need:first-child{min-height:0}.cap b{font-size:12px!important}.cap small{font-size:10px!important}.need h3{font-size:25px!important}.need>div>p:first-of-type{font-size:13px!important}.home-v7-narrative{font-size:11.5px}.home-v7-points li{font-size:10.5px}.journey p,.expert p,.article p{font-size:13px!important}}
</style>`;

let html = await readFile(path, "utf8");
if (html.includes(marker)) throw new Error("Homepage V7 already applied");
if (!html.includes("Bài toán đúng trước")) throw new Error("Homepage needs section not found");
html = html.replace("</head>", `${css}</head>`);

let index = 0;
html = html.replace(/<a class="need"[\s\S]*?<\/a>/g, (card) => {
  const detail = needs[index++];
  if (!detail) return card;
  const extra = `<p class="home-v7-narrative">${detail.narrative}</p><ul class="home-v7-points">${detail.points.map((p) => `<li>${p}</li>`).join("")}</ul><div class="home-v7-output"><small>Đầu ra gợi ý</small><b>${detail.output}</b></div><div class="home-v7-tags">${detail.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>`;
  return card.replace(/(<p>[^<]*<\/p>)(<\/div><span class="arrow">)/, `$1${extra}$2`);
});
if (index !== needs.length) throw new Error(`Expected ${needs.length} need cards, found ${index}`);

await writeFile(path, html, "utf8");
console.log("Enhanced IAICT homepage cards and typography V7");
