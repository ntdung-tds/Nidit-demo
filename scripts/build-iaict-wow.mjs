import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const out = "artifacts/nidit-portal/dist/public/iaict-portal";
const base = "/Nidit-demo/iaict-portal/";

const nav = [
  ["Giới thiệu", "gioi-thieu/"],
  ["Sản phẩm", "san-pham-nen-tang/"],
  ["Giải pháp", "giai-phap-dich-vu/"],
  ["Chuyển giao", "chuyen-giao-cong-nghe/"],
  ["Đào tạo", "dao-tao-tap-huan/"],
  ["Dự án", "du-an/"],
  ["Tin tức", "tin-tuc/"],
  ["Liên hệ", "lien-he/"],
];

const detailPages = {
  "gioi-thieu": {
    eyebrow: "ABOUT IAICT",
    title: "Kết nối nghiên cứu, công nghệ và giá trị thực tiễn",
    intro: "IAICT định hướng trở thành cầu nối giữa nghiên cứu, ứng dụng, đào tạo và chuyển giao công nghệ; tập trung vào những bài toán có thể triển khai, đo lường và nhân rộng.",
    items: [
      ["Technology", "Sản phẩm & nền tảng", "AI, dữ liệu, IoT, phần mềm và các nền tảng số theo bài toán thực tế."],
      ["Solutions", "Giải pháp & dịch vụ", "Tư vấn, thiết kế kiến trúc, phát triển, tích hợp và hỗ trợ vận hành."],
      ["Transfer", "Chuyển giao công nghệ", "Từ khảo sát, thử nghiệm, hoàn thiện đến bàn giao và đồng hành."],
      ["Academy", "Đào tạo & tập huấn", "Nâng cao năng lực số, AI, dữ liệu và quản trị chuyển đổi số."],
    ],
  },
  "san-pham-nen-tang": {
    eyebrow: "IAICT TECHNOLOGY",
    title: "Nền tảng số được thiết kế quanh bài toán sử dụng",
    intro: "Ưu tiên kiến trúc mở, dữ liệu có cấu trúc và khả năng tích hợp để sản phẩm không bị cô lập sau khi triển khai.",
    items: [
      ["01", "Nông – Lâm nghiệp thông minh", "Quản lý dữ liệu vùng, đối tượng, quá trình chăm sóc và giám sát hiện trường."],
      ["02", "IoT & Quan trắc", "Thu thập dữ liệu cảm biến, truyền dữ liệu, cảnh báo và giám sát trạng thái."],
      ["03", "Truy xuất nguồn gốc", "Liên kết sự kiện, hồ sơ và dữ liệu theo chuỗi để tăng tính minh bạch."],
      ["04", "Quản lý vòng đời", "Theo dõi tài sản, cây trồng, sản phẩm hoặc hồ sơ theo toàn bộ vòng đời."],
      ["05", "AI & Dữ liệu", "Chuẩn hóa dữ liệu và ứng dụng AI vào tra cứu, tổng hợp, phân tích và hỗ trợ ra quyết định."],
      ["06", "Ứng dụng theo yêu cầu", "Thiết kế linh hoạt theo quy trình nghiệp vụ và khả năng tích hợp hệ thống sẵn có."],
    ],
  },
  "giai-phap-dich-vu": {
    eyebrow: "IAICT SOLUTIONS",
    title: "Từ bài toán đến kiến trúc, từ kiến trúc đến vận hành",
    intro: "Giải pháp được xây dựng theo lộ trình rõ ràng, tránh đầu tư công nghệ tách rời nhu cầu sử dụng.",
    items: [
      ["01", "Tư vấn chuyển đổi số", "Đánh giá hiện trạng, mục tiêu, lộ trình, ưu tiên và khả năng triển khai."],
      ["02", "Kiến trúc & tích hợp", "Thiết kế lớp ứng dụng, dữ liệu, tích hợp, bảo mật và vận hành."],
      ["03", "AI & dữ liệu", "Thiết kế pipeline dữ liệu và ứng dụng AI có kiểm soát."],
      ["04", "IoT & tự động hóa", "Kết nối thiết bị hiện trường với hệ thống dữ liệu và quy trình nghiệp vụ."],
      ["05", "Phần mềm theo yêu cầu", "Xây dựng hệ thống phù hợp với quy trình thực tế thay vì ép quy trình theo công cụ."],
      ["06", "Vận hành & đồng hành", "Hỗ trợ sau triển khai, chuyển giao tài liệu và nâng cao năng lực đội ngũ."],
    ],
  },
  "chuyen-giao-cong-nghe": {
    eyebrow: "IAICT TRANSFER",
    title: "Chuyển giao dựa trên bằng chứng thử nghiệm",
    intro: "Mỗi giải pháp cần đi qua chuỗi khảo sát – thử nghiệm – hoàn thiện – chuyển giao – đồng hành để giảm rủi ro triển khai.",
    items: [
      ["01", "Khảo sát", "Làm rõ hiện trạng, dữ liệu, hạ tầng, người dùng và điều kiện vận hành."],
      ["02", "PoC / thử nghiệm", "Xây dựng mô hình thử nghiệm với tiêu chí đánh giá cụ thể."],
      ["03", "Hoàn thiện", "Điều chỉnh giải pháp dựa trên dữ liệu và phản hồi sử dụng."],
      ["04", "Chuyển giao", "Bàn giao công nghệ, mã nguồn/tài liệu theo phạm vi và hướng dẫn vận hành."],
      ["05", "Nhân rộng", "Chuẩn hóa cấu hình để mở rộng theo địa bàn, đơn vị hoặc nhóm đối tượng."],
    ],
  },
  "dao-tao-tap-huan": {
    eyebrow: "IAICT ACADEMY",
    title: "Đào tạo để ứng dụng được ngay trong công việc",
    intro: "Chương trình được cấu trúc theo đối tượng, vị trí việc làm và tình huống thực tế; kết hợp kiến thức nền với thao tác trực tiếp.",
    items: [
      ["A", "Lãnh đạo số", "Tư duy chiến lược, quản trị chuyển đổi số, dữ liệu và AI trong điều hành."],
      ["B", "AI trong công vụ", "Soạn thảo, tổng hợp, tham mưu, tra cứu và kiểm soát đầu ra AI."],
      ["C", "Dữ liệu & báo cáo", "Chuẩn hóa, khai thác và trực quan hóa dữ liệu phục vụ quản lý."],
      ["D", "Kỹ năng số", "Công cụ số, an toàn thông tin và nâng cao hiệu suất cá nhân."],
      ["E", "Chuyên đề ngành", "AI trong giáo dục, nông nghiệp, hành chính, truyền thông và các bài toán chuyên môn."],
    ],
  },
  "dao-tao-tap-huan/co-quan-nha-nuoc": {
    eyebrow: "PUBLIC SECTOR",
    title: "Khung đào tạo riêng cho cơ quan nhà nước",
    intro: "Thiết kế theo cấp quản lý và nhóm vị trí công việc, bám sát nhu cầu triển khai thực tế tại tỉnh, sở/ngành, xã/phường và đơn vị sự nghiệp.",
    items: [
      ["Tỉnh", "Lãnh đạo & quản trị", "Chiến lược, dữ liệu, điều hành số và quản trị chương trình chuyển đổi số."],
      ["Sở", "Nghiệp vụ chuyên ngành", "Ứng dụng AI, dữ liệu và công cụ số trong quy trình chuyên môn."],
      ["Xã", "Công vụ tuyến cơ sở", "Tham mưu, tổng hợp, dịch vụ công, truyền thông và kỹ năng số thực hành."],
      ["ĐVSN", "Dịch vụ & vận hành", "Ứng dụng công nghệ để nâng cao chất lượng phục vụ và quản trị nội bộ."],
    ],
  },
  "du-an": {
    eyebrow: "PROJECT LAB",
    title: "Dự án là nơi công nghệ được kiểm chứng bằng thực tế",
    intro: "Khu dự án công bố theo nguyên tắc evidence-first: mô tả bài toán, kiến trúc, phạm vi triển khai và dữ liệu đã được xác minh.",
    items: [
      ["TRÂM RỪNG", "IoT + dữ liệu hiện trường", "Thu thập thông số cảm biến ngoài trời, truyền dữ liệu 4G và lưu trữ tập trung."],
      ["TRACE", "Truy xuất nguồn gốc", "Liên kết hồ sơ, đối tượng và sự kiện theo vòng đời phục vụ minh bạch dữ liệu."],
      ["LIFECYCLE", "Quản lý vòng đời", "Theo dõi trạng thái, lịch sử và thông tin liên quan của đối tượng quản lý."],
    ],
  },
  "tin-tuc": {
    eyebrow: "INSIGHTS",
    title: "Thông tin, hoạt động và tri thức công nghệ",
    intro: "Kênh nội dung được tổ chức theo chủ đề để vừa phục vụ truyền thông hoạt động, vừa chia sẻ tri thức có giá trị sử dụng.",
    items: [
      ["01", "Hoạt động Viện", "Tin tức, chương trình, hợp tác và thông báo chính thức."],
      ["02", "Khoa học & Công nghệ", "Nghiên cứu, ứng dụng, chuyển giao và thử nghiệm công nghệ."],
      ["03", "Chuyển đổi số", "Góc nhìn về chiến lược, quản trị, dữ liệu và nền tảng số."],
      ["04", "AI & Dữ liệu", "Ứng dụng AI, quản trị rủi ro, dữ liệu và năng suất công việc."],
      ["05", "Sự kiện – Hội thảo", "Chương trình chuyên môn, đào tạo, hội thảo và tọa đàm."],
    ],
  },
  "lien-he": {
    eyebrow: "CONNECT",
    title: "Bắt đầu từ bài toán cần giải quyết",
    intro: "IAICT sẵn sàng trao đổi về nhu cầu tư vấn, nghiên cứu ứng dụng, triển khai giải pháp, chuyển giao và đào tạo.",
    items: [
      ["IAICT", "Viện Ứng dụng CNTT và Truyền thông", "Số 7 Tôn Thất Thuyết, phường Cầu Giấy, Hà Nội."],
      ["SOLUTIONS", "Tư vấn & triển khai", "Trao đổi bài toán, hiện trạng và phương án công nghệ phù hợp."],
      ["ACADEMY", "Đào tạo & tập huấn", "Xây dựng chương trình theo đối tượng, vị trí việc làm và mục tiêu thực tế."],
      ["DEMO", "Biểu mẫu đang khóa", "Bản GitHub Pages không thu dữ liệu cá nhân cho đến khi backend M0 được xác minh."],
    ],
  },
  "tim-kiem": {
    eyebrow: "SEARCH",
    title: "Tìm đúng nội dung trong hệ sinh thái IAICT",
    intro: "Bản demo trình bày trải nghiệm tìm kiếm; tìm kiếm dữ liệu thật sẽ kết nối D1/FTS sau khi hoàn tất M0.",
    items: [
      ["01", "Sản phẩm & nền tảng", "Theo nhóm công nghệ và bài toán ứng dụng."],
      ["02", "Giải pháp", "Theo nhu cầu tư vấn, triển khai, AI, IoT hoặc tích hợp."],
      ["03", "Đào tạo", "Theo đối tượng, cấp quản lý và chuyên đề."],
      ["04", "Dự án & tin tức", "Theo lĩnh vực, chương trình và nội dung chuyên môn."],
    ],
  },
};

