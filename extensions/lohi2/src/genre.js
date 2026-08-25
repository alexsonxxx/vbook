// genre.js — Danh sách thể loại
// Contract: execute() → [{ title, input, script }]
// API: /discovery/genres → ["Tiên Hiệp", "Ngôn Tình", ...]
load("config.js");
function execute() {
    var res = apiFetch(API_URL + "/discovery/genres");
    if (!res || !res.ok) return Response.error(!res ? "API unreachable" : ("Lỗi: " + res.status));

    var genres = res.json();
    if (!genres || !genres.length) return Response.error("Không có thể loại");

    var data = [];
    for (var i = 0; i < genres.length; i++) {
        data.push({
            title: genres[i],
            input: API_URL + "/discovery/feed?genres=" + encodeURIComponent(genres[i]),
            script: "gen.js"
        });
    }
    return Response.success(data);
}