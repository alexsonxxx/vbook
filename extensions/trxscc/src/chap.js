// chap.js — execute(url) -> HTML string (never an object)
//
// Verified layout of https://trxs.cc/tongren/<id>/<n>.html :
//   div.read_chapterName.tc   "书名 第N章 作者：X"
//   div.read_chapterDetail    <p>书名 作者：X</p><p></p><p>简介：…</p>…<p>第1章 标题</p><p></p><p>正文…</p>
// The detail block repeats the book title / author / intro before the real chapter, so
// the content starts at the first paragraph whose text begins with 第N章 (fallback: right
// after the last 简介 paragraph).
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
function stripTags(s) { return String(s || '').replace(/<[^>]*>/g, '').replace(/[\s\u3000]+/g, ' ').replace(/^ +| +$/g, ''); }

// Drop the repeated header block (book title / 作者： / 简介：…) that precedes each chapter.
function trimHeader(html) {
    var parts = String(html || '').split('</p>');
    var start = -1;
    for (var i = 0; i < parts.length; i++) {
        if (/^\s*第\s*\d+\s*[章節节]/.test(stripTags(parts[i]))) { start = i; break; }
    }
    if (start === -1) {
        var lastIntro = -1;
        for (var j = 0; j < parts.length && j < 20; j++) {
            var t = stripTags(parts[j]);
            if (t.indexOf('简介：') === 0 || t.indexOf('简介:') === 0) lastIntro = j;
        }
        start = lastIntro === -1 ? 0 : lastIntro + 1;
    }
    var out = [];
    for (var k = start; k < parts.length; k++) out.push(parts[k]);
    return out.join('</p>');
}

function execute(url) {
    var base = getBaseUrl();
    var u = absUrl(url);
    var m = u.match(/\/tongren\/(\d+)\/(\d+)\.html/);
    if (!m) return Response.error('URL chương không hợp lệ: ' + url);
    var target = base + '/tongren/' + m[1] + '/' + m[2] + '.html';

    var res;
    try {
        res = fetch(target, {headers: {'User-Agent': UA, 'Referer': base + '/'}, timeout: 25000});
    } catch (e) {
        return Response.error('Lỗi tải ' + target + ': ' + e);
    }
    if (!res.ok) return Response.error('HTTP ' + res.status + ' - ' + target);

    var doc = res.html('gbk');
    var cont = doc.select('.read_chapterDetail').first();
    if (!cont) cont = doc.select('.content .read_chapterDetail').first();
    if (!cont) return Response.error('Không tìm thấy nội dung chương tại ' + target);

    cont.select('script, style').remove();
    var html = trimHeader(cont.html() + '');

    // trim edges and collapse runs of empty paragraphs
    html = html.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
    html = html.replace(/(<p>\s*(?:&nbsp;|<br\s*\/?\s*>)?\s*<\/p>\s*){2,}/gi, '');
    html = html.replace(/<\/?(?:div|span)[^>]*>/gi, '');
    if (!html || html.length < 10) return Response.error('Nội dung chương rỗng: ' + target);
    return Response.success(html);
}