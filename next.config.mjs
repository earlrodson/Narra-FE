/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        BACKEND_URL: process.env.BACKEND_URL,
        BUBBLE_VALIDATE_URL: process.env.BUBBLE_VALIDATE_URL,
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "X-Frame-Options", value: "ALLOWALL" }, // Allow embedding in iframe
                    { key: "Content-Security-Policy", value: "frame-ancestors *;" }, // Allow iframes from any domain
                ],
            },
        ];
    },
};

export default nextConfig;
