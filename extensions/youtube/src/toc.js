load('config.js');

// toc.js — a YouTube video is a single "episode": the video itself. No `chap`
// script is declared, so the app passes the episode url straight to track.js.
function execute(url) {
    url = normalizeUrl(url);
    let title = "Xem video";
    let response = fetch(url, { headers: { "User-Agent": UserAgent.chrome(), "Accept-Language": "en-US,en;q=0.9" } });
    if (response.ok) {
        let html = response.text();
        let json = extractJson(html, "ytInitialPlayerResponse");
        if (json !== "") {
            try {
                let player = JSON.parse(json);
                if (player.videoDetails && player.videoDetails.title) {
                    title = player.videoDetails.title;
                }
            } catch (error) {
                // keep the default title
            }
        }
    }
    return Response.success([{ name: title, url: url, description: "", lock: false, pay: false }]);
}
