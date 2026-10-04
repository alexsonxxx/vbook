load('api.js');

// comments.js — reviews for a story, referenced from detail.js `comments`.
// `input` is the pseudo-URL BASE_URL/storyreviews/story?story_id=<id>.
// Response is a single page (no pagination params observed), so data2 is ''.
function execute(input, page) {
    var url = (input || '') + '';
    if (url.indexOf('/storyreviews/story') === -1) return Response.error('Link đánh giá không hợp lệ');

    var json = apiGet(url);
    if (!json || !json.data) return Response.success([], '');

    var items = [];
    for (var i = 0; i < json.data.length; i++) {
        var r = json.data[i];
        if (!r) continue;
        var name = '';
        var avatar = '';
        if (r.user) {
            if (r.user.name) name = r.user.name + '';
            if (r.user.avatar) avatar = r.user.avatar + '';
        }
        var desc = '';
        if (r.star) desc = r.star + ' sao';
        if (r.updated) {
            var t = new Date(r.updated * 1000);
            desc += (desc ? ' • ' : '') + t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate();
        }
        items.push({
            name: name || 'Ẩn danh',
            avatar: avatar,
            content: (r.comment || '') + '',
            description: desc + '',
            replies: []
        });
    }
    return Response.success(items, '');
}
