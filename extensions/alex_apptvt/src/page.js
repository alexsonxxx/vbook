// page.js — novel extension: single-page passthrough (required by repo scaffold).
function execute(url) {
    url = String(url);
    if (url.charAt(url.length - 1) === '/') url = url.slice(0, -1);
    return Response.success([url]);
}
