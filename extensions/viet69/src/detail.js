// detail.js — Thông tin chi tiết 1 video
// Contract: execute(url) → { name*, cover, host, author, description, ongoing:bool*, suggests? }
load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();

    // Đã verify: tiêu đề nằm ở h2.siteheading
    var nameEl = doc.select("h2.siteheading").first();
    var name = nameEl ? (nameEl.text() + "").trim() : "";
    if (!name) {
        var ogTitle = doc.select("meta[property=og:title]").first();
        if (ogTitle) name = (ogTitle.attr("content") + "").trim();
    }

    // Site không có og:image; thử meta chuẩn, không có thì bỏ trống
    var cover = "";
    var metaImg = doc.select("meta[property=og:image]").first();
    if (metaImg) cover = (metaImg.attr("content") || "") + "";

    // entry-meta (display:none): span.author "Anonymous", span.time "on dd/mm/yyyy"
    var author = "";
    var authorEl = doc.select(".entry-meta .author").first();
    if (authorEl) author = (authorEl.text() + "").trim();

    var timeEl = doc.select(".entry-meta .time").first();
    var timeText = timeEl ? (timeEl.text() + "").trim() : "";

    var description = "";
    var descMeta = doc.select("meta[name=description]").first();
    if (descMeta) description = (descMeta.attr("content") || "") + "";
    if (timeText) description = (description ? description + "\n" : "") + "Đăng: " + timeText;

    // Video lẻ luôn hoàn chỉnh
    var ongoing = false;

    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: description,
        ongoing: ongoing,
        format: "single",
        suggests: [{
            title: "Video liên quan",
            input: url,
            script: "suggests.js"
        }]
    });
}
