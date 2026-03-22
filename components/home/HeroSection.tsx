"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { Sparkles, MapPin, Globe, Rocket, Compass, Users, Star, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp } from "@/lib/ui/animations";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
}

function AnimatedCounter({ end, duration = 2 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let frameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
}

interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

function FloatingCard({ children, delay = 0, className = "" }: FloatingCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / 10);
    y.set((e.clientY - centerY) / 10);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={shouldReduceMotion ? undefined : { x: mouseXSpring, y: mouseYSpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[70vh] flex items-center justify-center px-6 py-10 md:py-16 overflow-hidden bg-background"
    >
      {/* Dynamic Animated Background */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <motion.div
            className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-primary/20 via-transparent to-primary/10 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, -100, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}

      {/* Parallax Content */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y, opacity }}
        className="container mx-auto relative z-10"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Creative Typography */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 },
              },
            }}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 bg-gradient-to-r from-primary to-primary/70 text-primary-foreground border-0 px-6 py-2.5 text-sm font-semibold shadow-lg">
                <Sparkles className="mr-2 h-4 w-4" />
                AI-Powered Travel Intelligence
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tighter"
            >
              <span className="block text-foreground">Khám phá</span>
              <span className="block mt-2 gradient-text-animated bg-clip-text">Việt Nam</span>
              <span className="block mt-2 text-foreground/80 text-3xl md:text-4xl lg:text-5xl">
                Thông Minh
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl font-medium"
            >
              Lên kế hoạch hoàn hảo trong <span className="text-primary font-bold">vài giây</span> với
              sức mạnh AI. Từ Hà Nội đến Phú Quốc, khám phá mọi góc đất Việt.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-3 pt-6"
            >
              <Button size="lg" className="text-base px-6 py-5 btn-gradient group shadow-xl shadow-primary/20" asChild>
                <Link href="/ai-planner">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Tạo kế hoạch AI
                  <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-6 py-5 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all font-semibold"
                asChild
              >
                <Link href="/explore">
                  <Globe className="mr-2 h-5 w-5" />
                  Khám phá ngay
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Interactive Visual Element */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { delay: 0.3, staggerChildren: 0.1 },
              },
            }}
            className="relative h-[450px] lg:h-[550px]"
          >
            {/* Floating Cards with 3D Effect */}
            <FloatingCard delay={0.4} className="absolute top-0 right-0 w-56">
              <Card className="card-premium-hover bg-white/40 dark:bg-primary/10 backdrop-blur-md border-primary/20 shadow-2xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-primary mb-1 tracking-tighter">
                    {mounted && <AnimatedCounter end={500} />}+
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">Điểm đến</p>
                </CardContent>
              </Card>
            </FloatingCard>

            <FloatingCard delay={0.5} className="absolute top-1/2 -translate-y-1/2 left-0 w-56 hidden xl:block">
              <Card className="card-premium-hover bg-white/40 dark:bg-primary/10 backdrop-blur-md border-primary/20 shadow-2xl">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg -rotate-3 group-hover:rotate-0 transition-transform">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-1 tracking-tighter">
                    {mounted && <AnimatedCounter end={10000} />}+
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Người dùng</p>
                </CardContent>
              </Card>
            </FloatingCard>

            <FloatingCard delay={0.6} className="absolute bottom-4 right-8 w-60 hidden md:block">
              <Card className="card-premium-hover bg-white/40 dark:bg-primary/10 backdrop-blur-md border-primary/20 shadow-2xl">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
                    <Star className="h-7 w-7 text-white fill-current" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-1 tracking-tighter">
                    {mounted && <AnimatedCounter end={95} />}%
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">Mức độ hài lòng</p>
                </CardContent>
              </Card>
            </FloatingCard>

            {/* Central Interactive Element */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0, rotate: -180 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48"
            >
              <div className="relative w-full h-full">
                {!shouldReduceMotion && (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-primary/20 rounded-full"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-4 border-4 border-primary/30 rounded-full"
                    />
                  </>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Compass className="h-12 w-12 text-primary-foreground" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      )}
    </section>
  );
}


