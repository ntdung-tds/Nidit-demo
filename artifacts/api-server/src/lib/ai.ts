import type { AiSuggestion, AiTask } from "@workspace/api-zod";
import { HttpError } from "./http";
import { logger } from "./logger";
import { cleanHtml, stripHtml, truncate } from "./text";

export const AI_MODEL = "gpt-5.6-terra";
const MAX_INPUT_CHARS = 12_000;

const SYSTEM_PROMPT = [
  "Bạn là biên tập viên cao cấp của Trang thông tin điện tử Viện Công nghệ số và Chuyển đổi số quốc gia (Bộ Khoa học và Công nghệ).",
  "Văn phong báo chí – hành chính nhà nước: chính xác, trang trọng, khách quan, ngắn gọn; đúng chính tả và quy tắc viết hoa tiếng Việt theo Nghị định 30/2020/NĐ-CP.",
  "Tuyệt đối không bịa đặt số liệu, tên người, chức danh, sự kiện không có trong nội dung gốc.",
  "Chỉ trả về một đối tượng JSON hợp lệ đúng cấu trúc được yêu cầu, không kèm giải thích hay định dạng markdown.",
].join(" ");

const TASK_PROMPTS: Record<AiTask, string> = {
  titles:
    'Đề xuất 5 tiêu đề tin bài khác nhau, mỗi tiêu đề tối đa 110 ký tự, rõ chủ thể và sự kiện, không giật tít, không dùng dấu chấm than. JSON: {"titles": ["...", "..."]}',
  summary:
    'Viết đoạn sa-pô (tóm tắt mở đầu) 2–3 câu, tối đa 60 từ, nêu được ai, làm gì, ở đâu, ý nghĩa. JSON: {"summary": "..."}',
  keywords:
    'Trích 6–10 từ khóa/cụm từ khóa tiếng Việt quan trọng nhất (danh từ riêng, lĩnh vực, chủ đề), viết thường trừ danh từ riêng. JSON: {"keywords": ["...", "..."]}',
  rewrite:
    'Biên tập lại nội dung cho mạch lạc, trang trọng, đúng văn phong tin bài của cơ quan nhà nước; giữ nguyên toàn bộ dữ kiện. Trả về HTML chỉ dùng các thẻ <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>. JSON: {"rewrite": "<p>...</p>"}',
  seo:
    'Tối ưu SEO: tiêu đề SEO tối đa 60 ký tự, mô tả SEO 140–160 ký tự hấp dẫn và chính xác, cùng 5–8 từ khóa. JSON: {"seoTitle": "...", "seoDescription": "...", "keywords": ["..."]}',
  proofread:
    'Soát lỗi chính tả, ngữ pháp, dấu câu, viết hoa, dùng từ. Liệt kê tối đa 15 lỗi; "original" là đoạn nguyên văn ngắn chứa lỗi (trích chính xác từ văn bản), "suggestion" là đoạn đã sửa, "reason" giải thích ngắn. Nếu không có lỗi, trả mảng rỗng. JSON: {"issues": [{"original": "...", "suggestion": "...", "reason": "..."}]}',
};

export interface AiInput {
  task: AiTask;
  title?: string | null;
  summary?: string | null;
  content?: string | null;
  instruction?: string | null;
}

function extractJson(text: string): Record<string, unknown> {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI không trả về JSON");
  return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
}

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const strList = (v: unknown, max: number): string[] =>
  Array.isArray(v) ? [...new Set(v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean))].slice(0, max) : [];

export async function suggestWithAi(input: AiInput): Promise<AiSuggestion> {
  const plain = truncate(stripHtml(input.content), MAX_INPUT_CHARS);
  const needsBody = input.task === "rewrite" || input.task === "proofread";
  if (needsBody && plain.length < 20) throw new HttpError(400, "Vui lòng nhập nội dung bài viết (ít nhất vài câu) trước khi dùng gợi ý AI");
  if (!needsBody && !plain && !input.title?.trim() && !input.summary?.trim()) {
    throw new HttpError(400, "Vui lòng nhập tiêu đề hoặc nội dung trước khi dùng gợi ý AI");
  }
  const userParts = [
    TASK_PROMPTS[input.task],
    input.instruction?.trim() ? `Yêu cầu bổ sung của biên tập viên: ${input.instruction.trim().slice(0, 500)}` : "",
    input.title?.trim() ? `Tiêu đề hiện tại: ${input.title.trim()}` : "",
    input.summary?.trim() ? `Sa-pô hiện tại: ${input.summary.trim()}` : "",
    plain ? `Nội dung:\n${input.task === "rewrite" ? truncate(input.content ?? "", MAX_INPUT_CHARS) : plain}` : "",
  ].filter(Boolean);

  let openai: (typeof import("@workspace/integrations-openai-ai-server"))["openai"];
  try {
    ({ openai } = await import("@workspace/integrations-openai-ai-server"));
  } catch (err) {
    logger.error({ err }, "AI integration is not configured");
    throw new HttpError(503, "Dịch vụ AI chưa được cấu hình");
  }

  let raw: string;
  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userParts.join("\n\n") },
      ],
    });
    raw = completion.choices[0]?.message?.content ?? "";
  } catch (err) {
    logger.error({ err, task: input.task }, "AI request failed");
    throw new HttpError(502, "Dịch vụ AI tạm thời không phản hồi, vui lòng thử lại sau ít phút");
  }

  let data: Record<string, unknown>;
  try {
    data = extractJson(raw);
  } catch (err) {
    logger.warn({ err, task: input.task, raw: raw.slice(0, 300) }, "AI returned invalid JSON");
    throw new HttpError(502, "Kết quả AI không hợp lệ, vui lòng thử lại");
  }

  const issues = Array.isArray(data["issues"])
    ? (data["issues"] as unknown[])
        .map((i) => {
          const o = (i ?? {}) as Record<string, unknown>;
          return { original: str(o["original"]) ?? "", suggestion: str(o["suggestion"]) ?? "", reason: str(o["reason"]) ?? "" };
        })
        .filter((i) => i.original && i.suggestion && i.original !== i.suggestion)
        .slice(0, 15)
    : [];
  const rewrite = str(data["rewrite"]);
  return {
    task: input.task,
    titles: strList(data["titles"], 8),
    summary: str(data["summary"]),
    keywords: strList(data["keywords"], 12),
    rewrite: rewrite ? cleanHtml(rewrite.includes("<") ? rewrite : `<p>${rewrite}</p>`) : null,
    seoTitle: str(data["seoTitle"]),
    seoDescription: str(data["seoDescription"]),
    issues,
    model: AI_MODEL,
    generatedAt: new Date(),
  };
}
