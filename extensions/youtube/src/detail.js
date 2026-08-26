load('config.js');

// detail.js — YouTube watch page. Metadata comes from ytInitialPlayerResponse
// (title/author/thumbnail/keywords/description) and ytInitialData (related videos).
function execute(url) {
    url = normalizeUrl(url);
    let response = fetch(url, { headers: { "User-Agent": UserAgent.chrome(), "Accept-Language": "en-US,en;q=0.9" } });
    if (!response.ok) return Response.error("HTTP " + response.status);
    let html = response.text();

    let json = extractJson(html, "ytInitialPlayerResponse");
    if (json === "") return Response.error("Không tải được dữ liệu video");
    let player;
    try {
        player = JSON.parse(json);
    } catch (error) {
        return Response.error("Dữ liệu video lỗi");
    }

    let vd = player.videoDetails || {};
    let videoId = vd.videoId || "";
    let title = vd.title || "";
    let author = vd.author || "";
    let desc = vd.shortDescription || "";
    let cover = pickThumb(vd.thumbnail && vd.thumbnail.thumbnails);
    let views = vd.viewCount || "";
    let seconds = vd.lengthSeconds || "0";

    let mv = player.microformat && player.microformat.playerMicroformatRenderer || {};
    let date = mv.publishDate || "";
    if (date.length > 10) date = date.substring(0, 10);

    let total = parseInt(seconds, 10);
    let hours = Math.floor(total / 3600);
    let mins = Math.floor((total % 3600) / 60);
    let secs = total % 60;
    let dur = "";
    if (hours > 0) dur = hours + ":";
    dur += (mins < 10 && hours > 0 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;

    let tags = [];
    let kws = vd.keywords || [];
    for (let i = 0; i < kws.length && i < 8; i++) {
        let kw = String(kws[i]);
        if (kw) tags.push({ title: kw, input: kw, script: "search.js" });
    }

    let detailHtml = "<b>Kênh:</b> " + escHtml(author) + "<br>" +
        "<b>Lượt xem:</b> " + escHtml(views) + "<br>" +
        "<b>Ngày đăng:</b> " + escHtml(date) + "<br>" +
        "<b>Thời lượng:</b> " + escHtml(dur);

    return Response.success({
        name: title,
        author: author,
        cover: cover,
        description: escHtml(desc),
        detail: detailHtml,
        url: BASE_URL + "/watch?v=" + videoId,
        type: "video",
        format: "series",
        ongoing: true,
        nsfw: false,
        locale: "vi",
        tags: tags,
        genres: [],
        suggests: [{ title: "Video liên quan", input: url, script: "similar.js" }],
        reviews: [],
        comments: []
    });
}
