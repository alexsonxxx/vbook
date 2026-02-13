function execute(url, page) {
    load('config.js');
    if (!page) page = "1";

    if (!url.includes(BASE_URL)) url = BASE_URL + url;

    let joiner = url.includes("?") ? "&" : "?";
    let response = fetch(url + joiner + "page=" + page);

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

            let meta = item.select(".story-meta").text().replace(/\s+/g, " ").trim();
            let desc = item.select(".story-desc").text().trim();

            list.push({
                name: name,
                link: link,
                cover: cover,
                description: desc || meta,
                host: BASE_URL
            });
        });

        return Response.success(list, next);
    }

    return null;
}
