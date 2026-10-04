load('api.js');

// home.js — tabs for APP TYT. Each tab's `input` is passed as `query` to search.js.
function execute() {
    return Response.success([
        { title: 'Truyện mới', input: '/stories/list?sort=created', script: 'search.js' },
        { title: 'Mới cập nhật', input: '/stories/list?sort=updated', script: 'search.js' },
        { title: 'Xem nhiều', input: '/stories/list?sort=view', script: 'search.js' },
        { title: 'Đề cử', input: '/stories/recommend/top', script: 'search.js' },
        { title: 'Thịnh hành', input: '/stories/gem/top?period=week', script: 'search.js' }
    ]);
}
