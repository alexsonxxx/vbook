// detail.js — Thông tin chi tiết phim từ API VSMOV
// Contract: execute(url) → { name*, cover, host, author, description, ongoing:bool*, genres? }
// url vào: BASE_URL + "/phim/{slug}"
load("config.js");

function execute(url) {
    var slug = slugFromUrl(url);
    if (!slug) return Response.error("Không tìm thấy slug: " + url);

    var j = fetchJson(API_BASE + "/phim/" + slug);
    if (!j || !j.movie) return Response.error("API không trả dữ liệu: " + slug);

    var mv = j.movie;

    // Ưu tiên poster (dọc); fallback thumb
    var cover = "";
    if (typeof mv.poster_url === "string" && mv.poster_url) cover = mv.poster_url;
    if (!cover && typeof mv.thumb_url === "string" && mv.thumb_url) cover = mv.thumb_url;

    // Mô tả: origin_name + meta (time, quality, lang, episode_current)
    var description = (mv.content || "") + "";
    var originName = (mv.origin_name || "") + "";
    var meta = [];
    if ((mv.time || "") + "") meta.push(mv.time + "");
    if ((mv.quality || "") + "") meta.push(mv.quality + "");
    if ((mv.lang || "") + "") meta.push(mv.lang + "");
    if ((mv.episode_current || "") + "") meta.push(mv.episode_current + "");
    if (originName && meta.length > 0) description = "<p>" + originName + " — " + meta.join(" · ") + "</p>" + description;
    else if (originName) description = "<p>" + originName + "</p>" + description;

    // status: completed | ongoing
    var ongoing = ((mv.status || "") + "").indexOf("completed") === -1;

    // Thể loại → link trang lọc theo /api/the-loai/{slug} (param ?category= bị API bỏ qua)
    var genres = [];
    (mv.category || []).forEach(function (c) {
        if (c && c.slug && c.name) {
            genres.push({
                title: (c.name || "") + "",
                input: BASE_URL + "/api/the-loai/" + c.slug + "?page={{page}}",
                script: "gen.js"
            });
        }
    });

    return Response.success({
        name: (mv.name || "") + "",
        cover: cover,
        host: BASE_URL,
        author: originName,
        description: description,
        ongoing: ongoing,
        genres: genres
    });
}
