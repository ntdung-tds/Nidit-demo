import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = "artifacts/nidit-portal/dist/public/iaict-portal";
const sourceFile = join(root, "du-an", "index.html");
const targetFile = join(root, "du-an", "tram-rung", "index.html");
const base = "/Nidit-demo/iaict-portal/";
const marker = "iaict-tram-rung-v5";

let html = await readFile(sourceFile, "utf8");
const headerEnd = html.indexOf("</header>");
const footerStart = html.indexOf("<footer");
if (headerEnd < 0 || footerStart < 0 || footerStart <= headerEnd) {
  throw new Error("Could not locate page shell for Trâm Rừng case study");
}

const main = `
<main id="main-content" class="tram-v5-page">
  <section class="tram-v5-hero">
    <div class="shell tram-v5-hero-grid">
      <div class="tram-v5-copy reveal">
        <div class="tram-v5-kicker">IAICT PROJECT LAB / TRÂM RỪNG</div>
        <h1>Từ rừng phòng hộ đến dữ liệu có thể khai thác.</h1>
        <p>Trâm Rừng là mô hình ứng dụng IoT và dữ liệu hiện trường theo hướng thực dụng: lấy được dữ liệu ổn định, đưa dữ liệu về server, lưu trữ có cấu trúc và tạo nền tảng cho giám sát, truy xuất và phân tích.</p>
        <div class="tram-v5-actions">
          <a class="tram-v5-primary" href="#architecture">Xem kiến trúc <span>↓</span></a>
          <a class="tram-v5-secondary" href="${base}du-an/">← Tất cả dự án</a>
        </div>
      </div>
      <aside class="tram-v5-facts reveal" aria-label="Thông số định hướng">
        <div><small>ENVIRONMENT</small><strong>Outdoor 100%</strong></div>
        <div><small>CONNECTIVITY</small><strong>4G linh hoạt</strong></div>
        <div><small>POWER</small><strong>UPS dự phòng</strong></div>
        <div><small>CORE</small><strong>Server + CSDL</strong></div>
      </aside>
    </div>
  </section>

  <section class="tram-v5-architecture" id="architecture">
    <div class="shell">
      <div class="tram-v5-heading reveal">
        <div><div class="tram-v5-kicker">DATA ARCHITECTURE</div><h2>Một luồng dữ liệu.<br>Năm lớp trách nhiệm rõ ràng.</h2></div>
        <p>Mỗi lớp được tách theo chức năng để dễ kiểm tra, thay thế và mở rộng mà không làm phức tạp toàn bộ hệ thống.</p>
      </div>
      <div class="tram-v5-flow reveal">
        <article><div class="tram-v5-node-top"><span>01</span><i></i></div><small>FIELD</small><h3>Cảm biến hiện trường</h3><p>Thu nhận thông số môi trường trực tiếp tại khu vực rừng phòng hộ.</p></article>
        <div class="tram-v5-arrow" aria-hidden="true"><i></i><b>›</b></div>
        <article><div class="tram-v5-node-top"><span>02</span><i></i></div><small>EDGE</small><h3>Gateway / Edge</h3><p>Kiểm tra, chuẩn hóa và đóng gói dữ liệu trước khi truyền đi.</p></article>
        <div class="tram-v5-arrow" aria-hidden="true"><i></i><b>›</b></div>
        <article><div class="tram-v5-node-top"><span>03</span><i></i></div><small>NETWORK</small><h3>Kết nối 4G</h3><p>Truyền dữ liệu từ hiện trường về trung tâm bằng kết nối di động linh hoạt.</p></article>
        <div class="tram-v5-arrow" aria-hidden="true"><i></i><b>›</b></div>
        <article><div class="tram-v5-node-top"><span>04</span><i></i></div><small>CORE</small><h3>Server + CSDL</h3><p>Lưu trữ tập trung, hình thành lịch sử dữ liệu và lớp sao lưu.</p></article>
        <div class="tram-v5-arrow" aria-hidden="true"><i></i><b>›</b></div>
        <article><div class="tram-v5-node-top"><span>05</span><i></i></div><small>APPS</small><h3>Ứng dụng khai thác</h3><p>Dashboard, cảnh báo, truy xuất, vòng đời và phân tích dữ liệu.</p></article>
      </div>
      <div class="tram-v5-datafirst reveal"><span>DATA-FIRST</span><p>Giá trị của hệ thống bắt đầu từ dữ liệu được thu nhận ổn định, có lịch sử và có thể kiểm tra — không bắt đầu từ số lượng màn hình hay số lượng tính năng.</p><b><i></i> DATA FLOW READY</b></div>
    </div>
  </section>

  <section class="tram-v5-context">
    <div class="shell tram-v5-context-grid">
      <div class="tram-v5-context-copy reveal"><div class="tram-v5-kicker">DESIGN CONTEXT</div><h2>Thiết kế từ điều kiện hiện trường.</h2><p>Giải pháp được tổ chức quanh điều kiện triển khai thực tế thay vì ép hiện trường chạy theo một kiến trúc quá phức tạp.</p></div>
      <div class="tram-v5-principles reveal">
        <article><span>01</span><div><h3>Data-first</h3><p>Ưu tiên dữ liệu được thu nhận ổn định, có cấu trúc và có thể kiểm tra trước khi mở rộng ứng dụng.</p></div></article>
        <article><span>02</span><div><h3>Field-ready</h3><p>Thiết kế cho môi trường ngoài trời, nguồn điện thực tế và điều kiện kết nối không đồng đều.</p></div></article>
        <article><span>03</span><div><h3>Replaceable</h3><p>Tách cảm biến, gateway, truyền dẫn và server để từng lớp có thể kiểm tra hoặc thay thế độc lập.</p></div></article>
        <article><span>04</span><div><h3>Transferable</h3><p>Kiến trúc, cấu hình và tài liệu được tổ chức để đơn vị tiếp nhận có thể vận hành và mở rộng.</p></div></article>
      </div>
    </div>
  </section>

  <section class="tram-v5-scope">
    <div class="shell">
      <div class="tram-v5-heading reveal"><div><div class="tram-v5-kicker">PROJECT SCOPE</div><h2>Từ PoC đến khả năng vận hành.</h2></div><p>Phạm vi được chia theo các lớp có thể kiểm tra và phát triển tiếp, giúp giảm rủi ro khi chuyển từ thử nghiệm sang triển khai thực tế.</p></div>
      <div class="tram-v5-scope-grid reveal">
        <article><span>01 / CAPTURE</span><h3>Thu thập</h3><p>Cảm biến, kết nối phần cứng, chu kỳ đo và kiểm tra dữ liệu đầu vào.</p></article>
        <article><span>02 / TRANSPORT</span><h3>Truyền dẫn</h3><p>Gateway, 4G, cơ chế gửi dữ liệu và theo dõi trạng thái kết nối.</p></article>
        <article><span>03 / STORE</span><h3>Lưu trữ</h3><p>Server, cơ sở dữ liệu, lịch sử đo, backup và quản lý dữ liệu.</p></article>
        <article><span>04 / USE</span><h3>Khai thác</h3><p>Dashboard, cảnh báo, truy xuất, vòng đời và phân tích khi dữ liệu đủ ổn định.</p></article>
      </div>
    </div>
  </section>

  <section class="tram-v5-cta">
    <div class="shell tram-v5-cta-inner reveal">
      <div><div class="tram-v5-kicker">IAICT / FIELD SYSTEMS</div><h2>Cần một mô hình tương tự?</h2><p>IAICT có thể cùng đơn vị khảo sát bài toán, xây dựng PoC và xác định kiến trúc phù hợp trước khi nhân rộng.</p></div>
      <a class="tram-v5-primary" href="${base}lien-he/">Bắt đầu trao đổi <span>↗</span></a>
    </div>
  </section>
</main>`;

