// gen.js — Danh sách phim từ 1 trang URL
// Contract: execute(url, page) → [{name*, link*, cover?, description?, host?, tag?}], nextPage?
// Thật: .item > a.item__title (href+title), img cover, .item__labels span tags
// Phân trang: ?page=N
function execute(url, page) {
    load('config.js');
    page = (page === undefined || page === null || page === "") ? "1" : String(page);
    var p = parseInt(page);
    if (!p || p < 1) p = 1;

    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    // Tách query (nếu có ?view=...) và gắn ?page=
    var base = url.split("?")[0];
    var pageUrl = p === 1 ? base : base + "?page=" + p;

    var res = fetch(pageUrl);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    var items = doc.select(".item");
    for (var i = 0; i < items.size(); i++) {
        var el = items.get(i);

        var linkEl = el.select("a.item__title").first();
        if (!linkEl) {
            linkEl = el.select("a").first();
        }
        if (!linkEl) continue;

        var link = (linkEl.attr("href") || "") + "";
        if (!link || seen[link]) continue;
        seen[link] = true;
        if (!link.startsWith("http")) link = BASE_URL + link;

        var imgEl = el.select("img").first();
        var cover = "";
        if (imgEl) {
            cover = (imgEl.attr("data-src") || imgEl.attr("src") || "") + "";
        }
        if (cover.startsWith("//")) cover = "https:" + cover;
        if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;

        var tags = [];
        el.select(".item__labels span").forEach(function (sp) {
            var tx = (sp.text() || "").trim() + "";
            if (tx) tags.push(tx);
        });
        var tag = tags.join(", ");

        var name = (linkEl.attr("title") || linkEl.text() || "").trim() + "";

        data.push({
            name: name,
            link: link,
            cover: cover,
            description: "",
            host: BASE_URL,
            tag: tag
        });
    }

    // Kiểm tra trang kế (home: ?page=2; genre: ?page=2)
    var hasNext = doc.select("a[href*='page=']").size() > 0;
    return Response.success(data, hasNext ? String(p + 1) : null);
}
