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
  date: new Date(2026, 10, 8), // 08.11.2026 (tháng tính từ 0)
  dateDisplay: "08 . 11 . 2026",
  dateShort: "08.11.2026",
  dateFull: "Chủ Nhật, ngày 08 tháng 11 năm 2026",

  /* Bố mẹ hai bên — hiện ở khối giới thiệu cô dâu chú rể.
     Nhà gái chỉ ghi mẹ (ba đã mất). */
  groomFamily: ["Ông Phạm Dân", "Bà Lê Thị Hiền"],
  brideFamily: ["Bà Nguyễn Thị Thanh Thủy"], // TODO: điền họ tên đầy đủ của mẹ cô dâu

  ceremony: {
    title: "Lễ Báo Hỷ",
    side: "Nhà trai",
    hosts: "Ông Phạm Dân & Bà Lê Thị Hiền",
    reception: "17:30", // giờ đón khách
    hour: "19:00", // giờ làm lễ — đếm ngược tính theo giờ này
    venue: "Huong Pho Restaurant",
    hall: "Lầu 1 - Sảnh A",
    address: "A12 Đ. Phan Văn Trị, Hạnh Thông, Hồ Chí Minh", // TODO: địa chỉ đầy đủ nhà hàng
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

  mapsUrl: "https://maps.app.goo.gl/oFftfki7JCyRmsMY9",
  mapsEmbed: "https://maps.google.com/maps?q=10.8287013,106.6833645&z=17&output=embed",

  /* URL production — fallback cho og:image khi build ngoài Vercel.
     Trên Vercel, layout tự lấy domain từ VERCEL_PROJECT_PRODUCTION_URL nên đổi tên project không cần sửa đây */
  productionUrl: "https://xuanhau-thuyuyen-wedding.vercel.app",
} as const;

export const COUPLE = `${WEDDING.groom} & ${WEDDING.bride}`;
