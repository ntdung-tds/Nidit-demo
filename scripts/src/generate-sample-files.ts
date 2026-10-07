/**
 * Sinh tệp PDF minh họa cho Văn bản – Tài liệu và video mẫu cho Thư viện của bản demo NIDIT.
 * Chạy: pnpm --filter @workspace/scripts run sample-files
 *
 * - PDF: artifacts/nidit-portal/public/files/*.pdf
 * - Video: artifacts/nidit-portal/public/videos/*.mp4 (dựng từ ảnh mẫu bằng ffmpeg)
 * - Ghi kích thước tệp vào artifacts/api-server/src/seed/sample-files.ts để dữ liệu khởi tạo dùng.
 */
import { execFileSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import PDFDocument from "pdfkit";

interface SampleDocument {
  number: string;
  title: string;
  docType: string;
  issuer: string;
  signer: string | null;
  issuedDate: string;
  effectiveDate: string | null;
  summary: string;
  fileName: string;
  external: boolean;
  body: string[];
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC_DIR = path.join(ROOT, "artifacts/nidit-portal/public");
const FILES_DIR = path.join(PUBLIC_DIR, "files");
const VIDEOS_DIR = path.join(PUBLIC_DIR, "videos");
const SIZES_FILE = path.join(ROOT, "artifacts/api-server/src/seed/sample-files.ts");
const FONT_DIR = "/usr/share/fonts/truetype/dejavu";
const FONT = { regular: `${FONT_DIR}/DejaVuSerif.ttf`, bold: `${FONT_DIR}/DejaVuSerif-Bold.ttf`, sans: `${FONT_DIR}/DejaVuSans.ttf`, sansBold: `${FONT_DIR}/DejaVuSans-Bold.ttf` };

const INSTITUTE = "Viện Công nghệ số và Chuyển đổi số quốc gia";

function vnDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `ngày ${d} tháng ${m} năm ${y}`;
}
function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function writePdf(doc: SampleDocument, file: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({
      size: "A4",
      margins: { top: 56, bottom: 64, left: 70, right: 56 },
      info: { Title: `${doc.number} – ${doc.title}`, Author: doc.issuer, Subject: "Tài liệu minh họa – bản demo Trang thông tin điện tử NIDIT" },
      bufferPages: true,
    });
    pdf.registerFont("serif", FONT.regular);
    pdf.registerFont("serif-bold", FONT.bold);
    pdf.registerFont("sans", FONT.sans);
    pdf.registerFont("sans-bold", FONT.sansBold);
    const out = createWriteStream(file);
    out.on("finish", () => resolve());
    out.on("error", reject);
    pdf.pipe(out);

    const left = pdf.page.margins.left;
    const width = pdf.page.width - pdf.page.margins.left - pdf.page.margins.right;

    if (doc.external) {
      // Trang giới thiệu văn bản của cơ quan có thẩm quyền: không tái tạo toàn văn
      pdf.font("sans-bold").fontSize(9).fillColor("#9a1b1b").text("TRANG GIỚI THIỆU VĂN BẢN – TỆP MINH HỌA", left, 56, { width, align: "left", characterSpacing: 0.6 });
      pdf.moveDown(0.6);
      pdf.font("serif-bold").fontSize(18).fillColor("#13294b").text(doc.title, { width });
      pdf.moveDown(0.4);
      pdf.font("sans").fontSize(10.5).fillColor("#444").text(`Số hiệu: ${doc.number}   ·   Cơ quan ban hành: ${doc.issuer}`, { width });
      pdf.text(`Ngày ban hành: ${shortDate(doc.issuedDate)}${doc.effectiveDate ? `   ·   Ngày có hiệu lực: ${shortDate(doc.effectiveDate)}` : ""}`, { width });
      pdf.moveDown(0.8);
      pdf.moveTo(left, pdf.y).lineTo(left + width, pdf.y).lineWidth(0.8).strokeColor("#c9a227").stroke();
      pdf.moveDown(0.9);
      pdf.font("serif-bold").fontSize(12).fillColor("#111").text("Tóm tắt nội dung");
      pdf.moveDown(0.3);
      pdf.font("serif").fontSize(11.5).fillColor("#111");
      for (const p of doc.body) {
        pdf.text(p, { width, align: "justify", lineGap: 3 });
        pdf.moveDown(0.5);
      }
      pdf.moveDown(0.8);
      const boxY = pdf.y;
      const note =
        "Tệp này chỉ dùng để minh họa chức năng tra cứu, tải văn bản của bản demo Trang thông tin điện tử. Toàn văn chính thức của văn bản xin tra cứu tại Cơ sở dữ liệu quốc gia về văn bản pháp luật (vbpl.vn), Công báo hoặc Cổng Thông tin điện tử của cơ quan ban hành.";
      pdf.font("sans").fontSize(10);
      const h = pdf.heightOfString(note, { width: width - 24, lineGap: 2 }) + 20;
      pdf.rect(left, boxY, width, h).fillAndStroke("#f6f1e3", "#c9a227");
      pdf.fillColor("#5b4a12").text(note, left + 12, boxY + 10, { width: width - 24, lineGap: 2 });
    } else {
      // Thể thức văn bản hành chính (minh họa)
      const colW = width * 0.46;
      const rightX = left + width - colW - 10;
      pdf.font("serif").fontSize(10.5).fillColor("#111").text("BỘ KHOA HỌC VÀ CÔNG NGHỆ", left, 56, { width: colW, align: "center" });
      pdf.font("serif-bold").fontSize(10.5).text(doc.issuer.toUpperCase(), { width: colW, align: "center" });
      const afterIssuer = pdf.y;
      pdf.moveTo(left + colW / 2 - 40, afterIssuer + 2).lineTo(left + colW / 2 + 40, afterIssuer + 2).lineWidth(0.6).strokeColor("#111").stroke();
      pdf.font("serif").fontSize(10.5).text(`Số: ${doc.number}`, left, afterIssuer + 10, { width: colW, align: "center" });

      pdf.font("serif-bold").fontSize(10.5).text("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", rightX, 56, { width: colW + 10, align: "center" });
      pdf.font("serif-bold").fontSize(11).text("Độc lập – Tự do – Hạnh phúc", { width: colW + 10, align: "center" });
      const afterMotto = pdf.y;
      pdf.moveTo(rightX + (colW + 10) / 2 - 70, afterMotto + 2).lineTo(rightX + (colW + 10) / 2 + 70, afterMotto + 2).lineWidth(0.6).stroke();
      pdf.font("serif").fontSize(10.5).text(`Hà Nội, ${vnDate(doc.issuedDate)}`, rightX, afterMotto + 10, { width: colW + 10, align: "center", oblique: true });

      pdf.y = Math.max(pdf.y, afterIssuer + 30) + 26;
      pdf.font("serif-bold").fontSize(13.5).text(doc.docType.toUpperCase(), left, pdf.y, { width, align: "center" });
      pdf.font("serif-bold").fontSize(12).text(doc.title, { width, align: "center" });
      pdf.moveDown(1.2);

      pdf.font("serif").fontSize(12).fillColor("#111");
      pdf.text(doc.summary, { width, align: "justify", lineGap: 3, indent: 28 });
      pdf.moveDown(0.5);
      for (const p of doc.body) {
        pdf.text(p, { width, align: "justify", lineGap: 3, indent: 28 });
        pdf.moveDown(0.5);
      }
      pdf.moveDown(1.2);
      if (doc.signer) {
        const m = doc.signer.match(/^(.*?Viện trưởng)\s+(.+)$/);
        const role = m?.[1] ?? "Thủ trưởng đơn vị";
        const name = m?.[2] ?? doc.signer;
        const titleLines = role.startsWith("Phó") ? "KT. VIỆN TRƯỞNG\nPHÓ VIỆN TRƯỞNG" : role.startsWith("Quyền") ? "Q. VIỆN TRƯỞNG" : role.toUpperCase();
        const signX = left + width - 230;
        const y = pdf.y;
        pdf.font("serif-bold").fontSize(11.5).text(titleLines, signX, y, { width: 230, align: "center" });
        pdf.font("serif").fontSize(10).fillColor("#666").text("(Đã ký – bản minh họa)", signX, pdf.y + 4, { width: 230, align: "center", oblique: true });
        pdf.font("serif-bold").fontSize(11.5).fillColor("#111").text(name, signX, pdf.y + 34, { width: 230, align: "center" });
        pdf.font("serif").fontSize(9.5).fillColor("#111").text("Nơi nhận:", left, y, { width: 200, oblique: true });
        pdf.fontSize(9).text("- Như trên;\n- Lưu: VT, VP.", left, pdf.y + 2, { width: 200 });
      }
    }

    // Chân trang: ghi chú bản demo và số trang
    const range = pdf.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      pdf.switchToPage(i);
      const bottom = pdf.page.height - 40;
      pdf.font("sans").fontSize(8).fillColor("#888");
      pdf.text(`${INSTITUTE} · Tài liệu minh họa – bản demo Trang thông tin điện tử`, left, bottom, { width: width - 60, lineBreak: false });
      pdf.text(`Trang ${i + 1}/${range.count}`, left + width - 60, bottom, { width: 60, align: "right", lineBreak: false });
    }
    pdf.end();
  });
}

