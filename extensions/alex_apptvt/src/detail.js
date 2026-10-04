load('api.js');

// detail.js — story detail. Links are pseudo-links
// `BASE_URL/stories/<24hex>/detail` minted by search.js; the id is the
// Mongo ObjectId used by the API.
function execute(url) {
    var sid = storyIdOf(url);
    if (!sid) return Response.error('Link truyện không hợp lệ');

    var json = apiGet('/stories/' + sid + '/detail');
    if (!json || !json.data) return Response.error('Không tải được thông tin truyện');
    var d = json.data;

    var author = (d.author || '') + '';
    var desc = (d.desc || '') + '';
    var genres = [];
    if (d.genre && d.genre.length) {
        for (var i = 0; i < d.genre.length; i++) {
            var g = (d.genre[i] || '') + '';
            if (!g) continue;
            genres.push({
                title: g,
                input: '/stories/filter?genre=' + encodeURIComponent(g),
                script: 'search.js'
            });
        }
    }

    var status = d.full ? 'Hoàn thành' : 'Đang ra';
    var detail = 'Tác giả: ' + author +
        '<br>Trạng thái: ' + status +
        '<br>Số chương: ' + (d.chapter_count || 0) +
        '<br>Lượt xem: ' + (d.view_count || 0) +
        '<br>Lượt thích: ' + (d.like_count || 0);
    if (d.owner && d.owner.name) detail += '<br>Nguồn: ' + d.owner.name;

    var comments = [];
    comments.push({
        title: 'Đánh giá',
        input: BASE_URL + '/storyreviews/story?story_id=' + sid,
        script: 'comments.js'
    });

    return Response.success({
        name: (d.title || '') + '',
        author: author,
        cover: (d.cover || '') + '',
        description: desc,
        detail: detail,
        url: url + '',
        type: 'novel',
        format: 'novel',
        ongoing: !d.full,
        genres: genres,
        suggests: [],
        comments: comments
    });
}
