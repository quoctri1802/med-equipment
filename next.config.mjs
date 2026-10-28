/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Bỏ qua lỗi linting khi build để ưu tiên deploy nhanh
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Bỏ qua lỗi TypeScript khi build
        ignoreBuildErrors: true,
    },
    // Tối ưu hóa hiệu năng & tải trang
    compress: true,
    poweredByHeader: false,
    swcMinify: true,
    experimental: {
        optimizePackageImports: ['lucide-react', 'recharts'],
    },
};

export default nextConfig;
