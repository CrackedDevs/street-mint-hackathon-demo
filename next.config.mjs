/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
      // Add this new pattern for Wikipedia images
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/**",
      },
      // Add this new pattern for New York Times images
      {
        protocol: "https",
        hostname: "static01.nyt.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "arweave.net",
        port: "",
        pathname: "/**",
      },
      // Add this new pattern for the specific Arweave hostname
      {
        protocol: "https",
        hostname: "*.arweave.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "iaulwnqmthzvuxfubnsb.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "white-original-anaconda-474.mypinata.cloud",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "docs.farcaster.xyz",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
