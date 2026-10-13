import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = "artifacts/nidit-portal/dist/public/iaict-portal";
const marker = "iaict-category-v61";

const details = {
  "giai-phap-dich-vu": [
    ["DISCOVERY", ["Khảo sát hiện trạng & quy trình", "Xác định ưu tiên và lộ trình"], ["Roadmap", "Assessment"]],
    ["ARCHITECTURE", ["So sánh phương án công nghệ", "Chọn kiến trúc theo điều kiện vận hành"], ["Architecture", "Fit-for-purpose"]],
    ["SYSTEM DESIGN", ["Kiến trúc ứng dụng & dữ liệu", "Tích hợp, phân quyền và vận hành"], ["Data", "Integration"]],
    ["INTELLIGENCE", ["Tổ chức luồng dữ liệu", "AI có kiểm soát theo nghiệp vụ"], ["AI", "Data"]],
    ["FIELD SYSTEMS", ["Thiết bị, gateway và kết nối", "Dữ liệu hiện trường về hệ thống"], ["IoT", "Automation"]],
    ["APPLICATION", ["Bám sát quy trình nghiệp vụ", "Thiết kế để tích hợp và mở rộng"], ["Web/App", "Workflow"]],
    ["OPERATIONS", ["Kết nối hệ thống & dữ liệu", "Bàn giao, giám sát và hỗ trợ"], ["Integration", "Operations"]],
  ],
  "san-pham-nen-tang": [
    ["SMART SECTOR", ["Giám sát đối tượng & hiện trường", "Tập trung dữ liệu phục vụ quản lý"], ["AgriTech", "Data"]],
    ["FIELD DATA", ["Cảm biến, gateway và truyền dẫn", "Thu thập dữ liệu theo thời gian"], ["Sensor", "IoT"]],
    ["TRACEABILITY", ["Liên kết thông tin theo chuỗi", "Tra cứu và xác thực nguồn gốc"], ["Trace", "QR/Data"]],
    ["LIFECYCLE", ["Theo dõi trạng thái theo thời gian", "Lưu lịch sử thay đổi & tác nghiệp"], ["Lifecycle", "Asset"]],
    ["INTELLIGENCE", ["Tổ chức dữ liệu có cấu trúc", "Phân tích và AI theo bài toán"], ["AI", "Analytics"]],
    ["EXTENSIBLE", ["Mô-đun hóa theo nhu cầu", "Kết nối hệ thống hiện có"], ["API", "Modular"]],
  ],
  "chuyen-giao-cong-nghe": [
    ["DISCOVER", ["Hiện trạng & điều kiện áp dụng", "Mục tiêu và tiêu chí tiếp nhận"], ["Scope", "Baseline"]],
    ["PROVE", ["PoC / mô hình kiểm chứng", "Đo lường theo tiêu chí thống nhất"], ["PoC", "Evidence"]],
    ["REFINE", ["Điều chỉnh từ kết quả thử nghiệm", "Chuẩn hóa cấu hình & quy trình"], ["Refine", "Standardize"]],
    ["ENABLE", ["Tài liệu & hướng dẫn vận hành", "Đào tạo người tiếp nhận"], ["Docs", "Training"]],
    ["SCALE", ["Hỗ trợ sau bàn giao", "Mở rộng và tích hợp khi cần"], ["Support", "Scale"]],
  ],
  "dao-tao-tap-huan": [
    ["AUDIENCE", ["Lãnh đạo / quản lý", "Chuyên viên & nhóm nghiệp vụ"], ["Role-based", "Public sector"]],
    ["OUTCOME", ["Năng lực cần áp dụng", "Tình huống gắn với công việc"], ["Outcome", "Practice"]],
    ["CURRICULUM", ["Chuyên đề có thể ghép linh hoạt", "Điều chỉnh theo lĩnh vực & trình độ"], ["Module", "Flexible"]],
    ["DELIVERY", ["Trực tiếp / trực tuyến / kết hợp", "Thực hành, tình huống & đánh giá"], ["Hybrid", "Assessment"]],
  ],
};

