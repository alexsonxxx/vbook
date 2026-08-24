var BASE_URL = "https://truyendich.fit";

function execute(url) {
    var response = fetch(url);
    if (!response.ok) return Response.error("Failed to load detail page");
    var doc = response.html();
    
    var name = "";
    var author = "";
    var cover = "";
    var description = "";
    var status = "";
    var genres = [];
    
    var jsonLd = doc.select("script[type='application/ld+json']");
    if (jsonLd.size() > 0) {
        try {
            var json = JSON.parse(jsonLd.first().html());
            name = json.name || "";
            author = json.author ? json.author.name : "";
            cover = json.image || "";
            description = json.description || "";
            if (json.genre) {
                genres = json.genre.split(",").map(function(g) { return g.trim(); });
            }
        } catch (e) {}
    }
    
    if (!name) name = doc.select("h1").text().trim();
    if (!cover) cover = doc.select("meta[property='og:image']").attr("content");
    if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;
    if (!author) author = doc.select("meta[name='author']").attr("content");
    if (!description) description = doc.select("meta[property='og:description']").attr("content");
    
    var statusEl = doc.select("span:contains('Trạng thái')").first();
    if (statusEl) {
        var statusText = statusEl.text();
        if (statusText.indexOf(":") !== -1) {
            status = statusText.split(":")[1].trim();
        }
    }
    if (!status) {
        if (doc.html().indexOf("Hoàn thành") !== -1) status = "Hoàn thành";
        else status = "Đang ra";
    }
    
    var detailParts = [];
    if (author) detailParts.push("Tác giả: " + author);
    detailParts.push("Trạng thái: " + status);
    if (genres.length > 0) detailParts.push("Thể loại: " + genres.join(", "));
    
    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: description,
        detail: detailParts.join("<br>")
    });
}
