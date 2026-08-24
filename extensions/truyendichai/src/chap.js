var BASE_URL = "https://truyendich.fit";

function execute(url) {
    var browser = Engine.newBrowser();
    try {
        browser.setUserAgent(UserAgent.android());
        browser.launch(url, 30000);
        
        var doc = browser.html();
        var content = extractContent(doc);
        
        if (!content) {
            try {
                var turnstile = doc.select("input[type='checkbox']");
                if (turnstile.size() > 0) {
                    turnstile.first().click();
                    java.lang.Thread.sleep(3000);
                    doc = browser.html();
                    content = extractContent(doc);
                }
            } catch (e) {}
        }
        
        if (!content) {
            try {
                var verifyBtn = doc.select("button:contains('Verify'), a:contains('Verify'), [class*='verify']");
                if (verifyBtn.size() > 0) {
                    verifyBtn.first().click();
                    java.lang.Thread.sleep(5000);
                    doc = browser.html();
                    content = extractContent(doc);
                }
            } catch (e) {}
        }
        
        if (!content) {
            return Response.error("Could not extract chapter content. Cloudflare Turnstile may require manual verification.");
        }
        
        return Response.success(content);
    } finally {
        browser.close();
    }
}

function extractContent(doc) {
    var contentEl = doc.select("#original-content-tab");
    if (contentEl.size() > 0) {
        return contentEl.html() + "";
    }
    
    contentEl = doc.select(".chapter-content, .content-chapter, #chapter-content, .novel-content");
    if (contentEl.size() > 0) {
        return contentEl.html() + "";
    }
    
    var article = doc.select("article");
    if (article.size() > 0) {
        var paragraphs = article.select("p");
        if (paragraphs.size() > 0) {
            var html = "";
            paragraphs.forEach(function(p) {
                html += "<p>" + (p.text() + "") + "</p>";
            });
            return html;
        }
    }
    
    var main = doc.select("main");
    if (main.size() > 0) {
        var ps = main.select("p");
        if (ps.size() > 3) {
            var h = "";
            ps.forEach(function(p) {
                h += "<p>" + (p.text() + "") + "</p>";
            });
            return h;
        }
    }
    
    return null;
}
