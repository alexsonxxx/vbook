// page.js (Comic) — Nhận URL detail, trả về mảng URL trang mục lục cho toc.js
// Contract: execute(url) → [urlString, ...]
// TOC của site này được load qua API /api/comics/{slug}/chapters (phân trang).
// → trả về chính URL detail; toc.js sẽ tự gọi API và loop qua các trang.
load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);
    return Response.success([url]);
}