const css = `<style id="${marker}">
.v6-card{overflow:hidden;min-height:390px!important;padding:25px 26px 24px!important;background:linear-gradient(180deg,#fff 0%,#f8fbfa 66%,#f2f7f5 100%)!important}.v6-card:before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--accent),color-mix(in srgb,var(--accent) 14%,transparent) 72%,transparent)}.v6-card-top{display:grid!important;grid-template-columns:auto 1fr auto;align-items:center;gap:10px}.v61-label{justify-self:start;padding:5px 8px;border:1px solid color-mix(in srgb,var(--accent) 17%,#dfe8e5);border-radius:999px;color:var(--accent);background:color-mix(in srgb,var(--accent) 5%,#fff);font-size:7px;font-weight:900;letter-spacing:.12em}.v6-card h3{position:relative;z-index:2;max-width:86%;margin:34px 0 11px!important}.v6-card>p{position:relative;z-index:2;min-height:48px;line-height:1.7!important}.v61-points{position:relative;z-index:2;display:grid;gap:7px;margin:18px 0 0;padding:16px 0 0;border-top:1px solid #dde8e5;list-style:none}.v61-points li{position:relative;padding-left:14px;color:#405e68;font-size:10px;line-height:1.55}.v61-points li:before{content:"";position:absolute;left:0;top:.62em;width:5px;height:5px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 9%,transparent)}.v61-tags{position:absolute;z-index:2;left:26px;right:26px;bottom:24px;display:flex;flex-wrap:wrap;gap:6px;padding-top:15px;border-top:1px solid #dde8e5}.v61-tags span{padding:5px 8px;border-radius:999px;background:#fff;color:#70868d;box-shadow:inset 0 0 0 1px #dde8e5;font-size:8px;font-weight:800;letter-spacing:.035em}.v61-glyph{position:absolute;right:-12px;bottom:-32px;color:color-mix(in srgb,var(--accent) 6%,transparent);font-size:106px;font-weight:900;line-height:1;letter-spacing:-.08em;pointer-events:none}.v6-grid[data-sequential="true"] .v6-card{min-height:430px!important;padding:23px 20px!important}.v6-grid[data-sequential="true"] .v6-card h3{margin-top:42px!important}.v6-grid[data-sequential="true"] .v6-card>p{min-height:66px}.v6-grid[data-sequential="true"] .v61-tags{left:20px;right:20px}.v6-grid[data-sequential="true"] .v61-label{max-width:78px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}@media(max-width:1080px){.v6-grid[data-sequential="true"]{gap:14px!important}}@media(max-width:760px){.v6-card,.v6-grid[data-sequential="true"] .v6-card{min-height:360px!important}.v6-card>p,.v6-grid[data-sequential="true"] .v6-card>p{min-height:0}}
</style>`;

for (const [route, routeDetails] of Object.entries(details)) {
  const path = join(root, route, "index.html");
  let html = await readFile(path, "utf8");
  if (!html.includes("iaict-category-v6")) throw new Error(`${route}: V6 marker not found`);
  if (html.includes(marker)) throw new Error(`${route}: V6.1 already applied`);

  html = html.replace("</head>", `${css}</head>`);
  let index = 0;
  html = html.replace(/<article class="v6-card">([\s\S]*?)<\/article>/g, (article) => {
    const detail = routeDetails[index];
    const current = index;
    index += 1;
    if (!detail) return article;
    const [label, points, tags] = detail;
    let enriched = article.replace(
      /(<span class="v6-index">[^<]+<\/span>)(<i class="v6-dot"><\/i>)/,
      `$1<span class="v61-label">${label}</span>$2`,
    );
    enriched = enriched.replace(
      /(<p>[\s\S]*?<\/p>)/,
      `$1<ul class="v61-points">${points.map((point) => `<li>${point}</li>`).join("")}</ul>`,
    );
    enriched = enriched.replace(
      /<\/article>$/,
      `<div class="v61-tags">${tags.map((tag) => `<span>${tag}</span>`).join("")}</div><span class="v61-glyph" aria-hidden="true">${String(current + 1).padStart(2, "0")}</span></article>`,
    );
    return enriched;
  });

  if (index !== routeDetails.length) throw new Error(`${route}: expected ${routeDetails.length} cards, found ${index}`);
  await writeFile(path, html, "utf8");
  console.log(`Enhanced ${route} with category cards V6.1`);
}
