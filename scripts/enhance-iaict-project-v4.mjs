import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = "artifacts/nidit-portal/dist/public/iaict-portal";
const file = join(root, "index.html");
const marker = "iaict-project-v4";
const base = "/Nidit-demo/iaict-portal/";

let html = await readFile(file, "utf8");
if (html.includes(`id="${marker}"`)) {
  console.log("IAICT Project V4 already applied.");
  process.exit(0);
}

const projectMarker = "PROJECT SPOTLIGHT";
const markerAt = html.indexOf(projectMarker);
if (markerAt < 0) throw new Error("Project spotlight marker not found");
const start = html.lastIndexOf('<section class="section', markerAt);
if (start < 0) throw new Error("Project spotlight section start not found");
const end = html.indexOf("</section>", markerAt);
if (end < 0) throw new Error("Project spotlight section end not found");

const icon = (name) => {
  const icons = {
    sensor: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M5.7 8.5a7 7 0 0 0 0 7M18.3 8.5a7 7 0 0 1 0 7M3.1 5.8a10.5 10.5 0 0 0 0 12.4M20.9 5.8a10.5 10.5 0 0 1 0 12.4"/></svg>',
    edge: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="7" width="14" height="11" rx="2"/><path d="M9 4h6M12 4v3M8 11h8M8 14h5"/></svg>',
    network: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17h2M8 14h2v3H8zM12 11h2v6h-2zM16 8h2v9h-2zM20 5h1v12h-1"/></svg>',
    server: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="6" rx="2"/><rect x="4" y="13" width="16" height="6" rx="2"/><path d="M8 8h.01M8 16h.01M12 8h5M12 16h5"/></svg>',
    apps: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><path d="M16.5 13v7M13 16.5h7"/></svg>',
  };
  return icons[name];
};

const section = `
<section class="section project-v4-section" aria-labelledby="project-v4-title">
  <div class="ia-shell project-v4-shell">
    <div class="project-v4-head reveal">
      <div>
        <div class="kicker">IAICT PROJECT LAB / TRÂM RỪNG</div>
        <h2 id="project-v4-title">Từ rừng phòng hộ đến dữ liệu có thể khai thác.</h2>
      </div>
      <p>Kiến trúc ưu tiên điều quan trọng nhất: dữ liệu cảm biến được thu nhận ổn định, truyền về server, lưu trữ có cấu trúc và sẵn sàng cho giám sát, truy xuất và phân tích.</p>
    </div>

    <div class="project-v4 reveal">
      <article class="project-v4-story">
        <div class="project-v4-index"><span>PROJECT / 01</span><i></i><span>FIELD SYSTEMS</span></div>
        <div class="project-v4-badge">Outdoor 100%</div>
        <h3>Trâm Rừng.<br><span>Kết nối hiện trường với dữ liệu.</span></h3>
        <p>Mô hình được thiết kế cho môi trường ngoài trời, kết nối 4G linh hoạt, nguồn dự phòng UPS và server làm trung tâm lưu trữ. Cách tiếp cận giảm phụ thuộc vào các lớp hạ tầng không cần thiết và giúp vận hành dễ kiểm soát hơn.</p>
        <div class="project-v4-facts" aria-label="Thông số định hướng">
          <span><small>Kết nối</small><b>4G linh hoạt</b></span>
          <span><small>Nguồn</small><b>UPS dự phòng</b></span>
          <span><small>Lưu trữ</small><b>Server + CSDL</b></span>
          <span><small>Mục tiêu</small><b>Data-first</b></span>
        </div>
        <a class="project-v4-link" href="${base}du-an/">Khám phá Project Lab <span>↗</span></a>
      </article>

      <article class="project-v4-architecture" aria-label="Sơ đồ kiến trúc dữ liệu Trâm Rừng">
        <div class="project-v4-grid" aria-hidden="true"></div>
        <div class="project-v4-top">
          <div><small>DATA ARCHITECTURE</small><b>Field → Edge → Network → Core → Application</b></div>
          <span>TRÂM RỪNG / V4</span>
        </div>

        <div class="project-v4-flow">
          <div class="project-v4-step">
            <div class="project-v4-stephead"><span>01</span><i>${icon("sensor")}</i></div>
            <b>Cảm biến hiện trường</b>
            <p>Thu nhận thông số môi trường trực tiếp tại khu vực rừng phòng hộ.</p>
            <small>FIELD / SENSOR</small>
          </div>
          <div class="project-v4-connector" aria-hidden="true"><i></i><b>›</b></div>
          <div class="project-v4-step">
            <div class="project-v4-stephead"><span>02</span><i>${icon("edge")}</i></div>
            <b>Edge / Gateway</b>
            <p>Kiểm tra, chuẩn hóa và đóng gói dữ liệu trước khi truyền đi.</p>
            <small>EDGE / CONTROL</small>
          </div>
          <div class="project-v4-connector" aria-hidden="true"><i></i><b>›</b></div>
          <div class="project-v4-step">
            <div class="project-v4-stephead"><span>03</span><i>${icon("network")}</i></div>
            <b>Kết nối 4G</b>
            <p>Truyền dữ liệu từ hiện trường về trung tâm qua kết nối di động linh hoạt.</p>
            <small>NETWORK / 4G</small>
          </div>
          <div class="project-v4-connector" aria-hidden="true"><i></i><b>›</b></div>
          <div class="project-v4-step">
            <div class="project-v4-stephead"><span>04</span><i>${icon("server")}</i></div>
            <b>Server + CSDL</b>
            <p>Lưu trữ tập trung, hình thành lịch sử dữ liệu và nền tảng sao lưu.</p>
            <small>CORE / STORAGE</small>
          </div>
          <div class="project-v4-connector" aria-hidden="true"><i></i><b>›</b></div>
          <div class="project-v4-step">
            <div class="project-v4-stephead"><span>05</span><i>${icon("apps")}</i></div>
            <b>Ứng dụng khai thác</b>
            <p>Dashboard, cảnh báo, truy xuất nguồn gốc, vòng đời và phân tích dữ liệu.</p>
            <small>APPS / INSIGHT</small>
          </div>
        </div>

        <div class="project-v4-note">
          <span>DATA-FIRST</span>
          <p>Dữ liệu đi xuyên suốt từ hiện trường đến ứng dụng; mỗi lớp có trách nhiệm rõ ràng để dễ kiểm tra, thay thế và mở rộng.</p>
          <b><i></i> Luồng dữ liệu hoạt động</b>
        </div>
      </article>
    </div>
  </div>
</section>`;

