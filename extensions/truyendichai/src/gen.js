var BASE_URL = "https://truyendich.fit";

function execute(url, page) {
    page = page || "1";
    var apiUrl = buildApiUrl(url, page);
    if (!apiUrl) return Response.error("Cannot build API URL for: " + url);
    
    var response = fetch(apiUrl);
    if (!response.ok) return Response.error("API request failed: " + response.status);
    
    var json = response.json();
    var items = json.items || [];
    var total = json.total || 0;
    var pageSize = json.size || 24;
    
    var data = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var link = BASE_URL + "/doc-truyen/" + item.slug;
        var cover = item.image_url || "";
        if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;
        var author = item.author || "";
        var description = "";
        if (item.description) description = item.description;
        else if (item.editions && item.editions.length > 0) {
            description = item.editions[0].description || "";
        }
        data.push({
            name: item.title,
            link: link,
            cover: cover,
            description: author + (description ? " - " + description : ""),
            host: BASE_URL
        });
    }
    
    var nextPage = null;
    var currentPage = parseInt(page);
    if (currentPage * pageSize < total) {
        nextPage = String(currentPage + 1);
    }
    
    return Response.success(data, nextPage);
}

function buildApiUrl(url, page) {
    var cleanUrl = url.split("?")[0];
    var slug = "";
    
    var listMatch = cleanUrl.match(/\/danh-sach\/([^\/]+)/);
    if (listMatch) {
        slug = listMatch[1];
        return BASE_URL + "/api/lists/" + slug + "?page=" + page + "&size=24";
    }
    
    var genreMatch = cleanUrl.match(/\/the-loai\/([^\/]+)/);
    if (genreMatch) {
        slug = genreMatch[1];
        return BASE_URL + "/api/categories/" + slug + "?page=" + page + "&size=24";
    }
    
    return null;
}
