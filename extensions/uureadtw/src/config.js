// BASE_URL is the site base. Hardcode the current default here, then let the DOMAIN
// config key (injected as a const from plugin.json.config) override it when present.
let BASE_URL = "https://www.uuread.tw";
try {
    if (DOMAIN) {
        BASE_URL = DOMAIN;
    }
} catch (error) {
}

// Rewrite an incoming url's host to BASE_URL, keeping path/query.
function normalizeUrl(url) {
    return url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
}
