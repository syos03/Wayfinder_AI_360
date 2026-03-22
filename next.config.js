/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
        }
      }
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /^https?:\/\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'others',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10
      }
    }
  ]
})

const nextConfig = {
  // Headers for Permissions Policy (allow sensor features for Google Maps)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'accelerometer=*, gyroscope=*, magnetometer=*, geolocation=*',
          },
        ],
      },
    ]
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '**.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'maps.app.goo.gl',
      },
      {
        protocol: 'https',
        hostname: '**.google.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-images.vtv.vn',
      },
      {
        protocol: 'https',
        hostname: '**.vtv.vn',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.pexelsusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'vetaucondao.vn',
      },
      {
        protocol: 'http',
        hostname: 'vetaucondao.vn',
      },
      {
        protocol: 'https',
        hostname: 'www.vietnamairlines.com',
      },
      {
        protocol: 'https',
        hostname: 'vietnamairlines.com',
      },
      {
        protocol: 'https',
        hostname: 'letsflytravel.vn',
      },
      {
        protocol: 'http',
        hostname: 'letsflytravel.vn',
      },
      {
        protocol: 'https',
        hostname: 'mia.vn',
      },
      {
        protocol: 'http',
        hostname: 'mia.vn',
      },
      {
        protocol: 'https',
        hostname: 'phongnhatourist.com',
      },
      {
        protocol: 'http',
        hostname: 'phongnhatourist.com',
      },
      {
        protocol: 'https',
        hostname: 'bizweb.dktcdn.net',
      },
      {
        protocol: 'http',
        hostname: 'bizweb.dktcdn.net',
      },
      {
        protocol: 'https',
        hostname: '**.dktcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.xanhsm.com',
      },
      {
        protocol: 'https',
        hostname: '**.xanhsm.com',
      },
      {
        protocol: 'https',
        hostname: 'quangbinhtravel.vn',
      },
      {
        protocol: 'https',
        hostname: '**.quangbinhtravel.vn',
      },
      {
        protocol: 'https',
        hostname: 'dulichso.vn',
      },
      {
        protocol: 'https',
        hostname: '**.dulichso.vn',
      },
      {
        protocol: 'https',
        hostname: 'ivivu.com',
      },
      {
        protocol: 'https',
        hostname: 'res.ivivu.com',
      },
      {
        protocol: 'https',
        hostname: '**.ivivu.com',
      },
      {
        protocol: 'https',
        hostname: 'klook.com',
      },
      {
        protocol: 'https',
        hostname: 'res.klook.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
      {
        protocol: 'https',
        hostname: '**.imagekit.io',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle msnodesqlv8 native module
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('msnodesqlv8')
    }
    
    // Handle Leaflet icons
    config.module.rules.push({
      test: /\.(png|svg|jpg|gif)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash][ext][query]'
      }
    })
    
    return config
  },
  serverExternalPackages: ['msnodesqlv8'],
  transpilePackages: ['leaflet', 'react-leaflet', 'react-map-gl', 'mapbox-gl']
}

module.exports = withPWA(nextConfig)
