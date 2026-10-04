// detail.js — story detail page.
// The description is obfuscated by the site (words hidden in empty spans,
// restored by a CSS content map) so the page text is read once to build the
// map and the description html is deobfuscated before returning.
load('config.js');

function extractStoryId(doc) {
    var onclicks = doc.select('[onclick]');
    for (var i = 0; i < onclicks.size(); i++) {
        var oc = String(onclicks.get(i).attr('onclick') || '');
        var m = oc.match(/(?:bookmark|report|loadComments|loadReviews)\((\d+)/);
        if (m) return m[1];
    }
    return '';
}

function execute(url) {
    url = normalizeUrl(url);

    var response = fetch(url);
    if (!response.ok) return Response.error('HTTP ' + response.status);
    var html = String(response.text() || '');

    var cssMap = buildCssMap(html);
    var doc = Html.parse(html);

    var name = String(doc.select('h2.card-title').text() || '').trim();

    var coverEl = doc.select('div[itemtype] img').first();
    var cover = coverEl ? normalizeLink(coverEl.attr('src')) : '';

    // The info block is a <dl class="row"> of dt/dd pairs; dt[i] matches dd[i].
    var dts = doc.select('dl.row dt');
    var dds = doc.select('dl.row dd');
    var author = '';
    var team = '';
    var statusText = '';
    for (var i = 0; i < dts.size() && i < dds.size(); i++) {
        var label = String(dts.get(i).text() || '').trim();
        var value = String(dds.get(i).text() || '').trim();
        if (label === 'Tác giả') author = value;
        else if (label === 'Team') team = value;
        else if (label === 'Trạng thái') statusText = value;
    }

    var ongoing = true;
    var st = statusText.toLowerCase();
    if (st.indexOf('hoàn') >= 0 || st.indexOf('full') >= 0 || st.indexOf('complete') >= 0) {
        ongoing = false;
    }

    var genres = [];
    doc.select('.cate-item').forEach(function (el) {
        var title = String(el.text() || '').trim();
        var input = normalizeLink(el.attr('href'));
        if (title && input) {
            genres.push({ title: title, input: input, script: 'gen.js' });
        }
    });

    var descHtml = String(doc.select('.story-description .ql-editor').html() || '');
    descHtml = deobfuscate(descHtml, cssMap);
    descHtml = stripWordDots(descHtml);

    // "Truyện Hot" widget on the page -> suggests.
    var suggestsData = [];
    doc.select('.relatedStory .single-story-block').forEach(function (el) {
        var a = el.select('.single-story-details h3 a').first();
        if (!a) return;
        var item = {
            name: String(a.text() || '').trim(),
            link: normalizeLink(a.attr('href')),
            cover: ''
        };
        var img = el.select('.single-story-img img').first();
        if (img) {
            var u = String(img.attr('data-src') || '');
            if (!u) u = String(img.attr('src') || '');
            if (u.indexOf('//') === 0) u = 'https:' + u;
            item.cover = u;
        }
        if (item.name && item.link) suggestsData.push(item);
    });

    var storyId = extractStoryId(doc);
    var comments = [];
    if (storyId) {
        comments.push({
            title: 'Bình luận',
            input: BASE_URL + '/ajax/showComment?story_id=' + storyId,
            script: 'comments.js'
        });
    }

    var detail =
        '<p><b>Tên truyện:</b> ' + name + '</p>' +
        '<p><b>Tác giả:</b> ' + author + '</p>' +
        (team ? '<p><b>Team:</b> ' + team + '</p>' : '') +
        '<p><b>Trạng thái:</b> ' + (statusText || 'Đang phát hành') + '</p>';

    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: descHtml,
        detail: detail,
        url: url,
        type: 'novel',
        format: 'novel',
        ongoing: ongoing,
        genres: genres,
        suggests: suggestsData.length > 0 ? [{
            title: 'Truyện Hot',
            input: JSON.stringify(suggestsData),
            script: 'suggests.js'
        }] : [],
        comments: comments
    });
}
