const nextPWA = require('next-pwa');

const isProd = process.env.NODE_ENV === 'production';

const withPWA = nextPWA({
  dest: 'public',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: isProd,
  reactStrictMode: false,
};

module.exports = isProd ? withPWA(nextConfig) : nextConfig;
