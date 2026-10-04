// LilyHub - nội dung chương
// Nội dung nằm ở media CDN dưới dạng .txt, đoạn cách nhau bằng dòng trống.
// File luôn mở đầu bằng "Chương N:" + một dòng "=====" phân cách, và có thể
// kết thúc bằng "=====" -> cần bỏ 2 thứ đó đi.

var LILY_API = "https://vnchwolfbckhhherrzjk.supabase.co/rest/v1/";
var LILY_MEDIA = "https://media.lilyhub.top/";
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
            res = fetch(LILY_API + path, { headers: lilyHeaders(), timeout: 20000 });
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

function lilyEscape(s) {
    return (s + "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function execute(url) {
    var raw = url + "";
    var id = lilyNovelId(raw);
    if (!id) return Response.error("Không đọc được mã truyện từ URL này.");

    // số chương = đoạn cuối của URL
    var segs = raw.replace(/^\s+|\s+$/g, "").split("/");
    var last = segs[segs.length - 1] + "";
    var num = /^[0-9]+$/.test(last) ? parseInt(last, 10) : 0;

    var rows = lilyQuery("chapters?select=chapter_number,title,content_key&novel_id=eq." + id + "&chapter_number=eq." + num + "&limit=1");
    if (!rows) return Response.error("Không lấy được nội dung chương từ LilyHub.");
    if (!rows.length) return Response.error("Không tìm thấy chương " + num + " của truyện này.");

    var key = rows[0].content_key + "";
    if (!key) return Response.error("Chương này chưa có nội dung.");

    var txt = null;
    var attempt = 0;
    while (attempt < 3) {
        var res = null;
        try {
            res = fetch(LILY_MEDIA + key, { timeout: 30000 });
        } catch (e) { res = null; }
        attempt++;
        if (res && res.ok) {
            var body = "";
            try { body = res.text() + ""; } catch (e2) { body = ""; }
            if (body) { txt = body; break; }
        }
        if (attempt < 3) sleep(600 * attempt);
    }
    if (!txt) return Response.error("Không tải được nội dung chương.");

    // tách đoạn theo dòng trống
    var blocks = txt.replace(/\r/g, "").split(/\n\s*\n/);
    var html = "";
    var used = 0;
    for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i].replace(/^\s+|\s+$/g, "");
        if (!b) continue;
        // bỏ dòng tiêu đề "Chương N:" và các đường kẻ "=====" / "-----"
        if (/^chương\s*\d+\s*[:：]?\s*$/i.test(b)) continue;
        if (/^[=\-*_~#]{3,}$/.test(b)) continue;
        var oneLine = b.replace(/\n/g, "<br/>");
        html += "<p>" + lilyEscape(oneLine).replace(/&lt;br\/&gt;/g, "<br/>") + "</p>\n";
        used++;
    }

    if (used === 0 || html.length < 20) return Response.error("Chương này chưa có nội dung.");
    return Response.success(html);
}