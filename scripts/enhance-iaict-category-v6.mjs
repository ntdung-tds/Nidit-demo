import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = "artifacts/nidit-portal/dist/public/iaict-portal";
const base = "/Nidit-demo/iaict-portal/";
const marker = "iaict-category-v6";

const pages = [
  {
    route: "giai-phap-dich-vu",
    variant: "solutions",
    eyebrow: "IAICT SOLUTIONS",
    title: "Giải pháp & Dịch vụ",
    intro: "IAICT bắt đầu từ bài toán vận hành, dữ liệu và tiêu chí thành công; sau đó mới lựa chọn kiến trúc, công nghệ và lộ trình triển khai phù hợp.",
    sectionEyebrow: "IAICT SOLUTIONS / DELIVERY SYSTEM",
    sectionTitle: "Từ bài toán vận hành đến giải pháp có thể triển khai.",
    sectionIntro: "Mỗi nhóm dịch vụ được tổ chức như một lớp năng lực có thể kết hợp theo nhu cầu thực tế, thay vì đóng gói cứng theo công nghệ.",
    signals: [["START","Bài toán & dữ liệu"],["DESIGN","Kiến trúc phù hợp"],["PROVE","PoC / thử nghiệm"],["RUN","Tích hợp & vận hành"]],
    items: [
      ["Tư vấn chuyển đổi số","Đánh giá hiện trạng, mục tiêu và lộ trình thực hiện."],
      ["Tư vấn giải pháp công nghệ","Lựa chọn kiến trúc và phương án phù hợp bài toán."],
      ["Thiết kế hệ thống","Thiết kế kiến trúc, dữ liệu, tích hợp và vận hành."],
      ["AI & Dữ liệu","Thiết kế luồng dữ liệu và ứng dụng AI có kiểm soát."],
      ["IoT & Tự động hóa","Kết nối thiết bị, dữ liệu hiện trường và quy trình."],
      ["Phần mềm theo yêu cầu","Phát triển ứng dụng phục vụ quy trình nghiệp vụ cụ thể."],
      ["Tích hợp & Vận hành","Kết nối hệ thống, chuyển giao và hỗ trợ vận hành."],
    ],
    finalEyebrow: "IAICT / SOLUTIONS",
    finalTitle: "Cần một phương án phù hợp với bài toán thực tế?",
    finalBody: "Bắt đầu từ nhu cầu, hiện trạng và tiêu chí thành công — sau đó mới xác định công nghệ, phạm vi và lộ trình triển khai.",
  },
  {
    route: "san-pham-nen-tang",
    variant: "technology",
    eyebrow: "IAICT TECHNOLOGY",
    title: "Sản phẩm & Nền tảng",
    intro: "Các nhóm công nghệ được tổ chức theo lớp năng lực có thể tích hợp: từ thiết bị và dữ liệu hiện trường đến AI, ứng dụng nghiệp vụ, truy xuất và quản lý vòng đời.",
    sectionEyebrow: "IAICT TECHNOLOGY / CAPABILITY STACK",
    sectionTitle: "Các lớp công nghệ có thể ghép thành một hệ thống hoàn chỉnh.",
    sectionIntro: "Nền tảng được nhìn theo khả năng tạo dữ liệu, xử lý, tích hợp và khai thác — để có thể tái sử dụng cho nhiều bài toán khác nhau.",
    signals: [["FIELD","IoT & thiết bị"],["CORE","Dữ liệu & dịch vụ"],["INTELLIGENCE","AI & phân tích"],["APPS","Ứng dụng nghiệp vụ"]],
    items: [
      ["Nông – Lâm nghiệp thông minh","Nền tảng số cho quản lý, giám sát và khai thác dữ liệu ngành."],
      ["IoT & Quan trắc","Kết nối thiết bị, cảm biến và dữ liệu quan trắc."],
      ["Truy xuất nguồn gốc","Quản lý thông tin nguồn gốc và chuỗi dữ liệu liên quan."],
      ["Quản lý vòng đời","Theo dõi đối tượng, tài sản hoặc sản phẩm theo vòng đời."],
      ["AI & Dữ liệu","Khai thác dữ liệu và ứng dụng AI theo bài toán cụ thể."],
      ["Nền tảng/ứng dụng khác","Giải pháp có thể tùy biến và tích hợp theo yêu cầu."],
    ],
    finalEyebrow: "IAICT / TECHNOLOGY",
    finalTitle: "Cần một nền tảng có thể tích hợp và mở rộng?",
    finalBody: "IAICT ưu tiên kiến trúc mô-đun, dữ liệu có cấu trúc và khả năng chuyển giao để nền tảng không bị khóa vào một giai đoạn triển khai duy nhất.",
  },
  {
    route: "chuyen-giao-cong-nghe",
    variant: "transfer",
    eyebrow: "IAICT TRANSFER",
    title: "Chuyển giao công nghệ",
    intro: "IAICT xem chuyển giao là quá trình biến một giải pháp đã được kiểm chứng thành năng lực mà đơn vị tiếp nhận có thể hiểu, vận hành, bảo trì và phát triển tiếp.",
    sectionEyebrow: "IAICT TRANSFER / FROM PROOF TO OPERATION",
    sectionTitle: "Chuyển giao không phải một buổi bàn giao.",
    sectionIntro: "Đó là chuỗi liên tục từ khảo sát, thử nghiệm, hoàn thiện đến tài liệu hóa, đào tạo và đồng hành sau tiếp nhận.",
    signals: [["01","Khảo sát"],["02","Thử nghiệm"],["03","Hoàn thiện"],["04–05","Chuyển giao & đồng hành"]],
    items: [
      ["Khảo sát","Làm rõ bài toán, hiện trạng và điều kiện ứng dụng."],
      ["Thử nghiệm","Xây dựng mô hình thử nghiệm và tiêu chí đánh giá."],
      ["Hoàn thiện","Điều chỉnh giải pháp dựa trên bằng chứng thử nghiệm."],
      ["Chuyển giao","Bàn giao công nghệ, tài liệu và hướng dẫn vận hành."],
      ["Đồng hành","Hỗ trợ mở rộng, tích hợp và nâng cao năng lực sử dụng."],
    ],
    finalEyebrow: "IAICT / TRANSFER",
    finalTitle: "Biến kết quả thử nghiệm thành năng lực của đơn vị tiếp nhận.",
    finalBody: "Trọng tâm là khả năng làm chủ: cấu hình, tài liệu, quy trình, đào tạo và cơ chế hỗ trợ phải đi cùng công nghệ được bàn giao.",
  },
  {
    route: "dao-tao-tap-huan",
    variant: "academy",
    eyebrow: "IAICT ACADEMY",
    title: "Đào tạo & Tập huấn",
    intro: "IAICT thiết kế chương trình từ vị trí việc làm, nhiệm vụ và năng lực đầu ra; nội dung được chia thành module để có thể triển khai linh hoạt cho từng nhóm học viên và từng cấp quản lý.",
    sectionEyebrow: "IAICT ACADEMY / LEARNING ARCHITECTURE",
    sectionTitle: "Đào tạo theo vị trí, nhiệm vụ và năng lực cần áp dụng.",
    sectionIntro: "Chương trình được tổ chức theo đối tượng, mục tiêu, module và hình thức để có thể triển khai linh hoạt cho từng đơn vị và cấp quản lý.",
    signals: [["AUDIENCE","Theo đối tượng"],["OUTCOME","Theo mục tiêu"],["MODULE","Theo chuyên đề"],["FORMAT","Trực tiếp / trực tuyến"]],
    items: [
      ["Theo đối tượng","Phân nhóm lãnh đạo, quản lý, chuyên viên và các nhóm nghiệp vụ để xác định đúng mức độ và tình huống học tập."],
      ["Theo mục tiêu","Gắn mục tiêu học tập với năng lực cần áp dụng vào công việc thay vì chỉ truyền đạt kiến thức lý thuyết."],
      ["Theo module","Cấu trúc nội dung thành các module có thể kết hợp linh hoạt theo thời lượng, lĩnh vực và trình độ người học."],
      ["Theo hình thức","Tổ chức trực tiếp, trực tuyến hoặc kết hợp; có thể tích hợp thực hành, tình huống và đánh giá đầu ra."],
    ],
    academyBanner: true,
    finalEyebrow: "IAICT / ACADEMY",
    finalTitle: "Xây dựng chương trình từ công việc thực tế.",
    finalBody: "IAICT có thể cùng đơn vị xác định nhóm học viên, năng lực đầu ra, module, thời lượng và cách tổ chức phù hợp với điều kiện triển khai.",
  },
];

