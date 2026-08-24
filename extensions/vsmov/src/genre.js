// genre.js — Danh sách thể loại từ API VSMOV
// Contract: execute() → [{ title, input, script }]
// Lưu ý: param ?category= bị API bỏ qua; endpoint lọc đúng là /api/the-loai/{slug}
load("config.js");

function execute() {
    var j = fetchJson(API_BASE + "/the-loai");
    if (!j || !j.data || !j.data.items) return Response.error("Không lấy được thể loại");

    var genres = [];
    var seen = {};
    (j.data.items || []).forEach(function (g) {
        var title = (g.name || "") + "";
        var slug = (g.slug || "") + "";
        if (!title || !slug || seen[slug]) return;
        seen[slug] = true;
        genres.push({
            title: title,
            input: BASE_URL + "/api/the-loai/" + slug + "?page={{page}}",
            script: "gen.js"
        });
    });

    if (genres.length === 0) return Response.error("Không có thể loại");
    return Response.success(genres);
}
