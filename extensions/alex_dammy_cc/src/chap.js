// chap.js — chapter content.
// dammy.cc obfuscates part of the text: some words are empty
// <span class="x-hash"></span> elements and a <style> block on the page maps
// each class to the real word via `:before { content: "..." }`. The page text
// is read once to build that map, then the words are put back into the html.
load('config.js');

function execute(url) {
    url = normalizeUrl(url);

    var response = fetch(url);
    if (!response.ok) return Response.error('HTTP ' + response.status);
    var html = String(response.text() || '');

    var cssMap = buildCssMap(html);
    var doc = Html.parse(html);

    var title = String(doc.select('h1.card-title').text() || '').trim();

    var content = String(doc.select('#chapter-content-render').html() || '');
    if (!content) {
        content = String(doc.select('.chapter-content').html() || '');
    }
    content = deobfuscate(content, cssMap);
    content = stripWordDots(content);

    if (!content) {
        return Response.error('Không tải được nội dung chương.');
    }

    return Response.success(content, title);
}
