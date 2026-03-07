"use client";

import { motion } from "framer-motion";
import { Brain, Globe, Rocket, Sparkles, TrendingUp, Zap, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { fadeInUp, slideInLeft, slideInRight, scaleIn } from "@/lib/ui/animations";

export function AISection() {
  return (
    <>
      {/* Asymmetric Split Section - AI Features */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Visual with Icons */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideInLeft}
              className="relative h-[500px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl" />
              <div className="relative h-full flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                  {[
                    { icon: Brain, color: "from-blue-500 to-cyan-500" },
                    { icon: Zap, color: "from-purple-500 to-pink-500" },
                    { icon: TrendingUp, color: "from-orange-500 to-red-500" },
                    { icon: Globe, color: "from-green-500 to-emerald-500" },
                    { icon: Rocket, color: "from-indigo-500 to-blue-500" },
                    { icon: Sparkles, color: "from-yellow-500 to-orange-500" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="aspect-square bg-gradient-to-br p-6 rounded-2xl shadow-lg cursor-pointer"
                    >
                      <item.icon className="w-full h-full text-white" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideInRight}
              className="space-y-8"
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
                <Brain className="w-4 h-4 mr-2" />
                AI Technology
              </Badge>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Trí tuệ nhân tạo <span className="gradient-text-animated">thông minh</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Powered by Google Gemini AI - Tạo kế hoạch du lịch hoàn hảo với phân tích sâu và gợi ý thông minh
                trong vài giây.
              </p>
              <div className="space-y-4 pt-4">
                {[
                  { icon: Sparkles, text: "Lập kế hoạch tức thì trong < 10 giây" },
                  { icon: TrendingUp, text: "Gợi ý thông minh dựa trên sở thích" },
                  { icon: Zap, text: "Tối ưu chi phí tự động" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-lg">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Creative Journey Timeline */}
      <section className="relative py-32 px-6 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 },
              },
            }}
            className="text-center mb-20"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                <Rocket className="w-4 h-4 mr-2" />
                Đơn giản & Nhanh chóng
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-5xl md:text-6xl font-bold mb-6">
              Chỉ <span className="gradient-text-animated">3 bước</span> đơn giản
            </motion.h2>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {[
              {
                step: "01",
                title: "Nhập thông tin",
                description: "Cho AI biết xuất phát từ đâu, muốn đi đâu, bao nhiêu ngày và ngân sách",
                icon: MapPin,
                color: "from-blue-500 to-cyan-500",
              },
              {
                step: "02",
                title: "AI tạo kế hoạch",
                description: "Gemini AI phân tích và tạo lịch trình chi tiết với ngân sách tối ưu trong vài giây",
                icon: Brain,
                color: "from-purple-500 to-pink-500",
              },
              {
                step: "03",
                title: "Bắt đầu hành trình",
                description: "Xem chi tiết, lưu lại và chia sẻ kế hoạch. Sẵn sàng cho chuyến đi!",
                icon: Rocket,
                color: "from-orange-500 to-red-500",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={index % 2 === 0 ? slideInLeft : slideInRight}
                className={`flex flex-col md:flex-row items-center gap-8 mb-16 last:mb-0 ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1">
                  <Card className="card-premium-hover h-full">
                    <CardHeader>
                      <div className="flex items-start gap-6">
                        <div
                          className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0`}
                        >
                          <item.icon className="w-10 h-10 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl font-bold text-primary">{item.step}</span>
                            <CardTitle className="text-2xl">{item.title}</CardTitle>
                          </div>
                          <CardDescription className="text-lg">{item.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
                <div className="w-1 h-24 bg-gradient-to-b from-primary to-primary/50 md:hidden" />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Button size="lg" className="btn-gradient text-base px-10" asChild>
              <Link href="/ai-planner">
                Thử ngay miễn phí
                <Rocket className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Creative Features Grid - Asymmetric */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="text-center mb-20"
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Tính năng nổi bật
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-5xl md:text-6xl font-bold mb-6">
              Mọi thứ bạn cần
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[
              { icon: Globe, title: "500+ Điểm đến", description: "Khắp Việt Nam từ Bắc đến Nam", large: false },
              { icon: Sparkles, title: "Lưu yêu thích", description: "Bookmark địa điểm yêu thích", large: true },
              { icon: Rocket, title: "AR360 Tour", description: "Xem trước địa điểm 360°", large: false },
              { icon: Brain, title: "An toàn", description: "Bảo mật thông tin tối đa", large: false },
              { icon: Zap, title: "Tiết kiệm thời gian", description: "Lập kế hoạch trong vài giây", large: false },
              { icon: TrendingUp, title: "Cộng đồng", description: "Chia sẻ và đánh giá", large: false },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn}
                className={feature.large ? "md:col-span-2 lg:col-span-1" : ""}
              >
                <Card className="card-premium-hover h-full group">
                  <CardHeader className="text-center">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                    >
                      <feature.icon className="h-8 w-8 text-primary-foreground" />
                    </motion.div>
                    <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}


