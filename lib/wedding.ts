/* ============================================================
   THÔNG TIN ĐÁM CƯỚI — đổi hết ở đây khi tái sử dụng thiệp
   cho cặp đôi khác, không cần sửa component.
   ============================================================ */
export const WEDDING = {
  groom: "Xuân Hậu",
  bride: "Thúy Uyên",
  groomShort: "Hậu",
  brideShort: "Uyên",
  /* Chữ lồng trên trái tim màn chào: H & U */
  initials: ["H", "U"],

  /* Ngày cưới — lịch tháng tự vẽ theo ngày này */
  date: new Date(2026, 7, 2), // 02.08.2026 (tháng tính từ 0)
  dateDisplay: "02 . 08 . 2026",
  dateShort: "02.08.2026",
  dateFull: "Chủ Nhật, ngày 02 tháng 08 năm 2026",

  /* Bố mẹ hai bên — hiện ở khối giới thiệu cô dâu chú rể.
     Nhà gái chỉ ghi mẹ (ba đã mất). */
  groomFamily: ["Ông Phạm Dân", "Bà Lê Thị Hiền"],
  brideFamily: ["Bà Nguyễn Thị Thanh Thủy"], // TODO: điền họ tên đầy đủ của mẹ cô dâu

  ceremony: {
    title: "Lễ Vu Quy",
    side: "Nhà gái",
    hosts: "Bà Nguyễn Thị Thanh Thủy", // TODO: điền họ tên đầy đủ của mẹ cô dâu
    hour: "08:00",
    venue: "Tư gia nhà gái",
    address: "Thôn Vĩnh Thiện, Xã Bù Đăng, Tp.Đồng Nai",
  },

  /* Hộp mừng cưới online — đổi enabled: true là section tự hiện.
     TODO: điền STK thật; có ảnh QR thì bỏ vào public/assets/ rồi điền đường dẫn vào qr */
  gift: {
    enabled: false,
    accounts: [
      { side: "Chú rể", bank: "Vietcombank", number: "0123456789", holder: "PHAM XUAN HAU", qr: "" },
      { side: "Cô dâu", bank: "Vietcombank", number: "9876543210", holder: "NGUYEN THUY UYEN", qr: "" },
    ],
  },

  mapsUrl: "https://maps.app.goo.gl/Qg3LJDuJkExNz5PBA",
  mapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d601.3922690187136!2d107.24177221117876!3d11.803831276222764!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3173770645bbd2b1%3A0x5791ebcd405e4e46!2sM%E1%BB%99c%20An%20Spa%20%26%20PhysioTherapy!5e1!3m2!1svi!2sus!4v1784011076202!5m2!1svi!2sus",

  /* URL production — fallback cho og:image khi build ngoài Vercel.
     Trên Vercel, layout tự lấy domain từ VERCEL_PROJECT_PRODUCTION_URL nên đổi tên project không cần sửa đây */
  productionUrl: "https://xuanhau-thuyuyen-wedding.vercel.app",
} as const;

export const COUPLE = `${WEDDING.groom} & ${WEDDING.bride}`;
