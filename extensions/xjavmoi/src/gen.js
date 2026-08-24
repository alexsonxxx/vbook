// gen.js — Danh sách phim từ 1 trang listing
// Contract: execute(url, page) → [{name*, link*, cover?, description?, host?, tag?}], nextPage?
// Thật: card = a.m-block.movie-item (href = link, [title] = tên,
//       .lazyload[data-original] = cover, .label = quốc gia)
// Phân trang kiểu query: ?page=N (trang chủ, the-loai, quoc-gia đều dùng chung)
function execute(url, page) {
    load('config.js');
    if (!page) page = "1";
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var pageUrl = url.replace("{{page}}", page);

    var res = fetch(pageUrl);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

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

        var tag = "";
        var labelEl = el.select(".label").first();
        if (labelEl) tag = (labelEl.text() || "").trim() + "";

        data.push({
            name: name.trim(),
            link: link,
            cover: cover,
            description: "",
            host: BASE_URL,
            tag: tag
        });
    });

    var nextPageNum = parseInt(page) + 1;
    var hasNext = doc.select("a[href*=\"page=" + nextPageNum + "\"]").size() > 0;

    return Response.success(data, hasNext ? String(nextPageNum) : null);
}
