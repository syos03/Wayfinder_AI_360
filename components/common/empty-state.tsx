/**
 * Empty State Component
 * Beautiful empty states with CTAs
 */

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center fade-in-up">
      {/* Icon Circle with enhanced gradient */}
      <div className="relative w-28 h-28 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-full blur-xl" />
        <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 rounded-full flex items-center justify-center border border-primary/20 float-animation">
          <Icon className="w-14 h-14 text-primary" />
        </div>
      </div>

      {/* Text with better typography */}
      <h3 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground mb-10 max-w-md text-lg leading-relaxed">
        {description}
      </p>

      {/* Actions with enhanced buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {primaryAction && (
          <Button size="lg" className="btn-gradient" asChild>
            <Link href={primaryAction.href}>
              {primaryAction.label}
            </Link>
          </Button>
        )}
        {secondaryAction && (
          <Button size="lg" variant="outline" asChild>
            <Link href={secondaryAction.href}>
              {secondaryAction.label}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

