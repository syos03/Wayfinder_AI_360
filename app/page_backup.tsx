'use client';

/**
 * Modern Home Page with Animations
 * Redesigned for better UX and engagement
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Users, 
  Wallet, 
  MapPin, 
  ArrowRight,
  Heart,
  Star,
  Camera,
  Shield,
  Clock,
  Compass,
  Zap,
  TrendingUp,
  CheckCircle2,
  Brain,
  Globe,
  Rocket
} from "lucide-react";
import { useEffect, useState } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

// Animated Counter Component
function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
      <div className="flex flex-col">
      {/* Hero Section - Modern & Interactive */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-24 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 bg-gradient-to-r from-primary to-secondary text-white border-0 px-4 py-2 shadow-lg">
            <Sparkles className="mr-2 h-4 w-4" />
                AI-Powered Travel Intelligence
          </Badge>
            </motion.div>
            
            {/* Heading */}
            <motion.h1 
              variants={fadeInUp}
              className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
            >
              <span className="block text-foreground">Khám phá</span>
              <span className="block mt-2 gradient-text">
                Việt Nam Thông Minh
            </span>
            </motion.h1>
            
            {/* Description */}
            <motion.p 
              variants={fadeInUp}
              className="mx-auto mb-10 max-w-3xl text-xl md:text-2xl text-muted-foreground leading-relaxed"
            >
              Lên kế hoạch hoàn hảo trong <span className="font-bold text-primary">vài giây</span> với
              sức mạnh AI. Từ Hà Nội đến Phú Quốc, chúng tôi giúp bạn khám phá mọi góc đất Việt.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-16"
            >
              <Button 
                size="lg" 
                variant="gradient"
                className="text-lg px-8 py-6 h-auto group"
                asChild
              >
                <Link href="/ai-planner">
                  <Sparkles className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform" />
                  Tạo kế hoạch AI
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 text-lg px-8 py-6 h-auto hover:bg-accent/50"
                asChild
              >
                <Link href="/explore">
                  <Compass className="mr-2 h-5 w-5" />
                  Khám phá điểm đến
                </Link>
              </Button>
            </motion.div>

            {/* Animated Stats */}
            {mounted && (
              <motion.div 
                variants={fadeInUp}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    <AnimatedCounter end={10000} />+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Người dùng
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    <AnimatedCounter end={500} />+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Điểm đến
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    <AnimatedCounter end={95} />%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Hài lòng
            </div>
            </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                    <AnimatedCounter end={5000} />+
            </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    AI Plans
            </div>
          </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground/40 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* AI Features Showcase */}
      <section className="px-6 py-24 bg-background">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 bg-gradient-to-r from-primary to-purple-600 text-white border-0 px-4 py-2 shadow-lg">
                <Brain className="w-4 h-4 mr-2" />
                AI Technology
            </Badge>
            </motion.div>
            <motion.h2 
              variants={fadeInUp}
              className="mb-6 text-4xl md:text-5xl font-bold text-foreground"
            >
              Trí tuệ nhân tạo <span className="gradient-text">thông minh</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="mx-auto max-w-2xl text-lg text-muted-foreground"
            >
              Powered by Google Gemini AI - Tạo kế hoạch du lịch hoàn hảo với phân tích sâu và gợi ý thông minh
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid gap-8 md:grid-cols-3"
          >
            {[
              {
                icon: Sparkles,
                title: "Lập kế hoạch tức thì",
                description: "AI tạo lịch trình chi tiết trong < 10 giây với ngân sách tối ưu",
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
              },
              {
                icon: TrendingUp,
                title: "Gợi ý thông minh",
                description: "Phân tích sở thích và đề xuất điểm đến phù hợp với bạn nhất",
                gradient: "from-secondary/90 to-secondary",
                bgGradient: "from-secondary/10 to-secondary/5 dark:from-secondary/20 dark:to-secondary/10"
              },
              {
                icon: Zap,
                title: "Tối ưu chi phí",
                description: "AI tính toán và tối ưu hóa ngân sách cho mọi chuyến đi",
                gradient: "from-teal-500 to-teal-600",
                bgGradient: "from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={scaleIn}>
                <Card className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:scale-105 bg-gradient-to-br ${feature.bgGradient}`}>
              <CardHeader className="text-center pb-4">
                    <motion.div 
                      className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="h-10 w-10 text-white" />
                    </motion.div>
                    <CardTitle className="text-2xl mb-3">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                      {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24 bg-gradient-to-br from-muted/30 to-muted/50">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 bg-primary/10 text-primary border border-primary/20 px-4 py-2">
                <Rocket className="w-4 h-4 mr-2" />
                Đơn giản & Nhanh chóng
              </Badge>
            </motion.div>
            <motion.h2 
              variants={fadeInUp}
              className="mb-6 text-4xl md:text-5xl font-bold text-foreground"
            >
              Chỉ <span className="gradient-text">3 bước</span> đơn giản
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="max-w-5xl mx-auto"
          >
            {[
              {
                step: "01",
                title: "Nhập thông tin",
                description: "Cho AI biết xuất phát từ đâu, muốn đi đâu, bao nhiêu ngày và ngân sách",
                icon: MapPin,
                color: "blue"
              },
              {
                step: "02",
                title: "AI tạo kế hoạch",
                description: "Gemini AI phân tích và tạo lịch trình chi tiết với ngân sách tối ưu trong vài giây",
                icon: Brain,
                color: "secondary"
              },
              {
                step: "03",
                title: "Bắt đầu hành trình",
                description: "Xem chi tiết, lưu lại và chia sẻ kế hoạch. Sẵn sàng cho chuyến đi!",
                icon: CheckCircle2,
                color: "teal"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="relative mb-12 last:mb-0"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Step Number */}
                  <motion.div 
                    className={`flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center text-white font-bold text-2xl shadow-2xl`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {item.step}
                  </motion.div>

                  {/* Content */}
                  <Card className="flex-1 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 dark:from-${item.color}-900/30 dark:to-${item.color}-800/30 rounded-xl flex items-center justify-center`}>
                          <item.icon className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`} />
                </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                          <CardDescription className="text-base">{item.description}</CardDescription>
                </div>
                </div>
              </CardHeader>
            </Card>
                </div>

                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute left-12 top-24 w-0.5 h-12 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600" />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mt-16"
          >
            <Button 
              size="lg" 
              variant="gradient"
              className="text-lg px-10 py-6 h-auto"
              asChild
            >
              <Link href="/ai-planner">
                Thử ngay miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
                </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24 bg-background">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 bg-primary/10 text-primary border border-primary/20 px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                Tính năng nổi bật
              </Badge>
            </motion.div>
            <motion.h2 
              variants={fadeInUp}
              className="mb-6 text-4xl md:text-5xl font-bold text-foreground"
            >
              Mọi thứ bạn cần
            </motion.h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {[
              { icon: Globe, title: "500+ Điểm đến", description: "Khắp Việt Nam từ Bắc đến Nam", gradient: "from-primary to-primary/80" },
              { icon: Heart, title: "Lưu yêu thích", description: "Bookmark địa điểm yêu thích", gradient: "from-secondary to-secondary/80" },
              { icon: Camera, title: "AR360 Tour", description: "Xem trước địa điểm 360°", gradient: "from-accent to-accent/80" },
              { icon: Shield, title: "An toàn", description: "Bảo mật thông tin tối đa", gradient: "from-primary/80 to-secondary/80" },
              { icon: Clock, title: "Tiết kiệm thời gian", description: "Lập kế hoạch trong vài giây", gradient: "from-secondary/80 to-accent/80" },
              { icon: Users, title: "Cộng đồng", description: "Chia sẻ và đánh giá", gradient: "from-accent/80 to-primary/80" }
            ].map((feature, index) => (
              <motion.div key={index} variants={scaleIn}>
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group h-full">
                  <CardHeader className="text-center">
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-lg mb-2">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 bg-gradient-to-r from-primary via-secondary to-accent text-white relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          style={{
            backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
            <Star className="w-4 h-4 mr-2 fill-current" />
                Được hàng nghìn người tin dùng
          </Badge>
            </motion.div>
            
            <motion.h2 
              variants={fadeInUp}
              className="mb-6 text-4xl md:text-5xl font-bold"
            >
              Sẵn sàng khám phá Việt Nam?
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="mx-auto mb-10 max-w-2xl text-xl text-blue-100"
            >
              Tham gia cùng hàng nghìn người đã tạo ra những chuyến đi đáng nhớ với Wayfinder AI
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-8"
            >
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-50 shadow-2xl text-lg px-10 py-6 h-auto"
                asChild
              >
              <Link href="/register">
                Đăng ký miễn phí
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary text-lg px-10 py-6 h-auto"
                asChild
              >
              <Link href="/explore">
                Khám phá ngay
              </Link>
            </Button>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-blue-200">
            ✨ Không cần thẻ tín dụng • 🚀 Thiết lập trong 30 giây • 💝 Miễn phí mãi mãi
            </motion.p>
          </motion.div>
        </div>
      </section>
      </div>
  );
}
