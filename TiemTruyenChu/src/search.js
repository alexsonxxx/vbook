function execute(key, page) {
    load('config.js');
    if (!page) page = "1";

    key = key.replace(/\s+/g, " ").trim();

    let response = fetch(BASE_URL + "/danh-sach?q=" + encodeURIComponent(key) + "&page=" + page);

    if (response.ok) {
        let doc = response.html();
        let next = doc.select("#pagination-container .page-item.active + .page-item button.page-link").text();

        let list = [];
        doc.select("#story-list-container .story-item").forEach(item => {
            let a = item.select("a.story-title").first();
            if (!a) return;

            let link = a.attr("href");
            let name = a.text().replace(/\s+/g, " ").trim();
            let cover = item.select("img.story-poster").first().attr("src");
            let desc = item.select(".story-desc").text().trim();

            list.push({
                name: name,
                link: link,
                cover: cover,
                description: desc,
                host: BASE_URL
            });
        });

        return Response.success(list, next);
    }

    return null;
}
