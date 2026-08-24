// search.js — Tìm kiếm phim
// Contract: execute(key, page) → [{ name*, link*, cover?, description?, host? }], nextPage?
// Thật: GET /search?k=<key> (form search), phân trang ?page=N
function execute(key, page) {
    load('config.js');
    page = (page === undefined || page === null || page === "") ? "1" : String(page);
    var p = parseInt(page);
    if (!p || p < 1) p = 1;

    var kw = ((key === undefined || key === null) ? "" : (key + "")).trim();
    if (!kw) return Response.success([], null);

    var res = fetch(BASE_URL + "/search?k=" + encodeURIComponent(kw) + "&page=" + p);
    if (!res.ok) return Response.error("Search failed: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    var items = doc.select(".item");
    for (var i = 0; i < items.size(); i++) {
        var el = items.get(i);
        var linkEl = el.select("a.item__title").first();
        if (!linkEl) linkEl = el.select("a").first();
        if (!linkEl) continue;

        var link = (linkEl.attr("href") || "") + "";
        if (!link || seen[link]) continue;
        seen[link] = true;
        if (!link.startsWith("http")) link = BASE_URL + link;

        var imgEl = el.select("img").first();
        var cover = imgEl ? ((imgEl.attr("data-src") || imgEl.attr("src") || "") + "") : "";
        if (cover.startsWith("//")) cover = "https:" + cover;
        if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;

        data.push({
            name: ((linkEl.attr("title") || linkEl.text() || "") + "").trim(),
            link: link,
            cover: cover,
            description: "",
            host: BASE_URL
        });
    }

    var hasNext = doc.select("a[href*='page=']").size() > 0;
    return Response.success(data, hasNext ? String(p + 1) : null);
}
