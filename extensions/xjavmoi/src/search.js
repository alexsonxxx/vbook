// search.js — Tìm kiếm phim
// Contract: execute(key, page) → [{ name*, link*, cover?, description?, host? }], nextPage?
// Thật: form #form-search action="/" method=get, input[name=search]
//       → GET /?search=<kw>; trang kết quả không có phân trang (24 item/trang)
//       Card kết quả giống listing: a.m-block.movie-item
function execute(key, page) {
    load('config.js');

    var res = fetch(BASE_URL + "/", {
        queries: { search: key }
    });
    if (!res.ok) return Response.error("Search failed: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    doc.select("a.m-block.movie-item").forEach(function (el) {
        var link = (el.attr("href") || "") + "";
        if (!link || seen[link]) return;
        seen[link] = true;
        if (!link.startsWith("http")) link = BASE_URL + link;

        var name = (el.attr("title") || "") + "";
        if (!name) {
            var tEl = el.select(".movie-title-1").first();
            name = (tEl ? tEl.text() : "") + "";
        }

        var cover = "";
        var imgEl = el.select(".lazyload").first();
        if (imgEl) {
            cover = (imgEl.attr("data-original") || imgEl.attr("data-src") || imgEl.attr("src") || "") + "";
        }
        if (cover.indexOf("//") === 0) cover = "https:" + cover;
        else if (cover && cover.indexOf("http") !== 0) cover = BASE_URL + cover;

        data.push({
            name: name.trim(),
            link: link,
            cover: cover,
            description: "",
            host: BASE_URL
        });
    });

    return Response.success(data, null);
}
