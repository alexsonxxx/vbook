// toc.js — Mục lục chương
// Contract: execute(url) → [{ name*, url*, host? }]
// url là URL web detail: https://lohi2.com/truyen/{slug}
// Lấy danh sách chương qua API /novels/{slug}/chapters (limit/offset, tối đa 1000/lần)
load("config.js");
function execute(url) {
    var slug = slugFromUrl(url);
    if (!slug) return Response.error("URL không hợp lệ");

    var chapters = [];
    var offset = 0;
    var limit = 200;
    var guard = 0;
    while (guard < 50) {
        var res = apiFetch(API_URL + "/novels/" + encodeURIComponent(slug) + "/chapters?limit=" + limit + "&offset=" + offset);
        if (!res || !res.ok) return Response.error(!res ? "API unreachable" : ("Lỗi: " + res.status));

        var batch = res.json();
        if (!batch || !batch.length) break;

        for (var i = 0; i < batch.length; i++) {
            var ch = batch[i];
            chapters.push({
                name: ch.titleVi || ("Chương " + ch.chapterNumber),
                url: BASE_URL + "/truyen/" + slug + "/chuong-" + ch.chapterNumber,
                host: BASE_URL
            });
        }

        if (batch.length < limit) break;
        offset += limit;
        guard++;
    }

    if (chapters.length === 0) return Response.error("Không có chương nào");
    return Response.success(chapters);
}