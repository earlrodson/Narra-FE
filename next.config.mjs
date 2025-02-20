/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "X-Frame-Options", value: "ALLOWALL" }, // Allow embedding in iframe
                    // { key: "Content-Security-Policy", value: "frame-ancestors *;" }, // Allow iframes from any domain
                    { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://bubble.io https://app.thymeandtell.com;"},
                ],
            },
        ];
    },
};

export default nextConfig;
