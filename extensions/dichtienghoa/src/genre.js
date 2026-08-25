// genre.js — Danh sách thể loại
// Contract: execute() → [{ title, input, script }]
load("config.js");
function execute() {
    loginIfNeeded();
    var res = apiFetch("/ranking/bootstrap?limit=1");
    var json = parseJson(res);
    if (!json || !json.data || !json.data.categories) return Response.error("Không có dữ liệu thể loại");

    var cats = json.data.categories;
    var out = [];
    for (var i = 0; i < cats.length; i++) {
        var c = cats[i];
        var n = (c.name || "").trim();
        if (!n || n.indexOf("__") === 0) continue;
        out.push({
            title: n,
            input: "/ranking/bootstrap?rank=byCategory&category=" + encodeURIComponent(n),
            script: "gen.js"
        });
    }

    if (!out.length) return Response.error("Không có thể loại");
    return Response.success(out);
}