const icon = (name) => {
  const paths = {
    ai: '<path d="M8 8h8v8H8z"/><path d="M4 10h4m8 0h4M4 14h4m8 0h4M10 4v4m4-4v4m-4 8v4m4-4v4"/>',
    iot: '<circle cx="12" cy="12" r="2"/><path d="M5 12a7 7 0 0 1 7-7m7 7a7 7 0 0 0-7-7M7.5 16.5A6.3 6.3 0 0 0 12 18m4.5-1.5A6.3 6.3 0 0 1 12 18"/>',
    data: '<path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z"/><path d="M4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5"/>',
    train: '<path d="M3 6h18v11H3z"/><path d="m8 21 4-4 4 4M8 10h8M8 13h5"/>',
    transfer: '<path d="M7 7h11l-3-3m3 3-3 3M17 17H6l3 3m-3-3 3-3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.ai}</svg>`;
};

const css = `
:root{--bg:#05111f;--bg2:#081a2d;--panel:#0c2136;--ink:#0a2540;--text:#eaf5ff;--muted:#8aa8c3;--blue:#2e8cff;--cyan:#2ee7ff;--teal:#27d7bd;--lime:#b9ff66;--paper:#f5f9fc;--line:rgba(143,190,225,.19);--shadow:0 28px 80px rgba(0,20,42,.22)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:white;line-height:1.55}a{color:inherit;text-decoration:none}button{font:inherit}.shell{width:min(1220px,calc(100% - 42px));margin:auto}.topbar{background:#03101d;color:#94b3cc;border-bottom:1px solid rgba(255,255,255,.06);font-size:12px}.topbar .shell{min-height:34px;display:flex;align-items:center;justify-content:space-between;gap:18px}.live{display:inline-flex;align-items:center;gap:8px}.live:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--teal);box-shadow:0 0 0 5px rgba(39,215,189,.09)}.header{position:sticky;top:0;z-index:50;background:rgba(5,17,31,.9);backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.08);color:white}.headrow{height:78px;display:flex;align-items:center;gap:22px}.brand{display:flex;align-items:center;gap:12px;margin-right:auto}.logo{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;font-weight:950;font-size:18px;background:linear-gradient(145deg,#0e78ff,#19cab8);box-shadow:0 8px 30px rgba(46,140,255,.3)}.brand strong{font-size:19px;letter-spacing:.02em}.brand small{display:block;color:#8ba8bf;font-size:10px;letter-spacing:.04em}.nav{display:flex;align-items:center;gap:17px;font-size:12px;font-weight:760}.nav a{padding:29px 0;position:relative}.nav a:after{content:"";position:absolute;left:0;right:100%;bottom:21px;height:2px;background:linear-gradient(90deg,var(--blue),var(--cyan));transition:.3s}.nav a:hover:after{right:0}.megawrap{position:relative}.megawrap>button{border:0;background:none;color:white;font-size:12px;font-weight:760;cursor:pointer;padding:29px 0}.mega{position:absolute;top:72px;right:-170px;width:720px;padding:18px;background:rgba(5,17,31,.98);border:1px solid var(--line);border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,.35);display:grid;grid-template-columns:repeat(4,1fr);gap:10px;opacity:0;visibility:hidden;transform:translateY(-8px);transition:.25s}.megawrap:hover .mega,.megawrap:focus-within .mega{opacity:1;visibility:visible;transform:none}.mega a{padding:17px;border-radius:14px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.05)}.mega a:after{display:none}.mega b{display:block;color:white;margin-bottom:5px;font-size:13px}.mega span{color:#809ab0;font-size:11px}.headtools{display:flex;gap:8px}.iconbtn{width:39px;height:39px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:white;display:grid;place-items:center;cursor:pointer}.iconbtn svg{width:17px;fill:none;stroke:currentColor;stroke-width:1.8}.menu{display:none}.hero{position:relative;overflow:hidden;background:var(--bg);color:white}.hero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 72% 30%,rgba(46,140,255,.18),transparent 25%),radial-gradient(circle at 86% 70%,rgba(39,215,189,.12),transparent 22%),linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:auto,auto,42px 42px,42px 42px}.heroinner{position:relative;min-height:720px;display:grid;grid-template-columns:1.04fr .96fr;gap:50px;align-items:center}.slidecopy{position:relative;min-height:460px}.slide{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;opacity:0;transform:translateY(15px);pointer-events:none;transition:.65s ease}.slide.active{opacity:1;transform:none;pointer-events:auto}.eyebrow{display:flex;align-items:center;gap:10px;color:#7ddfff;font-size:12px;font-weight:850;letter-spacing:.15em;text-transform:uppercase;margin-bottom:18px}.eyebrow:before{content:"";width:28px;height:1px;background:var(--cyan)}h1,h2,h3,p{margin-top:0}h1{font-size:clamp(48px,5.7vw,82px);line-height:.98;letter-spacing:-.055em;margin-bottom:24px;max-width:760px}h1 em{font-style:normal;color:transparent;background:linear-gradient(100deg,#73b8ff,#6affdf);background-clip:text;-webkit-background-clip:text}.hero p{font-size:18px;color:#a8bfd2;max-width:650px}.actions{display:flex;flex-wrap:wrap;gap:11px;margin-top:29px}.btn{display:inline-flex;align-items:center;gap:9px;padding:12px 18px;border-radius:12px;font-weight:800;font-size:13px;border:1px solid rgba(255,255,255,.13)}.btn.primary{color:#04111e;background:linear-gradient(110deg,#65afff,#52f0d3);border:0}.btn.ghost{color:#e6f5ff;background:rgba(255,255,255,.035)}.slidecontrols{display:flex;gap:8px;margin-top:30px}.dot{width:34px;height:4px;border:0;border-radius:8px;background:rgba(255,255,255,.14);padding:0;cursor:pointer}.dot.active{background:linear-gradient(90deg,var(--blue),var(--teal))}.command{position:relative;min-height:525px;border:1px solid rgba(118,196,255,.18);border-radius:28px;background:linear-gradient(145deg,rgba(12,33,54,.94),rgba(5,18,31,.92));box-shadow:0 34px 90px rgba(0,0,0,.28);overflow:hidden}.command:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 60% 45%,rgba(46,231,255,.09),transparent 32%)}.commandTop{height:54px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:8px;padding:0 18px;color:#7895ad;font-size:11px}.lamp{width:7px;height:7px;border-radius:50%;background:#36546a}.lamp.on{background:var(--teal);box-shadow:0 0 14px rgba(39,215,189,.8)}.screen{position:relative;height:calc(100% - 54px);padding:22px}.mesh{height:250px;border:1px solid rgba(255,255,255,.07);border-radius:20px;position:relative;overflow:hidden;background:linear-gradient(rgba(67,166,231,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(67,166,231,.055) 1px,transparent 1px);background-size:30px 30px}.mesh:before,.mesh:after{content:"";position:absolute;border-radius:50%;border:1px solid rgba(46,231,255,.23);width:180px;height:180px;left:50%;top:50%;transform:translate(-50%,-50%)}.mesh:after{width:110px;height:110px;border-style:dashed;animation:spin 18s linear infinite}.core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:70px;height:70px;border-radius:22px;background:linear-gradient(145deg,#136edc,#17a993);display:grid;place-items:center;font-size:13px;font-weight:900;box-shadow:0 0 55px rgba(46,140,255,.3)}.signal{position:absolute;width:13px;height:13px;border:2px solid var(--cyan);border-radius:50%;box-shadow:0 0 0 8px rgba(46,231,255,.05);animation:pulse 2.2s ease-in-out infinite}.s1{left:15%;top:28%}.s2{right:18%;top:22%;animation-delay:.5s}.s3{left:22%;bottom:20%;animation-delay:1s}.s4{right:20%;bottom:17%;animation-delay:1.5s}.dashrow{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}.dash{padding:14px;border:1px solid rgba(255,255,255,.06);border-radius:15px;background:rgba(255,255,255,.025)}.dash small{color:#6d8aa2;display:block;font-size:9px;text-transform:uppercase;letter-spacing:.12em}.dash strong{font-size:15px}.wave{height:28px;margin-top:8px;background:linear-gradient(135deg,transparent 0 15%,rgba(39,215,189,.65) 16% 18%,transparent 19% 33%,rgba(46,140,255,.7) 34% 36%,transparent 37% 52%,rgba(46,231,255,.75) 53% 55%,transparent 56%)}.trustbar{background:#071a2b;color:#8fa9bd;border-top:1px solid rgba(255,255,255,.06)}.trustbar .shell{min-height:76px;display:flex;align-items:center;gap:34px;overflow:auto}.trustbar strong{color:#d9ebf8;font-size:12px;white-space:nowrap}.trustitem{white-space:nowrap;font-size:11px;letter-spacing:.08em;text-transform:uppercase}.section{padding:96px 0}.section.dark{background:#061421;color:white}.section.soft{background:var(--paper)}.sectionhead{display:flex;align-items:end;justify-content:space-between;gap:40px;margin-bottom:40px}.sectionhead>div{max-width:700px}.sectionhead p{color:#63809a;max-width:520px;margin:0}.dark .sectionhead p{color:#819cb2}.kicker{color:#1687dc;font-size:11px;font-weight:850;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px}.dark .kicker{color:#5fd8ec}h2{font-size:clamp(34px,4vw,52px);line-height:1.05;letter-spacing:-.042em;margin-bottom:10px}.intentgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:13px}.intent{position:relative;min-height:285px;padding:23px;border-radius:22px;border:1px solid #dce8f1;background:white;overflow:hidden;transition:.35s}.intent:hover{transform:translateY(-8px);box-shadow:var(--shadow);border-color:#bdd8ed}.intent:before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,var(--blue),var(--teal));transform:scaleX(.3);transform-origin:left;transition:.35s}.intent:hover:before{transform:scaleX(1)}.miniicon{width:49px;height:49px;border-radius:15px;display:grid;place-items:center;background:#edf6ff;color:#1377ca;margin-bottom:36px}.miniicon svg{width:24px;fill:none;stroke:currentColor;stroke-width:1.7}.intent h3{font-size:21px;line-height:1.2;margin-bottom:9px}.intent p{font-size:13px;color:#678198}.intent b{margin-top:auto;display:block;color:#1476c7;font-size:12px}.pillars{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.pillar{position:relative;min-height:340px;padding:25px;border:1px solid rgba(255,255,255,.09);border-radius:22px;background:linear-gradient(150deg,rgba(255,255,255,.055),rgba(255,255,255,.018));overflow:hidden}.pillar:after{content:"";position:absolute;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(46,140,255,.16),transparent 66%);right:-65px;bottom:-70px}.pillar .no{font-size:11px;color:#5edaf0;letter-spacing:.14em}.pillar h3{font-size:23px;margin:70px 0 10px}.pillar p{color:#8ca8be;font-size:13px}.pillar a{display:inline-block;margin-top:20px;color:#7cdded;font-size:12px;font-weight:800}.project{display:grid;grid-template-columns:1.05fr .95fr;border-radius:30px;overflow:hidden;background:#061722;color:white;box-shadow:0 35px 90px rgba(0,25,50,.16)}.forest{position:relative;min-height:520px;padding:45px;background:radial-gradient(circle at 70% 20%,rgba(93,255,189,.18),transparent 25%),linear-gradient(145deg,#07382f,#08202b 62%,#061521);overflow:hidden}.forest:before{content:"";position:absolute;inset:auto 0 0;height:58%;background:linear-gradient(155deg,transparent 0 48%,rgba(79,177,124,.14) 49% 52%,transparent 53%),linear-gradient(25deg,transparent 0 48%,rgba(46,231,255,.09) 49% 52%,transparent 53%);background-size:90px 90px}.tree{position:absolute;bottom:-20px;width:0;height:0;border-left:55px solid transparent;border-right:55px solid transparent;border-bottom:190px solid rgba(60,168,115,.18)}.t1{left:12%}.t2{left:35%;transform:scale(.8)}.t3{right:15%;transform:scale(1.15)}.sensor{position:absolute;width:14px;height:14px;border-radius:50%;background:#86ffd8;box-shadow:0 0 0 9px rgba(134,255,216,.06),0 0 30px rgba(134,255,216,.6)}.p1{left:28%;top:34%}.p2{right:30%;top:46%}.p3{left:48%;bottom:28%}.forestContent{position:relative;z-index:2;max-width:510px}.forest h3{font-size:42px;line-height:1.04;margin:12px 0 16px}.forest p{color:#a9c8bd}.tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:25px}.tag{font-size:10px;text-transform:uppercase;letter-spacing:.11em;padding:8px 10px;border-radius:999px;border:1px solid rgba(134,255,216,.2);color:#baffea;background:rgba(134,255,216,.04)}.projectInfo{padding:42px;background:#071725}.steps{display:grid;gap:10px;margin-top:20px}.step{display:grid;grid-template-columns:42px 1fr;gap:13px;padding:14px;border-radius:15px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025)}.step span{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:#0d2b42;color:#65def1;font-size:11px;font-weight:900}.step b{display:block;font-size:13px;margin-bottom:2px}.step small{color:#7897ae}.academy{display:grid;grid-template-columns:.8fr 1.2fr;gap:14px}.academyLead{padding:35px;border-radius:25px;background:linear-gradient(145deg,#0b6fd1,#0a9e8b);color:white}.academyLead h3{font-size:36px;line-height:1.05}.academyLead p{color:#d9f3f1}.trackgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.track{padding:23px;border:1px solid #dce8f1;border-radius:20px;background:white}.track strong{font-size:17px}.track p{font-size:12px;color:#68839a;margin:8px 0 0}.track .line{width:40px;height:3px;border-radius:3px;background:linear-gradient(90deg,var(--blue),var(--teal));margin-bottom:25px}.insights{display:grid;grid-template-columns:1.25fr .75fr;gap:14px}.featureNews{min-height:400px;padding:36px;border-radius:25px;background:linear-gradient(145deg,#07182a,#0a3146);color:white;position:relative;overflow:hidden}.featureNews:before{content:"";position:absolute;width:390px;height:390px;border-radius:50%;right:-120px;bottom:-140px;border:1px solid rgba(46,231,255,.16);box-shadow:0 0 0 70px rgba(46,231,255,.025),0 0 0 140px rgba(46,140,255,.018)}.featureNews>*{position:relative}.featureNews h3{font-size:34px;line-height:1.1;max-width:610px;margin-top:100px}.featureNews p{color:#91aec3;max-width:600px}.newslist{display:grid;gap:10px}.news{padding:19px;border:1px solid #dce8f1;border-radius:18px;background:white}.news small{color:#1682d1;font-weight:800}.news b{display:block;margin:8px 0 3px}.news span{font-size:12px;color:#71889b}.network{display:grid;grid-template-columns:1fr 1fr;gap:14px}.networkCard{min-height:270px;border-radius:24px;padding:29px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03)}.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:42px}.chip{padding:10px 13px;border-radius:999px;border:1px solid rgba(255,255,255,.1);color:#a7c0d3;font-size:11px}.ctaBand{background:linear-gradient(110deg,#0675dd,#0b9c8a);color:white;padding:58px 0}.ctaGrid{display:flex;align-items:center;justify-content:space-between;gap:35px}.ctaBand h2{margin:0;max-width:800px}.footer{background:#03101d;color:#839fb5;padding:55px 0 24px}.footgrid{display:grid;grid-template-columns:1.25fr .75fr .75fr;gap:40px}.footer h4{color:white;margin:0 0 12px}.footer a{display:block;margin:7px 0;font-size:12px}.footer p{font-size:12px}.copyright{border-top:1px solid rgba(255,255,255,.07);padding-top:18px;margin-top:35px;font-size:11px;display:flex;justify-content:space-between;gap:15px}.subhero{background:radial-gradient(circle at 80% 25%,rgba(46,140,255,.18),transparent 24%),#061421;color:white;padding:100px 0 72px}.subhero h1{font-size:clamp(46px,5vw,72px);max-width:940px}.subhero p{max-width:780px;color:#9eb5c8;font-size:18px}.detailgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}.detail{min-height:245px;padding:25px;border:1px solid #dce8f1;border-radius:20px;background:white;transition:.3s}.detail:hover{transform:translateY(-6px);box-shadow:var(--shadow)}.detail .code{font-size:10px;color:#1786d5;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.detail h3{font-size:21px;margin:45px 0 10px}.detail p{font-size:13px;color:#68839a}.backline{display:flex;gap:10px;flex-wrap:wrap;margin-top:35px}.reveal{opacity:0;transform:translateY(24px);transition:.7s ease}.reveal.show{opacity:1;transform:none}@keyframes pulse{0%,100%{transform:scale(.8);opacity:.6}50%{transform:scale(1.2);opacity:1}}@keyframes spin{to{transform:translate(-50%,-50%) rotate(360deg)}}@media(max-width:1080px){.nav{display:none}.menu{display:block}.heroinner{grid-template-columns:1fr;min-height:auto;padding:90px 0 60px}.command{min-height:470px}.intentgrid,.pillars{grid-template-columns:repeat(2,1fr)}.project,.academy,.insights{grid-template-columns:1fr}.detailgrid{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){.shell{width:min(100% - 26px,1220px)}.topbar .shell{min-height:38px}.topbar span:last-child{display:none}.headrow{height:68px}.brand small{display:none}.logo{width:42px;height:42px}.heroinner{padding-top:65px}.slidecopy{min-height:520px}h1{font-size:48px}.command{min-height:420px;border-radius:20px}.screen{padding:14px}.mesh{height:215px}.dashrow{grid-template-columns:1fr}.dash:nth-child(n+2){display:none}.section{padding:70px 0}.sectionhead{display:block}.intentgrid,.pillars,.detailgrid,.trackgrid,.network{grid-template-columns:1fr}.projectInfo,.forest{padding:28px}.forest{min-height:480px}.forest h3{font-size:34px}.academyLead{padding:27px}.ctaGrid,.copyright{display:block}.ctaGrid .actions{margin-top:25px}.footgrid{grid-template-columns:1fr}.megawrap{display:none}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;animation:none!important;transition:none!important}.reveal{opacity:1;transform:none}}
`;

const header = () => `
<div class="topbar"><div class="shell"><span class="live">IAICT Digital Experience · WOW Edition</span><span>Viện Ứng dụng Công nghệ Thông tin và Truyền thông</span></div></div>
<header class="header"><div class="shell headrow">
  <a class="brand" href="${base}"><span class="logo">IA</span><span><strong>IAICT</strong><small>INSTITUTE FOR APPLIED ICT</small></span></a>
  <nav class="nav">${nav.slice(0,5).map(([t,h])=>`<a href="${base}${h}">${t}</a>`).join("")}</nav>
  <div class="megawrap"><button type="button">Khám phá ▾</button><div class="mega">
    <a href="${base}san-pham-nen-tang/"><b>IAICT Technology</b><span>Sản phẩm, nền tảng, AI, IoT, dữ liệu.</span></a>
    <a href="${base}giai-phap-dich-vu/"><b>IAICT Solutions</b><span>Tư vấn, thiết kế, tích hợp và vận hành.</span></a>
    <a href="${base}chuyen-giao-cong-nghe/"><b>IAICT Transfer</b><span>Thử nghiệm, hoàn thiện và chuyển giao.</span></a>
    <a href="${base}dao-tao-tap-huan/"><b>IAICT Academy</b><span>Đào tạo, tập huấn và năng lực số.</span></a>
  </div></div>
  <div class="headtools"><a class="iconbtn" aria-label="Tìm kiếm" href="${base}tim-kiem/">${icon("search")}</a><details class="menu"><summary class="iconbtn" aria-label="Menu">☰</summary></details></div>
</div></header>`;

const footer = () => `
<section class="ctaBand"><div class="shell ctaGrid"><div><div class="kicker" style="color:#d9fffa">START WITH THE PROBLEM</div><h2>Có một bài toán cần công nghệ giải quyết?</h2></div><div class="actions"><a class="btn primary" href="${base}lien-he/">Trao đổi với IAICT →</a></div></div></section>
<footer class="footer"><div class="shell"><div class="footgrid"><div><div class="brand"><span class="logo">IA</span><span><strong>IAICT</strong><small>APPLIED TECHNOLOGY · REAL IMPACT</small></span></div><p style="margin-top:18px;max-width:520px">Kết nối nghiên cứu, ứng dụng, chuyển giao và đào tạo để công nghệ tạo ra giá trị thực trong quản lý, sản xuất và đời sống.</p><p>Số 7 Tôn Thất Thuyết, phường Cầu Giấy, Hà Nội.</p></div><div><h4>Hệ sinh thái</h4><a href="${base}san-pham-nen-tang/">IAICT Technology</a><a href="${base}giai-phap-dich-vu/">IAICT Solutions</a><a href="${base}chuyen-giao-cong-nghe/">IAICT Transfer</a><a href="${base}dao-tao-tap-huan/">IAICT Academy</a></div><div><h4>Thông tin</h4><a href="${base}du-an/">Dự án</a><a href="${base}tin-tuc/">Tin tức</a><a href="${base}lien-he/">Liên hệ</a><a href="${base}tim-kiem/">Tìm kiếm</a></div></div><div class="copyright"><span>© IAICT · GitHub Pages demo</span><span>Demo UI/UX · Không thu thập dữ liệu cá nhân</span></div></div></footer>`;

const scripts = `
<script>
(() => {
  const slides=[...document.querySelectorAll('.slide')], dots=[...document.querySelectorAll('.dot')]; let current=0, timer;
  const go=i=>{ if(!slides.length)return; current=(i+slides.length)%slides.length; slides.forEach((s,n)=>s.classList.toggle('active',n===current)); dots.forEach((d,n)=>d.classList.toggle('active',n===current)); };
  const play=()=>{clearInterval(timer);timer=setInterval(()=>go(current+1),6500)};
  dots.forEach((d,i)=>d.addEventListener('click',()=>{go(i);play()})); go(0); play();
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12}); document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();
</script>`;

const documentHtml = (title, body) => `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#05111f"><meta name="description" content="IAICT - Viện Ứng dụng Công nghệ Thông tin và Truyền thông"><title>${title} · IAICT</title><style>${css}</style></head><body>${header()}${body}${footer()}${scripts}</body></html>`;

const home = `
<section class="hero"><div class="shell heroinner">
  <div class="slidecopy">
    <article class="slide active"><div class="eyebrow">Applied technology · Real impact</div><h1>Công nghệ để <em>giải bài toán thực tiễn.</em></h1><p>IAICT kết nối nghiên cứu, nền tảng số, tư vấn triển khai, chuyển giao và đào tạo thành một hệ sinh thái công nghệ có thể áp dụng vào thực tế.</p><div class="actions"><a class="btn primary" href="${base}giai-phap-dich-vu/">Khám phá hệ sinh thái →</a><a class="btn ghost" href="${base}du-an/">Xem dự án ứng dụng</a></div></article>
    <article class="slide"><div class="eyebrow">AI · Data · Digital workflow</div><h1>Biến dữ liệu thành <em>năng lực ra quyết định.</em></h1><p>Từ dữ liệu phân tán đến luồng dữ liệu có cấu trúc, AI hỗ trợ tra cứu, tổng hợp, phân tích và nâng cao hiệu suất công việc.</p><div class="actions"><a class="btn primary" href="${base}san-pham-nen-tang/">AI & Dữ liệu →</a><a class="btn ghost" href="${base}dao-tao-tap-huan/">Nâng cao năng lực AI</a></div></article>
    <article class="slide"><div class="eyebrow">IoT · Field data · Traceability</div><h1>Kết nối hiện trường với <em>hệ thống số.</em></h1><p>Thu thập dữ liệu cảm biến, truyền dữ liệu, truy xuất nguồn gốc và quản lý vòng đời trong một kiến trúc có thể mở rộng.</p><div class="actions"><a class="btn primary" href="${base}du-an/">Project Lab →</a><a class="btn ghost" href="${base}lien-he/">Trao đổi bài toán</a></div></article>
    <div class="slidecontrols"><button class="dot active" aria-label="Slide 1"></button><button class="dot" aria-label="Slide 2"></button><button class="dot" aria-label="Slide 3"></button></div>
  </div>
  <div class="command reveal"><div class="commandTop"><span class="lamp on"></span><span class="lamp"></span><span class="lamp"></span><span style="margin-left:8px">IAICT DIGITAL COMMAND CENTER · LIVE DEMO</span></div><div class="screen"><div class="mesh"><div class="core">IAICT</div><i class="signal s1"></i><i class="signal s2"></i><i class="signal s3"></i><i class="signal s4"></i></div><div class="dashrow"><div class="dash"><small>Data layer</small><strong>Connected</strong><div class="wave"></div></div><div class="dash"><small>AI layer</small><strong>Ready</strong><div class="wave"></div></div><div class="dash"><small>IoT layer</small><strong>Streaming</strong><div class="wave"></div></div></div></div></div>
</div></section>
<div class="trustbar"><div class="shell"><strong>IAICT CAPABILITIES</strong><span class="trustitem">AI & DATA</span><span class="trustitem">IOT & MONITORING</span><span class="trustitem">DIGITAL TRANSFORMATION</span><span class="trustitem">TRACEABILITY</span><span class="trustitem">TECHNOLOGY TRANSFER</span><span class="trustitem">PUBLIC SECTOR TRAINING</span></div></div>
<section class="section soft"><div class="shell"><div class="sectionhead reveal"><div><div class="kicker">START FROM YOUR NEED</div><h2>Bạn đang cần giải quyết điều gì?</h2></div><p>Đi vào vấn đề trước, chọn công nghệ sau. Đây là cách IAICT giảm rủi ro “đầu tư công nghệ nhưng không giải quyết được công việc”.</p></div><div class="intentgrid">
  <a class="intent reveal" href="${base}giai-phap-dich-vu/"><span class="miniicon">${icon("ai")}</span><h3>Tối ưu quy trình bằng AI</h3><p>Tham mưu, tổng hợp, tri thức nội bộ, tự động hóa và hỗ trợ ra quyết định.</p><b>Khám phá giải pháp →</b></a>
  <a class="intent reveal" href="${base}san-pham-nen-tang/"><span class="miniicon">${icon("iot")}</span><h3>Thu dữ liệu hiện trường</h3><p>IoT, cảm biến, 4G, giám sát và kết nối dữ liệu về hệ thống trung tâm.</p><b>Xem nền tảng →</b></a>
  <a class="intent reveal" href="${base}chuyen-giao-cong-nghe/"><span class="miniicon">${icon("transfer")}</span><h3>Thử nghiệm & chuyển giao</h3><p>PoC nhanh, đánh giá bằng chứng, hoàn thiện rồi mới nhân rộng.</p><b>Xem quy trình →</b></a>
  <a class="intent reveal" href="${base}dao-tao-tap-huan/"><span class="miniicon">${icon("train")}</span><h3>Nâng cao năng lực số</h3><p>Chương trình AI, dữ liệu, lãnh đạo số và kỹ năng số theo vị trí việc làm.</p><b>IAICT Academy →</b></a>
</div></div></section>
<section class="section dark"><div class="shell"><div class="sectionhead reveal"><div><div class="kicker">ONE ECOSYSTEM · FOUR PILLARS</div><h2>Bốn trụ cột, một hành trình triển khai.</h2></div><p>Từ công nghệ đến giải pháp, từ thử nghiệm đến chuyển giao và từ công cụ đến năng lực con người.</p></div><div class="pillars">
  <article class="pillar reveal"><span class="no">01 · TECHNOLOGY</span><h3>IAICT Technology</h3><p>Sản phẩm, nền tảng, AI, dữ liệu, IoT và phần mềm theo nhu cầu.</p><a href="${base}san-pham-nen-tang/">Khám phá →</a></article>
  <article class="pillar reveal"><span class="no">02 · SOLUTIONS</span><h3>IAICT Solutions</h3><p>Tư vấn, thiết kế kiến trúc, phát triển, tích hợp và hỗ trợ vận hành.</p><a href="${base}giai-phap-dich-vu/">Khám phá →</a></article>
  <article class="pillar reveal"><span class="no">03 · TRANSFER</span><h3>IAICT Transfer</h3><p>Khảo sát, thử nghiệm, hoàn thiện, chuyển giao và nhân rộng.</p><a href="${base}chuyen-giao-cong-nghe/">Khám phá →</a></article>
  <article class="pillar reveal"><span class="no">04 · ACADEMY</span><h3>IAICT Academy</h3><p>Đào tạo để cán bộ, tổ chức và doanh nghiệp làm chủ công nghệ.</p><a href="${base}dao-tao-tap-huan/">Khám phá →</a></article>
</div></div></section>
<section class="section"><div class="shell"><div class="sectionhead reveal"><div><div class="kicker">PROJECT SPOTLIGHT</div><h2>Trâm Rừng · Từ cảm biến ngoài trời đến dữ liệu có giá trị.</h2></div><p>Một ví dụ về cách IoT, kết nối, dữ liệu và truy xuất được ghép thành một hệ thống ứng dụng thay vì các thiết bị rời rạc.</p></div><div class="project reveal"><div class="forest"><div class="tree t1"></div><div class="tree t2"></div><div class="tree t3"></div><i class="sensor p1"></i><i class="sensor p2"></i><i class="sensor p3"></i><div class="forestContent"><div class="kicker" style="color:#81ffdc">IAICT PROJECT LAB</div><h3>Rừng phòng hộ được “số hóa” bằng dữ liệu hiện trường.</h3><p>Giám sát ngoài trời, lấy dữ liệu cảm biến, truyền về server, lưu trữ và tạo nền tảng cho quản lý vòng đời và truy xuất nguồn gốc.</p><div class="tags"><span class="tag">IoT</span><span class="tag">4G</span><span class="tag">Sensor data</span><span class="tag">Traceability</span><span class="tag">Lifecycle</span></div></div></div><div class="projectInfo"><div class="kicker" style="color:#5fd8ec">DATA FLOW</div><h3 style="font-size:27px">Một luồng dữ liệu xuyên suốt</h3><div class="steps"><div class="step"><span>01</span><div><b>Thu thập</b><small>Cảm biến và thiết bị hiện trường.</small></div></div><div class="step"><span>02</span><div><b>Kết nối</b><small>Gateway / 4G / giao thức truyền dữ liệu.</small></div></div><div class="step"><span>03</span><div><b>Lưu trữ</b><small>Server và cơ sở dữ liệu tập trung.</small></div></div><div class="step"><span>04</span><div><b>Khai thác</b><small>Dashboard, cảnh báo, truy xuất và phân tích.</small></div></div></div><div class="actions"><a class="btn ghost" href="${base}du-an/">Xem Project Lab →</a></div></div></div></div></section>
<section class="section soft"><div class="shell"><div class="sectionhead reveal"><div><div class="kicker">IAICT ACADEMY · PUBLIC SECTOR</div><h2>Đào tạo AI và kỹ năng số theo đúng vị trí công việc.</h2></div><p>Không học công cụ theo phong trào; học theo tình huống thật, dữ liệu thật và quy trình công việc thật.</p></div><div class="academy"><div class="academyLead reveal"><div class="kicker" style="color:#c8fff7">FOR GOVERNMENT</div><h3>Từ lãnh đạo số đến AI trong công vụ cấp xã.</h3><p>Khung chương trình có thể tùy chỉnh theo cấp tỉnh, sở/ngành, xã/phường và đơn vị sự nghiệp.</p><div class="actions"><a class="btn ghost" href="${base}dao-tao-tap-huan/co-quan-nha-nuoc/">Xem khung chương trình →</a></div></div><div class="trackgrid"><article class="track reveal"><div class="line"></div><strong>Lãnh đạo số</strong><p>Chiến lược, quản trị, dữ liệu và ra quyết định trong môi trường số.</p></article><article class="track reveal"><div class="line"></div><strong>AI trong công vụ</strong><p>Tham mưu, tổng hợp, soạn thảo, tra cứu và kiểm soát đầu ra AI.</p></article><article class="track reveal"><div class="line"></div><strong>Dữ liệu & báo cáo</strong><p>Chuẩn hóa, phân tích, trực quan hóa và sử dụng dữ liệu phục vụ quản lý.</p></article><article class="track reveal"><div class="line"></div><strong>Kỹ năng số thực hành</strong><p>Công cụ số, an toàn thông tin và nâng cao hiệu suất cá nhân.</p></article></div></div></div></section>
<section class="section"><div class="shell"><div class="sectionhead reveal"><div><div class="kicker">INSIGHTS & SIGNALS</div><h2>Cổng thông tin không chỉ để “đăng tin”.</h2></div><p>Nó phải trở thành lớp tri thức kết nối hoạt động Viện, khoa học công nghệ, chuyển đổi số, AI & dữ liệu và mạng lưới hợp tác.</p></div><div class="insights"><article class="featureNews reveal"><div class="kicker" style="color:#5fd8ec">FEATURED TOPIC</div><h3>AI có kiểm soát: từ công cụ cá nhân đến năng lực tổ chức.</h3><p>Góc nhìn IAICT về dữ liệu, quy trình, kiểm chứng đầu ra và cách đưa AI vào công việc một cách an toàn, có thể đo lường.</p><a class="btn ghost" href="${base}tin-tuc/">Khám phá Insights →</a></article><div class="newslist"><article class="news reveal"><small>CHUYỂN ĐỔI SỐ</small><b>Từ số hóa tài liệu đến tái thiết kế quy trình</b><span>Chuyên mục phân tích & ứng dụng</span></article><article class="news reveal"><small>AI & DỮ LIỆU</small><b>Thiết kế dữ liệu trước khi triển khai AI</b><span>Chuyên mục công nghệ</span></article><article class="news reveal"><small>IOT</small><b>Kiến trúc thu thập dữ liệu hiện trường</b><span>Project Lab</span></article><article class="news reveal"><small>ACADEMY</small><b>Khung kỹ năng AI cho cán bộ, công chức</b><span>Đào tạo & tập huấn</span></article></div></div></div></section>
<section class="section dark"><div class="shell"><div class="sectionhead reveal"><div><div class="kicker">NETWORK OF CAPABILITY</div><h2>Kết nối chuyên gia, công nghệ và đối tác theo bài toán.</h2></div><p>Khu vực này sẽ hiển thị hồ sơ chuyên gia, đơn vị phối hợp và đối tác sau khi dữ liệu được xác minh trong CMS.</p></div><div class="network"><article class="networkCard reveal"><div class="kicker">EXPERTISE</div><h3 style="font-size:28px">Mạng lưới chuyên môn đa lĩnh vực</h3><div class="chips"><span class="chip">AI & Machine Learning</span><span class="chip">Data Engineering</span><span class="chip">IoT</span><span class="chip">Digital Government</span><span class="chip">Agritech</span><span class="chip">Cybersecurity</span></div></article><article class="networkCard reveal"><div class="kicker">COLLABORATION</div><h3 style="font-size:28px">Hợp tác theo mô hình mở</h3><div class="chips"><span class="chip">Cơ quan nhà nước</span><span class="chip">Viện / Trường</span><span class="chip">Doanh nghiệp công nghệ</span><span class="chip">Chuyên gia</span><span class="chip">Địa phương</span><span class="chip">Nhóm nghiên cứu</span></div></article></div></div></section>`;

const renderDetail = (page) => {
  const cards = page.items.map(([code,title,desc])=>`<article class="detail reveal"><span class="code">${code}</span><h3>${title}</h3><p>${desc}</p></article>`).join("");
  return `<section class="subhero"><div class="shell"><div class="eyebrow">${page.eyebrow}</div><h1>${page.title}</h1><p>${page.intro}</p><div class="backline"><a class="btn ghost" href="${base}">← Trang chủ</a><a class="btn primary" href="${base}lien-he/">Trao đổi nhu cầu →</a></div></div></section><section class="section soft"><div class="shell"><div class="detailgrid">${cards}</div></div></section><section class="section dark"><div class="shell"><div class="sectionhead reveal"><div><div class="kicker">IAICT APPROACH</div><h2>Thiết kế để có thể triển khai, vận hành và mở rộng.</h2></div><p>Phiên bản GitHub Pages trình bày trải nghiệm giao diện. Dữ liệu nghiệp vụ và chức năng backend chỉ được kích hoạt sau khi M0 được xác minh.</p></div></div></section>`;
};

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await writeFile(join(out, "index.html"), documentHtml("Trang chủ", home));

for (const [slug, page] of Object.entries(detailPages)) {
  const dir = join(out, slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), documentHtml(page.title, renderDetail(page)));
}

await writeFile(join(out, "404.html"), documentHtml("Không tìm thấy", `<section class="subhero"><div class="shell"><div class="eyebrow">404</div><h1>Trang bạn tìm chưa có trong bản demo.</h1><p>Quay lại trang chủ để tiếp tục khám phá IAICT.</p><a class="btn primary" href="${base}">Về trang chủ →</a></div></section>`));
await writeFile(join(out, ".nojekyll"), "");
console.log(`IAICT WOW demo generated at ${out}`);
