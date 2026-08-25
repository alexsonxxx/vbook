// detail.js — Thông tin chi tiết một truyện
// Contract: execute(url) → { name*, cover, host, author, description, ongoing:bool*,
//                             genres?:[{title,input,script}], suggests?:[{title,input,script}] }
// url là URL web: https://lohi2.com/truyen/{slug}
load("config.js");
function execute(url) {
    var slug = slugFromUrl(url);
    if (!slug) return Response.error("URL không hợp lệ");

    var res = apiFetch(API_URL + "/novels/" + encodeURIComponent(slug));
    if (!res || !res.ok) return Response.error(!res ? "API unreachable" : ("Lỗi: " + res.status));

    var item = res.json();
    if (!item || item.error) return Response.error("Không tìm thấy truyện");

    var name = item.titleVi || item.titleCn || item.slug || "";
    var cover = item.coverImageUrl || "";
    var author = item.authorVi || item.authorNameVi || "";
    var status = item.completionStatus || "";
    var ongoing = status !== "completed";

    var descLines = [];
    if (item.synopsis) descLines.push("<b>Tóm tắt:</b><br>" + item.synopsis.replace(/\n/g, "<br>"));
    if (item.totalChapters) descLines.push("<b>Số chương:</b> " + item.totalChapters);
    if (item.totalWords) descLines.push("<b>Số từ:</b> " + item.totalWords);
    if (item.readCount !== undefined && item.readCount !== null) descLines.push("<b>Lượt đọc:</b> " + item.readCount);
    if (author) descLines.push("<b>Tác giả:</b> " + author);
    if ((item.genres || []).length > 0) descLines.push("<b>Thể loại:</b> " + item.genres.join(", "));
    if (item.latestChapter && item.latestChapter.titleVi) descLines.push("<b>Chương mới nhất:</b> " + item.latestChapter.titleVi);

    // Genre links → gen.js với filter genres
    var genres = [];
    (item.genres || []).forEach(function(g) {
        genres.push({
            title: g,
            input: API_URL + "/discovery/feed?genres=" + encodeURIComponent(g),
            script: "gen.js"
        });
    });

    // Suggests: cùng tác giả → search.js
    var suggests = [];
    if (author) {
        suggests.push({
            title: "Truyện cùng tác giả: " + author,
            input: author,
            script: "search.js"
        });
    }

    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: descLines.join("<br><br>"),
        ongoing: ongoing,
        genres: genres.length > 0 ? genres : undefined,
        suggests: suggests.length > 0 ? suggests : undefined
    });
}