// page.js — Trả danh sách URL trang mục lục cho toc.js
// Mục lục là 1 API call (chapters), nên trả [url] duy nhất.
// Contract: execute(url) → [urlString, ...]
load("config.js");
function execute(url) {
    if (!url) return Response.error("URL rỗng");
    // Chuẩn hóa domain về BASE_URL (nếu user mở URL lạ)
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    return Response.success([url]);
}