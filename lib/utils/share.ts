/**
 * Share Utilities
 * Web Share API with clipboard fallback
 */

import { toast } from 'sonner';

interface ShareData {
  title: string;
  text: string;
  url: string;
}

export async function shareContent(data: ShareData): Promise<boolean> {
  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name === 'AbortError') {
        // User cancelled, silently fail
        return false;
      }
      console.error('Share failed:', error);
      // Fall through to clipboard copy
    }
  }

  // Fallback to clipboard copy
  try {
    await navigator.clipboard.writeText(data.url);
    toast.success('Link đã được copy vào clipboard!');
    return true;
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    toast.error('Không thể chia sẻ');
    return false;
  }
}

export async function shareDestination(destination: {
  name: string;
  description: string;
  id: string;
}): Promise<boolean> {
  return shareContent({
    title: destination.name,
    text: destination.description.substring(0, 100) + '...',
    url: `${window.location.origin}/destinations/${destination.id}`,
  });
}

export async function shareTripPlan(plan: {
  title: string;
  id: string;
}): Promise<boolean> {
  return shareContent({
    title: plan.title,
    text: 'Xem kế hoạch du lịch của tôi',
    url: `${window.location.origin}/my-plans/${plan.id}`,
  });
}

