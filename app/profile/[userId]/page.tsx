'use client';

/**
 * Public User Profile Page
 * Displays user info, stats, reviews, followers, following
 */

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MapPin,
  Globe,
  Calendar,
  Star,
  Users,
  UserPlus,
  UserCheck,
  Award,
  ExternalLink,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/backend-auth';
import { trackProfileViewed, trackUserFollowed, trackUserUnfollowed } from '@/lib/analytics';

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    checkCurrentUser();
  }, [resolvedParams.userId]);

  const checkCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile/${resolvedParams.userId}`);
      const data = await res.json();

      if (data.success) {
        setProfile(data.data);
        
        // Check if current user is following this profile
        if (currentUser) {
          setIsFollowing(data.data.followers?.includes(currentUser.id) || false);
        }
        
        // Track profile view with PostHog
        trackProfileViewed({
          profileUserId: resolvedParams.userId,
          viewerUserId: currentUser?.id,
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setFollowLoading(true);
    try {
      const res = await fetch(`/api/profile/follow/${resolvedParams.userId}`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();
      if (data.success) {
        const newFollowingState = data.data.isFollowing;
        setIsFollowing(newFollowingState);
        
        // Track follow/unfollow with PostHog
        if (newFollowingState) {
          trackUserFollowed({
            followerId: currentUser.id,
            followedUserId: resolvedParams.userId,
          });
        } else {
          trackUserUnfollowed({
            followerId: currentUser.id,
            unfollowedUserId: resolvedParams.userId,
          });
        }
        
        // Refresh profile to update counts
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy người dùng</h2>
          <Button onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === resolvedParams.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        {profile.coverImage && (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {profile.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.name}
                    </h1>
                    {profile.bio && (
                      <p className="text-gray-600 mt-2">{profile.bio}</p>
                    )}
                    
                    {/* Location & Website */}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      {profile.location?.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {profile.location.city}
                            {profile.location.country && `, ${profile.location.country}`}
                          </span>
                        </div>
                      )}
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Website</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Tham gia {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <Button
                        onClick={() => router.push('/profile/edit')}
                        variant="outline"
                      >
                        Chỉnh sửa trang cá nhân
                      </Button>
                    ) : (
                      <Button
                        onClick={handleFollow}
                        disabled={followLoading}
                        variant={isFollowing ? 'outline' : 'default'}
                        className="gap-2"
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4" />
                            Đang theo dõi
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Theo dõi
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="font-bold text-lg">
                        {profile.stats?.reviewsCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">Đánh giá</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-bold text-lg">
                        {profile.stats?.followersCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">Người theo dõi</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600">
                    <Users className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-bold text-lg">
                        {profile.stats?.followingCount || 0}
                      </div>
                      <div className="text-xs text-gray-500">Đang theo dõi</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="font-bold text-lg">
                        {profile.stats?.destinationsVisited || 0}
                      </div>
                      <div className="text-xs text-gray-500">Đã đến</div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                {profile.badges && profile.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.badges.map((badge: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        <Award className="w-3 h-3" />
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="reviews" className="mb-12">
          <TabsList className="bg-white border rounded-lg p-1">
            <TabsTrigger value="reviews">
              Đánh giá ({profile.stats?.reviewsCount || 0})
            </TabsTrigger>
            <TabsTrigger value="followers">
              Người theo dõi ({profile.stats?.followersCount || 0})
            </TabsTrigger>
            <TabsTrigger value="following">
              Đang theo dõi ({profile.stats?.followingCount || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-6">
            <div className="grid gap-6">
              {profile.recentReviews && profile.recentReviews.length > 0 ? (
                profile.recentReviews.map((review: any) => (
                  <Card key={review._id} className="p-6">
                    <div className="flex items-start gap-4">
                      {review.destinationId?.images?.[0] && (
                        <img
                          src={review.destinationId.images[0]}
                          alt={review.destinationId.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg">
                            {review.destinationId?.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <h4 className="font-medium mb-2">{review.title}</h4>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {review.content}
                        </p>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Chưa có đánh giá nào
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="followers" className="mt-6">
            <div className="text-center py-12 text-gray-500">
              Danh sách người theo dõi (đang phát triển)
            </div>
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            <div className="text-center py-12 text-gray-500">
              Danh sách đang theo dõi (đang phát triển)
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

