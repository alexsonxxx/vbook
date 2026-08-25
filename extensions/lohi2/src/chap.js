// chap.js — Nội dung chương
// Contract: execute(url) → htmlString (KHÔNG phải object!)
// url là URL web: https://lohi2.com/truyen/{slug}/chuong-{n}
// API trả {chapter: {content: "plain text \n"}} → chuyển thành <p>…</p>
load("config.js");
function execute(url) {
    var m = (url || "").match(/\/truyen\/([^\/?#]+)\/chuong-(\d+)/);
    if (!m) return Response.error("URL chương không hợp lệ");
    var slug = decodeURIComponent(m[1]);
    var num = m[2];

    var res = apiFetch(API_URL + "/chapters/" + encodeURIComponent(slug) + "/" + num);
    if (!res || !res.ok) return Response.error(!res ? "API unreachable" : ("Lỗi: " + res.status));

    var json = res.json();
    if (!json || !json.chapter) return Response.error("Không tìm thấy chương");

    var chapter = json.chapter;
    var content = chapter.content || "";
    if (!content) {
        if (json.vipLocked) return Response.error("Chương VIP — cần mở khóa trên web");
        return Response.error("Nội dung trống");
    }

    // Loại watermark "Bạn đang xem" chèn giữa nội dung
    content = content.replace(/Bạn đang xem/g, "");

    // Chuyển plain text thành HTML: mỗi dòng là 1 <p>
    var lines = content.split(/\r?\n/);
    var html = "";
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].replace(/\s+/g, " ").trim();
        if (!line) continue;
        html += "<p>" + line + "</p>";
    }
    if (!html) html = "<p>" + content + "</p>";

    return Response.success(html);
}