'use client';

/**
 * Premium Admin Dashboard
 * Modern, creative design with animations and interactive elements
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  MapPin, 
  Star, 
  TrendingUp, 
  Activity,
  UserPlus,
  Shield,
  Sparkles,
  ArrowRight,
  Eye,
  Calendar,
  BarChart3,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { trackAdminDashboardViewed } from '@/lib/analytics';
import { getCurrentUser } from '@/lib/auth/backend-auth';

interface Stats {
  users: {
    total: number;
    active: number;
    banned: number;
    newToday: number;
    newLast7Days: number;
    newLast30Days: number;
    byRole: Array<{ _id: string; count: number }>;
  };
  destinations: {
    total: number;
    active: number;
    byRegion: Array<{ _id: string; count: number }>;
  };
  tripPlans: {
    total: number;
    today: number;
    last7Days: number;
    last30Days: number;
  };
  reviews: {
    total: number;
    today: number;
    last7Days: number;
    last30Days: number;
    averageRating: number;
  };
  recentActivity: {
    recentUsers: Array<any>;
    mostActiveUsers: Array<any>;
  };
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};

// Animated Counter Component
function AnimatedCounter({ end, duration = 1.5 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchStats();
    trackAdminView();
  }, []);
  
  const trackAdminView = async () => {
    const user = await getCurrentUser();
    if (user) {
      trackAdminDashboardViewed({ adminId: user.id });
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-muted-foreground">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <p className="text-destructive font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats.users.total,
      change: `+${stats.users.newLast7Days}`,
      changeLabel: '7 ngày qua',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
      link: '/admin/users',
      details: [
        { label: 'Hoạt động', value: stats.users.active, color: 'text-green-600' },
        { label: 'Bị cấm', value: stats.users.banned, color: 'text-red-600' }
      ]
    },
    {
      title: 'Điểm đến',
      value: stats.destinations.total,
      change: `${stats.destinations.active}`,
      changeLabel: 'đang hoạt động',
      icon: MapPin,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
      link: '/admin/destinations',
      details: stats.destinations.byRegion.slice(0, 2).map(r => ({
        label: r._id,
        value: r.count,
        color: 'text-purple-600'
      }))
    },
    {
      title: 'Đánh giá',
      value: stats.reviews.total,
      change: `${stats.reviews.averageRating.toFixed(1)}`,
      changeLabel: 'trung bình',
      icon: Star,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
      link: '/admin/reviews',
      details: [
        { label: '7 ngày', value: `+${stats.reviews.last7Days}`, color: 'text-amber-600' }
      ]
    },
    {
      title: 'AI Plans',
      value: stats.tripPlans?.total || 0,
      change: `${stats.tripPlans?.last7Days || 0}`,
      changeLabel: '7 ngày qua',
      icon: Sparkles,
      gradient: 'from-indigo-500 to-blue-500',
      bgGradient: 'from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20',
      link: '/admin/ai-plans',
      details: [
        { label: 'Hôm nay', value: stats.tripPlans?.today || 0, color: 'text-indigo-600' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative py-12 px-6 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
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
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold gradient-text-animated">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground text-lg mt-1">
                    Quản lý hệ thống Wayfinder AI
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center gap-3">
              <Button variant="outline" className="border-2" asChild>
                <Link href="/admin/analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Link>
              </Button>
              <Button className="btn-gradient" asChild>
                <Link href="/admin/users">
                  <Users className="w-4 h-4 mr-2" />
                  Quản lý người dùng
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        {/* Premium Stats Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12"
        >
          {statCards.map((stat, index) => (
            <motion.div key={index} variants={scaleIn}>
              <Link href={stat.link}>
                <Card className="card-premium-hover h-full group cursor-pointer overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <CardHeader className="relative z-10 pb-3">
                    <div className="flex items-center justify-between mb-4">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <stat.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardDescription className="text-sm font-medium">{stat.title}</CardDescription>
                    <CardTitle className="text-4xl font-bold mt-2">
                      {mounted ? <AnimatedCounter end={stat.value} /> : stat.value}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className={`w-4 h-4 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} />
                      <span className={`font-semibold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-muted-foreground">{stat.changeLabel}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-3 border-t border-border/50">
                      {stat.details.map((detail, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="text-muted-foreground">{detail.label}: </span>
                          <span className={detail.color}>{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Activity Sections */}
        <div className="grid gap-6 lg:grid-cols-2 mb-12">
          {/* Recent Users */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Card className="card-premium-hover h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Người dùng mới</CardTitle>
                      <CardDescription>10 người dùng đăng ký gần đây</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/users">
                      Xem tất cả
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentActivity.recentUsers.map((user, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">{user.role}</Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Most Active Users */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Card className="card-premium-hover h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Người dùng tích cực</CardTitle>
                      <CardDescription>Theo số lượng đánh giá</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/users">
                      Xem tất cả
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentActivity.mostActiveUsers.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            idx === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                            idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                            idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                            'bg-gradient-to-br from-primary/20 to-primary/40 text-primary'
                          }`}
                        >
                          {idx + 1}
                        </motion.div>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.email}</p>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                        {item.count} đánh giá
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
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
        >
          <Card className="card-premium-hover">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>Thao tác nhanh</CardTitle>
                  <CardDescription>Truy cập nhanh các chức năng quản lý</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: Users, label: 'Quản lý người dùng', href: '/admin/users', gradient: 'from-blue-500 to-cyan-500' },
                  { icon: MapPin, label: 'Quản lý điểm đến', href: '/admin/destinations', gradient: 'from-purple-500 to-pink-500' },
                  { icon: Star, label: 'Kiểm duyệt đánh giá', href: '/admin/reviews', gradient: 'from-amber-500 to-orange-500' },
                  { icon: Sparkles, label: 'Quản lý AI Plans', href: '/admin/ai-plans', gradient: 'from-indigo-500 to-blue-500' },
                ].map((action, index) => (
                  <motion.div key={index} variants={scaleIn}>
                    <Button
                      asChild
                      variant="outline"
                      className="h-auto py-6 w-full group hover:border-primary/50 transition-all"
                    >
                      <Link href={action.href}>
                        <div className="text-center w-full">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}
                          >
                            <action.icon className="w-6 h-6 text-white" />
                          </motion.div>
                          <p className="font-semibold group-hover:text-primary transition-colors">{action.label}</p>
                        </div>
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
