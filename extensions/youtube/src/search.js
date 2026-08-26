load('config.js');

// search.js — YouTube results. `query` = keyword (or a curated keyword from a
// home/genre tab). `page` = "" on the first call; afterwards it is the opaque
// continuation handle built as "apiKey|clientVersion|token" (data2 round-trip),
// resolved via the innertube continuation API.

// Walk a list of innertube nodes and collect videoRenderer entries (deduped by videoId).
// Search pages mix videoRenderer directly with shelfRenderer / itemSectionRenderer wrappers.
function collectVideos(nodes, items, seen) {
    if (!nodes) return;
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (!node) continue;
        if (node.videoRenderer) {
            let v = node.videoRenderer;
            let videoId = v.videoId || "";
            if (!videoId || seen[videoId]) continue;
            seen[videoId] = true;
            let views = "";
            if (v.viewCountText) {
                views = v.viewCountText.simpleText || "";
                if (!views && v.viewCountText.accessibility && v.viewCountText.accessibility.accessibilityData) {
                    views = v.viewCountText.accessibility.accessibilityData.label || "";
                }
            }
            let published = "";
            if (v.publishedTimeText) published = v.publishedTimeText.simpleText || "";
            let desc = views;
            if (published) desc = desc ? desc + " • " + published : published;
            let tag = v.lengthText ? v.lengthText.simpleText || "" : "";
            if (!tag && v.badges) {
                for (let b = 0; b < v.badges.length; b++) {
                    let badge = v.badges[b].metadataBadgeRenderer;
                    if (badge && badge.label) { tag = badge.label; break; }
                }
            }
            items.push({
                name: runsText(v.title && v.title.runs),
                cover: pickThumb(v.thumbnail && v.thumbnail.thumbnails),
                link: BASE_URL + "/watch?v=" + videoId,
                description: desc,
                tag: tag
            });
        } else if (node.itemSectionRenderer) {
            collectVideos(node.itemSectionRenderer.contents, items, seen);
        } else if (node.shelfRenderer) {
            let content = node.shelfRenderer.content || {};
            if (content.horizontalListRenderer) {
                collectVideos(content.horizontalListRenderer.items, items, seen);
            } else if (content.verticalListRenderer) {
                collectVideos(content.verticalListRenderer.items, items, seen);
            }
        }
    }
}

// The pagination handle rides at the tail of the list as a continuationItemRenderer.
function findNextToken(nodes) {
    if (!nodes) return "";
    for (let i = nodes.length - 1; i >= 0; i--) {
        let node = nodes[i];
        if (node && node.continuationItemRenderer) {
            let endpoint = node.continuationItemRenderer.continuationEndpoint || {};
            let command = endpoint.continuationCommand || {};
            if (command.token) return command.token;
        }
    }
    return "";
}

// Fetch a search page and parse its ytInitialData into { items, token, apiKey, clientVersion }.
function parseResultsHtml(html) {
    let items = [];
    let seen = {};
    let token = "";
    let apiKey = "";
    let clientVersion = "";
    let json = extractJson(html, "ytInitialData");
    if (json !== "") {
        try {
            let data = JSON.parse(json);
            let primary = data.contents && data.contents.twoColumnSearchResultsRenderer &&
                data.contents.twoColumnSearchResultsRenderer.primaryContents || {};
            let sectionList = primary.sectionListRenderer || {};
            collectVideos(sectionList.contents, items, seen);
            token = findNextToken(sectionList.contents);
        } catch (error) {
            // fall through with whatever was collected
        }
    }
    let keyM = html.match(/"INNERTUBE_API_KEY":"([^"]+)/);
    if (keyM) apiKey = keyM[1];
    let verM = html.match(/"clientVersion":"([^"]+)/);
    if (verM) clientVersion = verM[1];
    return { items: items, token: token, apiKey: apiKey, clientVersion: clientVersion };
}

// Parse a continuation API response into { items, token }.
function parseContinuationJson(data) {
    let items = [];
    let seen = {};
    let token = "";
    try {
        let commands = data.onResponseReceivedCommands || [];
        if (commands.length > 0) {
            let action = commands[0].appendContinuationItemsAction || {};
            let nodes = action.continuationItems || [];
            collectVideos(nodes, items, seen);
            token = findNextToken(nodes);
        }
    } catch (error) {
        // fall through
    }
    return { items: items, token: token };
}

function execute(query, page) {
    query = query || "";
    page = page || "";

    let items = [];
    let next = "";

    if (page === "") {
        if (query === "") return Response.success(items, "");
        // Tabs may prefix a query with "live:" to request the Livestream
        // filter (sp=EgJAAQ==); continuation tokens keep the filter applied.
        let live = false;
        if (query.indexOf("live:") === 0) {
            live = true;
            query = query.slice(5);
        }
        let url = BASE_URL + "/results?search_query=" + encodeURIComponent(query);
        if (live) url += "&sp=EgJAAQ%3D%3D";
        let response = fetch(url, { headers: { "User-Agent": UserAgent.chrome(), "Accept-Language": "en-US,en;q=0.9" } });
        if (!response.ok) return Response.error("HTTP " + response.status);
        let html = response.text();
        let parsed = parseResultsHtml(html);
        items = parsed.items;
        // Keep the api key + client version alongside the token so the next
        // continuation call is self-contained.
        if (parsed.token && parsed.apiKey) {
            next = parsed.apiKey + "|" + (parsed.clientVersion || "") + "|" + parsed.token;
        }
    } else {
        let parts = page.split("|");
        if (parts.length < 3) return Response.error("Token hỏng");
        let apiKey = parts[0];
        let clientVersion = parts[1];
        let token = parts[2];
        let context = {
            client: {
                clientName: "WEB",
                clientVersion: clientVersion || "2.20240801.00.00",
                hl: "en",
                gl: "US"
            }
        };
        let response = fetch("https://www.youtube.com/youtubei/v1/search?key=" + apiKey, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": UserAgent.chrome(),
                "Origin": BASE_URL
            },
            body: JSON.stringify({ context: context, continuation: token })
        });
        if (!response.ok) return Response.error("HTTP " + response.status);
        let data = response.json();
        let parsed = parseContinuationJson(data);
        items = parsed.items;
        if (parsed.token && apiKey) {
            next = apiKey + "|" + clientVersion + "|" + parsed.token;
        }
    }

    return Response.success(items, next);
}
