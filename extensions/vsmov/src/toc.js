// toc.js — Danh sách tập phim từ API VSMOV
// Contract: execute(url) → [{ name*, url*, host? }] (hỗ trợ {type:"section"} khi nhiều server)
// url vào: BASE_URL + "/phim/{slug}" (từ detail)
// Chapter URL ra: BASE_URL + "/phim/{slug}/{epSlug}" (URL nội bộ, chap.js sẽ phân tích lại)
load("config.js");

function execute(url) {
    var slug = slugFromUrl(url);
    if (!slug) return Response.error("Không tìm thấy slug: " + url);

    var j = fetchJson(API_BASE + "/phim/" + slug);
    if (!j || !j.episodes || j.episodes.length === 0) {
        return Response.error("Không có dữ liệu tập phim");
    }

    var multiServer = j.episodes.length > 1;
    var chapters = [];

    j.episodes.forEach(function (server) {
        if (multiServer && server.server_name) {
            chapters.push({ name: (server.server_name + "").trim(), type: "section" });
        }
        (server.server_data || []).forEach(function (ep) {
            var epSlug = (ep.slug || "") + "";
            var epName = (ep.name || epSlug || "") + "";
            if (!epSlug) return;
            chapters.push({
                name: epName,
                url: BASE_URL + "/phim/" + slug + "/" + epSlug,
                host: BASE_URL
            });
        });
    });

    if (chapters.length === 0) return Response.error("Không có tập nào");
    return Response.success(chapters);
}
