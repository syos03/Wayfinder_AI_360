'use client';

/**
 * PWA Install Prompt Component
 * Show install button when app is installable
 */

import { useInstallPrompt } from '@/lib/hooks/use-install-prompt';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';

export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Check className="h-4 w-4" />
        <span>Đã cài đặt</span>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={promptInstall}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Cài đặt ứng dụng
    </Button>
  );
}















