import type { db } from "@workspace/db";

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const DAY = 86_400_000;

/** Thời điểm cách hiện tại `days` ngày (âm = tương lai), đặt giờ theo giờ Việt Nam */
export function at(now: Date, days: number, hour = 8, minute = 0): Date {
  const vnToday = now.toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
  const base = new Date(`${vnToday}T00:00:00+07:00`).getTime();
  return new Date(base - days * DAY + hour * 3_600_000 + minute * 60_000);
}

/** Ngày dạng YYYY-MM-DD cách hiện tại `days` ngày */
export function dateStr(now: Date, days: number): string {
  return at(now, days, 12).toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
}

/** Bộ sinh số giả ngẫu nhiên có hạt giống để dữ liệu mẫu ổn định giữa các lần khởi tạo */
export function prng(seed: number) {
  let s = seed % 2147483647 || 1;
  const next = () => {
    s = (s * 48271) % 2147483647;
    return s / 2147483647;
  };
  return {
    next,
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T>(list: readonly T[]): T => list[Math.floor(next() * list.length)]!,
    weighted: <T>(list: readonly (readonly [T, number])[]): T => {
      const total = list.reduce((s, [, w]) => s + w, 0);
      let r = next() * total;
      for (const [v, w] of list) {
        r -= w;
        if (r <= 0) return v;
      }
      return list[list.length - 1]![0];
    },
  };
}

export type Block =
  | string
  | { h: string }
  | { ul: string[] }
  | { quote: string; by?: string }
  | { img: string; caption: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Dựng HTML nội dung từ các khối văn bản đơn giản (chuỗi có thể chứa thẻ <strong>, <em>, <a>) */
export function html(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if (typeof b === "string") return `<p>${b}</p>`;
      if ("h" in b) return `<h2>${esc(b.h)}</h2>`;
      if ("ul" in b) return `<ul>${b.ul.map((li) => `<li>${li}</li>`).join("")}</ul>`;
      if ("quote" in b) return `<blockquote><p>${b.quote}</p>${b.by ? `<cite>${esc(b.by)}</cite>` : ""}</blockquote>`;
      return `<figure><img src="${b.img}" alt="${esc(b.caption)}" /><figcaption>${esc(b.caption)}</figcaption></figure>`;
    })
    .join("\n");
}

export const img = (name: string) => `/images/${name}.jpg`;
