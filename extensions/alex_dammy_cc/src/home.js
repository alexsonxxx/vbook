// home.js — tabs shown on the home page. Each tab's `input` is a category
// path passed to gen.js, which builds the listing url from it.
load('config.js');

function execute() {
    return Response.success([
        { title: 'Truyện mới cập nhật', input: '/truyen-moi.html', script: 'gen.js' },
        { title: 'Truyện Hot', input: '/truyen-hot.html', script: 'gen.js' },
        { title: 'Truyện hoàn thành', input: '/truyen-hoan-thanh.html', script: 'gen.js' },
        { title: 'Truyện sáng tác', input: '/truyen-sang-tac.html', script: 'gen.js' }
    ]);
}
