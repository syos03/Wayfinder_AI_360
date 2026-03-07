/**
 * SEO Meta Tags Generator
 * Generate dynamic meta tags for each page
 */

export interface SEOMetaTags {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export function generateMetaTags(options: SEOMetaTags) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  
  const meta: any = {
    title: options.title,
    description: options.description,
    keywords: options.keywords?.join(', '),
    openGraph: {
      title: options.ogTitle || options.title,
      description: options.ogDescription || options.description,
      url: options.canonical || baseUrl,
      siteName: 'Wayfinder AI',
      images: options.ogImage ? [
        {
          url: options.ogImage,
          width: 1200,
          height: 630,
          alt: options.ogTitle || options.title,
        },
      ] : [],
      locale: 'vi_VN',
      type: options.ogType || 'website',
    },
    twitter: {
      card: options.twitterCard || 'summary_large_image',
      title: options.twitterTitle || options.ogTitle || options.title,
      description: options.twitterDescription || options.ogDescription || options.description,
      images: options.twitterImage ? [options.twitterImage] : (options.ogImage ? [options.ogImage] : []),
      creator: '@WayfinderAI',
      site: '@WayfinderAI',
    },
    robots: {
      index: !options.noindex,
      follow: !options.nofollow,
      googleBot: {
        index: !options.noindex,
        follow: !options.nofollow,
      },
    },
    alternates: {
      canonical: options.canonical || baseUrl,
      languages: {
        'vi-VN': options.canonical || baseUrl,
      },
    },
  };

  return meta;
}

// Predefined meta tags for common pages
export const homePageMeta: SEOMetaTags = {
  title: 'Wayfinder AI - Smart Travel Planner for Vietnam',
  description: 'Khám phá Việt Nam thông minh với Wayfinder AI. Tìm kiếm hàng trăm địa điểm du lịch, đọc đánh giá chân thực và lên kế hoạch chuyến đi hoàn hảo.',
  keywords: ['du lịch Việt Nam', 'travel Vietnam', 'điểm đến Việt Nam', 'lập kế hoạch du lịch', 'Wayfinder AI'],
  ogType: 'website',
};

export const explorePageMeta: SEOMetaTags = {
  title: 'Khám phá Điểm đến - Wayfinder AI',
  description: 'Khám phá hàng trăm địa điểm du lịch tuyệt vời khắp Việt Nam. Từ Bắc vào Nam, từ biển đến núi, tìm điểm đến hoàn hảo cho chuyến đi tiếp theo.',
  keywords: ['khám phá Việt Nam', 'điểm đến du lịch', 'địa điểm Việt Nam', 'travel destinations Vietnam'],
};

export const discoverPageMeta: SEOMetaTags = {
  title: 'Gợi ý Dành cho Bạn - Wayfinder AI',
  description: 'Khám phá những gợi ý du lịch được cá nhân hóa dựa trên sở thích của bạn. Tìm điểm đến đang HOT và các địa điểm phù hợp với phong cách du lịch của bạn.',
  keywords: ['gợi ý du lịch', 'điểm đến hot', 'travel recommendations', 'personalized travel'],
};

export function destinationPageMeta(destination: {
  name: string;
  description: string;
  province: string;
  images: string[];
  rating?: number;
  reviewCount?: number;
}): SEOMetaTags {
  return {
    title: `${destination.name}, ${destination.province} - Wayfinder AI`,
    description: destination.description.substring(0, 155) + '...',
    keywords: [destination.name, destination.province, 'du lịch', destination.province + ' travel'],
    ogImage: destination.images[0] || undefined,
    ogType: 'article',
    twitterCard: 'summary_large_image',
  };
}

export function profilePageMeta(user: {
  name: string;
  bio?: string;
  avatar?: string;
}): SEOMetaTags {
  return {
    title: `${user.name} - Hồ sơ | Wayfinder AI`,
    description: user.bio || `Xem hồ sơ du lịch của ${user.name} trên Wayfinder AI. Đánh giá, địa điểm đã đi và những trải nghiệm du lịch.`,
    ogType: 'profile',
    ogImage: user.avatar,
    noindex: false, // Allow indexing for public profiles
  };
}

export function adminPageMeta(): SEOMetaTags {
  return {
    title: 'Admin Dashboard - Wayfinder AI',
    description: 'Admin panel for Wayfinder AI',
    noindex: true,
    nofollow: true,
  };
}















