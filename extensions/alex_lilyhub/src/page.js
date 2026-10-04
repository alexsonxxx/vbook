// LilyHub - trang chia trang
// Mục lục nằm ngay trên trang chi tiết của LilyHub, không cần chia trang,
// nên trả về đúng 1 url (url truyện đã nhận).

function execute(url) {
    return Response.success([url]);
}