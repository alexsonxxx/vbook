// gen.js — Danh sách video từ 1 trang URL (home tab / genre)
// Contract: execute(url, page) → [{name*, link*, cover?, description?, host?, tag?}], nextPage?
load("config.js");

function execute(url, page) {
    if (!page) page = "1";

    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var clean = url;
    while (clean.slice(-1) === "/") clean = clean.slice(0, -1);

    // WP phân trang dạng path: /page/N/ ; /page/1/ redirect 301 nên page 1 dùng URL gốc
    var pageUrl = String(page) === "1" ? clean : clean + "/page/" + parseInt(page, 10) + "/";

    var res = fetch(pageUrl);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    doc.select("div.item.item-video").forEach(function (el) {
        var linkEl = el.select("a.clip-link").first();
        if (!linkEl) return;

        var link = (linkEl.attr("href") || "") + "";
        if (!link || seen[link]) return;
        seen[link] = true;
        if (link.indexOf("http") !== 0) {
            link = link.indexOf("/") === 0 ? BASE_URL + link : BASE_URL + "/" + link;
        }

        // Tên: h2.entry-title a là nguồn chính; title attr của a.clip-link là dự phòng
        var name = "";
        var titleA = el.select("h2.entry-title a").first();
        if (titleA) name = (titleA.text() + "").trim();
        if (!name) name = ((linkEl.attr("title") || "") + "").trim();

        var imgEl = el.select(".thumb img").first();
        var cover = imgEl ? ((imgEl.attr("src") || imgEl.attr("data-src") || "") + "") : "";

        data.push({
            name: name,
            link: link,
            cover: cover,
            description: "",
            host: BASE_URL
        });
    });

    // Phát hiện trang kế: lấy max số /page/N/ trong toàn bộ anchor (gồm cả "Last »")
    var cur = parseInt(page, 10);
    var maxPage = cur;
    doc.select("a[href*=/page/]").forEach(function (a) {
        var m = ((a.attr("href") || "") + "").match(/\/page\/(\d+)/);
        if (m) {
            var n = parseInt(m[1], 10);
            if (n > maxPage) maxPage = n;
        }
    });
    var nextPage = maxPage > cur ? String(cur + 1) : null;

    return Response.success(data, nextPage);
}
