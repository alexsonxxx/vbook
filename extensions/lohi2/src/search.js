// search.js — Tìm kiếm truyện
// Contract: execute(key, page) → [{ name*, link*, cover?, description?, host? }], nextPage?
// API: /novels/search?q={key} → {matches:[{slug, titleVi, coverImageUrl, authorVi, genres}]}
load("config.js");
function execute(key, page) {
    if (!key) return Response.error("Thiếu từ khóa");

    var res = apiFetch(API_URL + "/novels/search?q=" + encodeURIComponent(key));
    if (!res || !res.ok) return Response.error(!res ? "API unreachable" : ("Lỗi: " + res.status));

    var json = res.json();
    var matches = (json && json.matches) || [];
    if (!matches.length) return Response.success([]);

    var data = [];
    var seen = {};
    for (var i = 0; i < matches.length; i++) {
        var item = matches[i];
        var link = BASE_URL + "/truyen/" + item.slug;
        if (seen[link]) continue;
        seen[link] = true;

        var descParts = [];
        if (item.authorVi) descParts.push(item.authorVi);
        if ((item.genres || []).length > 0) descParts.push(item.genres.join(", "));

        data.push({
            name: item.titleVi || item.titleCn || item.slug || "",
            link: link,
            cover: item.coverImageUrl || "",
            description: descParts.join(" • "),
            host: BASE_URL
        });
    }

    return Response.success(data);
}