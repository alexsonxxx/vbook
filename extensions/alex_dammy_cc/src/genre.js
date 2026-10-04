// genre.js — genre/tag list. Each entry's `input` (a category url) is passed
// to gen.js the same way home.js tabs do.
load('config.js');

function execute() {
    var response = fetch(BASE_URL + '/');
    if (!response.ok) return Response.error('HTTP ' + response.status);
    var doc = response.html();

    var genres = [];
    var seen = {};
    doc.select('a.dropdown-item[href*="/the-loai/"]').forEach(function (el) {
        var title = String(el.text() || '').trim();
        var input = normalizeLink(el.attr('href'));
        if (!title || !input) return;
        if (seen[input]) return;
        seen[input] = true;
        genres.push({ title: title, input: input, script: 'gen.js' });
    });

    if (genres.length === 0) {
        return Response.error('Không tải được danh sách thể loại.');
    }
    return Response.success(genres);
}
