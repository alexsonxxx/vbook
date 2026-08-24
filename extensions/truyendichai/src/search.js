var BASE_URL = "https://truyendich.fit";

function execute(key, page) {
    page = page || "1";
    var url = BASE_URL + "/tim-kiem?q=" + encodeURIComponent(key) + "&page=" + page;
    var response = fetch(url);
    if (!response.ok) return Response.error("Search request failed: " + response.status);
    var html = response.text() + "";
    var data = [];
    var seen = {};
    
    var slugRegex = /doc-truyen\/([a-z0-9\-]+)/g;
    var match;
    while ((match = slugRegex.exec(html)) !== null) {
        var slug = match[1];
        if (seen[slug]) continue;
        if (slug.indexOf("chuong-") !== -1) continue;
        seen[slug] = true;
        var link = BASE_URL + "/doc-truyen/" + slug;
        var name = slug.replace(/-/g, " ");
        var coverMatch = html.match(new RegExp(slug + "[^\"]*\\.webp"));
        var cover = coverMatch ? BASE_URL + "/anh-bia/" + coverMatch[0].split("/").pop() : "";
        data.push({
            name: name,
            link: link,
            cover: cover,
            host: BASE_URL
        });
    }
    
    var nextPage = null;
    var pageNum = parseInt(page);
    var nextRegex = new RegExp("page=" + (pageNum + 1));
    if (nextRegex.test(html)) {
        nextPage = String(pageNum + 1);
    }
    
    return Response.success(data, nextPage);
}
