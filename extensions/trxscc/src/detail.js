// detail.js — execute(url) -> {name, cover, host, author, description, detail, ongoing}
//
// Verified layout of https://trxs.cc/tongren/<id>.html :
//   div.book_info
//     div.pic   > img[src][alt]        (alt = clean book name)
//     div.infos
//       h1                             "书名(全本)" / "书名(1-490)"
//       div.date > span > a            "作者：作者名"  (+ 日期：yyyy-mm-dd outside span)
//       div.booktips > h3 > a          txt下载 / 在线阅读
//       p                              标签：… + 简介
//   div.book_list > ul > li > a        the full chapter list (used by toc.js)
var DEFAULT_BASE_URL = 'https://trxs.cc';
var UA = 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

function getBaseUrl() {
    var raw = '';
    try { if (typeof base_url !== 'undefined') raw = base_url; } catch (e) {}
    raw = String(raw === null || raw === undefined ? '' : raw).replace(/"/g, '').trim();
    if (!raw || raw.charAt(0) === '{') return DEFAULT_BASE_URL;
    if (raw.indexOf('http') !== 0) return DEFAULT_BASE_URL;
    return raw.replace(/\/+$/, '');
}
function absUrl(u) { var b = getBaseUrl(); u = String(u || ''); if (!u) return ''; if (u.indexOf('http') === 0) return u; if (u.indexOf('//') === 0) return 'https:' + u; if (u.charAt(0) === '/') return b + u; return b + '/' + u; }
function cleanText(s) { return String(s === null || s === undefined ? '' : s).replace(/[\s\u3000]+/g, ' ').replace(/^ +| +$/g, ''); }

function bookId(url) {
    var m = String(url || '').match(/\/tongren\/(\d+)\.html/);
    return m ? m[1] : '';
}

// <p> of the info block uses <br /> separators -> turn them into newlines.
function brToNl(s) {
    return String(s || '')
        .replace(/<br\s*\/?\s*>/gi, '\n')
        .replace(/<[^>]*>/g, '');
}

function execute(url) {
    var base = getBaseUrl();
    var id = bookId(url);
    if (!id) return Response.error('URL không hợp lệ: ' + url);
    var target = base + '/tongren/' + id + '.html';

    var res;
    try {
        res = fetch(target, {headers: {'User-Agent': UA, 'Referer': base + '/'}, timeout: 25000});
    } catch (e) {
        return Response.error('Lỗi tải ' + target + ': ' + e);
    }
    if (!res.ok) return Response.error('HTTP ' + res.status + ' - ' + target);

    var doc = res.html('gbk');

    // name: img alt is already clean; h1 carries the "(全本)"/"(1-490)" suffix.
    var name = '';
    var img = doc.select('.book_info .pic img').first();
    if (img) name = cleanText(img.attr('alt'));
    var h1 = doc.select('.book_info .infos h1').first();
    var h1Text = h1 ? cleanText(h1.text()) : '';
    if (!name && h1Text) name = cleanText(h1Text.replace(/[（(][^）)]*[）)]\s*$/, ''));
    if (!name) name = cleanText(String(doc.select('title').text() || '').split('_')[0]);
    if (!name) return Response.error('Không đọc được tên truyện từ ' + target);

    var cover = '';
    if (img) {
        var src = cleanText(img.attr('src'));
        if (src && src.indexOf('nocover') === -1) cover = absUrl(src);
    }

    // author: div.date > span holds "作者：X" (the X may be an <a>), sometimes empty.
    var author = '';
    var aEl = doc.select('.book_info .date span a').first();
    if (aEl) author = cleanText(aEl.text());
    if (!author) {
        var span = doc.select('.book_info .date span').first();
        if (span) {
            author = cleanText(span.text());
            if (author.indexOf('作者') === 0) author = cleanText(author.replace(/^作者[:：]?\s*/, ''));
        }
    }

    // description / tags / intro live in .book_info .infos p (tags line starts with 标签：).
    var descRaw = '';
    var pEl = doc.select('.book_info .infos p').first();
    if (pEl) descRaw = brToNl(pEl.html());
    var tags = '';
    var mTag = descRaw.match(/^\s*标签[:：]\s*([^\n]*)/);
    if (mTag) tags = cleanText(mTag[1]);
    var desc = cleanText(descRaw.replace(/^\s*标签[:：][^\n]*/, ''));
    if (!desc) desc = cleanText(String(doc.select('meta[name=description]').attr('content') || ''));
    if (desc.length > 600) desc = desc.slice(0, 600) + '...';

    var detailParts = [];
    if (author) detailParts.push('作者：' + author);
    var dateEl = doc.select('.book_info .date').first();
    if (dateEl) {
        var dTxt = cleanText(dateEl.text());
        var mDate = dTxt.match(/日期[:：]\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/);
        if (mDate) detailParts.push('日期：' + mDate[1]);
    }
    if (tags) detailParts.push('标签：' + tags);
    detailParts.push(h1Text.indexOf('全本') !== -1 ? '状态：全本' : '状态：连载');

    // 全本 => finished, anything else (e.g. "(1-490)") => still updating.
    var ongoing = h1Text.indexOf('全本') === -1;

    return Response.success({
        name: name,
        cover: cover,
        host: base,
        author: author,
        description: desc,
        detail: detailParts.join('<br>'),
        ongoing: ongoing
    });
}