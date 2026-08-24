// toc.js (Comic) — Mục lục chương/tập
// Contract: execute(url) → [{ name*, url*, host? }]
// Nhận URL detail từ page.js; chapters được load qua API /api/comics/{slug}/chapters (phân trang 10/page).
load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);

    // Extract slug từ URL detail: .../truyen-tranh/{slug}
    var m = url.match(/\/truyen-tranh\/([^\/]+)/);
    if (!m) return Response.error("Invalid detail URL");
    var slug = m[1];

    var chapters = [];
    var seen = {};
    var page = 1;
    var lastPage = 1;

    while (page <= lastPage) {
        var res = fetch(BASE_URL + "/api/comics/" + slug + "/chapters", {
            queries: { page: page }
        });
        if (!res.ok) break;

        var json = res.json();
        if (!json || !json.success || !json.data) break;

        if (json.data.last_page) lastPage = json.data.last_page;

        var items = json.data.chapters || [];
        for (var i = 0; i < items.length; i++) {
            var ch = items[i];
            var num = ch.chapter_num;
            var chapUrl = BASE_URL + "/truyen-tranh/" + slug + "/chuong-" + num;
            if (seen[chapUrl]) continue;
            seen[chapUrl] = true;
            chapters.push({
                name: (ch.chapter_name || "") + "",
                url: chapUrl,
                host: BASE_URL
            });
        }
        page++;
        if (page > lastPage) break;
    }

    if (chapters.length === 0) return Response.error("No chapters found");

    // Sort tăng dần theo chapter_num (API trả giảm dần)
    chapters.sort(function (a, b) {
        var na = parseInt(a.url.split("/chuong-")[1], 10) || 0;
        var nb = parseInt(b.url.split("/chuong-")[1], 10) || 0;
        return na - nb;
    });

    return Response.success(chapters);
}