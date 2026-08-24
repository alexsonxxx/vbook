load('config.js');
// chap.js — reads a chapter, following "下一頁" links for multi-page chapters.
function execute(url) {
    url = normalizeUrl(url);
    if (url.indexOf("http") !== 0) {
        url = BASE_URL + url;
    }
    let html = "";
    let title = "";
    let u = url;
    let guard = 0;
    while (guard < 5) {
        guard++;
        let response = fetch(u);
        if (!response.ok) return Response.error("HTTP " + response.status + " " + u);
        let doc = response.html();
        if (guard === 1) {
            let t = doc.select(".chatit").first();
            if (t) {
                title = t.text().replace(/[（(]\s*\d+\s*\/\s*\d+\s*[)）]\s*$/, "").trim();
            }
        }
        doc.select("#nr script").remove();
        let nr = doc.select("#nr").first();
        if (nr) {
            html += nr.html().replace(/&nbsp;/g, " ");
        }
        let next = "";
        doc.select(".operate a").forEach(function (a) {
            let txt = a.text().replace(/\s/g, "");
            if (txt === "下一頁" || txt === "下一页") {
                let href = a.attr("href");
                if (href && href.indexOf("http") !== 0) href = BASE_URL + href;
                next = href;
            }
        });
        if (!next) break;
        u = next;
    }
    if (!html) return Response.error("Không tìm thấy nội dung chương");
    return Response.success(html, title);
}