function makeVideo(out: string, images: string[]) {
  const args = ["-y", "-loglevel", "error"];
  // Mỗi ảnh là một khung hình đơn; zoompan sinh 75 khung (3 giây ở 25 khung/giây) với hiệu ứng phóng chậm
  for (const im of images) args.push("-i", path.join(PUBLIC_DIR, "images", `${im}.jpg`));
  const chains = images
    .map((_, i) => `[${i}]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,zoompan=z='min(zoom+0.0008,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=75:s=1280x720:fps=25[v${i}]`)
    .join(";");
  const concat = `${images.map((_, i) => `[v${i}]`).join("")}concat=n=${images.length}:v=1:a=0,format=yuv420p[v]`;
  args.push("-filter_complex", `${chains};${concat}`, "-map", "[v]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-movflags", "+faststart", out);
  execFileSync("ffmpeg", args, { stdio: "inherit" });
}

async function main() {
  const seedModule = pathToFileURL(path.join(ROOT, "artifacts/api-server/src/seed/documents.ts")).href;
  const { DOCUMENTS } = (await import(seedModule)) as { DOCUMENTS: SampleDocument[] };
  mkdirSync(FILES_DIR, { recursive: true });
  mkdirSync(VIDEOS_DIR, { recursive: true });

  const sizes: Record<string, number> = {};
  for (const doc of DOCUMENTS) {
    const file = path.join(FILES_DIR, doc.fileName);
    await writePdf(doc, file);
    sizes[doc.fileName] = statSync(file).size;
  }
  console.log(`Đã tạo ${DOCUMENTS.length} tệp PDF trong ${path.relative(ROOT, FILES_DIR)}`);

  const videos: [string, string[]][] = [
    ["toan-canh-hoi-thao.mp4", ["news-hoi-thao", "news-ky-ket", "nghien-cuu-tieng-viet", "news-hop-tac-quoc-te"]],
    ["phong-thi-nghiem-ai.mp4", ["news-phong-lab-ai", "news-trung-tam-du-lieu", "du-lieu-gan-nhan", "ha-tang-iot"]],
  ];
  for (const [name, images] of videos) {
    const out = path.join(VIDEOS_DIR, name);
    if (!existsSync(out) || process.argv.includes("--force")) makeVideo(out, images);
    sizes[name] = statSync(out).size;
  }
  console.log(`Đã tạo ${videos.length} video trong ${path.relative(ROOT, VIDEOS_DIR)}`);

  const body = Object.entries(sizes)
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${v},`)
    .join("\n");
  writeFileSync(
    SIZES_FILE,
    `/** Tệp sinh tự động bởi scripts/src/generate-sample-files.ts – kích thước (byte) của tệp mẫu */\nexport const FILE_SIZES: Record<string, number> = {\n${body}\n};\n`,
  );
  console.log(`Đã ghi ${path.relative(ROOT, SIZES_FILE)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
