"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  MapPin, 
  Star, 
  Heart, 
  Calendar, 
  DollarSign,
  Users,
  Plane,
  Camera,
  Mountain,
  Waves,
  Building,
  TreePine,
  Utensils,
  ShoppingBag,
  Music,
  Palette,
  ArrowRight,
  TrendingUp,
  Award,
  Globe,
  Clock,
  Thermometer,
  Wind,
  Sun,
  CloudRain,
  Car,
  Bed,
  Coffee,
  Compass,
  Share2,
  Download,
  Bookmark,
  MessageSquare,
  ThumbsUp,
  Eye
} from "lucide-react"
import { top15Provinces, getProvinceById } from "@/data/top15-provinces"
import { getProvinceImages } from "@/data/province-images"
import { PhotoGallery } from "@/components/photo-gallery"
import { ReviewsPanel } from "@/components/reviews-panel"

export default function ProvinceDetailPage() {
  const params = useParams()
  const provinceId = params.id as string
  const province = getProvinceById(provinceId)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  if (!province) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy tỉnh thành</h1>
          <Link href="/explore">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại khám phá
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const getRegionIcon = (region: string) => {
    switch (region) {
      case "Miền Bắc": return <Mountain className="w-5 h-5" />
      case "Miền Trung": return <Waves className="w-5 h-5" />
      case "Miền Nam": return <TreePine className="w-5 h-5" />
      default: return <Globe className="w-5 h-5" />
    }
  }

  const getBudgetColor = (budget: number) => {
    if (budget <= 1000000) return "bg-green-100 text-green-700"
    if (budget <= 2000000) return "bg-yellow-100 text-yellow-700"
    return "bg-red-100 text-red-700"
  }

  const formatBudget = (budget: number) => {
    if (budget >= 1000000) {
      return `${(budget / 1000000).toFixed(1)}M VNĐ`
    }
    return `${(budget / 1000).toFixed(0)}k VNĐ`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/explore">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại khám phá
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart 
                  className={`w-5 h-5 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
                  }`} 
                />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30 border-0">
                {getRegionIcon(province.region)}
                <span className="ml-2">{province.region}</span>
              </Badge>
              
              <h1 className="text-4xl font-bold mb-4">{province.name}</h1>
              <p className="text-xl text-blue-100 mb-6">{province.description}</p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{province.rating}</span>
                  <span className="text-blue-100">({province.reviews.toLocaleString()} đánh giá)</span>
                </div>
                <Badge className={getBudgetColor(province.budget.medium)}>
                  <DollarSign className="w-4 h-4 mr-1" />
                  {formatBudget(province.budget.medium)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-300" />
                  <div>
                    <div className="font-medium">Thời gian tốt nhất</div>
                    <div className="text-blue-100">{province.bestTime}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blue-300" />
                  <div>
                    <div className="font-medium">Nhiệt độ trung bình</div>
                    <div className="text-blue-100">{province.avgTemp}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-300" />
                  <div>
                    <div className="font-medium">Dân số</div>
                    <div className="text-blue-100">{province.population}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-300" />
                  <div>
                    <div className="font-medium">Diện tích</div>
                    <div className="text-blue-100">{province.area}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl overflow-hidden">
                <img 
                  src={province.image} 
                  alt={province.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">{province.name}</h3>
                      <p className="text-white/90">{province.type}</p>
                    </div>
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-0">
                      <Camera className="w-4 h-4 mr-2" />
                      Xem ảnh
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="highlights">Điểm nổi bật</TabsTrigger>
            <TabsTrigger value="activities">Hoạt động</TabsTrigger>
            <TabsTrigger value="food">Ẩm thực</TabsTrigger>
            <TabsTrigger value="culture">Văn hóa</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            <TabsTrigger value="photos">Hình ảnh</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Budget Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Ngân sách du lịch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tiết kiệm</span>
                    <Badge className="bg-green-100 text-green-700">
                      {formatBudget(province.budget.low)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trung bình</span>
                    <Badge className="bg-yellow-100 text-yellow-700">
                      {formatBudget(province.budget.medium)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cao cấp</span>
                    <Badge className="bg-red-100 text-red-700">
                      {formatBudget(province.budget.high)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Transport Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-blue-600" />
                    Phương tiện di chuyển
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {province.transport.map((transport, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span className="text-sm">{transport}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Accommodation Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-purple-600" />
                    Chỗ ở
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {province.accommodation.map((accommodation, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span className="text-sm">{accommodation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weather Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-orange-600" />
                  Thông tin thời tiết
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-2">{province.avgTemp}</div>
                    <div className="text-sm text-gray-600">Nhiệt độ trung bình</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">{province.weather}</div>
                    <div className="text-sm text-gray-600">Kiểu khí hậu</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">{province.bestTime}</div>
                    <div className="text-sm text-gray-600">Thời gian tốt nhất</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Highlights Tab */}
          <TabsContent value="highlights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {province.highlights.map((highlight, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{highlight}</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Điểm đến nổi tiếng và thu hút nhiều du khách
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {province.activities.map((activity, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Compass className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{activity}</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Hoạt động thú vị và hấp dẫn cho du khách
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Khám phá
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Food Tab */}
          <TabsContent value="food" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {province.food.map((food, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Utensils className="w-4 h-4 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{food}</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Món ăn đặc sản và hấp dẫn của địa phương
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      <Utensils className="w-4 h-4 mr-2" />
                      Thưởng thức
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Culture Tab */}
          <TabsContent value="culture" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-600" />
                    Văn hóa & Nghệ thuật
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {province.culture.map((culture, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span className="text-sm">{culture}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-pink-600" />
                    Lễ hội & Sự kiện
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {province.festivals.map((festival, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full" />
                        <span className="text-sm">{festival}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-auto">
            <ReviewsPanel locationId={provinceId} />
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            <PhotoGallery 
              images={getProvinceImages(provinceId)} 
              provinceName={province.name}
            />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plane className="w-5 h-5 mr-2" />
            Lên kế hoạch du lịch
          </Button>
          <Button size="lg" variant="outline">
            <Bookmark className="w-5 h-5 mr-2" />
            Lưu vào danh sách yêu thích
          </Button>
          <Button size="lg" variant="outline">
            <MessageSquare className="w-5 h-5 mr-2" />
            Viết đánh giá
          </Button>
        </div>
      </div>
    </div>
  )
}
