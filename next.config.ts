import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Badge DevTools mặc định nằm góc trái dưới, đè lên nút ẩn/hiện lời chúc nổi */
  devIndicators: {
    position: "top-left",
  },
};

export default nextConfig;
