load('api.js');

// genre.js — tag list from /tags/. Each entry's `input` (a filter path)
// is passed to search.js the same way home.js tabs are.
function execute() {
    var json = apiGet('/tags/');
    if (!json || !json.data) return Response.error('Không tải được thể loại');
    var genres = [];
    for (var i = 0; i < json.data.length; i++) {
        var name = (json.data[i] || '') + '';
        if (!name) continue;
        genres.push({
            title: name,
            input: '/stories/filter?genre=' + encodeURIComponent(name),
            script: 'search.js'
        });
    }
    return Response.success(genres);
}
