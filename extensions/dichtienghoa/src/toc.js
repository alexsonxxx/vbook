// toc.js — Mục lục chương
// Contract: execute(url) → [{ name*, url*, host? }]
// API: /models/chapter?storyId={id}&page=N&limit=200
load("config.js");
function execute(url) {
    loginIfNeeded();
    var storyId = storyIdFromUrl(url);
    if (!storyId) return Response.error("URL không hợp lệ");

    var chapters = [];
    var page = 1;
    var limit = 200;
    var total = null;
    var guard = 0;

    while (guard < 100) {
        var res = apiFetch("/models/chapter?storyId=" + encodeURIComponent(storyId) + "&page=" + page + "&limit=" + limit);
        var json = parseJson(res);
        if (!json || json.error) return Response.error("Không lấy được danh sách chương");

        if (total === null && json.total) total = json.total;
        var batch = json.chapters || [];
        if (!batch.length) break;

        for (var i = 0; i < batch.length; i++) {
            var ch = batch[i];
            chapters.push({
                name: ch.title || ("Chương " + ch.number),
                url: BASE_URL + "/truyen/" + storyId + "/" + ch.id,
                host: BASE_URL
            });
        }

        if (total !== null && chapters.length >= total) break;
        if (batch.length < limit) break;
        page++;
        guard++;
        try { sleep(1200); } catch (e) {}
    }

    if (!chapters.length) return Response.error("Không có chương nào");
    return Response.success(chapters);
}