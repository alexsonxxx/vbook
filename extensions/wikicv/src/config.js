// config.js — Base URL, cookie helper, sha256 cho wikicv
var BASE_URL = "https://wikicv.org";
try { if (CONFIG_URL) BASE_URL = CONFIG_URL; } catch (e) {}

// ---- Cookie helper ----
// User nhập cookie vào config wikicvCookie (plugin.json config) để tải trang yêu cầu session
function wikiCookieFromConfig() {
    var c = "";
    try { if (typeof wikicvCookie !== "undefined" && wikicvCookie) { c = String(wikicvCookie).replace(/^"|"$/g, ""); } } catch (e) {}
    return c;
}

function wikiHeaders(referer) {
    var h = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 11; sdk_gphone64_x86_64 Build/RSR1.201013.001.A1) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "vi,en-US;q=0.9,en;q=0.8"
    };
    if (referer) h["Referer"] = referer;
    var cookie = wikiCookieFromConfig();
    if (cookie) h["Cookie"] = cookie;
    return h;
}

function wikiFetch(url, referer) {
    return fetch(url, { headers: wikiHeaders(referer) });
}

function wikiNormalizeUrl(url) {
    if (!url) return "";
    if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) {
        url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);
    } else if (url.indexOf("//") === 0) {
        url = "https:" + url;
    } else if (url.indexOf("/") === 0) {
        url = BASE_URL + url;
    } else {
        url = BASE_URL + "/" + url;
    }
    return url;
}

// ---- SHA-256 thuần ES5 (cho toc.js sign) ----
function wikiSha256(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = "length";
    var i, j;
    var result = "";
    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;

    var hash = wikiSha256.h = wikiSha256.h || [];
    var k = wikiSha256.k = wikiSha256.k || [];
    var primeCounter = k[lengthProperty];

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }

    ascii += "\x80";
    while (ascii[lengthProperty] % 64 - 56) ascii += "\x00";
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return;
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;

    for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, (j += 16));
        var oldHash = hash.slice(0);

        for (i = 0; i < 64; i++) {
            var w15 = w[i - 15];
            var w2 = w[i - 2];

            var a = hash[0];
            var e = hash[4];
            var temp1 =
                hash[7] +
                (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
                ((e & hash[5]) ^ (~e & hash[6])) +
                k[i] +
                (w[i] = i < 16
                    ? w[i]
                    : (w[i - 16] +
                        (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                        w[i - 7] +
                        (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);
            var temp2 =
                (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
                ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

            hash = [(temp1 + temp2) | 0].concat(hash);
            hash[4] = (hash[4] + temp1) | 0;
            hash.pop();
        }

        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }

    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            var b = (hash[i] >> (j * 8)) & 255;
            result += (b < 16 ? "0" : "") + b.toString(16);
        }
    }
    return result;
}