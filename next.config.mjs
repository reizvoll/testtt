/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "plus.unsplash.com",
      "images.unsplash.com",
      "tleulhbjpjscqgbmptoj.supabase.co", // 추가된 Supabase 도메인
      "k.kakaocdn.net",
      "via.placeholder.com"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      },
      {
        protocol: "http",
        hostname: "img1.kakaocdn.net"
      },
      {
        protocol: "http",
        hostname: "k.kakaocdn.net"
      },
      {
        protocol: 'https',
        hostname: 'tleulhbjpjscqgbmptoj.supabase.co', // 추가된 Supabase 도메인
        pathname: '/**',
      },
    ]
  }
};

export default nextConfig;
