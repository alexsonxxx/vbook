// config.js — VSMOV.COM (Nguồn API Phim Miễn Phí)
// Dùng var (KHÔNG let/const) — Rhino cũ của VBook không parse được let/const
var BASE_URL = "https://vsmov.com";
try { if (CONFIG_URL) BASE_URL = CONFIG_URL; } catch (e) {}

var API_BASE = BASE_URL + "/api";

/** Fetch JSON an toàn, trả null nếu lỗi */
function fetchJson(url) {
    var res = fetch(url, { headers: { Accept: "application/json" }, timeout: 15000 });
    if (!res.ok) return null;
    try {
        return res.json();
    } catch (e) {
        return null;
    }
}

/** Lấy slug từ URL detail /phim/{slug} (giữ nguyên đuôi số nếu có) */
function slugFromUrl(url) {
    var m = (url + "").match(/\/phim\/([^\/\?#]+)/);
    if (!m) return null;
    return m[1];
}

/** Chuyển items API thành danh sách sách/phim cho gen/search */
function itemsToBooks(items) {
    var data = [];
    var seen = {};
    items = items || [];
    for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var slug = (it.slug || "") + "";
        if (!slug || seen[slug]) continue;
        seen[slug] = true;

        var cover = "";
        if (typeof it.poster_url === "string" && it.poster_url) cover = it.poster_url;
        if (!cover && typeof it.thumb_url === "string" && it.thumb_url) cover = it.thumb_url;

        var desc = (it.origin_name || "") + "";
        if (it.year) desc = (desc ? desc + " · " : "") + it.year;

        data.push({
            name: (it.name || "") + "",
            link: BASE_URL + "/phim/" + slug,
            cover: cover,
            description: desc,
            host: BASE_URL
        });
    }
    return data;
}

/** nextPage từ pagination API: trả String hoặc null */
function nextPageFrom(pagination, page) {
    if (!pagination) return null;
    var cur = parseInt(pagination.currentPage, 10);
    var total = parseInt(pagination.totalPages, 10);
    if (isNaN(cur) || isNaN(total)) return null;
    if (cur < total) return String(cur + 1);
    return null;
}
