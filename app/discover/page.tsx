'use client';

import { Suspense, useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Compass, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PersonalizedSection from '@/components/recommendations/PersonalizedSection';
import TrendingSection from '@/components/recommendations/TrendingSection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, type Variants } from 'framer-motion';
import { trackTabChanged } from '@/lib/analytics';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Creative Hero Section */}
      <section className="relative py-10 px-6 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-80 h-80 bg-primary/15 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, -30, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 bg-gradient-to-r from-primary to-primary/70 text-primary-foreground border-0 px-4 py-1.5 text-xs font-semibold shadow-lg">
                <Compass className="mr-2 h-3.5 w-3.5" />
                Khám Phá Thông Minh
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
            >
              Khám Phá{' '}
              <span className="gradient-text-animated">Việt Nam</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-base md:text-lg text-muted-foreground leading-relaxed"
            >
              Tìm kiếm điểm đến hoàn hảo với gợi ý thông minh và cá nhân hóa
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-12">
        {/* Main Content Tabs */}
        <Tabs 
          defaultValue="for-you" 
          className="space-y-6"
          onValueChange={(value) => trackTabChanged({ tabName: value, source: 'discover_page' })}
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="flex justify-center"
          >
            <TabsList className="grid w-full max-w-xl mx-auto grid-cols-3 h-auto bg-muted/50 backdrop-blur-sm border border-border/50 p-1 rounded-xl">
              <TabsTrigger 
                value="for-you" 
                className="flex items-center gap-2 py-2 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all rounded-lg"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dành cho bạn</span>
                <span className="sm:hidden">Cho bạn</span>
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-[8px] bg-primary/20 text-primary border-0 font-bold hidden md:flex">AI</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="trending" 
                className="flex items-center gap-2 py-2 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all rounded-lg"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đang Hot</span>
                <span className="sm:hidden">Hot</span>
                <span className="relative flex h-1.5 w-1.5 ml-1 hidden md:flex">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="by-tags" 
                className="flex items-center gap-2 py-2 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all rounded-lg"
              >
                <Tag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Theo Tag</span>
                <span className="sm:hidden">Tags</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* For You Tab */}
          <TabsContent value="for-you" className="space-y-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <PersonalizedSection limit={12} showHeader={false} />
            </Suspense>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <TrendingSection period="7d" limit={12} showHeader={false} />
            </Suspense>
          </TabsContent>

          {/* By Tags Tab */}
          <TabsContent value="by-tags" className="space-y-8">
            <TagsExplorer />
          </TabsContent>
        </Tabs>

        {/* Enhanced Quick Stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: Sparkles, title: "Gợi ý thông minh", description: "Dựa trên sở thích của bạn", color: "from-blue-500 to-cyan-500" },
            { icon: TrendingUp, title: "Trending", description: "Điểm đến đang hot nhất", color: "from-purple-500 to-pink-500" },
            { icon: Tag, title: "Tags", description: "Khám phá theo chủ đề", color: "from-orange-500 to-red-500" },
          ].map((stat, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Card className="card-premium-hover h-full group">
                <CardContent className="p-5 text-center">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl`}
                  >
                    <stat.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-1.5">{stat.title}</h3>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Enhanced Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-56 shimmer rounded-t-xl" />
          <CardContent className="p-4 space-y-3">
            <div className="h-6 shimmer rounded" />
            <div className="h-4 shimmer rounded w-2/3" />
            <div className="h-4 shimmer rounded w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Enhanced Tags Explorer Component
function TagsExplorer() {
  const [tagStats, setTagStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTagStats();
  }, []);

  const fetchTagStats = async () => {
    try {
      const res = await fetch('/api/tags/stats');
      const data = await res.json();
      if (data.success) {
        const statsMap: Record<string, number> = {};
        data.data.forEach((stat: any) => {
          statsMap[stat.tag] = stat.count;
        });
        setTagStats(statsMap);
      }
    } catch (error) {
      console.error('Failed to fetch tag stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tagConfig = [
    { name: 'Biển', color: 'from-blue-500 to-cyan-500', icon: '🏖️' },
    { name: 'Núi', color: 'from-green-500 to-emerald-500', icon: '⛰️' },
    { name: 'Văn hóa', color: 'from-purple-500 to-pink-500', icon: '🏛️' },
    { name: 'Ẩm thực', color: 'from-orange-500 to-red-500', icon: '🍜' },
    { name: 'Thiên nhiên', color: 'from-emerald-500 to-teal-500', icon: '🌿' },
    { name: 'Lịch sử', color: 'from-amber-500 to-yellow-500', icon: '📜' },
    { name: 'Nghỉ dưỡng', color: 'from-pink-500 to-rose-500', icon: '🏝️' },
    { name: 'Thành phố', color: 'from-red-500 to-orange-500', icon: '🏙️' },
  ];

  const popularTags = tagConfig.map(tag => ({
    ...tag,
    count: tagStats[tag.name] || 0,
  })).filter(tag => tag.count > 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-3">Khám phá theo chủ đề</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 shimmer rounded mb-3" />
                <div className="h-6 shimmer rounded mb-2" />
                <div className="h-4 shimmer rounded w-2/3 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="text-center mb-8"
      >
        <motion.div variants={fadeInUp}>
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 px-3 py-1 text-[10px]">
            <Tag className="w-3.5 h-3.5 mr-1.5" />
            Khám phá theo chủ đề
          </Badge>
        </motion.div>
        <motion.h3 variants={fadeInUp} className="text-2xl md:text-3xl font-bold mb-2">
          Chọn chủ đề bạn yêu thích
        </motion.h3>
        <motion.p variants={fadeInUp} className="text-base text-muted-foreground">
          Tìm điểm đến phù hợp với sở thích của bạn
        </motion.p>
      </motion.div>

      {popularTags.length > 0 ? (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {popularTags.map((tag, index) => (
            <motion.a
              key={tag.name}
              href={`/tags/${encodeURIComponent(tag.name)}`}
              variants={scaleIn}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="card-premium-hover cursor-pointer overflow-hidden h-full">
                <CardContent className={`p-6 text-center bg-gradient-to-br ${tag.color} text-white relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  <div className="relative z-10">
                    <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                      {tag.icon}
                    </div>
                    <h4 className="font-bold text-base mb-1">{tag.name}</h4>
                    <p className="text-xs opacity-90">{tag.count} điểm đến</p>
                  </div>
                </CardContent>
              </Card>
            </motion.a>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-muted/50 border border-border rounded-xl p-8 text-center"
        >
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Chưa có tags nào</p>
          <p className="text-sm text-muted-foreground">
            Hãy thêm tags cho destinations trong admin panel
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-primary/5 border border-primary/20 rounded-xl p-4"
      >
        <p className="text-sm text-foreground">
          💡 <strong>Tags tự động:</strong> Tags được tạo dựa trên loại hình và nội dung của điểm đến.
        </p>
      </motion.div>
    </div>
  );
}
