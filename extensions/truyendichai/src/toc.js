var BASE_URL = "https://truyendich.fit";

function execute(url) {
    var apiUrl = buildApiUrl(url);
    if (!apiUrl) return Response.error("Cannot build chapter API URL");
    
    var response = fetch(apiUrl);
    if (!response.ok) return Response.error("Failed to fetch chapters: " + response.status);
    
    var json = response.json();
    var items = json.items || [];
    var chapters = [];
    
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var slug = getSlugFromUrl(url);
        if (!slug) slug = getSlugFromApiUrl(apiUrl);
        var chapUrl = BASE_URL + "/doc-truyen/" + slug + "/chuong-" + item.chapter_number;
        chapters.push({
            name: "Chương " + item.chapter_number + ": " + item.title,
            url: chapUrl,
            host: BASE_URL
        });
    }
    
    return Response.success(chapters);
}

function buildApiUrl(url) {
    if (!url) return null;
    
    if (url.indexOf("/api/novels/") !== -1) {
        return url;
    }
    
    var slug = getSlugFromUrl(url);
    if (!slug) return null;
    
    return BASE_URL + "/api/novels/" + slug + "/chapters?page=1";
}

function getSlugFromUrl(url) {
    var match = url.match(/\/doc-truyen\/([a-z0-9\-]+)/);
    if (match) return match[1];
    return null;
}

function getSlugFromApiUrl(url) {
    var match = url.match(/\/api\/novels\/([a-z0-9\-]+)\//);
    if (match) return match[1];
    return null;
}
