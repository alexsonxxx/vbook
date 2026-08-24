load('config.js');
function execute(url) {
    url = normalizeUrl(url);
    let response = fetch(url);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let doc = response.html();

    let chapters = [];
    doc.select("#newlist a").forEach(function (el) {
        let href = el.attr("href");
        if (!href) return;
        chapters.push({
            name: el.text(),
            url: href,
            host: BASE_URL,
            description: "",
            lock: false,
            pay: false
        });
    });

    return Response.success(chapters);
}