html = html.slice(0, start) + section + html.slice(end + "</section>".length);

const css = `
<style id="${marker}">
/* IAICT Project V4 — pale institutional canvas + technical data flow */
.project-v4-section{position:relative;overflow:hidden;background:radial-gradient(circle at 84% 12%,rgba(123,205,194,.14),transparent 27%),radial-gradient(circle at 8% 84%,rgba(112,151,194,.09),transparent 30%),linear-gradient(145deg,#f8f7f1 0%,#f2f6f7 56%,#f7faf9 100%)!important}
.project-v4-section::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(18,66,78,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(18,66,78,.025) 1px,transparent 1px);background-size:54px 54px;mask-image:linear-gradient(to bottom,transparent,#000 18%,#000 83%,transparent);pointer-events:none}
.project-v4-shell{position:relative;z-index:2}
.project-v4-head{display:grid;grid-template-columns:1.06fr .74fr;gap:80px;align-items:end;margin-bottom:54px}
.project-v4-head h2{max-width:760px;margin:0;color:#08263a;font-size:clamp(42px,4.6vw,66px);line-height:1.04;letter-spacing:-.034em}
.project-v4-head>p{max-width:510px;margin:0;color:#607884;font-size:14px;line-height:1.85}
.project-v4{display:grid;grid-template-columns:.76fr 1.24fr;gap:18px;align-items:stretch}
.project-v4-story,.project-v4-architecture{border:1px solid rgba(118,151,157,.23);border-radius:28px;box-shadow:0 28px 80px rgba(28,58,65,.11)}
.project-v4-story{position:relative;overflow:hidden;padding:46px;background:linear-gradient(152deg,#fbfdfb,#edf5f3);color:#173746}
.project-v4-story::before{content:"";position:absolute;width:360px;height:360px;right:-190px;bottom:-180px;border:1px solid rgba(19,139,124,.13);border-radius:50%;box-shadow:0 0 0 44px rgba(19,139,124,.025),0 0 0 88px rgba(19,139,124,.018)}
.project-v4-index{position:relative;z-index:2;display:flex;align-items:center;gap:10px;margin-bottom:54px;color:#789099;font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.project-v4-index i{height:1px;flex:1;background:linear-gradient(90deg,#7fc9bd,transparent)}
.project-v4-badge{position:relative;z-index:2;display:inline-flex;padding:7px 10px;border:1px solid #c7ddda;border-radius:999px;color:#0d766d;background:rgba(255,255,255,.66);font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
.project-v4-story h3{position:relative;z-index:2;margin:24px 0 19px;color:#082c3b;font-size:clamp(37px,3.5vw,52px);line-height:1.05;letter-spacing:-.035em}.project-v4-story h3 span{color:#0b786f;font-weight:650}
.project-v4-story>p{position:relative;z-index:2;margin:0;color:#58727d;font-size:14px;line-height:1.82}
.project-v4-facts{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;margin:32px 0;border:1px solid #d7e5e3;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.64)}
.project-v4-facts span{padding:15px 16px}.project-v4-facts span:nth-child(odd){border-right:1px solid #d7e5e3}.project-v4-facts span:nth-child(-n+2){border-bottom:1px solid #d7e5e3}.project-v4-facts small{display:block;color:#84979e;font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.project-v4-facts b{display:block;margin-top:5px;color:#163c48;font-size:12px}
.project-v4-link{position:relative;z-index:2;display:inline-flex;align-items:center;gap:20px;color:#096f69;font-size:12px;font-weight:800}.project-v4-link span{font-size:17px}
.project-v4-architecture{position:relative;overflow:hidden;padding:36px;background:linear-gradient(160deg,rgba(255,255,255,.97),rgba(235,245,247,.96));isolation:isolate}
.project-v4-grid{position:absolute;inset:0;z-index:-1;background-image:linear-gradient(rgba(26,100,108,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(26,100,108,.045) 1px,transparent 1px);background-size:32px 32px;mask-image:linear-gradient(145deg,#000,rgba(0,0,0,.7) 60%,transparent 96%)}
.project-v4-architecture::after{content:"";position:absolute;z-index:-1;width:360px;height:360px;right:-150px;top:-170px;border-radius:50%;background:radial-gradient(circle,rgba(62,202,180,.14),rgba(62,202,180,.035) 48%,transparent 70%);filter:blur(5px)}
.project-v4-top{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;padding-bottom:26px;border-bottom:1px solid #d5e4e5}.project-v4-top small{display:block;color:#789097;font-size:8px;font-weight:850;letter-spacing:.15em}.project-v4-top b{display:block;margin-top:5px;color:#123845;font-size:14px}.project-v4-top>span{color:#0b7d78;font-size:8px;font-weight:900;letter-spacing:.13em}
.project-v4-flow{display:grid;grid-template-columns:1fr 34px 1fr 34px 1fr 34px 1fr 34px 1fr;align-items:stretch;gap:0;padding:42px 0 36px}
.project-v4-step{position:relative;min-height:250px;padding:19px 16px 17px;border:1px solid #d3e2e3;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(239,247,248,.94));box-shadow:0 14px 32px rgba(21,64,72,.075);transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}
.project-v4-step:hover{transform:translateY(-5px);border-color:#9fcfc9;box-shadow:0 20px 42px rgba(21,64,72,.12)}
.project-v4-stephead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:28px}.project-v4-stephead>span{color:#83979e;font-size:8px;font-weight:900;letter-spacing:.12em}.project-v4-stephead>i{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;color:#087f76;background:#e7f6f3;box-shadow:inset 0 0 0 1px rgba(27,150,133,.1)}.project-v4-stephead svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.project-v4-step>b{display:block;color:#0c3442;font-size:13px;line-height:1.25}.project-v4-step>p{margin:10px 0 20px;color:#617982;font-size:10px;line-height:1.6}.project-v4-step>small{position:absolute;left:16px;bottom:15px;color:#8a9da3;font-size:7px;font-weight:850;letter-spacing:.11em}
.project-v4-connector{position:relative;display:grid;place-items:center}.project-v4-connector::before{content:"";position:absolute;left:3px;right:3px;top:50%;height:1px;background:linear-gradient(90deg,#9bcfc7,#21ad9b,#9bcfc7);box-shadow:0 0 12px rgba(33,173,155,.2)}.project-v4-connector i{position:absolute;left:2px;top:calc(50% - 3px);width:6px;height:6px;border-radius:50%;background:#25b29e;box-shadow:0 0 0 5px rgba(37,178,158,.08),0 0 16px rgba(37,178,158,.35);animation:projectV4Flow 2.8s ease-in-out infinite}.project-v4-connector b{position:relative;z-index:2;width:18px;height:18px;display:grid;place-items:center;border-radius:50%;color:#0c8278;background:#edf8f6;font-size:15px;font-weight:500;box-shadow:0 0 0 4px rgba(237,248,246,.9)}
.project-v4-connector:nth-child(4n) i{animation-delay:.55s}.project-v4-connector:nth-child(6) i{animation-delay:1.05s}.project-v4-connector:nth-child(8) i{animation-delay:1.55s}
.project-v4-note{display:grid;grid-template-columns:90px 1fr auto;gap:20px;align-items:center;padding-top:23px;border-top:1px solid #d5e4e5}.project-v4-note>span{color:#0a8179;font-size:8px;font-weight:900;letter-spacing:.14em}.project-v4-note>p{margin:0;color:#607981;font-size:11px;line-height:1.65}.project-v4-note>b{display:inline-flex;align-items:center;gap:8px;color:#4c6f77;font-size:8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.project-v4-note>b i{width:7px;height:7px;border-radius:50%;background:#27b49f;box-shadow:0 0 0 5px rgba(39,180,159,.08);animation:projectV4Pulse 2s ease-in-out infinite}
@keyframes projectV4Flow{0%{transform:translateX(0);opacity:.25}45%{opacity:1}100%{transform:translateX(25px);opacity:.15}}
@keyframes projectV4Pulse{0%,100%{opacity:.55;transform:scale(.9)}50%{opacity:1;transform:scale(1.14)}}
@media(max-width:1120px){.project-v4{grid-template-columns:1fr}.project-v4-head{grid-template-columns:1fr;gap:24px}.project-v4-flow{grid-template-columns:1fr 28px 1fr 28px 1fr;row-gap:20px}.project-v4-flow>.project-v4-step:nth-of-type(7),.project-v4-flow>.project-v4-step:nth-of-type(9){grid-row:3}.project-v4-flow>.project-v4-connector:nth-of-type(6),.project-v4-flow>.project-v4-connector:nth-of-type(8){display:none}}
@media(max-width:780px){.project-v4-section{padding-block:84px!important}.project-v4-story,.project-v4-architecture{border-radius:20px}.project-v4-story{padding:30px}.project-v4-architecture{padding:26px 22px}.project-v4-flow{grid-template-columns:1fr;gap:0;padding:30px 0}.project-v4-connector{min-height:42px}.project-v4-connector::before{left:50%;right:auto;top:0;bottom:0;width:1px;height:auto;background:linear-gradient(180deg,#9bcfc7,#21ad9b,#9bcfc7)}.project-v4-connector i{left:calc(50% - 3px);top:3px;animation:projectV4FlowY 2.8s ease-in-out infinite}.project-v4-connector b{transform:rotate(90deg)}.project-v4-step{min-height:190px}.project-v4-note{grid-template-columns:1fr}.project-v4-top{flex-direction:column}.project-v4-top>span{align-self:flex-start}.project-v4-facts{grid-template-columns:1fr}.project-v4-facts span:nth-child(odd),.project-v4-facts span:nth-child(-n+2){border-right:0}.project-v4-facts span:not(:last-child){border-bottom:1px solid #d7e5e3}}
@keyframes projectV4FlowY{0%{transform:translateY(0);opacity:.25}45%{opacity:1}100%{transform:translateY(32px);opacity:.15}}
@media(prefers-reduced-motion:reduce){.project-v4-connector i,.project-v4-note>b i{animation:none}.project-v4-step{transition:none}}
</style>`;

html = html.replace("</head>", `${css}\n</head>`);
await writeFile(file, html);
console.log("IAICT Project V4 applied.");
