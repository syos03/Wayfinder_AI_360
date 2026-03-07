/**
 * Structured Data Generator
 * Generate JSON-LD for schema.org markup
 */

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Wayfinder AI',
    alternateName: 'Wayfinder',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://wayfinder.ai',
    description: 'Smart Travel Planner for Vietnam - Khám phá Việt Nam thông minh',
    inLanguage: 'vi-VN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || 'https://wayfinder.ai'}/explore?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Wayfinder AI',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://wayfinder.ai',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://wayfinder.ai'}/icons/icon.svg`,
    description: 'Smart Travel Planner for Vietnam',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'VN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@wayfinder.ai',
    },
    sameAs: [
      // Add social media links when available
    ],
  };
}

export function generateDestinationSchema(destination: {
  id: string;
  name: string;
  description: string;
  images: string[];
  province: string;
  region: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  reviewCount?: number;
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: destination.name,
    description: destination.description,
    image: destination.images,
    address: {
      '@type': 'PostalAddress',
      addressLocality: destination.province,
      addressRegion: destination.region,
      addressCountry: 'VN',
    },
  };

  if (destination.coordinates) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: destination.coordinates.lat.toString(),
      longitude: destination.coordinates.lng.toString(),
    };
  }

  if (destination.rating && destination.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: destination.rating.toFixed(1),
      bestRating: '5',
      worstRating: '1',
      ratingCount: destination.reviewCount,
    };
  }

  return schema;
}

export function generateReviewSchema(review: {
  id: string;
  destinationName: string;
  author: {
    name: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  content: string;
  createdAt: Date;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'TouristDestination',
      name: review.destinationName,
    },
    author: {
      '@type': 'Person',
      name: review.author.name,
      ...(review.author.avatar && { image: review.author.avatar }),
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    name: review.title,
    reviewBody: review.content,
    datePublished: review.createdAt.toISOString(),
  };
}

export function generateBreadcrumbSchema(items: Array<{
  name: string;
  url: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generatePersonSchema(user: {
  name: string;
  bio?: string;
  avatar?: string;
  url?: string;
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name,
  };

  if (user.bio) schema.description = user.bio;
  if (user.avatar) schema.image = user.avatar;
  if (user.url) schema.url = user.url;

  return schema;
}















