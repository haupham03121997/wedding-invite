import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-beviet",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500"],
});

const title = "Xuân Hậu & Thúy Uyên | 02.08.2026";
const description =
  "Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi trong ngày cưới của Xuân Hậu và Thúy Uyên, Chủ Nhật ngày 04 tháng 10 năm 2026.";

// Khai báo URL Production chính thức của bạn để Messenger dễ nhận diện
const PRODUCTION_URL = "https://xuanhau-thuyuyen-wedding-invitions.vercel.app";

export const metadata: Metadata = {
  /* Vercel tự cấp VERCEL_PROJECT_PRODUCTION_URL lúc build; local dùng localhost */
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"
  ),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "vi_VN",
    // Sử dụng URL tuyệt đối và bổ sung các thuộc tính định dạng ảnh cho Messenger
    images: [
      {
        url: `${PRODUCTION_URL}/og.jpg`,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Ảnh cưới Xuân Hậu & Thúy Uyên",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${PRODUCTION_URL}/og.jpg`],
  },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${cormorant.variable} ${beVietnam.variable} h-full antialiased`}
    >
      {/* ponytail: mobile-only UI, desktop chỉ là khung điện thoại 430px đặt giữa */}
      <body className="min-h-full">
        <div className="relative mx-auto min-h-dvh max-w-[430px] bg-paper shadow-[0_0_48px_rgba(60,48,36,0.18)]">
          {children}
        </div>
      </body>
    </html>
  );
}