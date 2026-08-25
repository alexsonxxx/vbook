// search.js — Tìm kiếm truyện
// Contract: execute(key, page) → [{ name*, link*, cover?, description?, host? }], nextPage?
// API: /api/models/story?q=KEY&fast=1&page=N&pageSize=48
// Lưu ý: key là MỘT chuỗi từ khóa (app gọi execute(key, page) — không split).
load("config.js");
function execute(key, page) {
    if (!key) return Response.error("Thiếu từ khóa");
    loginIfNeeded();
    if (!page) page = "1";
    var p = Math.max(parseInt(page, 10) || 1, 1);

    // fast=1 + referer /tim-kiem giống hệt web — API search chuẩn
    var res = apiFetch("/models/story?q=" + encodeURIComponent(key) + "&fast=1&page=" + p + "&pageSize=48", {
        referer: BASE_URL + "/tim-kiem"
    });
    var json = parseJson(res);
    if (!json || json.error) return Response.error("Không có kết quả");

    var items = json.data;
    if (!Array.isArray(items) || !items.length) return Response.error("Không tìm thấy truyện");

    var out = [];
    for (var i = 0; i < items.length; i++) {
        out.push(mapNovelItem(items[i]));
    }

    var hasNext = false;
    if (json.pagination) {
        hasNext = json.pagination.hasMore === true ||
            (json.pagination.totalPages != null && p < json.pagination.totalPages);
    } else {
        hasNext = items.length >= 48;
    }
    return Response.success(out, hasNext ? String(p + 1) : null);
}