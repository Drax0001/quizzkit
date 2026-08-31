import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Retries navigations, prefetches, and Server Actions instead of
    // throwing when the network drops mid-request. See
    // docs/multi-domain-playbook.md and next.js's offline-support guide.
    useOffline: true,
  },
};

export default nextConfig;
