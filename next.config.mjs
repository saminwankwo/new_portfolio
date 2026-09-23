/** @type {import('next').NextConfig} */
const nextConfig = {
  // `next lint` is incompatible with ESLint 9 flat configs in Next 15.1.x
  // ("Cannot serialize key parse"). Lint runs separately via `npm run lint`.
  eslint: { ignoreDuringBuilds: true },

  // Flavor redirects + the classic terminal-user easter egg (plan step 27).
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: false },
      { source: '/~samuel', destination: '/', permanent: false },
      {
        source: '/index.php',
        destination: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        permanent: false,
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'opengraph.githubassets.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