const css = `
<style id="${marker}">
.tram-v5-page{background:#f7f8f5;color:#0b2d3c}.tram-v5-page *{box-sizing:border-box}.tram-v5-hero{position:relative;overflow:hidden;padding:124px 0 86px;background:radial-gradient(circle at 85% 18%,rgba(76,196,177,.16),transparent 28%),linear-gradient(145deg,#f8f7f1,#eef5f5 58%,#f8fbf9)}.tram-v5-hero:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(15,78,84,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(15,78,84,.035) 1px,transparent 1px);background-size:54px 54px;mask-image:linear-gradient(to bottom,transparent,#000 18%,#000 85%,transparent)}.tram-v5-hero-grid{position:relative;display:grid;grid-template-columns:1.25fr .55fr;gap:84px;align-items:end}.tram-v5-kicker{margin-bottom:18px;color:#087c73;font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.tram-v5-copy h1{max-width:900px;margin:0;color:#072b3c;font-size:clamp(54px,6.2vw,92px);line-height:.99;letter-spacing:-.05em}.tram-v5-copy>p{max-width:790px;margin:30px 0 0;color:#58727d;font-size:16px;line-height:1.8}.tram-v5-actions{display:flex;align-items:center;gap:28px;margin-top:36px}.tram-v5-primary{display:inline-flex;align-items:center;justify-content:center;gap:16px;padding:14px 19px;border-radius:999px;color:#fff!important;background:#087b72;font-size:11px;font-weight:850;letter-spacing:.03em;box-shadow:0 12px 28px rgba(8,123,114,.16);transition:.25s}.tram-v5-primary:hover{transform:translateY(-2px);background:#06675f}.tram-v5-secondary{color:#54717a;font-size:11px;font-weight:800}.tram-v5-facts{overflow:hidden;display:grid;grid-template-columns:1fr 1fr;border:1px solid #d2e1df;border-radius:22px;background:rgba(255,255,255,.74);box-shadow:0 24px 60px rgba(26,63,68,.1)}.tram-v5-facts div{padding:24px 22px}.tram-v5-facts div:nth-child(odd){border-right:1px solid #dbe7e5}.tram-v5-facts div:nth-child(-n+2){border-bottom:1px solid #dbe7e5}.tram-v5-facts small{display:block;color:#80969d;font-size:8px;font-weight:900;letter-spacing:.12em}.tram-v5-facts strong{display:block;margin-top:7px;color:#153d48;font-size:13px}.tram-v5-architecture,.tram-v5-scope{padding:112px 0;background:#fff}.tram-v5-heading{display:grid;grid-template-columns:1.08fr .62fr;gap:80px;align-items:end;margin-bottom:58px}.tram-v5-heading h2,.tram-v5-context-copy h2,.tram-v5-cta h2{margin:0;color:#082d3d;font-size:clamp(40px,4.7vw,66px);line-height:1.04;letter-spacing:-.04em}.tram-v5-heading>p{margin:0;color:#607881;font-size:14px;line-height:1.85}.tram-v5-flow{display:grid;grid-template-columns:1fr 34px 1fr 34px 1fr 34px 1fr 34px 1fr;align-items:stretch}.tram-v5-flow article{min-height:250px;padding:20px 17px 18px;border:1px solid #d5e3e4;border-radius:19px;background:linear-gradient(180deg,#fff,#f0f7f7);box-shadow:0 16px 34px rgba(18,61,70,.08)}.tram-v5-node-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:44px}.tram-v5-node-top span{color:#81969d;font-size:9px;font-weight:900}.tram-v5-node-top i{width:15px;height:15px;border:3px solid #edf8f6;border-radius:50%;background:#20ad9a;box-shadow:0 0 0 5px rgba(32,173,154,.08),0 0 17px rgba(32,173,154,.25)}.tram-v5-flow article>small{color:#0a8077;font-size:7px;font-weight:900;letter-spacing:.13em}.tram-v5-flow h3{margin:8px 0 10px;color:#0d3542;font-size:14px;line-height:1.3}.tram-v5-flow p{margin:0;color:#617a82;font-size:10px;line-height:1.65}.tram-v5-arrow{position:relative;display:grid;place-items:center}.tram-v5-arrow:before{content:"";position:absolute;left:2px;right:2px;top:50%;height:1px;background:linear-gradient(90deg,#a7d3cd,#20ad9a,#a7d3cd)}.tram-v5-arrow i{position:absolute;left:2px;top:calc(50% - 3px);width:6px;height:6px;border-radius:50%;background:#20ad9a;animation:tramV5Flow 2.8s ease-in-out infinite}.tram-v5-arrow b{position:relative;z-index:2;width:18px;height:18px;display:grid;place-items:center;border-radius:50%;color:#0a8077;background:#eff8f6;font-size:15px;box-shadow:0 0 0 4px #fff}.tram-v5-datafirst{display:grid;grid-template-columns:100px 1fr auto;gap:22px;align-items:center;margin-top:34px;padding-top:24px;border-top:1px solid #d9e5e5}.tram-v5-datafirst>span{color:#087d74;font-size:8px;font-weight:900;letter-spacing:.15em}.tram-v5-datafirst p{margin:0;color:#607981;font-size:11px;line-height:1.65}.tram-v5-datafirst b{display:flex;align-items:center;gap:8px;color:#59757c;font-size:8px;letter-spacing:.1em}.tram-v5-datafirst b i{width:7px;height:7px;border-radius:50%;background:#25b39f;box-shadow:0 0 0 5px rgba(37,179,159,.08)}.tram-v5-context{padding:112px 0;background:linear-gradient(145deg,#092a39,#0b3540);color:#fff}.tram-v5-context-grid{display:grid;grid-template-columns:.7fr 1.1fr;gap:90px}.tram-v5-context .tram-v5-kicker,.tram-v5-cta .tram-v5-kicker{color:#6ed8c7}.tram-v5-context-copy h2,.tram-v5-cta h2{color:#fff}.tram-v5-context-copy>p{max-width:520px;margin:26px 0 0;color:#a9c0c6;font-size:14px;line-height:1.85}.tram-v5-principles{border-top:1px solid rgba(255,255,255,.14)}.tram-v5-principles article{display:grid;grid-template-columns:60px 1fr;gap:18px;padding:25px 0;border-bottom:1px solid rgba(255,255,255,.12)}.tram-v5-principles article>span{color:#6ed8c7;font-size:9px;font-weight:900}.tram-v5-principles h3{margin:0 0 7px;font-size:17px}.tram-v5-principles p{margin:0;color:#9eb6bd;font-size:11px;line-height:1.7}.tram-v5-scope{background:#f5f8f6}.tram-v5-scope-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.tram-v5-scope-grid article{min-height:220px;padding:26px;border:1px solid #dce7e5;border-radius:20px;background:#fff}.tram-v5-scope-grid span{color:#0b8178;font-size:8px;font-weight:900;letter-spacing:.12em}.tram-v5-scope-grid h3{margin:38px 0 10px;color:#123a47;font-size:20px}.tram-v5-scope-grid p{margin:0;color:#657d84;font-size:11px;line-height:1.72}.tram-v5-cta{padding:86px 0;background:#071f2c;color:#fff}.tram-v5-cta-inner{display:flex;align-items:center;justify-content:space-between;gap:50px}.tram-v5-cta h2{font-size:clamp(38px,4vw,58px)}.tram-v5-cta p{max-width:700px;margin:16px 0 0;color:#a5bec5;font-size:13px;line-height:1.75}.tram-v5-cta .tram-v5-primary{flex:none;background:#21a995}
@keyframes tramV5Flow{0%{transform:translateX(0);opacity:.2}45%{opacity:1}100%{transform:translateX(26px);opacity:.15}}
@media(max-width:1100px){.tram-v5-hero-grid,.tram-v5-context-grid{grid-template-columns:1fr;gap:45px}.tram-v5-facts{max-width:620px}.tram-v5-flow{grid-template-columns:1fr;gap:0}.tram-v5-arrow{height:40px}.tram-v5-arrow:before{left:50%;right:auto;top:0;bottom:0;width:1px;height:auto;background:linear-gradient(180deg,#a7d3cd,#20ad9a,#a7d3cd)}.tram-v5-arrow i{left:calc(50% - 3px);top:2px;animation:tramV5FlowY 2.8s ease-in-out infinite}.tram-v5-arrow b{transform:rotate(90deg)}.tram-v5-flow article{min-height:180px}.tram-v5-scope-grid{grid-template-columns:1fr 1fr}}
@keyframes tramV5FlowY{0%{transform:translateY(0);opacity:.2}45%{opacity:1}100%{transform:translateY(30px);opacity:.15}}
@media(max-width:760px){.tram-v5-hero{padding:96px 0 64px}.tram-v5-copy h1{font-size:clamp(45px,14vw,66px)}.tram-v5-facts,.tram-v5-scope-grid{grid-template-columns:1fr}.tram-v5-facts div:nth-child(odd){border-right:0}.tram-v5-facts div:not(:last-child){border-bottom:1px solid #dbe7e5}.tram-v5-heading{grid-template-columns:1fr;gap:22px}.tram-v5-architecture,.tram-v5-context,.tram-v5-scope{padding:82px 0}.tram-v5-datafirst{grid-template-columns:1fr}.tram-v5-cta-inner{display:block}.tram-v5-cta .tram-v5-primary{margin-top:28px}.tram-v5-actions{align-items:flex-start;flex-direction:column;gap:18px}}
@media(prefers-reduced-motion:reduce){.tram-v5-arrow i{animation:none}.tram-v5-primary{transition:none}}
</style>`;

html = html.slice(0, headerEnd + "</header>".length) + main + html.slice(footerStart);
html = html.replace("</head>", `${css}\n</head>`);
html = html.replace(/<title>.*?<\/title>/, "<title>Trâm Rừng · IAICT Project Lab</title>");
html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Trâm Rừng — kiến trúc dữ liệu IoT hiện trường từ cảm biến, 4G đến server và ứng dụng khai thác.">');

await mkdir(dirname(targetFile), { recursive: true });
await writeFile(targetFile, html);
console.log("IAICT Trâm Rừng V5 case study created.");
