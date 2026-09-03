// detail.js — Thông tin chi tiết một truyện
// Contract: execute(url) → { name*, cover, host, author, description, ongoing:bool*,
//                             genres?:[{title,input,script}], suggests?:[{title,input,script}] }
load("config.js");
function execute(url) {
    loginIfNeeded();
    var storyId = storyIdFromUrl(url);
    if (!storyId) return Response.error("URL không hợp lệ");

    var res = apiFetch("/models/story/" + encodeURIComponent(storyId), { referer: BASE_URL + "/truyen/" + storyId });
    var json = parseJson(res);
    var item = json || {};
    if (!item || item.error || !item.id) return Response.error("Không tìm thấy truyện");

    var name = (item.title || "").replace(/^\s+|\s+$/g, "");
    var cover = item.imgUrl || "";
    var author = (item.author && item.author.name) ? String(item.author.name).replace(/^\s+|\s+$/g, "") : "";
    var status = item.status || "";
    var ongoing = status !== "completed";
    var totalCh = (item._count && item._count.chapters) ? item._count.chapters : null;

    var descLines = [];
    if (item.description) descLines.push("<b>Tóm tắt:</b><br>" + String(item.description).replace(/<br\s*\/?>/g, "\n").replace(/\n+/g, "<br>"));
    if (totalCh) descLines.push("<b>Số chương:</b> " + totalCh);
    if (item.titleChinese) descLines.push("<b>Tên gốc:</b> " + item.titleChinese);
    if (author) descLines.push("<b>Tác giả:</b> " + author);
    if (status === "completed") descLines.push("<b>Trạng thái:</b> Hoàn thành");
    else if (status === "ongoing") descLines.push("<b>Trạng thái:</b> Đang ra");
    if ((item.categories || []).length > 0) {
        var catNames = [];
        for (var ci = 0; ci < item.categories.length; ci++) catNames.push(item.categories[ci].name);
        descLines.push("<b>Thể loại:</b> " + catNames.join(", "));
    }

    // Genres links → gen.js với /models/story?category=<name> (phân trang thật, lọc theo NAME)
    var genres = [];
    (item.categories || []).forEach(function(c) {
        if (!c || !c.name || c.name.indexOf("__") === 0) return;
        genres.push({
            title: c.name,
            input: "/models/story?category=" + encodeURIComponent(c.name),
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