const css = `
<style id="${marker}">
.v6-page{--accent:#0b8178;--accent-soft:#dff2ee;--ink:#082d3d;--muted:#627a83;--hero-a:#f8f7f1;--hero-b:#eef5f5;background:#f7f9f7;color:var(--ink)}.v6-page[data-variant="technology"]{--accent:#146f88;--accent-soft:#e1f0f5;--hero-a:#f5f8f8;--hero-b:#eaf3f7}.v6-page[data-variant="transfer"]{--accent:#8b6537;--accent-soft:#f3eadf;--hero-a:#faf6ef;--hero-b:#f0f3ef}.v6-page[data-variant="academy"]{--accent:#5466a5;--accent-soft:#e9ebf7;--hero-a:#f8f7f3;--hero-b:#edf0f8}.v6-hero{position:relative;overflow:hidden;padding:118px 0 92px;background:radial-gradient(circle at 86% 18%,color-mix(in srgb,var(--accent) 16%,transparent),transparent 28%),linear-gradient(145deg,var(--hero-a),var(--hero-b) 62%,#fafcfb)}.v6-hero:before{content:"";position:absolute;inset:0;background-image:linear-gradient(color-mix(in srgb,var(--accent) 5%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--accent) 5%,transparent) 1px,transparent 1px);background-size:56px 56px;mask-image:linear-gradient(to bottom,transparent,#000 18%,#000 82%,transparent);pointer-events:none}.v6-hero-grid{position:relative;display:grid;grid-template-columns:1.18fr .62fr;gap:86px;align-items:end}.v6-kicker{margin:0 0 18px;color:var(--accent);font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.v6-hero h1{max-width:900px;margin:0;color:var(--ink);font-size:clamp(56px,6.4vw,94px);line-height:.98;letter-spacing:-.055em}.v6-lead{max-width:780px;margin:30px 0 0;color:var(--muted);font-size:16px;line-height:1.82}.v6-actions{display:flex;align-items:center;gap:28px;margin-top:36px}.v6-primary,.v6-secondary{display:inline-flex;align-items:center;gap:16px;font-size:11px;font-weight:850;text-decoration:none}.v6-primary{padding:14px 19px;border-radius:999px;color:#fff!important;background:var(--accent);box-shadow:0 12px 28px color-mix(in srgb,var(--accent) 20%,transparent);transition:transform .24s ease,filter .24s ease}.v6-primary:hover{transform:translateY(-2px);filter:brightness(.93)}.v6-secondary{color:#58717a!important}.v6-signals{overflow:hidden;display:grid;grid-template-columns:1fr 1fr;border:1px solid color-mix(in srgb,var(--accent) 19%,#dce5e2);border-radius:24px;background:rgba(255,255,255,.76);box-shadow:0 28px 66px rgba(28,62,69,.1);backdrop-filter:blur(12px)}.v6-signals div{min-height:116px;padding:24px 22px}.v6-signals div:nth-child(odd){border-right:1px solid #dce7e5}.v6-signals div:nth-child(-n+2){border-bottom:1px solid #dce7e5}.v6-signals small{display:block;color:#82969c;font-size:8px;font-weight:900;letter-spacing:.12em}.v6-signals strong{display:block;margin-top:9px;color:#173b47;font-size:13px;line-height:1.35}.v6-body{padding:108px 0 116px;background:#fff}.v6-head{display:grid;grid-template-columns:1.02fr .62fr;gap:80px;align-items:end;margin-bottom:58px}.v6-head h2{max-width:760px;margin:0;color:var(--ink);font-size:clamp(40px,4.8vw,66px);line-height:1.04;letter-spacing:-.04em}.v6-head>p{margin:0;color:var(--muted);font-size:14px;line-height:1.85}.v6-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.v6-card{position:relative;min-height:286px;padding:27px;border:1px solid #dce7e5;border-radius:21px;background:linear-gradient(180deg,#fff,#f5f9f8);box-shadow:0 12px 32px rgba(23,64,72,.055);transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}.v6-card:hover{transform:translateY(-5px);border-color:color-mix(in srgb,var(--accent) 42%,#dce7e5);box-shadow:0 22px 46px rgba(23,64,72,.1)}.v6-card-top{display:flex;align-items:center;justify-content:space-between;gap:18px}.v6-index{color:#85989e;font-size:9px;font-weight:900;letter-spacing:.12em}.v6-dot{width:11px;height:11px;border:3px solid #eef7f5;border-radius:50%;background:var(--accent);box-shadow:0 0 0 5px color-mix(in srgb,var(--accent) 9%,transparent)}.v6-card h3{margin:50px 0 12px;color:#103946;font-size:22px;line-height:1.18;letter-spacing:-.02em}.v6-card p{margin:0;color:#687e85;font-size:12px;line-height:1.75}.v6-page[data-variant="transfer"] .v6-grid{grid-template-columns:repeat(5,minmax(0,1fr));gap:0}.v6-page[data-variant="transfer"] .v6-card{min-height:320px;border-radius:0;border-left-width:0}.v6-page[data-variant="transfer"] .v6-card:first-child{border-left-width:1px;border-radius:21px 0 0 21px}.v6-page[data-variant="transfer"] .v6-card:last-child{border-radius:0 21px 21px 0}.v6-page[data-variant="transfer"] .v6-card:after{content:"→";position:absolute;right:-12px;top:30px;z-index:3;width:24px;height:24px;display:grid;place-items:center;border-radius:50%;color:var(--accent);background:#fff;box-shadow:0 0 0 5px #fff}.v6-page[data-variant="transfer"] .v6-card:last-child:after{display:none}.v6-page[data-variant="transfer"] .v6-card h3{margin-top:76px;font-size:18px}.v6-academy{padding:0 0 96px;background:linear-gradient(145deg,#f5f6fb,#eef2f7)}.v6-academy-inner{display:flex;align-items:center;justify-content:space-between;gap:50px;padding:38px 42px;border:1px solid #d8deee;border-radius:24px;background:#fff;box-shadow:0 18px 46px rgba(60,74,120,.08)}.v6-academy h2{margin:0 0 10px;color:#1e315b;font-size:30px}.v6-academy p{max-width:760px;margin:0;color:#6a738b;font-size:12px;line-height:1.75}.v6-final{padding:84px 0;background:#082836;color:#fff}.v6-final-inner{display:flex;align-items:center;justify-content:space-between;gap:50px}.v6-final .v6-kicker{color:color-mix(in srgb,var(--accent) 75%,#fff)}.v6-final h2{max-width:780px;margin:0;color:#fff;font-size:clamp(34px,4.2vw,56px);line-height:1.06;letter-spacing:-.035em}.v6-final p{max-width:700px;margin:16px 0 0;color:#a7bdc3;font-size:13px;line-height:1.75}.v6-final .v6-primary{flex:none}.v6-page[data-variant="academy"] .v6-final{background:#202a4e}.v6-page[data-variant="transfer"] .v6-final{background:#2c2821}
@media(max-width:1080px){.v6-hero-grid{grid-template-columns:1fr;gap:44px}.v6-signals{max-width:640px}.v6-grid{grid-template-columns:1fr 1fr}.v6-page[data-variant="transfer"] .v6-grid{grid-template-columns:1fr 1fr;gap:14px}.v6-page[data-variant="transfer"] .v6-card,.v6-page[data-variant="transfer"] .v6-card:first-child,.v6-page[data-variant="transfer"] .v6-card:last-child{border-left-width:1px;border-radius:18px}.v6-page[data-variant="transfer"] .v6-card:after{display:none}}
@media(max-width:760px){.v6-hero{padding:94px 0 64px}.v6-hero h1{font-size:clamp(46px,14vw,66px)}.v6-lead{font-size:14px}.v6-actions{align-items:flex-start;flex-direction:column;gap:18px}.v6-signals,.v6-grid,.v6-page[data-variant="transfer"] .v6-grid{grid-template-columns:1fr}.v6-signals div:nth-child(odd){border-right:0}.v6-signals div:not(:last-child){border-bottom:1px solid #dce7e5}.v6-head{grid-template-columns:1fr;gap:22px}.v6-body{padding:80px 0}.v6-card,.v6-page[data-variant="transfer"] .v6-card{min-height:230px}.v6-final-inner,.v6-academy-inner{display:block}.v6-final .v6-primary,.v6-academy .v6-primary{margin-top:28px}}
@media(prefers-reduced-motion:reduce){.v6-primary,.v6-card{transition:none}}
</style>`;

