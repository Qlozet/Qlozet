/** @type {import('next').NextConfig} */
const nextConfig = {
  source: "api/products",
  destination: "https://api.timbu.cloud/products",
  images: {
    domains: ["res.cloudinary.com", "encrypted-tbn0.gstatic.com"],
  },
};

export default nextConfig;
