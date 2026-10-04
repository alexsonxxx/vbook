// page.js — novel page list. dammy.cc novels are single-page, so the chapter
// url itself is the only page.
load('config.js');

function execute(url) {
    url = normalizeUrl(url);
    return Response.success([url]);
}