const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function render(page) {
  const signals = page.signals.map(([label, value]) => `<div><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`).join("");
  const cards = page.items.map(([title, body], index) => `<article class="v6-card"><div class="v6-card-top"><span class="v6-index">${String(index + 1).padStart(2,"0")}</span><i class="v6-dot"></i></div><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join("");
  const academy = page.academyBanner ? `<section class="v6-academy"><div class="shell v6-academy-inner"><div><div class="v6-kicker">PUBLIC SECTOR LEARNING</div><h2>Dành cho cơ quan nhà nước</h2><p>Khung chương trình có thể tổ chức theo cấp quản lý, loại đơn vị, nhóm vị trí công việc và mục tiêu chuyển đổi số cụ thể.</p></div><a class="v6-primary" href="${base}dao-tao-tap-huan/co-quan-nha-nuoc/">Xem khung chương trình <span>↗</span></a></div></section>` : "";
  return `<main id="main-content" class="v6-page" data-variant="${page.variant}"><section class="v6-hero"><div class="shell v6-hero-grid"><div class="reveal"><div class="v6-kicker">${esc(page.eyebrow)}</div><h1>${esc(page.title)}</h1><p class="v6-lead">${esc(page.intro)}</p><div class="v6-actions"><a class="v6-primary" href="#capabilities">Khám phá năng lực <span>↓</span></a><a class="v6-secondary" href="${base}lien-he/">Trao đổi nhu cầu ↗</a></div></div><aside class="v6-signals reveal" aria-label="Các lớp năng lực ${esc(page.title)}">${signals}</aside></div></section><section class="v6-body" id="capabilities"><div class="shell"><div class="v6-head reveal"><div><div class="v6-kicker">${esc(page.sectionEyebrow)}</div><h2>${esc(page.sectionTitle)}</h2></div><p>${esc(page.sectionIntro)}</p></div><div class="v6-grid reveal">${cards}</div></div></section>${academy}<section class="v6-final"><div class="shell v6-final-inner reveal"><div><div class="v6-kicker">${esc(page.finalEyebrow)}</div><h2>${esc(page.finalTitle)}</h2><p>${esc(page.finalBody)}</p></div><a class="v6-primary" href="${base}lien-he/">Liên hệ & Hợp tác <span>↗</span></a></div></section></main>`;
}

for (const page of pages) {
  const file = join(root, page.route, "index.html");
  let html = await readFile(file, "utf8");
  const headerEnd = html.indexOf("</header>");
  const footerStart = html.indexOf("<footer");
  if (headerEnd < 0 || footerStart < 0 || footerStart <= headerEnd) throw new Error(`Could not locate shell for ${page.route}`);
  html = html.slice(0, headerEnd + "</header>".length) + render(page) + html.slice(footerStart);
  if (!html.includes(`id="${marker}"`)) html = html.replace("</head>", `${css}\n</head>`);
  html = html.replace(/<title>.*?<\/title>/, `<title>${esc(page.title)} · IAICT</title>`);
  await writeFile(file, html);
  console.log(`IAICT Category V6 applied: ${page.route}`);
}
