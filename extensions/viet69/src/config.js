let BASE_URL = "https://viet69.be";
try { if (CONFIG_URL) BASE_URL = CONFIG_URL; } catch (e) {}

// Site chặn User-Agent lạ (503/504); dùng UA Android mobile
var UA = "Mozilla/5.0 (Linux; Android 13; SM-F741N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
