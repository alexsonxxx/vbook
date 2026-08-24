// search.js (Comic)
// Contract: execute(key, page) → [{name*, link*, cover?, description?, host?}], next?
load("config.js");

function execute(key, page) {
    if (!page) page = "1";

    var res = fetch(BASE_URL + "/tim-kiem-nang-cao", {
        queries: { keyword: key, page: page }
    });
    if (!res.ok) return Response.error("Search failed: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    doc.select(".grid-cols-3 > a[href*=\"/truyen-tranh/\"]").forEach(function(el) {
        var link = (el.attr("href") || "") + "";
        if (!link || seen[link]) return;
        seen[link] = true;
        if (!link.startsWith("http")) link = BASE_URL + link;
        var imgEl = el.select("img").first();
        var cover = imgEl ? ((imgEl.attr("data-src") || imgEl.attr("src") || "") + "") : "";
        if (cover.startsWith("//")) cover = "https:" + cover;
        if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;
        var nameEl = el.select("span.line-clamp-2").first();
        var name = nameEl ? (nameEl.text() + "") : "";
        data.push({ name: name.trim(), link: link, cover: cover, description: "", host: BASE_URL });
    });

    // Pagination: "Trang sau" link mang href chứa page=N với N > page hiện tại
    var hasNext = false;
    doc.select("a[href*=\"page=\"]").forEach(function (el) {
        var href = (el.attr("href") || "") + "";
        var m = href.match(/[?&]page=(\d+)/);
        if (m && parseInt(m[1], 10) > parseInt(page, 10)) hasNext = true;
    });
    var nextPage = hasNext ? String(parseInt(page, 10) + 1) : null;

    return Response.success(data, nextPage);
}