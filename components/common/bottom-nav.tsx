'use client';

/**
 * Mobile Bottom Navigation
 * Sticky navigation bar at bottom for mobile users
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Sparkles, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface BottomNavProps {
  favoritesCount?: number;
  userId?: string;
}

export function BottomNav({ favoritesCount = 0, userId }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: '/', icon: Home, label: 'Trang chủ' },
    { href: '/explore', icon: Compass, label: 'Khám phá' },
    { href: '/ai-planner', icon: Sparkles, label: 'AI', highlight: true },
    { href: '/favorites', icon: Heart, label: 'Yêu thích', badge: favoritesCount },
    { 
      href: userId ? `/profile/${userId}` : '/login', 
      icon: User, 
      label: 'Tôi' 
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t-2 border-primary/20 safe-area-pb shadow-2xl">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label, highlight, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200',
              isActive(href)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
              highlight && 'relative -mt-4'
            )}
          >
            {/* Highlight circle for AI button */}
            {highlight && (
              <div className="absolute -top-2 w-14 h-14 bg-gradient-to-r from-primary via-secondary to-accent rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-110">
                <Icon className="w-6 h-6 text-white group-hover:scale-125 transition-transform" />
              </div>
            )}
            
            {!highlight && (
              <>
                <div className="relative">
                  <div className={cn(
                    'absolute inset-0 rounded-full bg-primary/10 scale-0 transition-transform duration-200',
                    isActive(href) && 'scale-125'
                  )} />
                  <Icon className={cn(
                    'relative w-6 h-6 transition-all duration-200',
                    isActive(href) && 'scale-110'
                  )} />
                  {badge !== undefined && badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 hover:bg-red-600 transition-colors shadow-lg">
                      {badge > 9 ? '9+' : badge}
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  'text-[10px] mt-1 transition-all duration-200',
                  isActive(href) && 'font-semibold text-primary'
                )}>
                  {label}
                </span>
              </>
            )}
            {highlight && (
              <span className={cn(
                'text-[10px] mt-8 font-semibold transition-colors',
                isActive(href) ? 'text-primary' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

