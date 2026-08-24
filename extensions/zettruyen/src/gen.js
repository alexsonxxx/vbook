// gen.js (Comic) — Danh sách truyện tranh
// Contract: execute(url, page) → [{name*, link*, cover?, description?, host?, tag?}], nextPage?
// QUAN TRỌNG: nextPage phải là string, không phải số!
load("config.js");

function execute(url, page) {
    if (!page) page = "1";

    var pageUrl = url.replace("{{page}}", page);

    var res = fetch(pageUrl);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    doc.select(".grid-cols-3 > a[href*=\"/truyen-tranh/\"]").forEach(function (el) {
        var link = (el.attr("href") || "") + "";
        if (!link || seen[link]) return;
        seen[link] = true;

        if (!link.startsWith("http")) link = BASE_URL + link;

        var imgEl = el.select("img").first();
        var cover = imgEl ? ((imgEl.attr("data-src") || imgEl.attr("src") || "") + "") : "";
        if (cover.startsWith("//")) cover = "https:" + cover;
        if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;

        // ✅ Chỉ encode phần path + query (nếu cần)
        try {
            var urlObj = new URL(cover);
            // encode pathname (tránh lỗi space, unicode…)
            urlObj.pathname = urlObj.pathname
                .split("/")
                .map(p => encodeURIComponent(p))
                .join("/");
            cover = urlObj.toString();
        } catch (e) {
            // fallback nếu URL lỗi format
            cover = encodeURI(cover);
        }

        var nameEl = el.select("span.line-clamp-2").first();
        var name = nameEl ? (nameEl.text() + "") : "";

        data.push({
            name: name.trim(),
            link: link,
            cover: cover,
            description: "",
            host: BASE_URL,
        });
    });

    // Pagination: "Trang sau" link mang href chứa page=N với N > page hiện tại
    // Lưu ý: page không phải lúc nào cũng là param đầu (vd ?sort=rating&page=2) → dùng *="page="
    var hasNext = false;
    doc.select("a[href*=\"page=\"]").forEach(function (el) {
        var href = (el.attr("href") || "") + "";
        var m = href.match(/[?&]page=(\d+)/);
        if (m && parseInt(m[1], 10) > parseInt(page, 10)) hasNext = true;
    });
    var nextPage = hasNext ? String(parseInt(page, 10) + 1) : null;

    return Response.success(data, nextPage);
}