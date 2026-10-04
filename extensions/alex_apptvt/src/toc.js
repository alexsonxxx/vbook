load('api.js');

// toc.js — chapter list from /chapters/numbers?story_id=<id>&start=1&end=N.
// N comes from /stories/<id>/detail (chapter_count). Entries carry pseudo-links
// `BASE_URL/chapters/<story_id>/<number>` Minted here and resolved by chap.js.
function execute(url) {
    var sid = storyIdOf(url);
    if (!sid) return Response.error('Link truyện không hợp lệ');

    var dj = apiGet('/stories/' + sid + '/detail');
    if (!dj || !dj.data) return Response.error('Không tải được thông tin truyện');
    var total = parseInt(dj.data.chapter_count, 10);
    if (isNaN(total) || total < 1) return Response.error('Truyện chưa có chương');

    var json = apiGet('/chapters/numbers?story_id=' + sid + '&start=1&end=' + total);
    if (!json || !json.data) return Response.error('Không tải được danh sách chương');

    var chapters = [];
    for (var i = 0; i < json.data.length; i++) {
        var ch = json.data[i];
        if (!ch) continue;
        var num = parseInt(ch.number, 10);
        if (isNaN(num)) continue;
        chapters.push({
            name: (ch.title || ('Chương ' + num)) + '',
            url: BASE_URL + '/chapters/' + sid + '/' + num,
            host: BASE_URL
        });
    }
    if (!chapters.length) return Response.error('Truyện chưa có chương');
    return Response.success(chapters);
}
