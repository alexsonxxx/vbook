// chap.js — Nội dung chương truyện tranh
// Contract: execute(url) → mảng URL ảnh (VBook tự parse để hiển thị từng trang)
// QUAN TRỌNG: Trả về mảng URL ảnh!
load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();

    doc.select("script, style, ins, .ads, .advertisement").remove();

    // Ảnh chương nằm trong .chapter-images-container, dùng img[src*="zetimage"]
    // (loại bỏ banner zettruyen-wp.webp vì không chứa "zetimage")
    var imageUrls = [];
    doc.select(".chapter-images-container img[src*=\"zetimage\"]").forEach(function (img) {
        var src = img.attr("src") + "";
        if (src) imageUrls.push(src);
    });

    if (imageUrls.length === 0) return Response.error("No images found");

    return Response.success(imageUrls);
}