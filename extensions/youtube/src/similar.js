load('config.js');

// similar.js — related videos ("Up next") from the watch page's
// secondaryResults (lockupViewModel entries). The app passes the watch URL as `input`.
function execute(input) {
    input = normalizeUrl(input);
    let response = fetch(input, { headers: { "User-Agent": UserAgent.chrome(), "Accept-Language": "en-US,en;q=0.9" } });
    if (!response.ok) return Response.error("HTTP " + response.status);
    let html = response.text();
    let json = extractJson(html, "ytInitialData");
    if (json === "") return Response.success([], "");

    let items = [];
    try {
        let data = JSON.parse(json);
        let two = data.contents && data.contents.twoColumnWatchNextResults || {};
        let secondary = two.secondaryResults && two.secondaryResults.secondaryResults || {};
        let results = secondary.results || [];
        for (let i = 0; i < results.length; i++) {
            let itemSec = results[i].itemSectionRenderer;
            if (!itemSec) continue;
            let contents = itemSec.contents || [];
            for (let j = 0; j < contents.length; j++) {
                let lvm = contents[j].lockupViewModel;
                if (!lvm) continue;
                if (lvm.contentType && lvm.contentType !== "LOCKUP_CONTENT_TYPE_VIDEO") continue;
                let videoId = lvm.contentId || "";
                if (!videoId) continue;
                let meta = lvm.metadata && lvm.metadata.lockupMetadataViewModel || {};
                let title = meta.title && meta.title.content || "";
                if (!title) continue;
                let sources = lvm.contentImage && lvm.contentImage.thumbnailViewModel &&
                    lvm.contentImage.thumbnailViewModel.image &&
                    lvm.contentImage.thumbnailViewModel.image.sources || [];
                let cover = sources.length > 0 ? sources[sources.length - 1].url || "" : "";
                let sub = "";
                let rows = meta.metadata && meta.metadata.contentMetadataViewModel &&
                    meta.metadata.contentMetadataViewModel.metadataRows || [];
                for (let k = 0; k < rows.length; k++) {
                    let parts = rows[k].metadataParts || [];
                    for (let m = 0; m < parts.length; m++) {
                        let t = parts[m].text && parts[m].text.content || "";
                        if (t) sub = sub ? sub + " • " + t : t;
                    }
                }
                items.push({
                    name: title,
                    cover: cover,
                    link: BASE_URL + "/watch?v=" + videoId,
                    description: sub
                });
            }
        }
    } catch (error) {
        // return what was collected
    }

    return Response.success(items, "");
}
