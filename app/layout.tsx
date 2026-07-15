import { COUPLE, WEDDING } from "@/lib/wedding";
import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
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

/* Font thư pháp việt hóa cho câu trích & tên cô dâu chú rể */
const shelia = localFont({
  src: "./fonts/VNF-Shelia-Regular.ttf",
  variable: "--font-shelia",
  display: "swap",
});

const title = `${COUPLE} | ${WEDDING.dateShort}`;
const description = `Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi trong ngày cưới của ${COUPLE}, ${WEDDING.dateFull}.`;

// Khai báo URL Production chính thức của bạn để Messenger dễ nhận diện
const PRODUCTION_URL = WEDDING.productionUrl;

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
    url: PRODUCTION_URL,
    type: "website",
    locale: "vi_VN",
    // Sử dụng URL tuyệt đối và bổ sung các thuộc tính định dạng ảnh cho Messenger
    images: [
      {
        url: `${PRODUCTION_URL}/og.jpg`,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: `Ảnh cưới ${COUPLE}`,
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
      className={`${cormorant.variable} ${beVietnam.variable} ${shelia.variable} h-full antialiased`}
      /* script khôi phục theme gắn data-theme trước khi React hydrate — mismatch này là cố ý */
      suppressHydrationWarning
    >
      {/* ponytail: mobile-only UI, desktop chỉ là khung điện thoại 430px đặt giữa */}
      <body className="min-h-full">
        {/* Khôi phục tông màu đã chọn trước khi vẽ trang, tránh chớp màu mặc định */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
        <div className="relative mx-auto min-h-dvh max-w-107.5 bg-paper shadow-[0_0_48px_rgba(60,48,36,0.18)]">
          {children}
        </div>
      </body>
    </html>
  );
}