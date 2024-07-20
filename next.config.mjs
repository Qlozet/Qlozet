/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  source: "api/products",
  images: {
    domains: ["res.cloudinary.com", "encrypted-tbn0.gstatic.com"],
  },
};

export default nextConfig;
