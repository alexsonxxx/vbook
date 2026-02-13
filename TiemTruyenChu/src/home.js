function execute() {
    return Response.success([
        {title: "Mới cập nhật", input: "/danh-sach?sort=updated", script: "gen.js"},
        {title: "Tất Cả", input: "/danh-sach?sort=views", script: "gen.js"},
        {title: "Truyện Nam", input: "/danh-sach?gender=nam", script: "gen.js"},
        {title: "Truyện Nữ", input: "/danh-sach?gender=nu", script: "gen.js"},

        {title: "Lượt Xem", input: "/xep-hang?by=views", script: "gen.js"},
        {title: "Quà Tặng", input: "/xep-hang?by=gift", script: "gen.js"},
        {title: "Đề Cử", input: "/xep-hang?by=nominations", script: "gen.js"},
        {title: "Theo Dõi", input: "/xep-hang?by=follows", script: "gen.js"}
    ]);
}
