// LilyHub - mục lục
// Lưu ý: chapter_number KHÔNG liên tục (ngoại truyện nằm ở số rất lớn, ví dụ 1000002),
// nên phải lấy đúng danh sách server trả về thay vì tự sinh 0..chapter_count-1.

var LILY_API = "https://vnchwolfbckhhherrzjk.supabase.co/rest/v1/";
var LILY_SITE = "https://www.lilyhub.top/";
var LILY_KEY = "sb_publishable_fBI0JdeuAHrlZGg_2wA_oA_-oHzhiKk";

function lilyHeaders() {
    return {
        "apikey": LILY_KEY,
        "Authorization": "Bearer " + LILY_KEY,
        "Content-Type": "application/json"
    };
}

function lilyQuery(path) {
    var attempt = 0;
    while (attempt < 3) {
        var res = null;
        try {
            res = fetch(LILY_API + path, { headers: lilyHeaders(), timeout: 30000 });
        } catch (e) { res = null; }
        attempt++;
        if (res && res.ok) {
            var txt = "";
            try { txt = res.text() + ""; } catch (e2) { txt = ""; }
            var parsed = null;
            try { parsed = JSON.parse(txt); } catch (e3) { parsed = null; }
            if (parsed) return parsed;
        }
        if (attempt < 3) sleep(600 * attempt);
    }
    return null;
}

function lilyNovelId(input) {
    var s = (input + "").replace(/^\s+|\s+$/g, "");
    var parts = s.split("/");
    for (var i = parts.length - 1; i >= 0; i--) {
        var seg = parts[i];
        if (seg.indexOf("-") > 0 && seg.length >= 32 && /^[0-9a-fA-F-]+$/.test(seg)) return seg;
    }
    var m = s.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    if (m) return m[0];
    return "";
}

function execute(url) {
    var id = lilyNovelId(url);
    if (!id) return Response.error("Không đọc được mã truyện từ URL này.");

    var rows = lilyQuery("chapters?select=chapter_number,title&novel_id=eq." + id + "&order=chapter_number.asc&limit=2000");
    if (!rows) return Response.error("Không lấy được mục lục từ LilyHub.");
    if (!rows.length) return Response.error("Truyện này hiện chưa có chương nào.");

    var out = [];
    var seen = {};
    for (var i = 0; i < rows.length; i++) {
        var num = rows[i].chapter_number;
        var link = LILY_SITE + "truyen/" + id + "/" + num;
        if (seen[link]) continue;
        seen[link] = true;
        out.push({
            name: (rows[i].title ? rows[i].title + "" : "Chương " + num),
            url: link,
            host: "https://www.lilyhub.top"
        });
    }
    return Response.success(out);
}