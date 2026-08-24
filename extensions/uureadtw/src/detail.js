load('config.js');
function execute(url) {
    url = normalizeUrl(url);
    let response = fetch(url);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let doc = response.html();

    let nameEl = doc.select(".info h2").first();
    let coverEl = doc.select(".detail-body-body-img img").first();

    let author = "";
    let category = "";
    doc.select(".info p span").forEach(function (span) {
        let t = span.text().trim();
        if (t.indexOf("作者：") === 0) {
            let a = span.select("a").first();
            author = a ? a.text() : t.substring(3);
        } else if (t.indexOf("分類：") === 0) {
            category = t.substring(3);
        }
    });

    let intro = doc.select("#bookintro").first();
    let info = doc.select(".info").first();

    let tags = [];
    let genres = [];
    let path = sortPath(category);
    if (category && path) {
        tags = [{ title: category, input: path, script: "search.js" }];
        genres = [{ title: "Cùng thể loại", input: path, script: "search.js" }];
    }

    return Response.success({
        name: nameEl ? nameEl.text() : "",
        author: author,
        cover: coverEl ? coverEl.attr("src") : "",
        description: intro ? intro.text() : "",
        detail: info ? info.html() : "",
        url: url,
        type: "novel",
        format: "novel",
        ongoing: true,
        nsfw: false,
        tags: tags,
        genres: genres,
        suggests: [],
        reviews: [],
        comments: []
    });
}

// map category name to its /sort/{id}/ listing path
function sortPath(category) {
    if (category.indexOf("玄幻") !== -1) return "/sort/1/1.html";
    if (category.indexOf("仙俠") !== -1) return "/sort/2/1.html";
    if (category.indexOf("都市") !== -1) return "/sort/3/1.html";
    if (category.indexOf("歷史") !== -1) return "/sort/4/1.html";
    if (category.indexOf("遊戲") !== -1) return "/sort/5/1.html";
    if (category.indexOf("科幻") !== -1) return "/sort/6/1.html";
    if (category.indexOf("靈異") !== -1) return "/sort/7/1.html";
    if (category.indexOf("言情") !== -1) return "/sort/8/1.html";
    if (category.indexOf("其它") !== -1) return "/sort/9/1.html";
    return "";
}
