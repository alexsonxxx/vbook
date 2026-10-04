// toc.js — chapter list. All chapters are embedded in the detail page's
// .list-chapters block, newest first; return them in ascending order.
load('config.js');

function execute(url) {
    url = normalizeUrl(url);

    var response = fetch(url);
    if (!response.ok) return Response.error('HTTP ' + response.status);
    var doc = response.html();

    var chapters = [];
    var seen = {};
    doc.select('.list-chapters .item').forEach(function (item) {
        var a = item.select('.episode-title a').first();
        if (!a) return;
        var name = String(a.text() || '').trim();
        var link = normalizeLink(a.attr('href'));
        if (!name || !link) return;
        if (seen[link]) return;
        seen[link] = true;
        chapters.push({ name: name, url: link, host: BASE_URL });
    });

    if (chapters.length === 0) {
        return Response.error('Không tải được danh sách chương.');
    }

    chapters.reverse();
    return Response.success(chapters);
}
