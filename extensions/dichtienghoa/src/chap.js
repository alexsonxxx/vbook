// chap.js — Nội dung chương
// Contract: execute(url) → htmlString
// Ngôn ngữ đọc từ localStorage "chapter-reader-settings" (chính là nút 🌐 Dịch thuật/ngôn ngữ
// trên web dichtienghoa): translateEnabled=true + targetLang=vi → bản dịch tiếng Việt;
// translateEnabled=false hoặc targetLang khác vi → bản gốc tiếng Trung.
// Mặc định (chưa có setting): bản dịch tiếng Việt.
// URL: /truyen/{storyId}/{chapterId}
load("config.js");

// Đọc ngôn ngữ từ localStorage của site (nút 🌐 trên web). Trả true = tiếng Việt.
function useVietnameseFromSettings() {
    try {
        var raw = localStorage.getItem("chapter-reader-settings");
        if (!raw) return true; // chưa cấu hình → mặc định tiếng Việt
        var s = JSON.parse(raw);
        if (s && s.translateEnabled === false) return false; // user tắt dịch → tiếng Trung
        if (s && s.targetLang) {
            var t = String(s.targetLang).toLowerCase();
            if (t !== "vi" && t !== "vn" && t !== "vie") return false; // chọn ngôn ngữ khác
        }
        return true;
    } catch (e) {
        return true;
    }
}

// Browser fallback — dùng session WebView (site tự render theo localStorage nút 🌐)
function browserFallback(url) {
    var b = null;
    try {
        b = Engine.newBrowser();
        b.launch(url, 25000);
        var doc = b.html();
        var body = doc.select("main.chapter-content .chapter-body");
        if (body.size() === 0) body = doc.select("main.chapter-content");
        if (body.size() > 0) {
            var html = body.html() + "";
            if (html.length > 200) return html;
        }
    } catch (e) {}
    finally { if (b) { try { b.close(); } catch (e2) {} } }
    return "";
}

function execute(url) {
    var ids = extractChapterIds(url);
    if (!ids) return Response.error("URL chương không hợp lệ");
    var storyId = ids.storyId;
    var chapterId = ids.chapterId;

    loginIfNeeded();
    var useVi = useVietnameseFromSettings();

    // --- Path 1: API ---
    var content = "";
    try {
        var res = apiFetch("/models/chapter/" + encodeURIComponent(chapterId), {
            referer: BASE_URL + "/truyen/" + storyId + "/" + chapterId
        });
        if (res && res.ok) {
            var json = parseJson(res);
            if (json) {
                var d = json.data || json;
                if (useVi) {
                    // Ưu tiên bản dịch Việt, fallback bản gốc nếu chưa dịch
                    content = d.translatedContent || d.content || "";
                } else {
                    content = d.content || d.translatedContent || "";
                }
                if (!content && json.sourceUrl) {
                    content = crawlContent(json.sourceUrl, storyId, chapterId);
                }
                if (!content && json.data && json.data.sourceUrl) {
                    content = crawlContent(json.data.sourceUrl, storyId, chapterId);
                }
            }
        }
    } catch (e) { content = ""; }

    // --- Path 2: Browser fallback (session WebView, site render theo nút 🌐) ---
    if (!content) {
        content = browserFallback(url);
    }

    // --- Path 3: Crawl nguồn gốc (tiếng Trung) ---
    if (!content) {
        try {
            var res2 = apiFetch("/models/chapter/" + encodeURIComponent(chapterId), {
                referer: BASE_URL + "/truyen/" + storyId + "/" + chapterId
            });
            if (res2 && res2.ok) {
                var json2 = parseJson(res2);
                if (json2 && json2.sourceUrl) {
                    content = crawlContent(json2.sourceUrl, storyId, chapterId);
                }
            }
        } catch (e) {}
    }

    if (!content) {
        var vipHint = "";
        try {
            var resVip = apiFetch("/models/chapter/" + encodeURIComponent(chapterId));
            if (resVip && resVip.ok) {
                var jVip = parseJson(resVip);
                if (jVip && jVip.vipPrice > 0) vipHint = " (VIP)";
            }
        } catch (e) {}
        if (vipHint) return Response.error("Chương VIP — cần mở khóa trên web");
        return Response.error("Chưa có nội dung (chưa được dịch/cập nhật). Nếu đã có tài khoản, hãy nhập tài khoản/mật khẩu vào cài đặt extension.");
    }

    // Làm sạch interlinear <i> (chỉ giữ text dịch), giữ <br>
    if (content.indexOf("<i") >= 0) {
        content = content.replace(/<i\b[^>]*>([\s\S]*?)<\/i>/g, function(m2, inner) {
            return inner;
        });
    }
    content = content.replace(/&nbsp;/g, " ");
    content = formatContent(content);

    return Response.success(content + "");
}