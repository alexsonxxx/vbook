load('config.js');
// search.js — doubles as the listing script for home.js tabs.
// `query` is either a search keyword, or a sort/category path passed as `input`
// from a home tab. `page` is the next-page URL (data2) when paginating.
function execute(query, page) {
    query = query || "";
    page = page || "";

    // next page (data2) takes priority, then a category path input
    let isUrl = function (s) {
        return s.indexOf("/") === 0 || s.indexOf("http") === 0;
    };

    let url;
    if (page && isUrl(page)) {
        url = page;
    } else if (query && isUrl(query)) {
        url = query;
    } else {
        let resp = fetch(BASE_URL + "/search", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "searchkey=" + encodeURIComponent(query) + "&searchtype=all"
        });
        if (!resp.ok) return Response.error("HTTP " + resp.status);
        let items = parseList(resp.html().select("ul.newlist li"));
        return Response.success(items, "");
    }

    if (url.indexOf("http") !== 0) url = BASE_URL + url;

    let response = fetch(url);
    if (!response.ok) return Response.error("HTTP " + response.status + " " + url);
    let doc = response.html();

    let items = [];
    let seen = {};

    // cover cards ("推薦小說") carry the real cover image in the `srcset` attr
    doc.select(".index-body-nr-left-1-li").forEach(function (card) {
        let a = card.select(".media a").first();
        if (!a) return;
        let href = a.attr("href");
        if (!href || seen[href]) return;
        seen[href] = true;
        let img = card.select("img").first();
        let titleEl = card.select(".media-body strong a").first();
        let authorEl = card.select(".media-body span a").first();
        items.push({
            name: titleEl ? titleEl.text() : (a.attr("title") || ""),
            cover: img ? coverFrom(img) : "",
            link: href,
            host: BASE_URL,
            description: authorEl ? authorEl.text() : "",
            tag: ""
        });
    });

    // main paginated text list (no covers in markup)
    let main = doc.select(".sj-list .newlist").first();
    let list = main ? main.select("li") : doc.select("ul.newlist li");
    list.forEach(function (el) {
        let nameEl = el.select(".newlist-title a").first();
        if (!nameEl) return;
        let href = nameEl.attr("href");
        if (seen[href]) return;
        seen[href] = true;
        let typeEl = el.select(".newlist-type").first();
        let chapEl = el.select(".newlist-zj a").first();
        let authorEl = el.select(".newlist-zz a").first();
        items.push({
            name: nameEl.text(),
            cover: "",
            link: href,
            host: BASE_URL,
            description: chapEl ? chapEl.text() : "",
            tag: typeEl ? typeEl.text() : (authorEl ? authorEl.text() : "")
        });
    });

    let nextEl = doc.select(".pages .pagelink .next").first();
    let next = nextEl ? nextEl.attr("href") : "";

    return Response.success(items, next || "");
}

// cover lives in `srcset` (lazy-loaded); fall back to `src`
function coverFrom(img) {
    let s = img.attr("srcset") || img.attr("src") || "";
    if (!s) return "";
    return s.split(",")[0].trim().split(" ")[0];
}

function parseList(rows) {
    let out = [];
    rows.forEach(function (el) {
        let nameEl = el.select(".newlist-title a").first();
        if (!nameEl) return;
        let typeEl = el.select(".newlist-type").first();
        let chapEl = el.select(".newlist-zj a").first();
        let authorEl = el.select(".newlist-zz a").first();
        out.push({
            name: nameEl.text(),
            cover: "",
            link: nameEl.attr("href"),
            host: BASE_URL,
            description: chapEl ? chapEl.text() : "",
            tag: typeEl ? typeEl.text() : (authorEl ? authorEl.text() : "")
        });
    });
    return out;
}
