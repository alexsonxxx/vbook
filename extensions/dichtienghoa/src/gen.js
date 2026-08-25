// gen.js — Danh sách truyện
// Contract: execute(url, page) → [{ name*, link*, cover?, description?, host? }], nextPage?
load("config.js");
function execute(url, page) {
    loginIfNeeded();
    if (!page) page = "1";
    var p = Math.max(parseInt(page, 10) || 1, 1);

    var sep = url.indexOf("?") >= 0 ? "&" : "?";
    var apiPath = url + sep + "page=" + p + "&limit=" + PAGE_SIZE;

    var res = apiFetch(apiPath);
    var json = parseJson(res);
    if (!json || json.error) return Response.error("Không có dữ liệu");

    var data = json.data;
    if (!data) return Response.error("Không có dữ liệu");

    var items = null;
    if (url.indexOf("home/bootstrap") >= 0) {
        var tab = "newest";
        var tm = url.match(/tab=([^&]+)/);
        if (tm) tab = tm[1];
        if (data[tab] && data[tab].data) items = data[tab].data;
    } else if (url.indexOf("ranking/bootstrap") >= 0) {
        var rank = "daily";
        var rm = url.match(/rank=([^&]+)/);
        if (rm) rank = rm[1];
        if (data.rankings && data.rankings[rank]) items = data.rankings[rank];
    } else {
        if (Array.isArray(data)) items = data;
        else if (data.data && Array.isArray(data.data)) items = data.data;
    }

    if (!items || !items.length) return Response.error("Không có dữ liệu");

    var out = [];
    var seen = {};
    for (var i = 0; i < items.length; i++) {
        var link = BASE_URL + "/truyen/" + items[i].id;
        if (seen[link]) continue;
        seen[link] = true;
        out.push(mapNovelItem(items[i]));
    }

    var hasNext = items.length >= PAGE_SIZE;
    return Response.success(out, hasNext ? String(p + 1) : null);
}