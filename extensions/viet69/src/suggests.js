// suggests.js — Video liên quan ("You may also like" trên trang chi tiết)
// Contract: execute(input) → [{name*, link*, cover?, host?}] ; input = URL trang detail
load("config.js");

function execute(input) {
    var url = (input || "") + "";
    if (url.indexOf("http") !== 0) return Response.error("Invalid input");

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    // Section đã verify: .app-related-videos chứa các .item.item-video giống trang chủ
    // (chỉ có trên bài mới /bai-viet/; bài cũ /{slug}/ không có section này)
    var section = doc.select(".app-related-videos").first();
    var items = section ? section.select("div.item.item-video") : null;

    if (!items || items.size() === 0) {
        // Fallback: gợi ý từ danh sách mới nhất trên trang chủ
        var homeRes = fetch(BASE_URL + "/", { headers: { "User-Agent": UA }, timeout: 25000 });
        if (!homeRes.ok) return Response.success(data);
        items = homeRes.html().select("div.item.item-video");
    }

    items.forEach(function (el) {
        var linkEl = el.select("a.clip-link").first();
        if (!linkEl) return;

        var link = (linkEl.attr("href") || "") + "";
        if (!link || seen[link]) return;
        seen[link] = true;
        if (link.indexOf("http") !== 0) {
            link = link.indexOf("/") === 0 ? BASE_URL + link : BASE_URL + "/" + link;
        }

        var name = ((linkEl.attr("title") || "") + "").trim();
        if (!name) {
            var titleA = el.select("h2.entry-title a").first();
            if (titleA) name = (titleA.text() + "").trim();
        }

        var imgEl = el.select(".thumb img").first();
        var cover = imgEl ? ((imgEl.attr("src") || imgEl.attr("data-src") || "") + "") : "";

        data.push({
            name: name,
            link: link,
            cover: cover,
            host: BASE_URL
        });
    });

    return Response.success(data);
}
