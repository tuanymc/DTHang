/** Chuẩn hóa URL ảnh/video (ảnh trong DB có thể là https://..., hoặc chuỗi không có scheme). */
export function normalizeMediaUrl(url?: string | null): string {
    const fallback =
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80";
    if (url == null || `${url}`.trim() === "") return fallback;
    const t = `${url}`.trim();
    if (/^https?:\/\//i.test(t)) return t;
    if (t.startsWith("//")) return `https:${t}`;
    return `https://${t.replace(/^\/+/, "")}`;
}
