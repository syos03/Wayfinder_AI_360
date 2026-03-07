'use client';

/**
 * Edit Profile Page
 * Allows user to update their profile information
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link as LinkIcon, Save, X } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/backend-auth';
import { toast } from 'sonner';

export default function EditProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarInput, setAvatarInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverInput, setCoverInput] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);
    
    // Fetch full profile
    fetchProfile(user.id);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/profile/${userId}`);
      const data = await res.json();

      if (data.success) {
        const profile = data.data;
        setName(profile.name || '');
        setBio(profile.bio || '');
        setAvatar(profile.avatar || '');
        setCoverImage(profile.coverImage || '');
        setCity(profile.location?.city || '');
        setCountry(profile.location?.country || '');
        setWebsite(profile.website || '');
        setPhone(profile.phone || '');
        setFacebook(profile.socialLinks?.facebook || '');
        setInstagram(profile.socialLinks?.instagram || '');
        setTwitter(profile.socialLinks?.twitter || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvatar = () => {
    if (avatarInput.trim()) {
      setAvatar(avatarInput.trim());
      setAvatarInput('');
    }
  };

  const handleAddCover = () => {
    if (coverInput.trim()) {
      setCoverImage(coverInput.trim());
      setCoverInput('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    const payload = {
      name,
      bio,
      avatar,
      coverImage,
      location: { city, country },
      website,
      phone,
      socialLinks: { facebook, instagram, twitter },
    };
    
    console.log('💾 Saving profile with data:', payload);
    
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('📥 Server response:', data);
      
      if (data.success) {
        toast.success('Cập nhật trang cá nhân thành công!');
        router.push(`/profile/${currentUser.id}`);
      } else {
        toast.error('Lỗi: ' + data.error);
        console.error('❌ Update failed:', data);
      }
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      toast.error('Có lỗi xảy ra!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa trang cá nhân</h1>
          <p className="text-gray-600 mt-2">
            Cập nhật thông tin cá nhân của bạn
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-8">
            {/* Avatar */}
            <div>
              <Label>Ảnh đại diện</Label>
              <div className="flex items-center gap-4 mt-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={avatarInput}
                      onChange={(e) => setAvatarInput(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <Button onClick={handleAddAvatar} size="sm" className="gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Thêm
                    </Button>
                  </div>
                  {avatar && (
                    <Button
                      onClick={() => setAvatar('')}
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-red-600"
                    >
                      <X className="w-4 h-4" />
                      Xóa ảnh
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <Label>Ảnh bìa</Label>
              <div className="mt-3 space-y-3">
                {coverImage && (
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <img
                      src={coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      onClick={() => setCoverImage('')}
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={coverInput}
                    onChange={(e) => setCoverInput(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                  />
                  <Button onClick={handleAddCover} size="sm" className="gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Thêm
                  </Button>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div>
              <Label htmlFor="name">Tên hiển thị *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="bio">Tiểu sử</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Giới thiệu về bạn..."
                className="mt-2"
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {bio.length}/500 ký tự
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Thành phố</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Hà Nội"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="country">Quốc gia</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Việt Nam"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-medium text-lg mb-4">Mạng xã hội</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/username"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/username"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/username"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button
                onClick={() => router.back()}
                variant="outline"
              >
                Hủy
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

