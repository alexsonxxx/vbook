// comments.js — referenced from detail.js `comments`.
// Comments are loaded by the site from /ajax/showComment?story_id=<id>&page=<n>
// as an html fragment. `input` is that ajax url (without the page param).
load('config.js');

function parseCommentLi(li) {
    // .first() is required: nested replies also carry .meta-2, so a plain
    // .text() on the set concatenates every reply author into one string.
    var nameEl = li.select('.meta-2 abbr').first();
    if (!nameEl) nameEl = li.select('.meta-2 a').first();
    var name = nameEl ? String(nameEl.text() || '').trim() : '';

    var avatarEl = li.select('.avt_user img').first();
    var avatar = avatarEl ? normalizeLink(avatarEl.attr('src')) : '';

    var contentEl = li.select('.post-comments p').first();
    var content = contentEl ? String(contentEl.html() || '') : '';

    var timeEl = li.select('.meta-2 small').first();
    var time = timeEl ? String(timeEl.text() || '').trim() : '';
    var cut = time.indexOf('·');
    if (cut >= 0) time = time.slice(0, cut).trim();

    var replies = [];
    li.select('ul li').forEach(function (child) {
        replies.push(parseCommentLi(child));
    });

    return {
        name: name,
        avatar: avatar,
        content: content,
        description: time,
        replies: replies
    };
}

function execute(input, page) {
    var url = normalizeUrl(input);
    if (!url) return Response.error('Thiếu url bình luận.');

    var p = page ? String(page) : '1';
    url += (url.indexOf('?') === -1 ? '?' : '&') + 'page=' + p;

    var response = fetch(url);
    if (!response.ok) return Response.error('HTTP ' + response.status);
    var doc = response.html();

    var items = [];
    doc.select('ul.comments > li').forEach(function (li) {
        items.push(parseCommentLi(li));
    });

    return Response.success(items, '');
}
