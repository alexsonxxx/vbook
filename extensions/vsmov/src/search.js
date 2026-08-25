// search.js — Tìm kiếm phim qua API VSMOV
// Contract: execute(key, page) → [{name*, link*, cover?, description?, host?}], nextPage?
load("config.js");

function execute(key, page) {
    if (!page) page = "1";

    var url = API_BASE + "/tim-kiem?keyword=" + encodeURIComponent(key) + "&page=" + page;
    var j = fetchJson(url);
    if (!j) return Response.error("Tìm kiếm lỗi");

    var data = itemsToBooks(j.items);
    if (data.length === 0) return Response.error("Không có kết quả");

    var nextPage = nextPageFrom(j.pagination, page);
    return Response.success(data, nextPage);
}
