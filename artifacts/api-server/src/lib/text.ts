import sanitizeHtml from "sanitize-html";

/** Bỏ dấu tiếng Việt, chuyển về chữ thường */
export function foldVietnamese(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

/** Sinh đường dẫn thân thiện từ tiêu đề tiếng Việt */
export function slugify(input: string, fallback = "noi-dung"): string {
  const slug = foldVietnamese(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110)
    .replace(/-+$/g, "");
  return slug || fallback;
}

/** Tìm đường dẫn chưa được sử dụng: slug, slug-2, slug-3 ... */
export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  let candidate = base;
  let n = 2;
  while (await exists(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

const ALIGN = [/^left$/, /^right$/, /^center$/, /^justify$/];

/** Làm sạch HTML do người dùng nhập (trình soạn thảo, dữ liệu thu thập) */
export function cleanHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "blockquote", "ul", "ol", "li",
      "a", "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "hr", "code", "pre",
      "span", "sub", "sup", "iframe",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "frameborder"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
    },
    allowedStyles: {
      p: { "text-align": ALIGN },
      h2: { "text-align": ALIGN },
      h3: { "text-align": ALIGN },
      h4: { "text-align": ALIGN },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com", "www.google.com"],
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs["href"] ?? "";
        const external = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs,
        };
      },
    },
  });
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/** Lấy văn bản thuần từ HTML */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  const text = sanitizeHtml(html.replace(/<\/(p|div|li|h[1-6])>/gi, " ").replace(/<br\s*\/?>/gi, " "), {
    allowedTags: [],
    allowedAttributes: {},
  });
  return text
    .replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_m, code: string) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trim()}…`;
}

export function readingMinutes(html: string): number {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Trích đoạn quanh từ khóa tìm kiếm */
export function snippetAround(text: string, query: string, max = 180): string {
  const plain = text.replace(/\s+/g, " ").trim();
  if (!plain) return "";
  const idx = foldVietnamese(plain).indexOf(foldVietnamese(query));
  if (idx < 0 || plain.length <= max) return truncate(plain, max);
  const start = Math.max(0, idx - Math.floor(max / 3));
  const piece = plain.slice(start, start + max);
  return `${start > 0 ? "…" : ""}${piece.trim()}${start + max < plain.length ? "…" : ""}`;
}

/** Thoát ký tự đặc biệt cho XML */
export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Chuỗi điều kiện LIKE an toàn */
export function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

const VI_ACCENTED =
  "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ" +
  "ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ";

/** Cặp chuỗi dùng cho hàm translate() của PostgreSQL để tìm kiếm không dấu */
export const VI_TRANSLATE_FROM = VI_ACCENTED;
export const VI_TRANSLATE_TO = [...VI_ACCENTED].map((ch) => foldVietnamese(ch)).join("");
