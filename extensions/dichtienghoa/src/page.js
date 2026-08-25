// page.js — Trả danh sách URL trang mục lục cho toc.js
// Mục lục là 1 API call → trả [url] duy nhất.
// Contract: execute(url) → [urlString, ...]
load("config.js");
function execute(url) {
    if (!url) return Response.error("URL rỗng");
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);
    return Response.success([url]);
}