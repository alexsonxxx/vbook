var BASE_URL = "https://truyendich.fit";

function execute(url) {
    var match = url.match(/\/doc-truyen\/([^\/\?]+)/);
    if (!match) return Response.error("Cannot extract novel slug from URL");
    var slug = match[1];
    
    var baseUrl = BASE_URL + "/api/novels/" + slug + "/chapters?page=";
    var firstPageUrl = baseUrl + "1";
    var response = fetch(firstPageUrl);
    if (!response.ok) return Response.error("Failed to fetch chapters");
    
    var json = response.json();
    var total = json.total || 0;
    var size = json.size || 50;
    
    if (total <= 0) return Response.success([]);
    
    var totalPages = Math.ceil(total / size);
    var urls = [];
    for (var i = 1; i <= totalPages; i++) {
        urls.push(baseUrl + i);
    }
    
    return Response.success(urls);
}
