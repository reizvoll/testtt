/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'tleulhbjpjscqgbmptoj.supabase.co',
          pathname: '/**',
        },
      ],
    },
  }
  
  export default nextConfig
