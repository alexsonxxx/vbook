// home.js — curated tabs. YouTube's homepage is client-rendered (no server-side
// video list), so each tab runs a real search query via search.js.
function execute() {
    return Response.success([
        { title: "Trực tiếp", input: "live:trực tiếp", script: "search.js" },
        { title: "Trending", input: "trending", script: "search.js" },
        { title: "Âm nhạc", input: "music", script: "search.js" },
        { title: "Trailer phim", input: "movie trailer", script: "search.js" },
        { title: "Tin tức", input: "news", script: "search.js" },
        { title: "Game", input: "gaming", script: "search.js" }
    ]);
}
