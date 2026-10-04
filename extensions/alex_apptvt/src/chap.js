load('api.js');

// chap.js — chapter content from /chapters/detail?number=N&story_id=<id>.
// URL is the pseudo-link minted by toc.js: BASE_URL/chapters/<story_id>/<number>.
function execute(url) {
    var sid = storyIdOf(url);
    if (!sid) return Response.error('Link chương không hợp lệ');
    var m = String(url).match(/\/chapters\/[a-f0-9]{24}\/(\d+)/);
    if (!m) return Response.error('Link chương không hợp lệ');

    var json = apiGet('/chapters/detail?number=' + m[1] + '&story_id=' + sid);
    if (!json || !json.data) return Response.error('Không tải được chương');
    var content = (json.data.content || '') + '';
    var title = (json.data.title || '') + '';
    if (!content) return Response.error('Nội dung chương trống');
    return Response.success(content, title);
}
