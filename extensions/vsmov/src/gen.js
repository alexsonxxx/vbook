// gen.js — Danh sách phim từ API JSON VSMOV
// Contract: execute(url, page) → [{name*, link*, cover?, description?, host?}], nextPage?
// url vào: BASE_URL + "/api/danh-sach/{type}?page={{page}}"
load("config.js");

function execute(url, page) {
    if (!page) page = "1";

    // Thay {{page}} trong URL template
    var pageUrl = url.replace(/{{page}}/g, page);
    // Đảm bảo có ?page= khi template không chứa {{page}}
    if (pageUrl.indexOf("page=") === -1) {
        pageUrl += (pageUrl.indexOf("?") === -1 ? "?" : "&") + "page=" + page;
    }

    var j = fetchJson(pageUrl);
    if (!j) return Response.error("API lỗi: " + pageUrl);

    var data = itemsToBooks(j.items);
    if (data.length === 0) return Response.error("Không có phim nào");

    var nextPage = nextPageFrom(j.pagination, page);
    return Response.success(data, nextPage);
}
